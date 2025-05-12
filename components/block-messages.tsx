import { PreviewMessage } from './message';
import { useScrollToBottom } from './use-scroll-to-bottom';
import { ChatRequestOptions, Message } from 'ai';
import { memo } from 'react';
import equal from 'fast-deep-equal';

export type Vote = {
  id: string;
  messageId: string;
  userId: string;
  value: 'up' | 'down';
  createdAt: Date;
};

interface BlockMessagesProps {
  chatId: string;
  messages: Message[];
  isLoading: boolean;
  preview?: Message;
  votes?: Vote[];
  setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void;
  reload: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
  isReadonly: boolean;
}

export const BlockMessages = memo(function BlockMessages({
  chatId,
  messages,
  isLoading,
  preview,
  votes,
  setMessages,
  reload,
  isReadonly,
}: BlockMessagesProps) {
  const [messagesContainerRef, messagesEndRef, scrollToBottom] = useScrollToBottom<HTMLDivElement>();

  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
      {messages.map((message, i) => (
        <div key={message.id} className="py-4">
          <PreviewMessage
            chatId={chatId}
            message={message}
            isLoading={isLoading && i === messages.length - 1}
            vote={votes?.find(v => v.messageId === message.id)}
            setMessages={setMessages}
            reload={reload}
            isReadonly={isReadonly}
          />
        </div>
      ))}
      {preview && (
        <div className="py-4">
          <PreviewMessage
            chatId={chatId}
            message={preview}
            isLoading={isLoading}
            vote={votes?.find(v => v.messageId === preview.id)}
            setMessages={setMessages}
            reload={reload}
            isReadonly={isReadonly}
          />
        </div>
      )}
      <div ref={messagesEndRef} className="shrink-0 min-w-[24px] min-h-[24px]" />
    </div>
  );
}, equal);
