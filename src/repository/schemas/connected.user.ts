import { Document, Schema} from 'mongoose';
import { LocationSchema, Location } from '../shared_schemsa/location';

export const ConnectedUsersSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    clientId: { type: String, required: true, unique: true },
    name: String,
    interestAssets: [String],
    online: {type: Boolean, required: true, default: false },
    lastKnownLocation: LocationSchema,
    lastSeen: Date
});
ConnectedUsersSchema.index({ lastKnownLocation: '2dsphere' });
ConnectedUsersSchema.index({ "userId": 1 });
ConnectedUsersSchema.index({ "lastSeen": 1 });

/**
 * Declared Connectecd Users schema type
 */
export interface ConnectedUser extends Document {
    userId: string;
    clientId: string;
    name: string;
    interestAssets: string[];
    online: boolean;
    lastKnownLocation: Location;
    lastSeen: Date;
}