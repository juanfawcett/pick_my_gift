import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Gift from '@/models/Gift';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    await Gift.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting gift:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();
    
    if (body.stock === undefined) {
      return NextResponse.json({ error: 'Stock requerido' }, { status: 400 });
    }

    const updatedGift = await Gift.findByIdAndUpdate(
      id,
      { stock: body.stock },
      { new: true }
    );

    return NextResponse.json({ success: true, gift: updatedGift });
  } catch (error: unknown) {
    console.error('Error updating gift:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
