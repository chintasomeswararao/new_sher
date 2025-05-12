'use client';

import type { ChatRequestOptions, Message } from 'ai';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useMemo, useState, useEffect } from 'react';

import type { Vote } from './block';

import { DocumentToolCall, DocumentToolResult } from './document';
import { PencilEditIcon, SparklesIcon } from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';
import { Weather } from './weather';
import equal from 'fast-deep-equal';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MessageEditor } from './message-editor';
import { DocumentPreview } from './document-preview';
import { ExtractResults } from './extract-results';
import { ScrapeResults } from './scrape-results';
import { useDeepResearch } from '@/lib/deep-research-context';
import { Progress } from './ui/progress';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
console.log("==Message====>",API_BASE_URL)

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
}: {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const { addActivity, addSource, initProgress, setDepth, updateProgress } =
    useDeepResearch();
  const [lastQueryData, setLastQueryData] = useState<any>(null);
  const [isResearchVisible, setIsResearchVisible] = useState(false);

  // Check if message contains keywords indicating deep research
  useEffect(() => {
    if (message.content && typeof message.content === 'string' &&
        (message.content.includes("research") || 
         message.content.includes("See the generated queries") || 
         message.content.includes("researched your question"))) {
      
      // First try to get data from localStorage
      try {
        const localData = localStorage.getItem('lastQueryData');
        if (localData) {
          const parsedData = JSON.parse(localData);
          if (parsedData && parsedData.generated_queries) {
            setLastQueryData(parsedData);
            setIsResearchVisible(true);
            return; // Skip API call if we have data
          }
        }
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
      }
      
      // If no localStorage data, try the API
      console.log('Attempting to fetch from:', `${API_BASE_URL}/api/v1/queries`);
      if (!API_BASE_URL) {
        console.error('API_BASE_URL is not defined');
        return;
      }
      fetch(`${API_BASE_URL}/api/v1/queries`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      })
        .then(response => {
          console.log('API Response status:', response.status);
          console.log('API Response headers:', Object.fromEntries(response.headers.entries()));
          if (response.ok) return response.json();
          throw new Error(`Failed to fetch latest query: ${response.status} ${response.statusText}`);
        })
        .then(data => {
          console.log('API Response data:', data);
          if (data && data.generated_queries) {
            setLastQueryData(data);
            setIsResearchVisible(true);
            // Store for future use
            localStorage.setItem('lastQueryData', JSON.stringify(data));
          }
        })
        .catch(error => {
          console.error("Error fetching latest query:", error);
          console.error("API Base URL:", API_BASE_URL);
        });
    }
  }, [message.content]);

  useEffect(() => {
    if (message.toolInvocations) {
      message.toolInvocations.forEach((toolInvocation: any) => {
        try {
          if (toolInvocation.toolName === 'deepResearch') {
            // Handle progress initialization
            if (
              'delta' in toolInvocation &&
              toolInvocation.delta?.type === 'progress-init'
            ) {
              const { maxDepth, totalSteps } = toolInvocation.delta.content;
              initProgress(maxDepth, totalSteps);
            }

            // Handle depth updates
            if (
              'delta' in toolInvocation &&
              toolInvocation.delta?.type === 'depth-delta'
            ) {
              const { current, max } = toolInvocation.delta.content;
              setDepth(current, max);
            }

            // Handle activity updates
            if (
              'delta' in toolInvocation &&
              toolInvocation.delta?.type === 'activity-delta'
            ) {
              const activity = toolInvocation.delta.content;
              addActivity(activity);

              if (
                activity.completedSteps !== undefined &&
                activity.totalSteps !== undefined
              ) {
                updateProgress(activity.completedSteps, activity.totalSteps);
              }
            }

            // Handle source updates
            if (
              'delta' in toolInvocation &&
              toolInvocation.delta?.type === 'source-delta'
            ) {
              addSource(toolInvocation.delta.content);
            }

            // Handle final result
            if (
              toolInvocation.state === 'result' &&
              toolInvocation.result?.success
            ) {
              const { completedSteps, totalSteps } = toolInvocation.result.data;
              if (completedSteps !== undefined && totalSteps !== undefined) {
                updateProgress(completedSteps, totalSteps);
              }
            }
          }
        } catch (error) {
          console.error('Error processing deep research update:', error);
        }
      });
    }
  }, [
    message.toolInvocations,
    addActivity,
    addSource,
    initProgress,
    setDepth,
    updateProgress,
  ]);

  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          {message.role === 'assistant' && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 w-full">
            {message.experimental_attachments && (
              <div className="flex flex-row justify-end gap-2">
                {message.experimental_attachments.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {message.content && mode === 'view' && (
              <div className="flex flex-row gap-2 items-start">
                {message.role === 'user' && !isReadonly && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                        onClick={() => {
                          setMode('edit');
                        }}
                      >
                        <PencilEditIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit message</TooltipContent>
                  </Tooltip>
                )}

                <div
                  className={cn('flex flex-col gap-4', {
                    'bg-primary text-primary-foreground px-3 py-2 rounded-xl':
                      message.role === 'user',
                  })}
                >
                  <Markdown>{message.content as string}</Markdown>
                </div>
              </div>
            )}

            {message.content && mode === 'edit' && (
              <div className="flex flex-row gap-2 items-start">
                <div className="size-8" />

                <MessageEditor
                  key={message.id}
                  message={message}
                  setMode={setMode}
                  setMessages={setMessages}
                  reload={reload}
                />
              </div>
            )}

            {message.toolInvocations && message.toolInvocations.length > 0 && (
              <div className="flex flex-col gap-4">
                {(() => {
                  let hasRenderedDeepResearch = false;
                  
                  return message.toolInvocations.map((toolInvocation) => {
                    const { toolName, toolCallId, state, args } = toolInvocation;

                    if (state === 'result') {
                      const { result } = toolInvocation;

                      return (
                        <div key={toolCallId}>
                          {toolName === 'extract' ? (
                            <ExtractResults
                              results={
                                state === 'result' && result.data
                                  ? Array.isArray(result.data)
                                    ? result.data.map((item: any) => ({
                                        url: item.url,
                                        data: item.data,
                                      }))
                                    : {
                                        url: args.urls[0],
                                        data: result.data,
                                      }
                                  : []
                              }
                              isLoading={false}
                            />
                          ) : toolName === 'scrape' ? (
                            <ScrapeResults
                              url={args.url}
                              data={result.data}
                              isLoading={false}
                            />
                          ) : toolName === 'deepResearch' ? (
                            <div className="text-sm">
                              {result.success ? (
                                <>
                                  {result.data && result.data.queryObjects && (
                                    <DeepResearchProgress
                                      state={result.data.originalQueryId}
                                      activity={result.data.queryObjects}
                                    />
                                  )}
                                </>
                              ) : (
                                <div className="text-red-500">
                                  Research may have failed: {result.error}
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      );
                    }
                    
                    // For streaming/pending states
                    if (toolName === 'deepResearch') {
                      // Skip rendering the progress bar completely
                      return null;
                    }
                    
                    return (
                      <div
                        key={toolCallId}
                        className={cx({
                          skeleton: ['getWeather'].includes(toolName),
                        })}
                      >
                        {toolName === 'extract' ? (
                          <ExtractResults results={[]} isLoading={true} />
                        ) : toolName === 'scrape' ? (
                          <ScrapeResults
                            url={args.url}
                            data=""
                            isLoading={true}
                          />
                        ) : null}
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.content !== nextProps.message.content) return false;
    if (
      !equal(
        prevProps.message.toolInvocations,
        nextProps.message.toolInvocations,
      )
    )
      return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DeepResearchProgress = ({
  state,
  activity,
}: {
  state: string;
  activity: Array<{
    type: string;
    status: string;
    message: string;
    timestamp: string;
    depth?: number;
    completedSteps?: number;
    totalSteps?: number;
  }>;
}) => {
  const { state: deepResearchState } = useDeepResearch();
  const [lastActivity, setLastActivity] = useState<string>('');
  const [startTime] = useState<number>(Date.now());
  const maxDuration = 20 * 60 * 1000; // 5 minutes in milliseconds
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activity && activity.length > 0) {
      const lastItem = activity[activity.length - 1];
      setLastActivity(lastItem.message);

      // Update progress from activity if available
      if (
        lastItem.completedSteps !== undefined &&
        lastItem.totalSteps !== undefined
      ) {
        deepResearchState.completedSteps = lastItem.completedSteps;
        deepResearchState.totalExpectedSteps = lastItem.totalSteps;
      }
    }
  }, [activity, deepResearchState]);

  // Calculate overall progress
  const progress = useMemo(() => {
    if (deepResearchState.totalExpectedSteps === 0) return 0;
    return Math.min(
      (deepResearchState.completedSteps /
        deepResearchState.totalExpectedSteps) *
        100,
      100,
    );
  }, [deepResearchState.completedSteps, deepResearchState.totalExpectedSteps]);

  // Calculate time progress
  const timeProgress = useMemo(() => {
    const elapsed = currentTime - startTime;
    return Math.min((elapsed / maxDuration) * 100, 100);
  }, [currentTime, startTime]);

  // Get current phase
  const currentPhase = useMemo(() => {
    if (!activity.length) return '';
    const current = activity[activity.length - 1];
    switch (current.type) {
      case 'search':
        return 'Searching';
      case 'extract':
        return 'Extracting';
      case 'analyze':
        return 'Analyzing';
      case 'synthesis':
        return 'Synthesizing';
      default:
        return 'Researching';
    }
  }, [activity]);

  // Format time
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const timeUntilTimeout = Math.max(maxDuration - (currentTime - startTime), 0);

  return (
    <div className="w-full space-y-2">
      {/* Returning null instead of rendering the progress bar */}
      {null}
    </div>
  );
};
