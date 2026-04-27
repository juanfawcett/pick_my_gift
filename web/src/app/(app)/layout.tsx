import { cookies } from 'next/headers';
import { Navbar } from '@/components/Navbar';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user')?.value;
  let user = null;

  if (authCookie) {
    try {
      user = JSON.parse(authCookie);
    } catch (e) {
      // JSON parse error
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Navbar userName={user?.name} role={user?.role} />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 py-8">
        {children}
      </main>
    </div>
  );
}
