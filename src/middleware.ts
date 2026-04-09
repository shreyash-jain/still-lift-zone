// Still Zone - Route Protection Middleware
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Debug logging to verify middleware execution
  console.log(`[Middleware] Processing request for: ${pathname}`);
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

  // All API routes should be accessible (they handle their own auth)
  if (pathname.startsWith('/still-zone/api/')) {
    return NextResponse.next();
  }

  // Public routes that don't need authentication
  const publicRoutes = [
    '/still-zone/signup',
    '/still-zone/login',
    '/still-zone/auth/callback',
  ];

  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPublicRoute) {
    console.log(`[Middleware] Public route allowed: ${pathname}`);
    return NextResponse.next();
  }

  // Check for authentication token in cookies
  // We check for 'access_token' (set by our auth utils) 
  const hasAccessToken = request.cookies.has('access_token');

  // If your app strictly relies on 'access_token' cookie:
  const hasAuth = hasAccessToken;

  console.log(`[Middleware] Auth check for ${pathname}: ${hasAuth ? 'Authenticated' : 'Missing Token'}`);

  if (!hasAuth) {
    console.log(`[Middleware] Redirecting unauthenticated user to login from ${pathname}`);
    const loginUrl = new URL('/still-zone/login', request.url);
    // Add return URL so they are sent back after login
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow access if authenticated
  return NextResponse.next();
}

export const config = {
  // Matcher must explicitly cover /still-zone and subpaths
  matcher: [
    '/still-zone',
    '/still-zone/:path*',
    '/super-admin-stillzone/:path*'
  ],
};
