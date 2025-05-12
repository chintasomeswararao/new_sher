import { auth, signIn } from '@/app/(auth)/auth';

async function getOrCreateSession() {
  let session = await auth();

  if (!session) {
    session = await signIn();
  }

  return session;
}

export async function GET(request: Request) {
  const session = await getOrCreateSession();

  if (!session?.user?.id) {
    return new Response('Authentication required', { status: 401 });
  }

  // Return empty history since we're not persisting data
  return new Response(JSON.stringify([]), { status: 200 });
}
