import { connectToDatabase } from '@/lib/db';
import Transaction from '@/models/Transaction';
import '@/models/User';
import '@/models/Gift';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function AdminReservasPage() {
  await connectToDatabase();

  const transactionsRaw = (await Transaction.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name phone')
    .populate('items.giftId', 'name photos price status')
    .lean()) as any[];

  // Convertimos temporalmente algunos campos a strings simples (para que React pueda serializar a JSON en el RSC)
  const transactions = transactionsRaw.map((t) => ({
    _id: t._id.toString(),
    createdAt: t.createdAt.toISOString(),
    total: t.total,
    user: t.user
      ? {
          name: t.user.name,
          phone: t.user.phone,
        }
      : null,
    items: t.items.map((item: any) => ({
      quantity: item.quantity,
      priceAtPurchase: item.priceAtPurchase,
      giftId: item.giftId
        ? {
            _id: item.giftId._id.toString(),
            name: item.giftId.name,
            photos: item.giftId.photos || [],
          }
        : null,
    })),
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Lista de Reservas
          </h1>
          <p className="text-gray-500 mt-2">
            Aquí están todas las personas que ya agregaron y confirmaron sus
            regalos.
          </p>
        </div>
        <Link href="/admin">
          <Button
            variant="outline"
            className="border-primary/20 text-primary font-semibold"
          >
            Volver a Inventario
          </Button>
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border shadow-sm">
          <p className="text-gray-500 text-lg">
            Aún no existen regalos confirmados/reservados.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {transactions.map((t) => (
            <Card
              key={t._id}
              className="overflow-hidden border-primary/20 shadow-md bg-white/50 backdrop-blur-sm rounded-2xl p-0"
            >
              <CardHeader className="bg-primary/5 pt-6 px-6 pb-6 border-b border-primary/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-serif text-primary">
                      {t.user?.name || 'Invitado desconocido'}
                    </CardTitle>
                    <div className="flex items-center gap-2 bg-white/80 border border-primary/10 px-3 py-1.5 rounded-full shadow-sm w-fit">
                      <span className="text-primary text-xs">📞</span>
                      <span className="text-sm font-medium text-gray-700">
                        {t.user?.phone || 'Sin celular registrado'}
                      </span>
                    </div>
                  </div>
                  <div className="md:text-right space-y-1">
                    <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em]">
                      Recibido el
                    </p>
                    <p className="text-gray-700 font-semibold text-sm">
                      {format(
                        new Date(t.createdAt),
                        "d 'de' MMMM, yyyy",
                        { locale: es }
                      )}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {format(new Date(t.createdAt), "h:mm a", { locale: es })}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8 px-6 pb-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-px flex-1 bg-primary/10"></div>
                    <h4 className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] px-2">
                      Artículos regalados
                    </h4>
                    <div className="h-px flex-1 bg-primary/10"></div>
                  </div>

                  <ul className="space-y-4">
                    {t.items.map((item: any, idx: number) => {
                      const gift = item.giftId;
                      return (
                        <li
                          key={idx}
                          className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-primary/5 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-4 w-full">
                            <div className="h-20 w-20 bg-gray-50 rounded-xl overflow-hidden relative shrink-0 border border-primary/10 flex items-center justify-center">
                              {gift?.photos?.[0] ? (
                                <Image
                                  src={gift.photos[0]}
                                  alt={gift.name || 'Regalo'}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <span className="text-[10px] text-gray-400 italic">Sin foto</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 leading-tight mb-1">
                                {gift
                                  ? gift.name
                                  : '🎁 Regalo eliminado'}
                              </p>
                              <div className="flex items-center text-xs text-gray-500 font-medium">
                                <span className="bg-primary/5 text-primary px-2 py-0.5 rounded-md">
                                  Llevó {item.quantity} ud.
                                </span>
                                <span className="mx-2 opacity-30">|</span>
                                <span>
                                  {new Intl.NumberFormat('es-CO', {
                                    style: 'currency',
                                    currency: 'COP',
                                    maximumFractionDigits: 0,
                                  }).format(item.priceAtPurchase)}{' '}
                                  / c/u
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0 pt-4 sm:pt-0 border-t sm:border-0 border-primary/5 w-full sm:w-auto">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 hidden sm:block">
                              Subtotal
                            </p>
                            <p className="font-bold text-gray-900 text-base">
                              {new Intl.NumberFormat('es-CO', {
                                style: 'currency',
                                currency: 'COP',
                                maximumFractionDigits: 0,
                              }).format(item.priceAtPurchase * item.quantity)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-8 bg-primary/5 -mx-6 -mb-8 p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-primary/10">
                    <span className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.3em]">
                      Total del Regalo
                    </span>
                    <span className="text-3xl font-serif text-primary font-bold">
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        maximumFractionDigits: 0,
                        minimumFractionDigits: 0,
                      }).format(t.total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
