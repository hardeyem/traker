import { Document, Schema} from 'mongoose';
import { LocationSchema, Location } from '../shared_schemsa/location';

export const AssetSchema = new Schema({
    assetId: { type: String, required: true, unique: true },
    lastKnownLocation: LocationSchema,
    lastBroadcastTime: Date
});
AssetSchema.index({ lastKnownLocation: '2dsphere' });
AssetSchema.index({ "assetId": 1 });
AssetSchema.index({ "lastBroadcastTime": 1 });

/**
 * Declared Asset schema type
 */
export interface Asset extends Document {
    assetId: string;
    lastKnownLocation: Location;
    lastBroadcastTime: Date;
}