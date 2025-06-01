import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Your middleware logic here
  return NextResponse.next();
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    // Skip static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};


