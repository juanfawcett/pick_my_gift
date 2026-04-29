'use client';

import { useState, useMemo } from 'react';
import { GiftCard } from './GiftCard';
import { ArrowDownAZ, ArrowUpAZ, ArrowDownNarrowWide, ArrowUpNarrowWide } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SortKey = 'default' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

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

interface GiftGridProps {
  gifts: Gift[];
}

const sortOptions: { key: SortKey; label: string; icon: React.ReactNode }[] = [
  { key: 'name-asc', label: 'A → Z', icon: <ArrowDownAZ className="h-4 w-4" /> },
  { key: 'name-desc', label: 'Z → A', icon: <ArrowUpAZ className="h-4 w-4" /> },
  { key: 'price-asc', label: 'Menor precio', icon: <ArrowDownNarrowWide className="h-4 w-4" /> },
  { key: 'price-desc', label: 'Mayor precio', icon: <ArrowUpNarrowWide className="h-4 w-4" /> },
];

export function GiftGrid({ gifts }: GiftGridProps) {
  const [sort, setSort] = useState<SortKey>('default');

  const sorted = useMemo(() => {
    const list = [...gifts];
    switch (sort) {
      case 'name-asc':  return list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
      case 'name-desc': return list.sort((a, b) => b.name.localeCompare(a.name, 'es'));
      case 'price-asc': return list.sort((a, b) => a.price - b.price);
      case 'price-desc':return list.sort((a, b) => b.price - a.price);
      default:          return list;
    }
  }, [gifts, sort]);

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mr-1">Ordenar:</span>
        {sortOptions.map((opt) => (
          <Button
            key={opt.key}
            variant={sort === opt.key ? 'default' : 'outline'}
            size="sm"
            className={`rounded-full gap-1.5 text-xs font-semibold transition-all ${
              sort === opt.key ? 'shadow-md' : 'text-gray-500 border-gray-200'
            }`}
            onClick={() => setSort(sort === opt.key ? 'default' : opt.key)}
          >
            {opt.icon}
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Gift Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {sorted.map((gift) => (
          <GiftCard key={gift._id} gift={gift} />
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-24 bg-gray-50 rounded-2xl border-2 border-dashed">
          <p className="text-gray-500">Aún no hay regalos disponibles, visítanos pronto.</p>
        </div>
      )}
    </div>
  );
}
