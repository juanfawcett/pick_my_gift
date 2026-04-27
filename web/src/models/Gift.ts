import mongoose, { Schema, Document } from 'mongoose';

export interface IGift extends Document {
  name: string;
  description?: string;
  price: number;
  photos: string[];
  urlML?: string;
  stock: number;
  status: 'available' | 'unavailable';
}

const GiftSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    photos: [{ type: String }],
    urlML: { type: String },
    stock: { type: Number, required: true, default: 1 },
    status: {
      type: String,
      enum: ['available', 'unavailable'],
      default: 'available',
    },
  },
  { timestamps: true },
);

export default mongoose.models.Gift ||
  mongoose.model<IGift>('Gift', GiftSchema);
