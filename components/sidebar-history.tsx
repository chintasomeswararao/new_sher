// 'use client';

// import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
// import Link from 'next/link';
// import { useParams, usePathname, useRouter } from 'next/navigation';
// import type { User } from 'next-auth';
// import { memo, useEffect, useState } from 'react';
// import { toast } from 'sonner';
// import useSWR from 'swr';
// import { ChevronUp, ChevronDown } from 'lucide-react';
// import { PanelLeft } from 'lucide-react';
// import { PlusIcon } from '@/components/icons';
// import Image from 'next/image';

// import {
//   CheckCircleFillIcon,
//   GlobeIcon,
//   LockIcon,
//   MoreHorizontalIcon,
//   ShareIcon,
//   TrashIcon,
// } from '@/components/icons';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '@/components/ui/alert-dialog';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuPortal,
//   DropdownMenuSeparator,
//   DropdownMenuSub,
//   DropdownMenuSubContent,
//   DropdownMenuSubTrigger,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import {
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarMenu,
//   SidebarMenuAction,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   useSidebar,
// } from '@/components/ui/sidebar';
// import { fetcher } from '@/lib/utils';
// import { useChatVisibility } from '@/hooks/use-chat-visibility';
// import { SidebarLeftIcon } from '@/components/icons';

// type Chat = {
//   id: string;
//   title: string;
//   visibility: 'private' | 'public';
//   userId: string;
//   createdAt: Date;
// };

// type GroupedChats = {
//   today: Chat[];
//   yesterday: Chat[];
//   lastWeek: Chat[];
//   lastMonth: Chat[];
//   older: Chat[];
// };

// interface QueryHistory {
//   id: number;
//   query_text: string;
//   user_reference_id: string;
//   created_at: string;
//   generated_queries: {
//     id: number;
//     query_text: string;
//     parent_id: number;
//     is_selected: boolean;
//     created_at: string;
//   }[];
//   citations?: any[];
//   search_results?: any[];
// }

// const PureChatItem = ({
//   chat,
//   isActive,
//   onDelete,
//   setOpenMobile,
// }: {
//   chat: Chat;
//   isActive: boolean;
//   onDelete: (chatId: string) => void;
//   setOpenMobile: (open: boolean) => void;
// }) => {
//   const { visibilityType, setVisibilityType } = useChatVisibility({
//     chatId: chat.id,
//     initialVisibility: chat.visibility,
//   });

//   return (
//     <SidebarMenuItem>
//       <SidebarMenuButton asChild isActive={isActive}>
//         <Link href={`/chat/${chat.id}`} onClick={() => setOpenMobile(false)}>
//           <span>{chat.title}</span>
//         </Link>
//       </SidebarMenuButton>

//       <DropdownMenu modal={true}>
//         <DropdownMenuTrigger asChild>
//           <SidebarMenuAction
//             className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
//             showOnHover={!isActive}
//           >
//             <MoreHorizontalIcon />
//             <span className="sr-only">More</span>
//           </SidebarMenuAction>
//         </DropdownMenuTrigger>

//         <DropdownMenuContent side="bottom" align="end">
//           <DropdownMenuSub>
//             <DropdownMenuSubTrigger className="cursor-pointer">
//               <ShareIcon />
//               <span>Share</span>
//             </DropdownMenuSubTrigger>
//             <DropdownMenuPortal>
//               <DropdownMenuSubContent>
//                 <DropdownMenuItem
//                   className="cursor-pointer flex-row justify-between"
//                   onClick={() => {
//                     setVisibilityType('private');
//                   }}
//                 >
//                   <div className="flex flex-row gap-2 items-center">
//                     <LockIcon size={12} />
//                     <span>Private</span>
//                   </div>
//                   {visibilityType === 'private' ? (
//                     <CheckCircleFillIcon />
//                   ) : null}
//                 </DropdownMenuItem>
//                 <DropdownMenuItem
//                   className="cursor-pointer flex-row justify-between"
//                   onClick={() => {
//                     setVisibilityType('public');
//                   }}
//                 >
//                   <div className="flex flex-row gap-2 items-center">
//                     <GlobeIcon />
//                     <span>Public</span>
//                   </div>
//                   {visibilityType === 'public' ? <CheckCircleFillIcon /> : null}
//                 </DropdownMenuItem>
//               </DropdownMenuSubContent>
//             </DropdownMenuPortal>
//           </DropdownMenuSub>

