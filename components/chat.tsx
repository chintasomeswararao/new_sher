'use client';

import type { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { useState, useRef } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { toast } from 'sonner';
import Image from 'next/image';
import inpharmdLogo from '../public/images/inpharmd.png';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from './block';
import { fetcher } from '@/lib/utils';

import { Block } from './block';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { VisibilityType } from './visibility-selector';
import { useBlockSelector } from '@/hooks/use-block';

export function Chat({
  id,
  initialMessages,
  selectedModelId,
  selectedReasoningModelId,
  selectedVisibilityType,
  isReadonly,

}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
  selectedReasoningModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();
  // Always use deep-research mode
  const searchMode = 'deep-research';
  
  // Reference to forceScrollToBottom function from Messages component
  const forceScrollToBottomRef = useRef<(() => void) | null>(null);

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useChat({
    id,
    body: { 
      id, 
      modelId: selectedModelId, 
      reasoningModelId: selectedReasoningModelId, 
      experimental_deepResearch: true // Always use deep research
    },
    initialMessages,
    experimental_throttle: 100,
    onFinish: () => {
      mutate('/api/v1/history');
    },
    onError: async (error: Error) => {
      if (error.message.includes('Too many requests')) {
        toast.error(
          'Too many requests. Please wait a few seconds before sending another message.',
        );
      } else {
        toast.error(`Error: ${error.message || 'An unknown error occurred'}`);

        if (error instanceof Response || 'status' in error) {
          try {
            const errorData = await (error as Response).json();
            console.error('Response error details:', errorData);
          } catch (e) {
            console.error('Could not parse error response:', e);
          }
        }
      }
    },
  });

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isBlockVisible = useBlockSelector((state) => state.status === 'streaming');

  // Track research running state from QueryManager
  const [isQueryResearchRunning, setIsQueryResearchRunning] = useState(false);
  const handleResearchStart = () => setIsQueryResearchRunning(true);
  const handleResearchEnd = () => setIsQueryResearchRunning(false);

  // Callback to receive the forceScrollToBottom function from Messages
  const setForceScrollToBottom = (fn: () => void) => {
    forceScrollToBottomRef.current = fn;
  };

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background pr-64 overflow-hidden custom-scrollbar">
      {/* <ChatHeader
        chatId={id}
        selectedModelId={selectedModelId}
        selectedReasoningModelId={selectedReasoningModelId}
        selectedVisibilityType={selectedVisibilityType}
        isReadonly={isReadonly}
      /> */}

      <Messages
        chatId={id}
        isLoading={isLoading && !isBlockVisible}
        votes={votes}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        isReadonly={isReadonly}
        isBlockVisible={isBlockVisible}
        onResearchStart={handleResearchStart}
        onResearchEnd={handleResearchEnd}
        setForceScrollToBottom={setForceScrollToBottom}
      />

      <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        {!isReadonly && (
          <MultimodalInput
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            setMessages={setMessages}
            append={append}
            searchMode={searchMode}
            setSearchMode={() => {}} // Empty function as we don't change modes
          />
        )}
      </form>
    </div>
  );
}
