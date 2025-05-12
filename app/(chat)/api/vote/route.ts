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
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await getOrCreateSession();

  if (!session?.user?.id) {
    return new Response('Authentication required', { status: 401 });
  }

  // Return empty votes array since we're not persisting votes
  return new Response(JSON.stringify([]), { status: 200 });
}

export async function POST(request: Request) {
  const { chatId, messageId, type } = await request.json();

  if (!chatId || !messageId || !type) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await getOrCreateSession();

  if (!session?.user?.id) {
    return new Response('Authentication required', { status: 401 });
  }

  // No database persistence needed
  return new Response('Vote recorded', { status: 200 });
}
