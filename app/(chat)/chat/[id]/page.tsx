import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME, DEFAULT_REASONING_MODEL_NAME } from '@/lib/ai/models';
import { VisibilityType } from '@/components/visibility-selector';

// Generating page props interface
interface GeneratedPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ChatPage(props: GeneratedPageProps) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  const resolvedParams = await props.params;
  const chatId = resolvedParams.id;
  const visibility: VisibilityType = 'private';

  return (
    <div className="flex h-screen flex-col">
      <Chat 
        id={chatId}
        initialMessages={[]}
        selectedModelId={DEFAULT_MODEL_NAME}
        selectedReasoningModelId={DEFAULT_REASONING_MODEL_NAME}
        selectedVisibilityType={visibility}
        isReadonly={false}
      />
    </div>
  );
}