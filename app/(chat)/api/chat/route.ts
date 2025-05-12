import {
  type Message,
  convertToCoreMessages,
  createDataStreamResponse,
  generateObject,
  generateText,
  streamObject,
  streamText,
} from 'ai';
import { z } from 'zod';

import { auth, signIn } from '@/app/(auth)/auth';
import { customModel } from '@/lib/ai';
import { models, reasoningModels } from '@/lib/ai/models';
import { rateLimiter } from '@/lib/rate-limit';
// Fix the import error by defining our own system prompt
// import {
//   codePrompt,
//   systemPrompt,
//   updateDocumentPrompt,
// } from '@/lib/ai/prompts';
const systemPrompt = `You are an AI assistant that helps with deep medical research.`;
// Base URL for API, defined in .env as NEXT_PUBLIC_API_URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

import { generateUUID, getMostRecentUserMessage } from '@/lib/utils';
import FirecrawlApp from '@mendable/firecrawl-js';

type AllowedTools =
  | 'deepResearch'
  | 'search'
  | 'extract'
  | 'scrape';

const firecrawlTools: AllowedTools[] = ['search', 'extract', 'scrape'];
const allTools: AllowedTools[] = [...firecrawlTools, 'deepResearch'];

const app = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY || '',
});

// const reasoningModel = customModel(process.env.REASONING_MODEL || 'o1-mini', true);

export async function POST(request: Request) {
  const maxDuration = process.env.MAX_DURATION
    ? parseInt(process.env.MAX_DURATION)
    : 1000; 
  
  const {
    id,
    messages,
    modelId,
    reasoningModelId,
    experimental_deepResearch = false,
  }: { 
    id: string; 
    messages: Array<Message>; 
    modelId: string; 
    reasoningModelId: string;
    experimental_deepResearch?: boolean;
  } = await request.json();

  const session = await auth();

  // Require authentication
  if (!session?.user?.id) {
    return new Response('Authentication required', { status: 401 });
  }

  // Apply rate limiting
  const identifier = session.user.id;
  const { success, limit, reset, remaining } =
    await rateLimiter.limit(identifier);

  if (!success) {
    return new Response(`Too many requests`, { status: 429 });
  }

  const model = models.find((model) => model.id === modelId);
  const reasoningModel = reasoningModels.find((model) => model.id === reasoningModelId);

  if (!model || !reasoningModel) {
    return new Response('Model not found', { status: 404 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const userMessageId = generateUUID();

  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.writeData({
        type: 'user-message-id',
        content: userMessageId,
      });

      const result = streamText({
        // Router model
        model: customModel(model.apiIdentifier, false),
        system: systemPrompt,
        messages: coreMessages,
        maxSteps: 200,
        tools: {
          deepResearch: {
            description:
              'Perform deep research on a topic using an AI agent that coordinates search, extract, and analysis tools with reasoning steps.',
            parameters: z.object({
              topic: z.string().describe('The topic or question to research'),
            }),
            execute: async ({ topic, maxDepth = 7 }) => {
              try {
                console.log(`[deepResearch] Starting research on topic: "${topic}"`);
                
                // Make the request to the API endpoint using the format from the FastAPI implementation
                console.log(`[deepResearch] Making request to localhost API`);
                console.log(`[deepResearch] API URL: ${process.env.NEXT_PUBLIC_API_URL}`);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/query`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  // Use the exact format expected by the FastAPI endpoint
                  body: JSON.stringify({ 
                    query: userMessage.content,              // Use the original user query
                    user_id: session?.user?.id,    // This is the reference ID from the API login response
                    skip_search: false,
                    search_model: 'gpt-4-turbo',
                    reasoning_model: 'gpt-4o',
                    stream: false,
                  }),
                });

                console.log(`[deepResearch] API response status: ${response.status}`);
                
                if (!response.ok) {
                  console.error(`[deepResearch] API request failed with status ${response.status}`);
                  return {
                    success: false,
                    error: `Research failed with status ${response.status}`,
                  };
                }

                const responseData = await response.json();
                console.log(`[deepResearch] API response data:`, responseData);

                // Return the raw response directly without progress tracking
                console.log(`[deepResearch] Research complete, returning results`);
                
                return {
                  success: true,
                  data: {
                    message: '', // Empty message to hide the research results
                    queriesUsed: responseData.generated_queries?.map((q: { query_text: string }) => q.query_text) || [],
                    queriesIds: responseData.generated_queries?.map((q: { id: number }) => q.id) || [],
                    originalQueryId: responseData.id,
                    queryObjects: responseData.generated_queries || [],
                    citations: [],
                    findings: [],
                    summaries: []
                  }
                };
              } catch (error: any) {
                console.error(`[deepResearch] Error during research:`, error);
                
                return {
                  success: false,
                  error: error.message,
                };
              }
            },
          },
        },
        onFinish: async ({ response }) => {
          // No database operations needed
        },
        experimental_telemetry: {
          isEnabled: true,
          functionId: 'stream-text',
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  // Require authentication
  if (!session?.user?.id) {
    return new Response('Authentication required', { status: 401 });
  }

  return new Response('Chat deleted', { status: 200 });
}
