import NextAuth, { type Session, type User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// Extended types for user and session with API token
interface ExtendedUser extends User {
  accessToken?: string;
  expiresAt?: string;
}

interface ExtendedSession extends Session {
  user: {
    id: string;
    email: string;
  };
  accessToken?: string;
  expiresAt?: string;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        try {
          if (!email || !password) return null;

          console.log('=============================================');
          console.log('AUTHENTICATION ATTEMPT');
          console.log('Email:', email);
          console.log('Password: [REDACTED]');
          console.log('=============================================');
          
          try {
            console.log('Making API request to: https://inpharmd.ai/api/v2/login');
            
            const response = await fetch('https://inpharmd.ai/api/v2/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                email,
                password
              }).toString(),
            });

            if (!response.ok) {
              console.error(`API Error: ${response.status} ${response.statusText}`);
              const errorText = await response.text();
              console.error('API Error Details:', errorText);
              return null;
            }

            const data = await response.json();
            
            console.log('=============================================');
            console.log('API RESPONSE SUCCESS');
            console.log('Status:', response.status);
            console.log('Response Body:', JSON.stringify(data, null, 2));
            console.log('=============================================');
            
            if (!data?.user_id) {
              console.error('API response missing user_id:', data);
              return null;
            }

            const user = {
              id: data.user_id,
              email: data.email,
              accessToken: data.access_token,
              expiresAt: data.expires_at,
            } as ExtendedUser;
            
            console.log('=============================================');
            console.log('USER AUTHENTICATED SUCCESSFULLY');
            console.log('User ID:', user.id);
            console.log('Email:', user.email);
            console.log('Token:', user.accessToken);
            console.log('Expires:', user.expiresAt);
            console.log('=============================================');
            
            return user;
          } catch (apiError) {
            console.error('=============================================');
            console.error('API REQUEST ERROR');
            console.error(apiError);
            console.error('=============================================');
            return null;
          }
        } catch (err) {
          console.error('=============================================');
          console.error('AUTHORIZATION ERROR');
          console.error(err);
          console.error('=============================================');
          return null;
        }
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAuth = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');
      const isOnProtectedPage = nextUrl.pathname.startsWith('/chat/') || nextUrl.pathname === '/history';

      if (!isLoggedIn && isOnProtectedPage) {
        return Response.redirect(new URL('/login', nextUrl));
      }
      if (isLoggedIn && isOnAuth) {
        return Response.redirect(new URL('/', nextUrl));
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.accessToken = (user as ExtendedUser).accessToken;
        token.expiresAt = (user as ExtendedUser).expiresAt;
      }
      return token;
    },

    async session({ session, token }: { session: ExtendedSession; token: any }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.accessToken = token.accessToken;
      session.expiresAt = token.expiresAt;
      return session;
    },
  },
});
