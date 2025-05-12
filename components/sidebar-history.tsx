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

import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import type { User } from 'next-auth';
import { memo, useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { PanelLeft } from 'lucide-react';
import { PlusIcon } from '@/components/icons';
import Image from 'next/image';

import {
  CheckCircleFillIcon,
  GlobeIcon,
  LockIcon,
  MoreHorizontalIcon,
  ShareIcon,
  TrashIcon,
} from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { fetcher } from '@/lib/utils';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { SidebarLeftIcon } from '@/components/icons';

interface QueryHistory {
  id: number;
  query_text: string;
  user_reference_id: string;
  created_at: string;
  generated_queries: {
    id: number;
    query_text: string;
    parent_id: number;
    is_selected: boolean;
    created_at: string;
  }[];
  citations?: any[];
  search_results?: any[];
}

const PureQueryItem = ({
  query,
  isActive,
  setOpenMobile,
}: {
  query: QueryHistory;
  isActive: boolean;
  setOpenMobile: (open: boolean) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const formattedDate = new Date(query.created_at).toLocaleDateString();
  const router = useRouter();

  // Handler for clicking the query row (not the expand/collapse button)
  const handleRowClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // Prevent navigation if the expand/collapse button was clicked
    if ((e.target as HTMLElement).closest('button')) return;
    router.push(`/history/${query.id}`);
    setOpenMobile(false);
  };

  return (
    <SidebarMenuItem>
      <div className="w-full">
        <SidebarMenuButton 
          asChild 
          isActive={isActive}
          className="w-full"
        >
          <div className="flex flex-col gap-1 p-2 cursor-pointer" onClick={handleRowClick}>
            <div className="flex items-center justify-between">
              <span
                className="text-sm font-medium truncate max-w-[180px] block"
                title={query.query_text}
              >
                {query.query_text}
              </span>
            </div>
            <span className="text-xs text-gray-500">{formattedDate}</span>
          </div>
        </SidebarMenuButton>
      </div>
    </SidebarMenuItem>
  );
};

export const QueryItem = memo(PureQueryItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false;
  return true;
});

export function SidebarHistory({ user }: { user: User | undefined }) {
  const { setOpenMobile, state, toggleSidebar } = useSidebar();
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupedHistory, setGroupedHistory] = useState<{
    today: QueryHistory[];
    yesterday: QueryHistory[];
    older: QueryHistory[];
  }>({
    today: [],
    yesterday: [],
    older: []
  });

  // Group history items by date
  const groupHistoryByDate = (historyItems: QueryHistory[]) => {
    const grouped = {
      today: [] as QueryHistory[],
      yesterday: [] as QueryHistory[],
      older: [] as QueryHistory[]
    };

    historyItems.forEach(item => {
      const itemDate = new Date(item.created_at);
      
      if (isToday(itemDate)) {
        grouped.today.push(item);
      } else if (isYesterday(itemDate)) {
        grouped.yesterday.push(item);
      } else {
        grouped.older.push(item);
      }
    });

    return grouped;
  };

  const fetchQueryHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Make request to the backend with user ID
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_BASE_URL) {
        throw new Error('API_BASE_URL is not configured');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/v1/query-history?user_id=${user?.id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch query history: ${response.status}`);
      }
      
      const data = await response.json();
      const historyData = Array.isArray(data) ? data : [];
      setHistory(historyData);
      
      // Group the history data by date
      setGroupedHistory(groupHistoryByDate(historyData));
    } catch (error) {
      console.error('Error fetching history:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch history');
    } finally {
      setIsLoading(false);
    }
  };

  // Add event listener for new queries
  useEffect(() => {
    if (user) {
      fetchQueryHistory();

      // Listen for new query events
      const handleNewQuery = (event: CustomEvent) => {
        const newQuery = event.detail;
        setHistory(prevHistory => {
          const updatedHistory = [newQuery, ...prevHistory];
          // Re-group when a new query is added
          setGroupedHistory(groupHistoryByDate(updatedHistory));
          return updatedHistory;
        });
      };

      // Set up interval to refresh history
      const refreshInterval = setInterval(() => {
        fetchQueryHistory();
      }, 30000); // Refresh every 30 seconds

      window.addEventListener('newQuery', handleNewQuery as EventListener);
      return () => {
        window.removeEventListener('newQuery', handleNewQuery as EventListener);
        clearInterval(refreshInterval);
      };
    }
  }, [user]);

  // Render helper for date-grouped query items
  const renderQueryGroup = (title: string, queries: QueryHistory[]) => {
    if (queries.length === 0) return null;
    
    return (
      <div className="mt-2">
        <h3 className="px-2 text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
          {title}
        </h3>
        <SidebarMenu>
          {queries.map((query) => (
            <QueryItem
              key={query.id}
              query={query}
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
          <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            Queries will appear here
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (isLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            Loading queries...
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (error) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-red-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            {error}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (history.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            No queries found
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <>
      {/* Always show the toggle icon, fixed on the left when collapsed */}
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
          {/* InpharmD logo at the end (rightmost) */}
          <Image src="/images/inpharmd.png" alt="InpharmD Logo" width={40} height={40} className="h-10 w-auto ml-2" />
        </div>
      )}

      {/* Sidebar content, hidden when collapsed */}
      <SidebarGroup className={state === 'collapsed' ? 'hidden' : ''}>
        <SidebarGroupContent>
          {renderQueryGroup("Today", groupedHistory.today)}
          {renderQueryGroup("Yesterday", groupedHistory.yesterday)}
          {renderQueryGroup("Previous Days", groupedHistory.older)}
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}