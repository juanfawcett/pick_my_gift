import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  phone: string;
  role: 'admin' | 'guest';
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    role: { type: String, enum: ['admin', 'guest'], default: 'guest' },
  },
  { timestamps: true },
);

export default mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);
