import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConnectedUser } from 'src/repository/schemas/connected.user';

@Injectable()
export class ConnectedUserService {

    constructor(
        @InjectModel('ConnectedUser') private connectedUserModel: Model<ConnectedUser>
    ){}

    /**
     * Get all Connected users in database
     * @returns 
     */
    getAllAssets(): Promise<ConnectedUser[]>{
        return this.connectedUserModel.find({}).exec();
    }

    /**
     * Update presence of users in database insert if new
     * @param userId 
     * @param data 
     * @returns 
     */
    setPresence(userId: string, data: any): Promise<any>{
        return this.connectedUserModel.updateOne({userId}, {
            $set: {
                lastKnownLocation: {
                    coordinates: [data.long, data.lat],
                    address: data.address
                },
                interestAssets: [],
                online: data.online || false,
                clientId: data.clientId,
                lastSeen: new Date()
            }
        }, {upsert: true}).exec();
    }

    /**
     * Track asset of Interested Connected users
     * @param userId 
     * @param clientId 
     * @param assetId 
     * @returns 
     */
    trackAsset(userId: string, clientId: string, assetId: string): Promise<any>{
        return this.connectedUserModel.updateOne({userId}, {
            $set: {
                clientId: clientId,
            },
            $push: {
                interestAssets: assetId
            }
        }).exec();
    }

    /**
     * Get connected user of a specific assest at the specified distance
     * @param long 
     * @param lat 
     * @param distance 
     * @param assetId 
     * @returns 
     */
    getInterestedUserByDistance(long: number, lat: number, distance: number, assetId: string, minDistance?: number ): Promise<ConnectedUser[]>{
        const geoNear = {
            near: { type: "Point", coordinates: [long, lat] },
            distanceField: "distanceToLocation",
            maxDistance: distance,
            minDistance: minDistance || distance,
            spherical: true,
            uniqueDocs: true,
            query: { interestAssets: {$elemMatch: {$eq: assetId}}}
        }

        console.log(geoNear);

        return this.connectedUserModel.aggregate([
            { $geoNear: geoNear }
        ]).exec();
    }


}
