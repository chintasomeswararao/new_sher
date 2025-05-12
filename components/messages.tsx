import type { Message } from 'ai';
import type { ChatRequestOptions } from '@/lib/types';
import { PreviewMessage, ThinkingMessage } from './message';
import { useScrollToBottom } from './use-scroll-to-bottom';
import { Overview } from './overview';
import React, { memo, useEffect, useState } from 'react';
import { Vote } from './block';
import equal from 'fast-deep-equal';
import { toast } from 'sonner';
import { QueryManager } from './query-manager';

// Extended type for tool invocation with result
interface ExtendedToolInvocation {
  toolName: string;
  state: string;
  result?: {
    success: boolean;
    data: {
      queryObjects: any[];
      originalQueryId: number;
    };
  };
}

interface MessagesProps {
  chatId: string;
  isLoading: boolean;
  votes: Array<Vote> | undefined;
  messages: Array<Message>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
  isBlockVisible: boolean;
  onResearchStart?: () => void;
  onResearchEnd?: () => void;
  setForceScrollToBottom?: (fn: () => void) => void;
}

function PureMessages({
  chatId,
  isLoading,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
  onResearchStart,
  onResearchEnd,
  setForceScrollToBottom,
}: MessagesProps) {
  const [messagesContainerRef, messagesEndRef, forceScrollToBottom] =
    useScrollToBottom<HTMLDivElement>();
  const [lastQueryData, setLastQueryData] = useState<any>(null);
  const [messagesWithResearch, setMessagesWithResearch] = useState<Set<string>>(new Set());
  const [messageResearchData, setMessageResearchData] = useState<Record<string, any>>({});
  const [prevMessageCount, setPrevMessageCount] = useState(0);

  // Pass the forceScrollToBottom function to the parent via setForceScrollToBottom
  useEffect(() => {
    if (setForceScrollToBottom) {
      setForceScrollToBottom(forceScrollToBottom);
    }
  }, [forceScrollToBottom, setForceScrollToBottom]);

  const handleError = async (error: any) => {
    if (error?.response?.status === 429) {
      const data = await error.response.json();
      const resetInSeconds = Math.ceil((data.reset - Date.now()) / 1000);
      toast.error(
        `Rate limit exceeded. Please wait ${resetInSeconds} seconds before trying again.`,
        {
          duration: Math.min(resetInSeconds * 1000, 5000),
        },
      );
    }
  };

  // Force scroll to bottom when a new message is added
  useEffect(() => {
    if (messages.length > prevMessageCount) {
      forceScrollToBottom();
      setPrevMessageCount(messages.length);
    }
  }, [messages.length, prevMessageCount, forceScrollToBottom]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.role === 'assistant') {
        const hasDeepResearch = latestMessage.toolInvocations?.some(
          (inv: any) => inv?.toolName === 'deepResearch' && inv?.state === 'result'
        );

        // const isResearchMessage = 
        //   typeof latestMessage.content === 'string' && 
        //   (latestMessage.content.includes("research") || 
        //    latestMessage.content.includes("queries") ||
        //    latestMessage.content.includes("researched"));

        if (hasDeepResearch) {
          setMessagesWithResearch(prev => {
            const updated = new Set(prev);
            updated.add(latestMessage.id);
            return updated;
          });

          const researchData = latestMessage.toolInvocations?.find(
            (inv: any) => inv?.toolName === 'deepResearch' && inv?.state === 'result'
          ) as any;
          
          if (researchData && researchData.result && researchData.result.data) {
            setMessageResearchData(prev => ({
              ...prev,
              [latestMessage.id]: researchData.result.data
            }));
          }
        // }

        // if ((isResearchMessage && !hasDeepResearch) || (!hasDeepResearch && !lastQueryData)) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/queries`)
            .then(response => {
              if (response.ok) return response.json();
              throw new Error("Failed to fetch latest query");
            })
            .then(data => {
              if (data && data.generated_queries) {
                setLastQueryData(data);
                setMessageResearchData(prev => ({
                  ...prev,
                  [latestMessage.id]: data
                }));
                setMessagesWithResearch(prev => {
                  const updated = new Set(prev);
                  updated.add(latestMessage.id);
                  return updated;
                });
              }
            })
            .catch(error => {
              console.error("Error fetching latest query:", error);
              try {
                const localData = localStorage.getItem('lastQueryData');
                if (localData) {
                  const parsedData = JSON.parse(localData);
                  setLastQueryData(parsedData);
                  setMessageResearchData(prev => ({
                    ...prev,
                    [latestMessage.id]: parsedData
                  }));
                  setMessagesWithResearch(prev => {
                    const updated = new Set(prev);
                    updated.add(latestMessage.id);
                    return updated;
                  });
                }
              } catch (err) {
                console.error("Error retrieving localStorage data:", err);
              }
            });
        }
      }
    }
  }, [messages, lastQueryData]);

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-auto pt-4 custom-scrollbar"
    >
      {/* {messages.length === 0 && <Overview />} */}

      {messages.map((message, index) => {
        const modifiedMessage = messagesWithResearch.has(message.id) && message.role === 'assistant'
          ? { ...message, content: '' }
          : message;

        const shouldShowQueryResults = 
          message.role === 'assistant' && 
          (message.toolInvocations?.some(
            (inv: any) => inv?.toolName === 'deepResearch' && inv?.state === 'result'
          ) || messagesWithResearch.has(message.id));

        const messageData = messageResearchData[message.id];

        return (
          <React.Fragment key={`message-wrapper-${message.id}`}>
            <PreviewMessage
              key={message.id}
              chatId={chatId}
              message={modifiedMessage}
              isLoading={isLoading && messages.length - 1 === index}
              vote={
                votes
                  ? votes.find((vote) => vote.messageId === message.id)
                  : undefined
              }
              setMessages={setMessages}
              reload={async (options?: ChatRequestOptions) => {
                try {
                  return await reload(options);
                } catch (error) {
                  handleError(error);
                  return null;
                }
              }}
              isReadonly={isReadonly}
            />

            {/* ✅ Corrected query results rendering to avoid duplicates */}
            {shouldShowQueryResults && (() => {
              // Only show one version of the query results, prioritizing direct tool invocations
              if (message.toolInvocations?.some(
                  (inv: any) => inv?.toolName === 'deepResearch' && inv?.state === 'result' && inv?.result?.success && inv?.result?.data?.queryObjects
                )) {
                // Find the first valid deepResearch invocation and return just one QueryManager
                const validToolInvocation = message.toolInvocations.find(
                  (inv: any) => inv?.toolName === 'deepResearch' && 
                                inv?.state === 'result' && 
                                inv?.result?.success && 
                                inv?.result?.data?.queryObjects
                ) as ExtendedToolInvocation;
                
                if (validToolInvocation && validToolInvocation.result) {
                  return (
                    <div key={`deepresearch-${message.id}`} className="max-w-3xl mx-auto px-4 w-full">
                      <QueryManager
                        queries={validToolInvocation.result.data.queryObjects}
                        parentQueryId={validToolInvocation.result.data.originalQueryId}
                        onResearchStart={onResearchStart}
                        onResearchEnd={onResearchEnd}
                        showDeepResearch={index === messages.length - 1}
                      />
                    </div>
                  );
                }
                return null;
              } else if (messageData && messageData.generated_queries) {
                return (
                  <div key={`fallback-research-${message.id}`} className="max-w-3xl mx-auto px-4 w-full">
                    <QueryManager
                      queries={messageData.generated_queries}
                      parentQueryId={messageData.id}
                      hideHeader={true}
                      onResearchStart={onResearchStart}
                      onResearchEnd={onResearchEnd}
                      showDeepResearch={index === messages.length - 1}
                    />
                  </div>
                );
              } else if (index === messages.length - 1 && lastQueryData && lastQueryData.generated_queries) {
                return (
                  <div key={`global-fallback-${message.id}`} className="max-w-3xl mx-auto px-4 w-full">
                    <QueryManager
                      queries={lastQueryData.generated_queries}
                      parentQueryId={lastQueryData.id}
                      hideHeader={true}
                      onResearchStart={onResearchStart}
                      onResearchEnd={onResearchEnd}
                      showDeepResearch={index === messages.length - 1}
                    />
                  </div>
                );
              }
              return null;
            })()}
          </React.Fragment>
        );
      })}

      {isLoading &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

      <div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isBlockVisible && nextProps.isBlockVisible) return true;

  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.isLoading && nextProps.isLoading) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return true;
});
