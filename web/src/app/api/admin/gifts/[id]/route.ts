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
