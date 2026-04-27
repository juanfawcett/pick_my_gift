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
  const [needsName, setNeedsName] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    if (needsName && !name) return;

    setLoading(true);
    try {
      const body = needsName ? { phone, name } : { phone };
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.needsRegistration) {
          setNeedsName(true);
        } else {
          router.push('/regalos');
        }
      } else {
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
          <CardTitle className="text-4xl font-serif text-primary tracking-widest uppercase mt-4">
            Scarlett
          </CardTitle>
          <p className="text-sm tracking-[0.2em] text-primary/70 font-serif uppercase">
            Mi Baby Shower
          </p>
          <CardDescription className="text-base text-gray-500 pt-2 italic font-serif">
            Acompáñanos en este día tan especial
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!needsName ? (
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
                  Ingresa tu número para entrar o registrarte.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-primary/10 p-3 rounded-md border border-primary/20 text-center">
                  <p className="text-sm text-primary font-medium">
                    Parece que eres nuevo(a). Por favor, dinos tu nombre para identificarte en los regalos.
                  </p>
                </div>
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
                    autoFocus
                    className="text-base py-6 focus-visible:ring-primary"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full text-lg py-6 font-bold"
              disabled={loading || !phone || (needsName && !name)}
            >
              {loading ? 'Cargando...' : needsName ? 'Completar registro' : 'Entrar a la lista'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
