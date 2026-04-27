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

interface Gift {
  _id: string;
  name: string;
  price: number;
  stock: number;
  photos: string[];
  description?: string;
  urlML?: string;
  status: 'available' | 'unavailable';
}

export function GiftCard({ gift }: { gift: Gift }) {
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);

  const cartItem = items.find((i) => i.id === gift._id);
  const maxAvailable = gift.stock - (cartItem?.quantity || 0);
  const isAvailable = maxAvailable > 0 && gift.status === 'available';

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addItem({
      id: gift._id,
      name: gift.name,
      price: gift.price,
      quantity: selectedQuantity,
      maxStock: gift.stock,
      photo: gift.photos[0] || '/placeholder.png', // Default image
    });
    setSelectedQuantity(1); // Reset selected
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Card
            className={`overflow-hidden cursor-pointer hover:shadow-md transition-all group ${!isAvailable ? 'opacity-50 grayscale' : ''}`}
          />
        }
      >
        <div className="aspect-square relative w-full bg-gray-100">
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
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white px-4 py-2 text-sm font-bold rounded shadow uppercase tracking-wide text-gray-800">
                Agotado
              </span>
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-bold text-gray-800 line-clamp-1 leading-snug">
            {gift.name}
          </h3>
          <div className="flex justify-between items-center text-sm font-semibold text-primary">
            <span>
              {new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
              }).format(gift.price)}
            </span>
            <span className="text-gray-500 font-normal">
              Disp: {maxAvailable}
            </span>
          </div>
        </CardContent>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{gift.name}</DialogTitle>
          <DialogDescription className="text-primary font-semibold text-lg">
            {new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
            }).format(gift.price)}
          </DialogDescription>
        </DialogHeader>

        <GiftCarousel photos={gift.photos} name={gift.name} />

        {gift.description && (
          <p className="text-sm text-gray-600 mb-4">{gift.description}</p>
        )}

        {gift.urlML && (
          <div className="mb-4 mt-2">
            <a
              href={gift.urlML}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Ver Producto en Mercado Libre
            </a>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              En carrito:{' '}
              <span className="font-semibold text-black">
                {cartItem?.quantity || 0}
              </span>
            </span>
            <span className="text-gray-500">
              Disp. Extra:{' '}
              <span className="font-semibold text-black">{maxAvailable}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-gray-500"
                onClick={() =>
                  setSelectedQuantity(Math.max(1, selectedQuantity - 1))
                }
                disabled={!isAvailable || selectedQuantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="w-12 text-center font-medium">
                {selectedQuantity}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-gray-500"
                onClick={() =>
                  setSelectedQuantity(
                    Math.min(maxAvailable, selectedQuantity + 1),
                  )
                }
                disabled={!isAvailable || selectedQuantity >= maxAvailable}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              className="flex-1"
              onClick={handleAddToCart}
              disabled={!isAvailable}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isAvailable ? 'Agregar' : 'Agotado'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