//           <DropdownMenuItem
//             className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
//             onSelect={() => onDelete(chat.id)}
//           >
//             <TrashIcon />
//             <span>Delete</span>
//           </DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>
//     </SidebarMenuItem>
//   );
// };

// export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
//   if (prevProps.isActive !== nextProps.isActive) return false;
//   return true;
// });

// const PureQueryItem = ({
//   query,
//   isActive,
//   setOpenMobile,
// }: {
//   query: QueryHistory;
//   isActive: boolean;
//   setOpenMobile: (open: boolean) => void;
// }) => {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const formattedDate = new Date(query.created_at).toLocaleDateString();
//   const router = useRouter();

//   // Handler for clicking the query row (not the expand/collapse button)
//   const handleRowClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
//     // Prevent navigation if the expand/collapse button was clicked
//     if ((e.target as HTMLElement).closest('button')) return;
//     router.push(`/history/${query.id}`);
//     setOpenMobile(false);
//   };

//   return (
//     <SidebarMenuItem>
//       <div className="w-full">
//         <SidebarMenuButton 
//           asChild 
//           isActive={isActive}
//           // Add onClick to the row div, not the button
//           className="w-full"
//         >
//           <div className="flex flex-col gap-1 p-2 cursor-pointer" onClick={handleRowClick}>
//             <div className="flex items-center justify-between">
//               <span
//                 className="text-sm font-medium truncate max-w-[180px] block"
//                 title={query.query_text}
//               >
//                 {query.query_text}
//               </span>
//             </div>
//             <span className="text-xs text-gray-500">{formattedDate}</span>
//           </div>
//         </SidebarMenuButton>

//         {isExpanded && (
//           <div className="pl-4 pr-2 py-2 space-y-3 bg-gray-50">
//             {/* Generated Queries */}
//             {query.generated_queries.length > 0 && (
//               <div>
//                 <h4 className="text-xs font-medium mb-1">Generated Sub-queries:</h4>
//                 <ul className="space-y-1">
//                   {query.generated_queries.map((subQuery) => (
//                     <li key={subQuery.id} className="pl-2 border-l-2 border-gray-200">
//                       <p className="text-xs">{subQuery.query_text}</p>
//                       <p className="text-xs text-gray-500">
//                         {new Date(subQuery.created_at).toLocaleDateString()}
//                       </p>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//             {/* Citations */}
//             {query.citations && query.citations.length > 0 && (
//               <div>
//                 <h4 className="text-xs font-medium mb-1">Citations:</h4>
//                 <ul className="space-y-1">
//                   {query.citations.map((citation, index) => (
//                     <li key={index} className="pl-2 border-l-2 border-gray-200 py-1">
//                       <div className="flex flex-col">
//                         {citation.title && citation.url ? (
//                           <a
//                             href={citation.url}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-xs text-blue-700 underline font-medium"
//                           >
//                             {citation.title}
//                           </a>
//                         ) : null}
//                         {citation.content_snippet && (
//                           <span className="text-xs text-gray-600 mt-0.5">{citation.content_snippet}</span>
//                         )}
//                         {citation.relevance_score?.score !== undefined && (
//                           <span className="text-xs text-gray-400 mt-0.5">Relevance: {citation.relevance_score.score}</span>
//                         )}
//                       </div>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//             {/* Search Results */}
//             {query.search_results && query.search_results.length > 0 && (
//               <div>
//                 <h4 className="text-xs font-medium mb-1">Search Results:</h4>
//                 <ul className="space-y-1">
//                   {query.search_results.map((result, index) => (
//                     <li key={index} className="pl-2 border-l-2 border-gray-200 py-1">
//                       {result.response_text && (
//                         <div className="text-xs text-gray-700 mb-1 whitespace-pre-line">{result.response_text}</div>
//                       )}
//                       {result.result_data && Array.isArray(result.result_data) && result.result_data.length > 0 && (
//                         <ul className="list-disc list-inside ml-2">
//                           {result.result_data.map((ref: any, idx: number) =>
//                             Object.entries(ref).map(([_, value]: [string, any], i) =>
//                               Object.entries(value).map(([title, url]) => (
//                                 <li key={title + url} className="ml-2">
//                                   <a
//                                     href={url as string}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="text-xs text-blue-700 underline"
//                                   >
//                                     {title}
//                                   </a>
//                                 </li>
//                               ))
//                             )
//                           )}
//                         </ul>
//                       )}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </SidebarMenuItem>
//   );
// };

