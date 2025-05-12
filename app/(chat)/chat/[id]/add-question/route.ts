// app/api/chat/[chatId]/add-question/route.ts
import { auth } from '@/app/(auth)/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await auth();
    console.log('[Add Question API] Session:', session?.user?.id);
    
    if (!session?.user?.id) {
      console.log('[Add Question API] No user session found');
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const body = await request.json();
    const { query } = body;
    
    if (!query || !query.trim()) {
      return new NextResponse('Query is required', { status: 400 });
    }
    
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!API_BASE_URL) {
      console.error('[Add Question API] NEXT_PUBLIC_API_URL not configured');
      return NextResponse.json({ error: 'API URL not configured' }, { status: 500 });
    }
    
    const apiUrl = `${API_BASE_URL}/api/v1/chat/${params.chatId}/add-question`;
    console.log('[Add Question API] Posting to:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query.trim(),
        user_id: session.user.id
      }),
    });
    
    console.log('[Add Question API] Backend response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Add Question API] Backend error:', errorText);
      return new NextResponse('Failed to add question', { status: response.status });
    }
    
    const data = await response.json();
    console.log('[Add Question API] Success:', data);
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[Add Question API] Unexpected error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}