'use client';

import { useCartStore } from '@/store/cart';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingCart, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { GiftCarousel } from './GiftCarousel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Gift {
  _id: string;
  name: string;
  price: number;
  stock: number;
  photos: string[];
  description?: string;
  urlML?: string;
  storeName?: string;
  status: 'available' | 'unavailable';
}

export function GiftCard({ gift }: { gift: Gift }) {
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'details' | 'success'>('details');
  const router = useRouter();
  
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);

  const cartItem = items.find((i) => i.id === gift._id);
  const maxAvailable = gift.stock - (cartItem?.quantity || 0);
  
  // Realmente agotado (en base de datos)
  const isExhaustedDB = gift.stock <= 0 || gift.status === 'unavailable';
  // Agotado para el usuario actual (ya tiene todo el stock en el carrito)
  const isExhaustedUser = maxAvailable <= 0;

  const handleAddToCart = () => {
    if (isExhaustedUser || isExhaustedDB) return;
    
    addItem({
      id: gift._id,
      name: gift.name,
      price: gift.price,
      quantity: selectedQuantity,
      maxStock: gift.stock,
      photo: gift.photos[0] || '/placeholder.png',
    });
    
    setStep('success');
    setSelectedQuantity(1);
  };

  const resetDialog = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Pequena demora para que no se vea el cambio de contenido mientras cierra
      setTimeout(() => setStep('details'), 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={resetDialog}>
      <DialogTrigger
        nativeButton={false}
        render={
          <Card
            className={`overflow-hidden cursor-pointer hover:shadow-md transition-all group ${isExhaustedDB ? 'opacity-50 grayscale' : ''}`}
          />
        }
      >
        <div className="aspect-square relative w-full bg-white">
          {gift.photos && gift.photos.length > 0 ? (
            <Image
              src={gift.photos[0]}
              alt={gift.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Sin foto
            </div>
          )}
          
          {isExhaustedDB && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white px-4 py-2 text-sm font-bold rounded-xl shadow uppercase tracking-wide text-gray-800">
                Agotado
              </span>
            </div>
          )}

          {!isExhaustedDB && cartItem && (
            <div className="absolute top-2 right-2 z-10">
              <div className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                <ShoppingCart className="h-3 w-3" />
                <span>{cartItem.quantity} EN CARRITO</span>
              </div>
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <Tooltip>
            <TooltipTrigger render={<h3 className="font-bold text-gray-800 line-clamp-2 leading-tight font-serif text-base h-[2.5rem]" />}>
              {gift.name}
            </TooltipTrigger>
            <TooltipContent>{gift.name}</TooltipContent>
          </Tooltip>
          <div className="flex justify-between items-center text-sm font-semibold text-primary">
            <span className="text-base">
              {new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
              }).format(gift.price)}
            </span>
            <span className="text-gray-400 font-medium text-xs">
              Stock: {gift.stock}
            </span>
          </div>
        </CardContent>
      </DialogTrigger>

      <DialogContent>
        {step === 'details' ? (
          <>
            <DialogHeader className="pt-8 px-8">
              <Tooltip>
                <TooltipTrigger render={<DialogTitle className="font-serif text-2xl text-primary line-clamp-2 leading-tight" />}>
                  {gift.name}
                </TooltipTrigger>
                <TooltipContent>{gift.name}</TooltipContent>
              </Tooltip>
              <DialogDescription className="text-gray-500 font-medium text-lg">
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0,
                }).format(gift.price)}
              </DialogDescription>
            </DialogHeader>

            <div className="px-8 py-2">
              <GiftCarousel photos={gift.photos} name={gift.name} />
            </div>

            <div className="px-8 pb-10 space-y-6">
              {gift.description && (
                <p className="text-sm text-gray-600 font-sans leading-relaxed">
                  {gift.description}
                </p>
              )}

              {gift.urlML && (
                <a
                  href={gift.urlML}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-sm group/ml"
                >
                  <ExternalLink className="h-4 w-4 mr-2 group-hover/ml:translate-x-0.5 group-hover/ml:-translate-y-0.5 transition-transform" />
                  Ver detalles en {gift.storeName || (gift.urlML.includes('amazon') ? 'Amazon' : 'Mercado Libre')}
                </a>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                  <span>Disponibilidad total: {gift.stock}</span>
                  {cartItem && (
                    <span className="text-primary">Ya tienes {cartItem.quantity} ud.</span>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Cantidad</span>
                    <div className="flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-primary hover:bg-white hover:shadow-sm rounded-xl"
                        onClick={() =>
                          setSelectedQuantity(Math.max(1, selectedQuantity - 1))
                        }
                        disabled={isExhaustedDB || selectedQuantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="w-10 text-center font-bold text-gray-700">
                        {selectedQuantity}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-primary hover:bg-white hover:shadow-sm rounded-xl"
                        onClick={() =>
                          setSelectedQuantity(
                            Math.min(maxAvailable, selectedQuantity + 1),
                          )
                        }
                        disabled={isExhaustedDB || isExhaustedUser || selectedQuantity >= maxAvailable}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    className="w-full h-14 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                    onClick={handleAddToCart}
                    disabled={isExhaustedDB || isExhaustedUser}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2 shrink-0" />
                    {isExhaustedDB 
                      ? 'Agotado' 
                      : isExhaustedUser 
                        ? '¡Ya en tu carrito!' 
                        : 'Agregar al carrito'}
                  </Button>
                </div>
                
                {isExhaustedUser && !isExhaustedDB && (
                  <p className="text-center text-[10px] text-primary font-bold uppercase tracking-wide animate-pulse">
                    Has seleccionado todas las unidades disponibles
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-bold text-primary">¡Regalo Añadido!</h2>
              <p className="text-gray-500 text-sm">
                Has agregado <span className="font-bold text-gray-800">{gift.name}</span> a tu selección.
              </p>
            </div>
            
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <p className="text-xs text-primary font-bold uppercase tracking-wider mb-2 text-rose-500">¡Paso importante!</p>
              <p className="text-gray-600 text-sm">
                Recuerda que debes <span className="font-bold">confirmar tu regalo</span> en el carrito para que quede reservado oficialmente.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                className="w-full h-12 rounded-2xl font-bold shadow-lg"
                onClick={() => router.push('/carrito')}
              >
                Ir a Confirmar Ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-gray-500 font-semibold"
                onClick={() => setOpen(false)}
              >
                Seguir eligiendo regalos
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