// export const QueryItem = memo(PureQueryItem, (prevProps, nextProps) => {
//   if (prevProps.isActive !== nextProps.isActive) return false;
//   return true;
// });

// export function SidebarHistory({ user }: { user: User | undefined }) {
//   const { setOpenMobile, state, toggleSidebar } = useSidebar();
//   const [history, setHistory] = useState<QueryHistory[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [groupedHistory, setGroupedHistory] = useState<{
//     today: QueryHistory[];
//     yesterday: QueryHistory[];
//     older: QueryHistory[];
//   }>({
//     today: [],
//     yesterday: [],
//     older: []
//   });

//   // Group history items by date
//   const groupHistoryByDate = (historyItems: QueryHistory[]) => {
//     const grouped = {
//       today: [] as QueryHistory[],
//       yesterday: [] as QueryHistory[],
//       older: [] as QueryHistory[]
//     };

//     historyItems.forEach(item => {
//       const itemDate = new Date(item.created_at);
      
//       if (isToday(itemDate)) {
//         grouped.today.push(item);
//       } else if (isYesterday(itemDate)) {
//         grouped.yesterday.push(item);
//       } else {
//         grouped.older.push(item);
//       }
//     });

//     return grouped;
//   };

//   const fetchQueryHistory = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       const response = await fetch('/api/query-history', {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include'
//       });
      
//       if (!response.ok) {
//         throw new Error(`Failed to fetch query history: ${response.status}`);
//       }
      
//       const data = await response.json();
//       const historyData = Array.isArray(data) ? data : [];
//       setHistory(historyData);
      
//       // Group the history data by date
//       setGroupedHistory(groupHistoryByDate(historyData));
//     } catch (error) {
//       console.error('Error fetching history:', error);
//       setError(error instanceof Error ? error.message : 'Failed to fetch history');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Add event listener for new queries
//   useEffect(() => {
//     if (user) {
//       fetchQueryHistory();

//       // Listen for new query events
//       const handleNewQuery = (event: CustomEvent) => {
//         const newQuery = event.detail;
//         setHistory(prevHistory => {
//           const updatedHistory = [newQuery, ...prevHistory];
//           // Re-group when a new query is added
//           setGroupedHistory(groupHistoryByDate(updatedHistory));
//           return updatedHistory;
//         });
//       };

//       window.addEventListener('newQuery', handleNewQuery as EventListener);
//       return () => {
//         window.removeEventListener('newQuery', handleNewQuery as EventListener);
//       };
//     }
//   }, [user]);

//   // Render helper for date-grouped query items
//   const renderQueryGroup = (title: string, queries: QueryHistory[]) => {
//     if (queries.length === 0) return null;
    
//     return (
//       <div className="mt-2">
//         <h3 className="px-2 text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">

//           {title}
//         </h3>
//         <SidebarMenu>
//           {queries.map((query) => (
//             <QueryItem
//               key={query.id}
//               query={query}
//               isActive={false}
//               setOpenMobile={setOpenMobile}
//             />
//           ))}
//         </SidebarMenu>
//       </div>
//     );
//   };

//   if (!user) {
//     return (
//       <SidebarGroup>
//         <SidebarGroupContent>
//           <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
//             Queries will appear here
//           </div>
//         </SidebarGroupContent>
//       </SidebarGroup>
//     );
//   }

