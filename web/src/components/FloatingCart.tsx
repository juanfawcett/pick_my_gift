'use client';

import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function FloatingCart() {
  const itemsCount = useCartStore((state) => state.totalItems());
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (itemsCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [itemsCount]);

  if (!mounted || itemsCount === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href="/carrito" className="group flex items-center gap-3">
        <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-primary/20 text-primary font-bold text-sm hidden md:block group-hover:scale-105 transition-transform">
          Revisar y Confirmar
        </div>
        <div className={cn(
          "bg-primary text-white p-4 rounded-full shadow-2xl relative hover:scale-110 active:scale-95 transition-all duration-300",
          isAnimating && "scale-125"
        )}>
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute -top-2 -right-2 bg-white text-primary border-2 border-primary h-7 w-7 rounded-full flex items-center justify-center text-xs font-black shadow-md animate-in zoom-in duration-300">
            {itemsCount}
          </span>
        </div>
      </Link>
    </div>
  );
}
