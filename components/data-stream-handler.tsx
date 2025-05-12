'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';
import { BlockKind, Suggestion, UIBlock, CustomDocument } from './block';
import { initialBlockData, useBlock } from '@/hooks/use-block';
import { useUserMessageId } from '@/hooks/use-user-message-id';
import { cx } from 'class-variance-authority';
import { useDeepResearch } from '@/lib/deep-research-context';

type DataStreamDelta = {
  type:
    | 'text-delta'
    | 'code-delta'
    | 'spreadsheet-delta'
    | 'title'
    | 'id'
    | 'suggestion'
    | 'clear'
    | 'finish'
    | 'user-message-id'
    | 'kind'
    | 'activity-delta'
    | 'source-delta'
    | 'citation-delta'
    | 'citation_result'
    | 'processing_depth'
    | 'deep-research-results';
  content:
    | string
    | Suggestion
    | {
        type:
          | 'search'
          | 'extract'
          | 'analyze'
          | 'reasoning'
          | 'synthesis'
          | 'thought';
        status: 'pending' | 'complete' | 'error';
        message: string;
        timestamp: string;
      }
    | {
        url: string;
        title: string;
        relevance: number;
      }
    | {
        title: string;
        url: string;
        query: string;
      };
  result?: any;
  query?: string;
  results?: any;
};

export function DataStreamHandler({ id }: { id: string }) {
  const { data: dataStream, setMessages } = useChat({ id });
  const { setUserMessageIdFromServer } = useUserMessageId();
  const { setBlock } = useBlock();
  const { addActivity, addSource, addCitation } = useDeepResearch();
  const lastProcessedIndex = useRef(-1);

  useEffect(() => {
    if (!dataStream?.length) return;

    const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);
    lastProcessedIndex.current = dataStream.length - 1;

    (newDeltas as DataStreamDelta[]).forEach((delta: DataStreamDelta) => {
      if (delta.type === 'user-message-id') {
        setUserMessageIdFromServer(delta.content as string);
        return;
      }

      setBlock((draftBlock) => {
        if (!draftBlock) {
          return { 
            id: 'init',
            type: 'document',
            status: 'streaming',
            content: { 
              id: 'init', 
              title: '', 
              content: '', 
              kind: 'text' as BlockKind, 
              userId: '', 
              createdAt: new Date() 
            } as CustomDocument,
            isVisible: false
          };
        }

        switch (delta.type) {
          case 'id':
            return {
              ...draftBlock,
              id: delta.content as string,
              status: 'streaming',
              isVisible: draftBlock.isVisible
            };

          case 'title':
            return {
              ...draftBlock,
              content: {
                ...(draftBlock.content as CustomDocument),
                title: delta.content as string
              },
              status: 'streaming',
              isVisible: draftBlock.isVisible
            };

          case 'kind':
            return {
              ...draftBlock,
              content: {
                ...(draftBlock.content as CustomDocument),
                kind: delta.content as BlockKind
              },
              status: 'streaming',
              isVisible: draftBlock.isVisible
            };

          case 'text-delta':
            const currentContent = typeof draftBlock.content === 'string' 
              ? draftBlock.content 
              : (draftBlock.content as CustomDocument).content;
            const newContent = currentContent + (delta.content as string);
            return {
              ...draftBlock,
              content: {
                ...(draftBlock.content as CustomDocument),
                content: newContent
              },
              status: 'streaming',
              isVisible: draftBlock.isVisible
            };

          case 'code-delta':
            return {
              ...draftBlock,
              content: {
                ...(draftBlock.content as CustomDocument),
                content: delta.content as string
              },
              status: 'streaming',
              isVisible: draftBlock.isVisible
            };

          case 'spreadsheet-delta':
            return {
              ...draftBlock,
              content: {
                ...(draftBlock.content as CustomDocument),
                content: delta.content as string
              },
              status: 'streaming',
              isVisible: draftBlock.isVisible
            };

          case 'clear':
            return {
              ...draftBlock,
              content: {
                ...(draftBlock.content as CustomDocument),
                content: ''
              },
              status: 'streaming',
              isVisible: draftBlock.isVisible
            };

          case 'finish':
            return {
              ...draftBlock,
              status: 'idle',
              isVisible: draftBlock.isVisible
            };

          case 'activity-delta':
            const activity = delta.content as {
              type: 'search' | 'extract' | 'analyze' | 'thought' | 'reasoning';
              status: 'pending' | 'complete' | 'error';
              message: string;
              timestamp: string;
            };
            addActivity(activity);
            return {
              ...draftBlock,
              status: 'streaming',
              isVisible: draftBlock.isVisible
            };

          case 'source-delta':
            const source = delta.content as {
              url: string;
              title: string;
              relevance: number;
            };
            addSource(source);
            return {
              ...draftBlock,
              status: 'streaming',
              isVisible: draftBlock.isVisible
            };
            
          case 'citation-delta':
          case 'citation_result':
            if (delta.result) {
              const title = Object.keys(delta.result)[0];
              const url = delta.result[title];
              const query = delta.query || '';
              addCitation({ title, url, query });
            } else if (typeof delta.content === 'object') {
              const citation = delta.content as {
                title: string;
                url: string;
                query: string;
              };
              addCitation(citation);
            }
            return {
              ...draftBlock,
              status: 'streaming',
              isVisible: draftBlock.isVisible
            };

          case 'deep-research-results':
            try {
              const toolResult = JSON.parse(delta.content as string);
              setMessages((prevMessages) => {
                const lastAssistantIndex = [...prevMessages].reverse().findIndex(
                  (msg) => msg.role === 'assistant'
                );
                
                if (lastAssistantIndex === -1) return prevMessages;
                
                const newMessages = [...prevMessages];
                const actualIndex = newMessages.length - 1 - lastAssistantIndex;
                const lastMessage = newMessages[actualIndex];
                
                const updatedMessage = {
                  ...lastMessage,
                  toolInvocations: [
                    ...(lastMessage.toolInvocations || []),
                    toolResult
                  ]
                };
                
                newMessages[actualIndex] = updatedMessage;
                return newMessages;
              });
            } catch (error) {
              console.error('Error processing deep research results:', error);
            }
            return {
              ...draftBlock,
              status: 'streaming',
              isVisible: draftBlock.isVisible
            };

          default:
            return draftBlock;
        }
      });
    });
  }, [
    dataStream,
    setBlock,
    setUserMessageIdFromServer,
    addActivity,
    addSource,
    addCitation,
    setMessages,
  ]);

  return null;
}