//   if (isLoading) {
//     return (
//       <SidebarGroup>
//         <SidebarGroupContent>
//           <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
//             Loading queries...
//           </div>
//         </SidebarGroupContent>
//       </SidebarGroup>
//     );
//   }

//   if (error) {
//     return (
//       <SidebarGroup>
//         <SidebarGroupContent>
//           <div className="px-2 text-red-500 w-full flex flex-row justify-center items-center text-sm gap-2">
//             {error}
//           </div>
//         </SidebarGroupContent>
//       </SidebarGroup>
//     );
//   }

//   if (history.length === 0) {
//     return (
//       <SidebarGroup>
//         <SidebarGroupContent>
//           <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
//             No queries found
//           </div>
//         </SidebarGroupContent>
//       </SidebarGroup>
//     );
//   }

//   return (
//     <>
//       {/* Always show the toggle icon, fixed on the left when collapsed */}
//       {state === 'collapsed' && (
//         <div className="fixed top-4 left-0 z-50 flex flex-row gap-2 items-center">
//           <button
//             className="p-2 bg-white border border-gray-200 rounded-full shadow hover:bg-gray-100 transition"
//             onClick={toggleSidebar}
//             aria-label="Open sidebar"
//           >
//             <PanelLeft size={24} />
//           </button>
//           <button
//             className="p-2 bg-white border border-gray-200 rounded-full shadow hover:bg-gray-100 transition"
//             onClick={() => { window.location.href = '/'; }}
//             aria-label="New chat"
//           >
//             <PlusIcon size={24} />
//           </button>
//           {/* InpharmD logo at the end (rightmost) */}
//           <Image src="/images/inpharmd.png" alt="InpharmD Logo" width={40} height={40} className="h-10 w-auto ml-2" />
//         </div>
//       )}

//       {/* Sidebar content, hidden when collapsed */}
//       <SidebarGroup className={state === 'collapsed' ? 'hidden' : ''}>
//         <SidebarGroupContent>
//           {renderQueryGroup("Today", groupedHistory.today)}
//           {renderQueryGroup("Yesterday", groupedHistory.yesterday)}
//           {renderQueryGroup("Previous Days", groupedHistory.older)}
//         </SidebarGroupContent>
//       </SidebarGroup>
//     </>
//   );
// }

'use client';

import { isToday, isYesterday } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from 'next-auth';
import { memo, useEffect, useState, useCallback } from 'react';
import { 
  PanelLeft, 
  RefreshCw, 
  ChevronRight, 
  FileText, 
  Search, 
  Link as LinkIcon,
  CheckCircle
} from 'lucide-react';
import { PlusIcon } from '@/components/icons';
import Image from 'next/image';
import { toast } from 'sonner';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

interface Citation {
  id: number;
  title: string;
  url: string;
  content_snippet?: string;
  relevance_score?: any;
  created_at: string;
  generated_query_id?: number;
}

interface SearchResult {
  id: number;
  result_data: any;
  response_text?: string;
  created_at: string;
}

interface GeneratedQuery {
  id: number;
  query_text: string;
  parent_id: number;
  is_selected: boolean;
  created_at: string;
}

interface Question {
  id: number;
  question_id: string;
  user_query_id: number;
  question_text: string;
  sequence_number: number;
  created_at: string;
  generated_queries: GeneratedQuery[];
  search_results: SearchResult[];
  citations: Citation[];
  final_responses: Array<{
    id: number;
    response_text?: string;
    result_data: any;
    created_at: string;
  }>;
}

interface ChatSession {
  chat_id: string;
  created_at: string;
  last_activity: string;
  is_active: boolean;
  questions: Question[];
}

