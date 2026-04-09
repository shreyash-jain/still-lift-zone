export const runtime = 'edge';

// Still Zone - Route Protection Middleware
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // SuperAdmin Portal Route Protection
  if (pathname.startsWith('/super-admin-stillzone')) {
    const isLoginPage = pathname === '/super-admin-stillzone/login';
    const isAuthApi = pathname.startsWith('/super-admin-stillzone/api/auth');

    const adminSession = request.cookies.get('super_admin_session');

    if (isLoginPage) {
      if (adminSession) {
        // If already logged in, no need to see the login page
        return NextResponse.redirect(new URL('/super-admin-stillzone', request.url));
      }
      return NextResponse.next();
    }

    if (isAuthApi) {
      return NextResponse.next();
    }

    if (!adminSession) {
      const loginUrl = new URL('/super-admin-stillzone/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Only apply middleware to Still Zone routes
  if (!pathname.startsWith('/still-zone')) {
    return NextResponse.next();
  }

  // Public routes that don't need authentication
  const publicRoutes = [
    '/still-zone',
    '/still-zone/signup',
    '/still-zone/login',
  ];

  // Check if route is public
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // For protected routes, we'll handle auth checks in the page components
  // This middleware can be extended to check for auth tokens/cookies if needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/still-zone/:path*',
    '/super-admin-stillzone/:path*'
  ],
};

