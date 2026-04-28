'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Trash2, ArrowDownAZ, ArrowUpAZ, ArrowDownNarrowWide, ArrowUpNarrowWide } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export default function AdminPage() {
  const [url, setUrl] = useState('');
  const [loadingScrape, setLoadingScrape] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  // Formulario del Regalo
  const [giftData, setGiftData] = useState({
    name: '',
    price: 0,
    stock: 1,
    urlML: '',
    storeName: '',
    photos: [] as string[],
  });

  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const [existingGifts, setExistingGifts] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [adminSort, setAdminSort] = useState<'default' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'>('default');

  const sortedGifts = useMemo(() => {
    const list = [...existingGifts];
    switch (adminSort) {
      case 'name-asc':  return list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
      case 'name-desc': return list.sort((a, b) => b.name.localeCompare(a.name, 'es'));
      case 'price-asc': return list.sort((a, b) => a.price - b.price);
      case 'price-desc':return list.sort((a, b) => b.price - a.price);
      default:          return list;
    }
  }, [existingGifts, adminSort]);

  const fetchGifts = async () => {
    try {
      const res = await fetch('/api/admin/gifts');
      if (res.ok) {
        const { gifts } = await res.json();
        setExistingGifts(gifts);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoadingScrape(true);
    try {
      const res = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (res.ok) {
        setGiftData({
          name: data.title || '',
          price: data.price || 0,
          stock: 1, // Asumimos 1 por defecto, tú puedes cambiarlo manual
          urlML: url,
          storeName: data.storeName || '',
          photos: data.photos || [],
        });
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al intentar extraer la información.');
    } finally {
      setLoadingScrape(false);
    }
  };

  const handleSaveGift = async () => {
    if (!giftData.name || giftData.price <= 0 || giftData.stock <= 0) {
      return toast.warning('El nombre, precio y stock son obligatorios');
    }

    setLoadingSave(true);
    try {
      const res = await fetch('/api/admin/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(giftData),
      });

      if (res.ok) {
        toast.success('¡Regalo guardado con éxito!');
        fetchGifts();
        setUrl('');
        setGiftData({ name: '', price: 0, stock: 1, urlML: '', storeName: '', photos: [] });
      } else {
        const err = await res.json();
        toast.error(err.error || 'No se pudo guardar');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión');
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/gifts/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Regalo eliminado');
        fetchGifts();
      }
    } catch (e) {
      console.error(e);
      toast.error('Error al eliminar');
    } finally {
      setDeleteId(null);
    }
  };

  const handleUpdateStock = async (id: string, newStock: number) => {
    if (newStock < 0) return toast.warning('El stock no puede ser negativo');
    try {
      const res = await fetch(`/api/admin/gifts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        toast.success('Stock actualizado');
        fetchGifts();
      } else {
        toast.error('No se pudo actualizar el stock');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error de conexión');
    }
  };

  return (
    <>
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Panel de Administrador
            </h1>
            <p className="text-gray-500">
              Agrega nuevos regalos pegando un link de MercadoLibre o Amazon.
            </p>
          </div>
          <Button
            onClick={() => (window.location.href = '/admin/reservas')}
            className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-6 shadow border border-primary/20"
          >
            👀 Ver Lista de Reservas
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulario de Scraping */}
          <div className="space-y-6">
            <Card className="p-0">
              <CardHeader className="pt-6 px-6 pb-4">
                <CardTitle>1. Link de MercadoLibre o Amazon</CardTitle>
                <CardDescription>
                  Copia y pega la URL del producto que quieres añadir a la lista
                  de regalos.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <form onSubmit={handleScrape} className="flex gap-2">
                  <Input
                    placeholder="Link de MercadoLibre o Amazon..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                  <Button type="submit" disabled={loadingScrape || !url}>
                    {loadingScrape ? 'Buscando...' : 'Extraer Información'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Formulario de Edición (Preview) */}
            {giftData.name !== '' && (
              <Card className="border-primary/20 bg-white shadow-md p-0">
                <CardHeader className="pt-6 px-6 pb-4">
                  <CardTitle>2. Revisa y Guarda</CardTitle>
                  <CardDescription>
                    Confirma la información extraída y ajústala si es necesario.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-6 pb-6">
                  <div className="space-y-2">
                    <Label className="text-primary font-semibold">Nombre del Regalo</Label>
                    <Input
                      className="bg-white border-primary/20 focus-visible:ring-primary/20"
                      value={giftData.name}
                      onChange={(e) =>
                        setGiftData({ ...giftData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-primary font-semibold">Nombre de la Tienda (Marketplace)</Label>
                    <Input
                      placeholder="Ej: Falabella, Pepe Ganga, Lego Store..."
                      className="bg-white border-primary/20 focus-visible:ring-primary/20"
                      value={giftData.storeName}
                      onChange={(e) =>
                        setGiftData({ ...giftData, storeName: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-primary font-semibold">Precio (COP)</Label>
                      <Input
                        type="number"
                        className="bg-white border-primary/20 focus-visible:ring-primary/20"
                        value={giftData.price}
                        onChange={(e) =>
                          setGiftData({
                            ...giftData,
                            price: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-primary font-semibold">Cantidad/Stock</Label>
                      <Input
                        type="number"
                        min={1}
                        className="bg-white border-primary/20 focus-visible:ring-primary/20"
                        value={giftData.stock}
                        onChange={(e) =>
                          setGiftData({
                            ...giftData,
                            stock: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-primary font-semibold">Fotos del Producto</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Pega el link de una foto..."
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        className="flex-1 text-xs"
                      />
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          if (newPhotoUrl) {
                            setGiftData({ ...giftData, photos: [...giftData.photos, newPhotoUrl] });
                            setNewPhotoUrl('');
                          }
                        }}
                      >
                        Añadir
                      </Button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto py-2 px-1">
                      {giftData.photos.map((src, idx) => (
                        <div
                          key={idx}
                          className="relative h-24 w-24 shrink-0 rounded-xl overflow-hidden border-2 border-primary/10 shadow-sm group/photo"
                        >
                          <Image
                            src={src}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                          <button 
                            className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover/photo:opacity-100 transition-opacity"
                            onClick={() => setGiftData({ ...giftData, photos: giftData.photos.filter((_, i) => i !== idx) })}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {giftData.photos.length === 0 && (
                        <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl w-full">
                          <span className="text-sm text-gray-400 italic font-serif">Sin fotos. Agrega una arriba.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    className="w-full font-bold text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    onClick={handleSaveGift}
                    disabled={loadingSave}
                  >
                    {loadingSave ? 'Guardando...' : 'Guardar Regalo'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Lista de Regalos Existentes */}
          <Card className="p-0">
            <CardHeader className="pt-6 px-6 pb-4">
              <CardTitle>Inventario Actual</CardTitle>
              <CardDescription>
                Estos son los regalos que ya cargaste a la BD.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {/* Sort controls */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mr-1">Ordenar:</span>
                {[
                  { key: 'name-asc' as const, label: 'A → Z', icon: <ArrowDownAZ className="h-3.5 w-3.5" /> },
                  { key: 'name-desc' as const, label: 'Z → A', icon: <ArrowUpAZ className="h-3.5 w-3.5" /> },
                  { key: 'price-asc' as const, label: '$ ↑', icon: <ArrowDownNarrowWide className="h-3.5 w-3.5" /> },
                  { key: 'price-desc' as const, label: '$ ↓', icon: <ArrowUpNarrowWide className="h-3.5 w-3.5" /> },
                ].map((opt) => (
                  <Button
                    key={opt.key}
                    variant={adminSort === opt.key ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full gap-1 text-xs h-7 px-3 font-semibold ${
                      adminSort === opt.key ? 'shadow-sm' : 'text-gray-500 border-gray-200'
                    }`}
                    onClick={() => setAdminSort(adminSort === opt.key ? 'default' : opt.key)}
                  >
                    {opt.icon}
                    {opt.label}
                  </Button>
                ))}
              </div>
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
                {sortedGifts.map((gift) => (
                  <div
                    key={gift._id}
                    className="flex items-center gap-3 border p-3 rounded-lg bg-white"
                  >
                    <div className="relative h-12 w-12 rounded-sm overflow-hidden bg-gray-100 shrink-0">
                      {gift.photos?.[0] && (
                        <Image
                          src={gift.photos[0]}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 truncate">
                        {gift.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase font-semibold text-gray-400">Stock:</span>
                        <Input
                          key={`${gift._id}-${gift.stock}`}
                          type="number"
                          min={0}
                          className="h-7 w-16 text-xs"
                          defaultValue={gift.stock}
                          onBlur={(e) => {
                            const val = parseInt(e.target.value);
                            if (isNaN(val) || val < 0) {
                              e.target.value = gift.stock.toString();
                              return;
                            }
                            if (val !== gift.stock) handleUpdateStock(gift._id, val);
                          }}
                        />
                        <span className="text-[10px] text-gray-400 uppercase">Estado: {gift.status}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-rose-500"
                      onClick={() => handleDelete(gift._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {existingGifts.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No has cargado regalos aún.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="¿Eliminar Regalo?"
        description="Esta acción no se puede deshacer. El regalo se borrará permanentemente de la lista."
        confirmText="Sí, eliminar"
        cancelText="No, cancelar"
        onConfirm={confirmDelete}
      />
    </>
  );
}
