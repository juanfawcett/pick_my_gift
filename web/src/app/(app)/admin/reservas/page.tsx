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
              className="overflow-hidden border-primary/20 shadow-sm"
            >
              <CardHeader className="bg-primary/5 pb-6 border-b border-primary/10">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-extrabold text-foreground">
                      {t.user?.name || 'Invitado desconocido'}
                    </CardTitle>
                    <CardDescription className="mt-1 font-mono text-gray-600 bg-white px-2 py-1 rounded-md inline-block border">
                      📞 {t.user?.phone || 'Sin celular registrado'}
                    </CardDescription>
                  </div>
                  <div className="md:text-right">
                    <p className="text-sm font-bold text-primary uppercase tracking-wide">
                      Recibido el
                    </p>
                    <p className="text-gray-700 font-medium">
                      {format(
                        new Date(t.createdAt),
                        "d 'de' MMMM, yyyy 'a las' h:mm a",
                        {
                          locale: es,
                        },
                      )}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 pb-2">
                    Artículos regalados:
                  </h4>
                  <ul className="space-y-6">
                    {t.items.map((item: any, idx: number) => {
                      const gift = item.giftId;
                      return (
                        <li
                          key={idx}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/50 p-3 rounded-lg border border-dashed"
                        >
                          <div className="flex items-center gap-4 w-full">
                            <div className="h-16 w-16 bg-white rounded-md overflow-hidden relative shrink-0 border shadow-sm flex items-center justify-center">
                              {gift?.photos?.[0] ? (
                                <Image
                                  src={gift.photos[0]}
                                  alt={gift.name || 'Regalo'}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <span className="text-[10px] text-gray-400">
                                  Sin foto
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 leading-tight">
                                {gift
                                  ? gift.name
                                  : '🎁 Este regalo fue eliminado de la aplicación'}
                              </p>
                              <div className="flex items-center mt-1 text-sm text-gray-600">
                                <span>
                                  Llevó{' '}
                                  <span className="font-bold text-primary px-1">
                                    {item.quantity}
                                  </span>{' '}
                                  ud.{' '}
                                </span>
                                <span className="mx-2 text-gray-300">|</span>
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

                          <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-200">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 hidden sm:block">
                              Subtotal
                            </p>
                            <p className="font-extrabold text-gray-900 bg-white px-3 py-1 rounded inline-block border">
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
                  <div className="mt-8 border-t-2 border-primary/20 pt-4 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                      Total del Regalo
                    </span>
                    <span className="text-2xl font-extrabold text-primary">
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        maximumFractionDigits: 0,
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
