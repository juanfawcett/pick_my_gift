import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Gift from '@/models/Gift';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();
    await Gift.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting gift:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
