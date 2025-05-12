import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';

import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME, models, reasoningModels, DEFAULT_REASONING_MODEL_NAME } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { auth, signOut } from '@/app/(auth)/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default async function Page() {
  const id = generateUUID();
  const session = await auth();
  const isAuthenticated = !!session?.user;

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;

  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  const reasoningModelIdFromCookie = cookieStore.get('reasoning-model-id')?.value;

  const selectedReasoningModelId =
    reasoningModels.find((model) => model.id === reasoningModelIdFromCookie)?.id ||
    DEFAULT_REASONING_MODEL_NAME;

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="w-full max-w-md px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Inpharmd Deep Research</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">AI-powered research assistant</p>
          </div>
          
          <Card className="border-2 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Login Required</CardTitle>
              <CardDescription className="text-center">
                Please log in or create an account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-center">
                <p>Access AI-powered research with:</p>
                <ul className="space-y-1 text-sm">
                  <li>• Deep research capabilities</li>
                  <li>• Reliable source findings</li>
                  <li>• Personalized chat history</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/register">Create Account</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="absolute top-4 right-4 z-50">
        <form action={async () => {
          'use server'
          await signOut({ redirectTo: '/login' });
        }}>
          {/* <Button 
            type="submit" 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={16} />
            <span>Logout</span>
          </Button> */}
        </form>
      </div>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedModelId={selectedModelId}
        selectedReasoningModelId={selectedReasoningModelId}
        selectedVisibilityType="private"
        isReadonly={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
