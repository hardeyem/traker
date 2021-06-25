import { Injectable } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Observable, from } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { map } from 'rxjs/operators';
import { AppLogger } from 'src/core';
import { Asset } from 'src/repository/schemas/asset';
import { UtiliHelpers } from 'src/shared/classes/helpers';
import { ConnectedUserService } from 'src/shared/services/connected-user/connected-user.service';

@WebSocketGateway(3001, {transports:["websocket"], pingTimeout: 0})
export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    
    @WebSocketServer()
    server: Server;
    static clients: Socket[] = [];
    throttleTime = 5000;

    constructor(
        private logger: AppLogger,
        private connectedUserSvc: ConnectedUserService,

    ){ }


    emitMessage(event: string, message: any){
        this.logger.log('sending messgae',  event);
        this.server.emit(event, message);
    }

    /**
     * Process general asset broadcast to interested and informing of proximity
     * @param assetId 
     * @param asset 
     * @returns 
     */
    broadcastAssetLocation(assetId: string, asset: Asset){
        console.log('broadcastin', asset);
        if(!asset){
            return false;
        }
        this.assetBroadcast(assetId, asset);

        // send proximity broadcast
        const proximity = Array.from(Array(11), (_,x) => x == 0? x : x*10);
        console.log('proximity array', proximity);
        this.sendProximityBroadcast(assetId, asset.lastKnownLocation.coordinates[0], asset.lastKnownLocation.coordinates[1], proximity.reverse());
    }

    /**
     * Broadcast asset location to all interested client in asset room. Throttling to 5000 ms
     * @param assetId 
     * @param asset 
     */
    assetBroadcast(assetId: string, asset: Asset){
        let throttleTime = 5000;
        if(asset && asset.lastBroadcastTime){
            const timeDiffer = Date.now() - new Date(asset.lastBroadcastTime).getTime();
            throttleTime = timeDiffer > this.throttleTime ? 100 : this.throttleTime - timeDiffer + 100;
        }
        this.server.to(assetId).emit('message', asset);
        UtiliHelpers.throttle(throttleTime, () => {
            // this.logger.log('broadcasting asset location',  assetId);
            this.server.to(assetId).emit('message', asset);
        });
    }

    /**
     * Send proximity message to all matching client within the specified proximity array
     * @param assetId 
     * @param long 
     * @param lat 
     * @param proximity 
     * @returns 
     */
    async sendProximityBroadcast(assetId: string, long: number, lat: number, proximity: number[]) {
        console.log('sending proximity', assetId, proximity);

        if(proximity.length < 1){
            return;
        }

        let users: string[]| any = await this.connectedUserSvc.getInterestedUserByDistance(long, lat, proximity[0], assetId, proximity[0]);
        // this.logger.log('proximity users', users);
        if(users.length > 0){
            users = users.map((u) => u.clienId);
            const broadCastClients = EventGateway.clients.filter(client => users.includes(client.id));
            broadCastClients.forEach(client => client.emit('proximity', {proximity: proximity[0], assestId: assetId}));
        }
        
        return this.sendProximityBroadcast(assetId, long, lat, proximity.slice(1));
    }

    
    /**
     * Handles websocket server intialization - @Override
     * @param server 
     */
    afterInit(server: any) {
        this.logger.log('websocket initialized ');
    }


    /**
     * Handles client connection - @Override
     * @param client 
     * @param args 
     * @returns 
     */
    async handleConnection(client: Socket, ...args: any[]) {
        this.logger.log('websocket connected ', client.id);

        const clientQuery: any = client.handshake.query;
        if(clientQuery.lat && clientQuery.long){
            clientQuery.lat =  parseFloat(clientQuery.lat);
            clientQuery.long =  parseFloat(clientQuery.long);
        }
        const validConn = UtiliHelpers.validParam(clientQuery, [{name: 'userId', type: 'string'}, {name: 'long', type: 'number'},{name: 'lat', type: 'number'}]);
        if(!validConn.success){
            return client.disconnect(true); //reject connection if necessary parameters are not available
        }
        clientQuery.online = true;
        clientQuery.clientId = client.id;

        try {
            await this.connectedUserSvc.setPresence(clientQuery.userId, clientQuery);   
        } catch (error) {
            this.logger.error('Error seeting user presence', error);
        }

        client.emit('connected', {}); //inform the client the user has been connected 
        EventGateway.clients.push(client);
    }

    /**
     * Handles client disconnection - @Override
     * @param client 
     */
    async handleDisconnect(client: Socket) {
        this.logger.log('disconneted', client.id);
        
        const clientQuery: any = client.handshake.query;
        clientQuery.online = false;
        try {
            await this.connectedUserSvc.setPresence(clientQuery.userId, clientQuery);
        } catch (error) {
            this.logger.error('Error setting user presence on connection ', error);
        }
        EventGateway.clients = EventGateway.clients.filter(c => c.id != client.id);
        
    }
    
    /**
     * Handle trackAsset event from client
     * @param data 
     * @param client 
     */
    @SubscribeMessage('trackAsset')
    async trackAsset(@MessageBody() data: any, @ConnectedSocket() client: Socket): Promise<void> {
        this.logger.log('Client tracking asset', data);
        const clientQuery: any = client.handshake.query;
        if(data.assetId){
            try {
                await this.connectedUserSvc.trackAsset(clientQuery.userId, client.id, data.assetId);   
            } catch (error) {
                this.logger.error('Error registering user for asset tracking', error);
            }
            client.join(data.assetId);
        }
    }
}
