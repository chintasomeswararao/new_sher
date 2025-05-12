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
  const id = searchParams.get('id');
  const createdAt = searchParams.get('createdAt');

  if (!id || !createdAt) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await getOrCreateSession();

  if (!session?.user?.id) {
    return new Response('Authentication required', { status: 401 });
  }

  // Return empty document since we're not persisting data
  return new Response(JSON.stringify({
    id,
    createdAt,
    title: 'Untitled Document',
    content: '',
    kind: 'text',
    userId: session.user.id
  }), { status: 200 });
}

export async function POST(request: Request) {
  const session = await getOrCreateSession();

  if (!session?.user?.id) {
    return new Response('Authentication required', { status: 401 });
  }

  // No database persistence needed
  return new Response('Document created', { status: 200 });
}

export async function PATCH(request: Request) {
  const session = await getOrCreateSession();

  if (!session?.user?.id) {
    return new Response('Authentication required', { status: 401 });
  }

  // No database persistence needed
  return new Response('Document updated', { status: 200 });
}

export async function DELETE(request: Request) {
  const session = await getOrCreateSession();

  if (!session?.user?.id) {
    return new Response('Authentication required', { status: 401 });
  }

  // No database persistence needed
  return new Response('Document deleted', { status: 200 });
}
