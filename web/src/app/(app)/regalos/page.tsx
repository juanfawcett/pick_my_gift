import { connectToDatabase } from '@/lib/db';
import Gift from '@/models/Gift';
import Transaction from '@/models/Transaction';
import { GiftGrid } from '@/components/GiftGrid';
import { MousePointerClick, ExternalLink, CheckCircle2, CalendarHeart, ArrowRight, Gift as GiftIcon } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function RegalosPage() {
  await connectToDatabase();
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user')?.value;
  
  let hasSelectedGifts = false;
  if (authCookie) {
    try {
      const user = JSON.parse(authCookie);
      const transactionExists = await Transaction.exists({ user: user.id });
      hasSelectedGifts = !!transactionExists;
    } catch (e) {
      console.error("Error checking transactions:", e);
    }
  }

  const regalos = await Gift.find().sort({ createdAt: -1 }).lean();
  const gifts = regalos.map((r: any) => ({ ...r, _id: r._id.toString() }));

  return (
    <div className="space-y-12 pb-12">
      {hasSelectedGifts && (
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full hidden sm:block">
              <GiftIcon className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              Ya tienes regalos reservados. Puedes ver los detalles y links de compra en tu sección personal.
            </p>
          </div>
          <Link 
            href="/mis-regalos" 
            className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold shrink-0 hover:shadow-lg transition-all active:scale-95"
          >
            Ver mis regalos
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
      <div className="text-center max-w-5xl mx-auto space-y-6 pt-8">
        <h1 className="text-4xl md:text-5xl font-serif text-primary tracking-wide">
          🍼 ¡Gracias por sumarte a la celebración de nuestra baby Scarlett! 🎁
        </h1>
        <h2 className="text-xl md:text-2xl font-serif text-primary tracking-wide text-rose-500">
          Sigue estos pasos para seleccionar tu(s) regalo(s)
        </h2>
        {/* Guía Visual Paso a Paso */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left mt-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-primary/10 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors"></div>
            <MousePointerClick className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-bold text-gray-800 text-lg mb-1">1. Elige</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Haz clic en el/los detalle(s) que más te guste(n) y agrégalo(s) al carrito. Si está(n) gris, alguien se te adelantó.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-500/10 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/40 group-hover:bg-blue-500 transition-colors"></div>
            <ExternalLink className="h-8 w-8 text-blue-500 mb-3" />
            <h3 className="font-bold text-gray-800 text-lg mb-1">2. Revisa</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Los precios son de referencia. Usa el link del producto para ver los detalles y comprarlo(s) en esa tienda o donde prefieras.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-500/10 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500/40 group-hover:bg-green-500 transition-colors"></div>
            <CheckCircle2 className="h-8 w-8 text-green-500 mb-3" />
            <h3 className="font-bold text-gray-800 text-lg mb-1">3. Confirma</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Ve a tu carrito y finaliza. No pagarás nada aquí, solo nos confirmas el/los detalle(s) que traerás.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-rose-500/10 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/40 group-hover:bg-rose-500 transition-colors"></div>
            <CalendarHeart className="h-8 w-8 text-rose-500 mb-3" />
            <h3 className="font-bold text-gray-800 text-lg mb-1">4. Acompáñanos</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              ¡Te esperamos el 23 de mayo en la Mz 7 Casa 5 Urb. Nuevo Horizonte para celebrar!
            </p>
          </div>
        </div>
      </div>

      <GiftGrid gifts={gifts} />
    </div>
  );
}
