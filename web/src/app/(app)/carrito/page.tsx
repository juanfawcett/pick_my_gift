'use client';

import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } =
    useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.id,
            quantity: i.quantity,
            price: i.price,
          })),
          total: totalPrice(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(
          '¡Reserva confirmada con éxito! Muchísimas gracias de parte de Scarlett.',
        );
        clearCart();
        router.push('/regalos');
      } else {
        alert(`Error al apartar: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('Hubo un problema de conexión al despachar.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <ShoppingCart className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          Tu carrito está vacío
        </h2>
        <p className="text-gray-500 max-w-sm">
          Aún no has seleccionado ningún regalo para Scarlett.
        </p>
        <Button asChild className="mt-8 font-semibold w-full max-w-xs">
          <Link href="/regalos">Ver listado de regalos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Tu Selección
        </h1>
        <Button variant="destructive" size="sm" onClick={() => clearCart()}>
          Limpiar todo
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden border-border/40 shadow-sm transition-all hover:shadow-md"
            >
              <CardContent className="p-0 flex items-stretch">
                <div className="w-28 relative bg-gray-100 shrink-0">
                  <Image
                    src={item.photo}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between ml-2">
                  <div className="flex justify-between gap-4">
                    <h3 className="font-bold text-gray-800 line-clamp-2 leading-tight">
                      {item.name}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-500 rounded-full hover:bg-rose-50 hover:text-rose-600 shrink-0"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-end justify-between mt-auto pt-4">
                    <div className="font-semibold text-primary">
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                      }).format(item.price)}
                    </div>

                    <div className="flex items-center border rounded-md h-8 bg-zinc-50 border-zinc-200">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-8 text-zinc-500 hover:text-zinc-900 rounded-none rounded-l-md"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div className="w-10 text-center font-medium text-sm">
                        {item.quantity}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-8 text-zinc-500 hover:text-zinc-900 rounded-none rounded-r-md"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.maxStock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resumen */}
        <Card className="sticky top-24 shadow-md bg-white border-primary/10">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-bold text-lg border-b pb-4 text-gray-900">
              Resumen del Carrito
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>
                  Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} ítems)
                </span>
                <span className="font-medium">
                  {new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                  }).format(totalPrice())}
                </span>
              </div>
            </div>

            <div className="border-t pt-4 border-dashed">
              <div className="flex justify-between font-bold text-gray-900 text-lg">
                <span>Total</span>
                <span className="text-primary">
                  {new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                  }).format(totalPrice())}
                </span>
              </div>
            </div>

            <Button
              className="w-full h-12 text-md font-bold hover:-translate-y-0.5 transition-transform shadow-md rounded-xl"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Confirmando reserva...' : 'Confirmar Regalos'}
            </Button>
            <p className="text-xs text-center text-gray-400 font-medium">
              No se generarán cobros, es una lista de reserva.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
