'use client';

import Link from 'next/link';
import { ShoppingCart, LogOut, Gift } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function Navbar({
  userName,
  role,
}: {
  userName?: string;
  role?: string;
}) {
  const itemsCount = useCartStore((state) => state.totalItems());
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4 max-w-5xl mx-auto">
        <Link
          href="/regalos"
          className="flex items-center gap-2 font-bold text-primary text-lg"
        >
          <span className="text-2xl">🍼</span>
          <span className="hidden sm:inline-block">Baby Shower Scarlett</span>
          <span className="sm:hidden">Scarlett</span>
        </Link>
        <div className="flex items-center gap-4">
          {userName && (
            <span className="text-sm text-gray-600 hidden md:inline-block">
              Hola, {userName}
            </span>
          )}
          {role === 'admin' && (
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Admin
              </Button>
            </Link>
          )}
          <Link href="/mis-regalos">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary hover:bg-primary/10">
              <Gift className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline-block">Mis Regalos</span>
            </Button>
          </Link>
          <Link href="/carrito">
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              {mounted && itemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {itemsCount}
                </span>
              )}
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 ml-1"
            title="Cerrar sesión"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
