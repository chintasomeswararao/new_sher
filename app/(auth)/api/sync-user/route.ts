// // app/(auth)/api/sync-user/route.ts
// import { cookies } from 'next/headers';
// import { NextRequest, NextResponse } from 'next/server';

// export async function GET() {
//   try {
//     // Get session from cookie
//     const cookieStore = await cookies();
//     const sessionCookie = cookieStore.get('next-auth.session-token');
    
//     if (!sessionCookie?.value) {
//       return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
//     }
    
//     // Get session data by calling the session endpoint
//     const sessionResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/session`, {
//       headers: {
//         Cookie: `next-auth.session-token=${sessionCookie.value}`,
//       },
//     });
    
//     if (!sessionResponse.ok) {
//       return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
//     }
    
//     const session = await sessionResponse.json();
    
//     if (!session?.user?.id || !session?.accessToken) {
//       return NextResponse.json({ error: 'Invalid session data' }, { status: 401 });
//     }
    
//     // Call your backend API with user data
//     const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/user`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: new URLSearchParams({
//         user_id: session.user.id,
//         email: session.user.email || '',
//         access_token: session.accessToken || '',
//         expires_at: session.expiresAt || new Date(Date.now() + 24*60*60*1000).toISOString(),
//       }).toString(),
//     });
    
//     if (!apiResponse.ok) {
//       const errorText = await apiResponse.text();
//       console.error('Failed to sync user data:', errorText);
//       return NextResponse.json({ error: 'Failed to sync user data' }, { status: 500 });
//     }
    
//     const result = await apiResponse.json();
//     return NextResponse.json(result);
//   } catch (error) {
//     console.error('Error in sync-user API route:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// app/api/sync-user/route.ts
import { auth } from '@/app/(auth)/auth';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || !session?.user?.email) {
      return new NextResponse('No user session', { status: 401 });
    }
    
    // Sync user with backend
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        user_id: session.user.id,
        email: session.user.email,
        access_token: session.accessToken || '',
        expires_at: session.expiresAt || '',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to sync user: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error syncing user:', error);
    return new NextResponse('Failed to sync user', { status: 500 });
  }
}