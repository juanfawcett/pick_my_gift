import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth_user');

  const { pathname } = request.nextUrl;

  // Si ya tiene sesión activa y está en la página principal (login), redirigir a los regalos
  if (authCookie && pathname === '/') {
    return NextResponse.redirect(new URL('/regalos', request.url));
  }

  // Si NO tiene sesión y quiere acceder a páginas privadas, redirigir al login principal
  if (
    !authCookie &&
    (pathname.startsWith('/regalos') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/carrito'))
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protección adicional para rutas de admin
  if (authCookie && pathname.startsWith('/admin')) {
    try {
      const user = JSON.parse(authCookie.value);
      if (user.role !== 'admin') {
        return NextResponse.redirect(new URL('/regalos', request.url));
      }
    } catch (error) {
      // Si la cookie es inválida, forzamos inicio de sesión
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/regalos', '/carrito', '/admin/:path*'],
};
