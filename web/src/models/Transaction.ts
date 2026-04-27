import mongoose, { Schema, Document } from 'mongoose';

export interface ITransactionItem {
  giftId: mongoose.Types.ObjectId;
  quantity: number;
  priceAtPurchase: number;
}

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId;
  items: ITransactionItem[];
  total: number;
}

const TransactionItemSchema: Schema = new Schema({
  giftId: { type: Schema.Types.ObjectId, ref: 'Gift', required: true },
  quantity: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true },
});

const TransactionSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [TransactionItemSchema],
    total: { type: Number, required: true },
  },
  { timestamps: true },
);

export default mongoose.models.Transaction ||
  mongoose.model<ITransaction>('Transaction', TransactionSchema);
