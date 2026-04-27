import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Transaction from '@/models/Transaction';
import Gift from '@/models/Gift';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { items, total } = data; // items: [{ id, quantity, price }]

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío' },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth_user')?.value;

    if (!authCookie) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = JSON.parse(authCookie);

    await connectToDatabase();

    // 1. Verificar stock actual de todo en una sola vuelta para evitar transacciones a medias
    const giftDocs = await Gift.find({
      _id: { $in: items.map((i: any) => i.id) },
    });

    // Mapeamos los decumentos base para chequear rapidito si la cantidad pedida existe
    for (const item of items) {
      const dbGift = giftDocs.find((g: any) => g._id.toString() === item.id);
      if (!dbGift) {
        return NextResponse.json(
          { error: `El producto con id ${item.id} no existe` },
          { status: 404 },
        );
      }

      // Chequear si el stock actual < lo que piden
      if (dbGift.stock < item.quantity || dbGift.status !== 'available') {
        return NextResponse.json(
          {
            error: `Stock insuficiente para: ${dbGift.name}. Solo quedan ${dbGift.stock} uds.`,
          },
          { status: 400 },
        );
      }
    }

    // 2. Procesar (Aca idealmente se usaria MongoDB Sesssions/Transactions pero para MVP servirá async secuencial)
    const transactionItems = items.map((item: any) => ({
      giftId: item.id,
      quantity: item.quantity,
      priceAtPurchase: item.price,
    }));

    // Crear el historial transaccional
    const newTransaction = await Transaction.create({
      user: user.id,
      items: transactionItems,
      total: total,
    });

    // Despachar el update de los regalos
    for (const item of items) {
      const dbGift = giftDocs.find((g: any) => g._id.toString() === item.id);
      const newStock = dbGift.stock - item.quantity;
      const newStatus = newStock > 0 ? 'available' : 'unavailable';

      await Gift.findByIdAndUpdate(item.id, {
        stock: newStock,
        status: newStatus,
      });
    }

    return NextResponse.json({
      success: true,
      transaction: newTransaction._id,
    });
  } catch (error: any) {
    console.error('Error procesando pago/reserva:', error);
    return NextResponse.json(
      { error: 'Error procesando reserva' },
      { status: 500 },
    );
  }
}
