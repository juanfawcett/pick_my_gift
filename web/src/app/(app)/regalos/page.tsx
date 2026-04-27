import { connectToDatabase } from '@/lib/db';
import Gift from '@/models/Gift';
import { GiftCard } from '@/components/GiftCard';

export const dynamic = 'force-dynamic'; // Para asegurarnos de que la consulta sea en tiempo real al entrar

export default async function RegalosPage() {
  await connectToDatabase();

  // Obtenemos los regalos ordenados por fecha de creación (los más nuevos primero)
  const regalos = await Gift.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center max-w-2xl mx-auto space-y-4 pt-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          🍼¡Gracias por sumarte a la celebración de nuestra Baby Scarlett!🎁
        </h1>
        <p className="text-lg leading-8 text-gray-500">
          Elegir tu regalo es simple, haz clic en el/los que más te guste(n) y agrégalo(s) a tu carrito.
          <br />
          Si ya no hay unidades disponibles aparecerá en gris y significa que alguien se te adelantó.
          Los precios son solo una referencia. En cada regalo encontrarás el link de mercado libre para que puedas constatar dicho precio. Lo puedes comprar ahí mismo en Mercado Libre o donde quieras. Te damos esta referencia para tu facilidad o porque fue una referencia que nos gustó.
          Cuando confirmes tu regalo, recibiremos la notificación de que lo hiciste y sabremos que ese es el detalle que traerás para nuestra Bebé.

          Muchas gracias por acompañarnos en este momento tan especial, te esperamos el 23 de mayo en la Mz 7 Casa 5 Urb. Nuevo Horizonte para que celebremos juntos esta fecha especial.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {regalos.map((regalo: any) => (
          <GiftCard
            key={regalo._id.toString()}
            gift={{
              ...regalo,
              _id: regalo._id.toString(),
            }}
          />
        ))}
      </div>

      {regalos.length === 0 && (
        <div className="text-center py-24 bg-gray-50 rounded-2xl border-2 border-dashed">
          <p className="text-gray-500">
            Aún no hay regalos disponibles, visítanos pronto.
          </p>
        </div>
      )}
    </div>
  );
}
