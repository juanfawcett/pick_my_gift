import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import Transaction from '@/models/Transaction';
import Gift from '@/models/Gift';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { ArrowLeft, Gift as GiftIcon, ExternalLink } from 'lucide-react';
import { GiftCarousel } from '@/components/GiftCarousel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const dynamic = 'force-dynamic';

export default async function MisRegalosPage() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user')?.value;

  if (!authCookie) {
    redirect('/');
  }

  const user = JSON.parse(authCookie);

  await connectToDatabase();
  // Nos aseguramos de que el modelo Gift esté registrado
  const GiftModel = Gift;

  const transactions = await Transaction.find({ user: user.id })
    .populate('items.giftId')
    .sort({ createdAt: -1 })
    .lean();

  // Aplanar la lista de regalos de todas las transacciones
  const misRegalos: any[] = [];
  transactions.forEach((tx: any) => {
    tx.items.forEach((item: any) => {
      if (item.giftId) {
        // En caso de que el regalo haya sido eliminado de la DB, evitamos errores
        misRegalos.push({
          ...item,
          transactionDate: tx.createdAt,
        });
      }
    });
  });

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 pt-8">
        <Link href="/regalos" className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-serif text-primary tracking-wide">
            Mis regalos elegidos
          </h1>
          <p className="text-gray-500 mt-1">
            Aquí están los detalles que has reservado para Scarlett.
          </p>
        </div>
      </div>

      {misRegalos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="bg-gray-100 p-6 rounded-full mb-2">
            <GiftIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Aún no has elegido ningún regalo
          </h2>
          <p className="text-gray-500 max-w-sm">
            Ve al listado principal para elegir con qué detalle quieres sorprender a la bebé.
          </p>
          <Link href="/regalos" className={buttonVariants({ className: "mt-4 font-semibold" })}>
            Ver listado de regalos
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {misRegalos.map((item, idx) => {
            const gift = item.giftId;
            return (
              <Dialog key={idx}>
                <DialogTrigger
                  nativeButton={false}
                  render={
                    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer text-left h-full" />
                  }
                >
                  <CardContent className="p-0 flex items-stretch h-32">
                    <div className="w-32 relative bg-gray-100 shrink-0">
                      {gift.photos && gift.photos.length > 0 ? (
                        <Image
                          src={gift.photos[0]}
                          alt={gift.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          Sin foto
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800 line-clamp-2 leading-tight text-sm">
                          {gift.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Reservado: {new Date(item.transactionDate).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <span className="font-semibold text-primary text-sm">
                          {new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            minimumFractionDigits: 0,
                          }).format(item.priceAtPurchase)}
                        </span>
                        <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-md text-gray-600">
                          Cant: {item.quantity}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader className="pt-8 px-8 pb-2">
                    <DialogTitle className="font-serif text-2xl text-primary leading-tight">{gift.name}</DialogTitle>
                  </DialogHeader>

                  <div className="px-8">
                    <GiftCarousel photos={gift.photos} name={gift.name} />
                  </div>

                  <div className="px-8 pb-8 space-y-4">
                    {gift.description && (
                      <p className="text-sm text-gray-600 leading-relaxed">{gift.description}</p>
                    )}

                    {gift.urlML && (
                      <a
                        href={gift.urlML}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-sm"
                      >
                        <ExternalLink className="h-4 w-4 mr-2 shrink-0" />
                        Ver Producto en {gift.storeName || (gift.urlML.includes('amazon') ? 'Amazon' : 'Mercado Libre')}
                      </a>
                    )}

                    <div className="flex justify-between items-center text-sm border-t pt-4">
                      <span className="text-gray-500">
                        Confirmado el: {new Date(item.transactionDate).toLocaleDateString('es-CO')}
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
      )}
    </div>
  );
}
