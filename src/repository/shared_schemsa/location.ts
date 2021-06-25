import { Document, Schema} from 'mongoose';

export const LocationSchema = new Schema({
    type: { type: String, default: 'Point', required: true },
    coordinates: { type: [Number], required: true },
    address: { type: String, required: true },
});

/**
 * Define Location schema type
 */
export interface Location extends Document {
    type?: string;
    coordinates: [number, number];
    address: string;
}