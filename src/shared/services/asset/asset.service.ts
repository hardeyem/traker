import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Asset } from 'src/repository/schemas/asset';
import { AddAssetDTO, AssetLocationUpdateDTO } from 'src/shared/dtos/asset.dto';

@Injectable()
export class AssetService {
    constructor(
        @InjectModel('Asset') private assetModel: Model<Asset>
    ){}

    /**
     * Adde new asset to database
     * @param data 
     * @returns 
     */
    addAsset(data: AddAssetDTO | any): Promise<Asset> {
        const asset  = new this.assetModel(data);
        return asset.save();
    }

    /**
     * Get all assests in database
     * @returns 
     */
    getAllAssets(): Promise<Asset[]>{
       return this.assetModel.find({}).exec();
    }
    
    /**
     * Get asset in database by asset id
     * @param assetId 
     * @returns 
     */
    getByAssetId(assetId: string): Promise<Asset>{
       return this.assetModel.findOne({assetId}).exec();
    }
    
    /**
     * Update location of asset in database 
     * @param assetId 
     * @param locData 
     * @returns 
     */
    updateLocation(assetId: string, locData: AssetLocationUpdateDTO): Promise<any>{
       return this.assetModel.updateOne({assetId}, {
            $set: {
                lastKnownLocation: {
                    coordinates: [locData.longitude, locData.latitude],
                    address: locData.address
                }
            }
       }).exec();
    }
}
