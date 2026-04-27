import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { name, phone } = await req.json();

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // Logica de creación o login
    let user = await User.findOne({ phone });

    if (!user) {
      // Si el teléfono es el designado para admin
      const role = phone === '3013887536' ? 'admin' : 'guest';
      user = await User.create({ name, phone, role });
    }

    // Setear cookie usando Server Actions/Route Handlers approach
    const cookieStore = await cookies();
    cookieStore.set(
      'auth_user',
      JSON.stringify({
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        path: '/',
      },
    );

    return NextResponse.json({
      success: true,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error: any) {
    console.error('Error in auth:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
