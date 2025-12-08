// Still Zone - Route Protection Middleware
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  ],
};

