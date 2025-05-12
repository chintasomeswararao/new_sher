import { auth, signIn } from '@/app/(auth)/auth';

async function getOrCreateSession() {
  let session = await auth();

  if (!session) {
    session = await signIn();
  }

  return session;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('documentId');
  const documentCreatedAt = searchParams.get('documentCreatedAt');

  if (!documentId || !documentCreatedAt) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await getOrCreateSession();

  if (!session?.user?.id) {
    return new Response('Authentication required', { status: 401 });
  }

  // Return empty suggestions array since we're not persisting data
  return new Response(JSON.stringify([]), { status: 200 });
}

export async function POST(request: Request) {
  const session = await getOrCreateSession();

  if (!session?.user?.id) {
    return new Response('Authentication required', { status: 401 });
  }

  // No database persistence needed
  return new Response('Suggestion created', { status: 200 });
}

export async function PATCH(request: Request) {
  const session = await getOrCreateSession();

  if (!session?.user?.id) {
    return new Response('Authentication required', { status: 401 });
  }

  // No database persistence needed
  return new Response('Suggestion updated', { status: 200 });
}
