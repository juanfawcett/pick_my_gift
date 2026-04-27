import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Gift from '@/models/Gift';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.name || !data.price || !data.stock) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios (nombre, precio o cantidad).' },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const newGift = await Gift.create({
      name: data.name,
      description: data.description || '',
      price: data.price,
      photos: data.photos || [],
      urlML: data.urlML || '',
      stock: data.stock,
      status: data.stock > 0 ? 'available' : 'unavailable',
    });

    return NextResponse.json({ success: true, gift: newGift });
  } catch (error: any) {
    console.error('Error creating gift:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const gifts = await Gift.find().sort({ createdAt: -1 });
    return NextResponse.json({ gifts });
  } catch (error: any) {
    console.error('Error fetching gifts:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
