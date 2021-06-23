import { Injectable } from '@nestjs/common';
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Observable, from } from 'rxjs';
import { Server } from 'socket.io';
import { map } from 'rxjs/operators';

@WebSocketGateway(3001, {transports:["websocket"]})
export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(){
        setTimeout(() => {
            this.server.emit('events', { name: 'Adeyemi' });
        }, 5000);
    }

    afterInit(server: any) {
        console.log('websocket initialized ');
    }
    handleConnection(client: any, ...args: any[]) {
        console.log('websocket connected ', client.id);
    }
    handleDisconnect(client: any) {
        console.log('websocket disconnected');
    }

    @SubscribeMessage('events')
    onEvent(@MessageBody() data: any): Observable<WsResponse<number>> {
        console.log(data);
        return null;
    }
}
