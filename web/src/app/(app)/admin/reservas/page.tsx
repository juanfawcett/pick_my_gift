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
import { Gift as GiftIcon, ExternalLink } from 'lucide-react';
import { GiftCarousel } from '@/components/GiftCarousel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DeleteTransactionButton } from './DeleteTransactionButton';

export const dynamic = 'force-dynamic';

export default async function AdminReservasPage() {
  await connectToDatabase();

  const transactionsRaw = (await Transaction.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name phone')
    .populate(
      'items.giftId',
      'name photos price status description urlML storeName',
    )
    .lean()) as any[];

  const groupedByUser: Record<string, any> = {};
  let totalGiftsSelected = 0;
  let totalSumValue = 0;

  transactionsRaw.forEach((t) => {
    const userId = t.user?._id?.toString() || 'unknown';
    if (!groupedByUser[userId]) {
      groupedByUser[userId] = {
        _id: userId,
        user: t.user
          ? {
              name: t.user.name,
              phone: t.user.phone,
            }
          : null,
        transactions: [],
        total: 0,
        lastTransactionDate: t.createdAt,
      };
    }

    groupedByUser[userId].transactions.push(t);

    t.items.forEach((item: any) => {
      totalGiftsSelected += item.quantity;
      groupedByUser[userId].total += item.priceAtPurchase * item.quantity;
      totalSumValue += item.priceAtPurchase * item.quantity;
    });

    if (
      new Date(t.createdAt) >
      new Date(groupedByUser[userId].lastTransactionDate)
    ) {
      groupedByUser[userId].lastTransactionDate = t.createdAt;
    }
  });

  const groupedUsers = Object.values(groupedByUser).sort(
    (a: any, b: any) =>
      new Date(b.lastTransactionDate).getTime() -
      new Date(a.lastTransactionDate).getTime(),
  );

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

      <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <GiftIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary/70 uppercase tracking-wider">
              Total regalos seleccionados
            </p>
            <p className="text-3xl font-bold text-primary">
              {totalGiftsSelected}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-end">
          <p className="text-sm font-medium text-primary/70 uppercase tracking-wider">
            Valor total regalos
          </p>
          <p className="text-3xl font-bold text-primary">
            {new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              maximumFractionDigits: 0,
            }).format(totalSumValue)}
          </p>
        </div>
      </div>

      {groupedUsers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border shadow-sm">
          <p className="text-gray-500 text-lg">
            Aún no existen regalos confirmados/reservados.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {groupedUsers.map((userGroup) => (
            <Card
              key={userGroup._id}
              className="overflow-hidden border-primary/20 shadow-md bg-white/50 backdrop-blur-sm rounded-2xl p-0"
            >
              <CardHeader className="bg-primary/5 pt-6 px-6 pb-6 border-b border-primary/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-serif text-primary">
                      {userGroup.user?.name || 'Invitado desconocido'}
                    </CardTitle>
                    <div className="flex items-center gap-2 bg-white/80 border border-primary/10 px-3 py-1.5 rounded-full shadow-sm w-fit">
                      <span className="text-primary text-xs">📞</span>
                      <span className="text-sm font-medium text-gray-700">
                        {userGroup.user?.phone || 'Sin celular registrado'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row items-center gap-6">
                    <div className="md:text-right space-y-1">
                      <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em]">
                        Última actividad
                      </p>
                      <p className="text-gray-700 font-semibold text-sm">
                        {format(
                          new Date(userGroup.lastTransactionDate),
                          "d 'de' MMMM, yyyy",
                          {
                            locale: es,
                          },
                        )}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {format(
                          new Date(userGroup.lastTransactionDate),
                          'h:mm a',
                          {
                            locale: es,
                          },
                        )}
                      </p>
                    </div>
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
                    {userGroup.transactions.map((t: any) => (
                      <div
                        key={t._id.toString()}
                        className="space-y-4 relative border border-primary/10 rounded-2xl p-4 bg-white/40"
                      >
                        <div className="absolute -top-3 right-4 bg-white shadow-sm rounded-full p-1 border border-primary/10">
                          <DeleteTransactionButton
                            transactionId={t._id.toString()}
                          />
                        </div>
                        {t.items.map((item: any, idx: number) => {
                          const gift = item.giftId;
                          if (!gift) return null;
                          return (
                            <Dialog key={`${t._id}-${idx}`}>
                              <DialogTrigger
                                nativeButton={false}
                                render={
                                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-primary/5 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer" />
                                }
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
                                      <span className="text-[10px] text-gray-400 italic">
                                        Sin foto
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex-1 text-left">
                                    <p className="font-bold text-gray-900 leading-tight mb-1">
                                      {gift.name}
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
                                    }).format(
                                      item.priceAtPurchase * item.quantity,
                                    )}
                                  </p>
                                </div>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader className="pt-8 px-8 pb-2">
                                  <DialogTitle className="font-serif text-2xl text-primary leading-tight">
                                    {gift.name}
                                  </DialogTitle>
                                </DialogHeader>

                                <div className="px-8">
                                  <GiftCarousel
                                    photos={gift.photos}
                                    name={gift.name}
                                  />
                                </div>

                                <div className="px-8 pb-8 space-y-4">
                                  {gift.description && (
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                      {gift.description}
                                    </p>
                                  )}

                                  {gift.urlML && (
                                    <a
                                      href={gift.urlML}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-center w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-sm"
                                    >
                                      <ExternalLink className="h-4 w-4 mr-2 shrink-0" />
                                      Ver Producto en{' '}
                                      {gift.storeName ||
                                        (gift.urlML.includes('amazon')
                                          ? 'Amazon'
                                          : 'Mercado Libre')}
                                    </a>
                                  )}

                                  <div className="flex justify-between items-center text-sm border-t pt-4">
                                    <span className="text-gray-500">
                                      Precio al comprar:{' '}
                                      {new Intl.NumberFormat('es-CO', {
                                        style: 'currency',
                                        currency: 'COP',
                                        maximumFractionDigits: 0,
                                      }).format(item.priceAtPurchase)}
                                    </span>
                                    <span className="font-semibold text-primary">
                                      Cant: {item.quantity}
                                    </span>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          );
                        })}
                      </div>
                    ))}
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
                      }).format(userGroup.total)}
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
