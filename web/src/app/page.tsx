'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });

      if (res.ok) {
        router.push('/regalos');
      } else {
        const data = await res.json();
        alert(data.error || 'Algo salió mal');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/20">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 rounded-full p-4 mb-2 inline-block">
            <span className="text-4xl">🍼</span>
          </div>
          <CardTitle className="text-3xl font-extrabold text-primary">
            Baby Shower de Scarlett
          </CardTitle>
          <CardDescription className="text-base text-gray-500">
            Ingresa tus datos para ver y elegir los regalitos.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">
                Nombre completo
              </Label>
              <Input
                id="name"
                placeholder="Ej. Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
                className="text-base py-6 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 font-medium">
                Número de celular
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Ej. 3001234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                required
                className="text-base py-6 focus-visible:ring-primary"
              />
              <p className="text-sm text-gray-400 pt-1">
                Solo para identificar tus regalos.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full text-lg py-6 font-bold"
              disabled={loading || !name || !phone}
            >
              {loading ? 'Entrando...' : 'Entrar a la lista de regalos'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
