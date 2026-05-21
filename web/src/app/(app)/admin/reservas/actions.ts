'use server';

import { connectToDatabase } from '@/lib/db';
import Transaction from '@/models/Transaction';
import Gift from '@/models/Gift';
import { revalidatePath } from 'next/cache';

export async function deleteTransaction(transactionId: string) {
  await connectToDatabase();

  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    throw new Error('Transacción no encontrada');
  }

  // Restore stock for each gift
  for (const item of transaction.items) {
    const dbGift = await Gift.findById(item.giftId);
    if (dbGift) {
      const newStock = dbGift.stock + item.quantity;
      await Gift.findByIdAndUpdate(item.giftId, {
        stock: newStock,
        status: newStock > 0 ? 'available' : dbGift.status,
      });
    }
  }

  // Delete the transaction
  await Transaction.findByIdAndDelete(transactionId);

  revalidatePath('/admin/reservas');
}