const PureChatItem = ({
  chat: chatSession,
  isActive,
  setOpenMobile,
}: {
  chat: ChatSession;
  isActive: boolean;
  setOpenMobile: (open: boolean) => void;
}) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const formattedDate = new Date(chatSession.last_activity).toLocaleDateString();
  
  // Get the first question as the main title
  const mainQuestion = chatSession.questions[0];
  const title = mainQuestion ? mainQuestion.question_text : "Untitled Chat";
  
  // Count various elements
  const totalQuestions = chatSession.questions.length;
  const totalSubQueries = chatSession.questions.reduce(
    (acc, q) => acc + q.generated_queries.length, 0
  );
  const totalCitations = chatSession.questions.reduce(
    (acc, q) => acc + q.citations.length, 0
  );
  const hasResults = chatSession.questions.some(q => 
    q.search_results.length > 0 || q.final_responses.length > 0
  );

  const handleRowClick = () => {
    // Navigate to the first question's detail page
    if (mainQuestion) {
      router.push(`/history/${mainQuestion.user_query_id}`);
    }
    setOpenMobile(false);
  };

  return (
    <SidebarMenuItem>
      <div className="w-full">
        <SidebarMenuButton 
          onClick={handleRowClick}
          isActive={isActive}
          className="w-full cursor-pointer hover:bg-accent"
        >
          <div className="flex items-start justify-between w-full">
            <div className="flex flex-col items-start gap-1 flex-1">
              <span
                className="text-sm font-medium truncate w-full text-left"
                title={title}
              >
                {title}
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formattedDate}</span>
                {chatSession.is_active && (
                  <span className="text-green-600 font-medium">Active</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {totalQuestions} {totalQuestions === 1 ? 'question' : 'questions'}
                </span>
                <span className="flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  {totalSubQueries} {totalSubQueries === 1 ? 'query' : 'queries'}
                </span>
                <span className="flex items-center gap-1">
                  <LinkIcon className="h-3 w-3" />
                  {totalCitations} {totalCitations === 1 ? 'citation' : 'citations'}
                </span>
              </div>
            </div>
            <div className="flex items-center">
              {hasResults && (
                <span className="text-green-600 mr-2">
                  <CheckCircle className="h-4 w-4" />
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="p-1 hover:bg-accent rounded"
              >
                <ChevronRight 
                  className={`h-4 w-4 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`} 
                />
              </button>
            </div>
          </div>
        </SidebarMenuButton>
        
        {isExpanded && (
          <div className="pl-4 pr-2 py-2 space-y-2 bg-muted/50">
            {chatSession.questions.map((question, idx) => (
              <div 
                key={question.question_id}
                className="p-2 bg-background/80 rounded-md cursor-pointer hover:bg-accent/50"
                onClick={() => {
                  router.push(`/history/${question.user_query_id}`);
                  setOpenMobile(false);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium">
                      Question {idx + 1}: {question.question_text}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{question.generated_queries.length} sub-queries</span>
                      <span>{question.citations.length} citations</span>
                      {question.final_responses.length > 0 && (
                        <span className="text-green-600">Response ready</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem);

export function SidebarHistory({ user }: { user: User | undefined }) {
  const { setOpenMobile, state, toggleSidebar } = useSidebar();
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [groupedHistory, setGroupedHistory] = useState<{
    today: ChatSession[];
    yesterday: ChatSession[];
    older: ChatSession[];
  }>({
    today: [],
    yesterday: [],
    older: []
  });

  const groupHistoryByDate = useCallback((historyItems: ChatSession[]) => {
    const grouped = {
      today: [] as ChatSession[],
      yesterday: [] as ChatSession[],
      older: [] as ChatSession[]
    };

    historyItems.forEach(item => {
      const itemDate = new Date(item.last_activity);
      
      if (isToday(itemDate)) {
        grouped.today.push(item);
      } else if (isYesterday(itemDate)) {
        grouped.yesterday.push(item);
      } else {
        grouped.older.push(item);
      }
    });

    return grouped;
  }, []);

  const fetchChatHistory = useCallback(async () => {
    if (!user?.id) {
      console.log('[SidebarHistory] No user ID available');
      return;
    }

    console.log('[SidebarHistory] Fetching chat history for user:', user.id);
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the Next.js API route for complete chat history
      const response = await fetch('/api/chat-history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store'
      });
      
      console.log('[SidebarHistory] Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chat history: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[SidebarHistory] Chat history received:', data.length, 'sessions');
      
      const historyData = Array.isArray(data) ? data : [];
      
      // Sort sessions by last activity (most recent first)
      historyData.sort((a, b) => 
        new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
      );
      
      setChatHistory(historyData);
      setGroupedHistory(groupHistoryByDate(historyData));
      
    } catch (error) {
      console.error('[SidebarHistory] Error fetching chat history:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch history');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, groupHistoryByDate]);

  useEffect(() => {
    if (user?.id) {
      console.log('[SidebarHistory] User detected, fetching chat history');
      fetchChatHistory();
      
      // Set up interval to refresh history every 30 seconds
      const refreshInterval = setInterval(() => {
        console.log('[SidebarHistory] Auto-refreshing chat history');
        fetchChatHistory();
      }, 30000);
      
      // Listen for new query events
      const handleNewQuery = (event: CustomEvent) => {
        console.log('[SidebarHistory] New query event received:', event.detail);
        
        // Fetch updated chat history when a new query is added
        fetchChatHistory();
        
        // If it's a new question added to chat, show a toast notification
        if (event.detail.action === 'add_to_chat') {
          console.log('[SidebarHistory] New question added to chat:', event.detail.chatId);
          toast.success('New question added to chat');
        }
      };
      
      window.addEventListener('newQuery', handleNewQuery);
      
      return () => {
        clearInterval(refreshInterval);
        window.removeEventListener('newQuery', handleNewQuery);
      };
    }
  }, [user?.id, fetchChatHistory]);

  const handleRefresh = async () => {
    console.log('[SidebarHistory] Manual refresh triggered');
    setIsRefreshing(true);
    await fetchChatHistory();
    setIsRefreshing(false);
  };

  const renderChatGroup = (title: string, chats: ChatSession[]) => {
    if (chats.length === 0) return null;
    
    return (
      <div className="mt-4">
        <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {title}
        </h3>
        <SidebarMenu>
          {chats.map((chat) => (
            <ChatItem
              key={chat.chat_id}
              chat={chat}
              isActive={false}
              setOpenMobile={setOpenMobile}
            />
          ))}
        </SidebarMenu>
      </div>
    );
  };

  if (!user) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-zinc-500 text-center text-sm">
            Sign in to see your chat history
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (isLoading && chatHistory.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-zinc-500 text-center text-sm">
            Loading chat history...
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (error) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-red-500 text-center text-sm">
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <>
      {/* Toggle button when sidebar is collapsed */}
      {state === 'collapsed' && (
        <div className="fixed top-4 left-0 z-50 flex flex-row gap-2 items-center">
          <button
            className="p-2 bg-white border border-gray-200 rounded-full shadow hover:bg-gray-100 transition"
            onClick={toggleSidebar}
            aria-label="Open sidebar"
          >
            <PanelLeft size={24} />
          </button>
          <button
            className="p-2 bg-white border border-gray-200 rounded-full shadow hover:bg-gray-100 transition"
            onClick={() => { window.location.href = '/'; }}
            aria-label="New chat"
          >
            <PlusIcon size={24} />
          </button>
          <Image 
            src="/images/inpharmd.png" 
            alt="InpharmD Logo" 
            width={40} 
            height={40} 
            className="h-10 w-auto ml-2" 
          />
        </div>
      )}

      {/* Sidebar content */}
      <SidebarGroup>
        <div className="flex items-center justify-between px-2 mb-2">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <SidebarGroupContent>
          {chatHistory.length === 0 ? (
            <div className="px-2 text-zinc-500 text-center text-sm">
              <p>No chats yet</p>
              <p className="mt-1 text-xs">Start a new search to see your history</p>
            </div>
          ) : (
            <>
              {renderChatGroup("Today", groupedHistory.today)}
              {renderChatGroup("Yesterday", groupedHistory.yesterday)}
              {renderChatGroup("Previous Days", groupedHistory.older)}
            </>
          )}
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}