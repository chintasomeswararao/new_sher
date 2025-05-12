import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isAuthenticated = !!session?.user;
  const pathname = request.nextUrl.pathname;
  
  // Define public and protected paths
  const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isProtectedPath = pathname === '/' || 
                          pathname.startsWith('/chat/') || 
                          pathname === '/history' ||
                          pathname.startsWith('/api/chat');
  
  // Redirect unauthenticated users to login
  if (!isAuthenticated && isProtectedPath && !isAuthPath) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }
  
  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthPath) {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/chat/:path*',
    '/history',
    '/api/chat/:path*',
    '/login',
    '/register'
  ],
};
