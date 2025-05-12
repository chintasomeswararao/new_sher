import type { NextAuthConfig } from 'next-auth';

// Make sure this config is Edge-compatible
export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  providers: [], // Empty array for Edge compatibility
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAuth = nextUrl.pathname.startsWith('/login') || 
                      nextUrl.pathname.startsWith('/register');
      const isOnChat = nextUrl.pathname.startsWith('/chat/');
      const isOnHistory = nextUrl.pathname === '/history';
      
      // Redirect unauthenticated users to login page
      if (!isLoggedIn && (isOnChat || isOnHistory)) {
        return Response.redirect(new URL('/login', nextUrl));
      }

      // Redirect authenticated users away from auth pages
      if (isLoggedIn && isOnAuth) {
        return Response.redirect(new URL('/', nextUrl));
      }

      // Allow access to everything else
      return true;
    },
  },
} satisfies NextAuthConfig;
