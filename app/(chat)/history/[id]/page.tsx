// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";

// export default function QueryHistoryDetailPage() {
//   const params = useParams();
//   const router = useRouter();
//   const { id } = params;
//   const [query, setQuery] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!id) return;
//     setLoading(true);
//     fetch(`/api/query-history`)
//       .then((res) => res.json())
//       .then((data) => {
//         const found = Array.isArray(data) ? data.find((q) => String(q.id) === String(id)) : null;
//         setQuery(found);
//         setLoading(false);
//       });
//   }, [id]);

//   if (loading) return <div className="p-4">Loading...</div>;
//   if (!query) return <div className="p-4 text-red-500">Query not found.</div>;

//   return (
//     <div className="min-h-screen bg-[#f8fafc] pb-10">
//       <div className="max-w-3xl mx-auto mt-8 px-4">
//         <div className="bg-white rounded-xl shadow-md border-l-4 border-orange-500 p-6 mb-8">
//           <div className="text-xs text-gray-500 mb-1">Created: {new Date(query.created_at).toLocaleString()}</div>
//           <div className="text-lg font-semibold text-gray-900 mb-2">{query.query_text}</div>
//         </div>

//         {/* Generated Sub-queries */}
//         {query.generated_queries && query.generated_queries.length > 0 && (
//           <div className="mb-8">
//             <h2 className="text-base font-bold text-gray-800 mb-3">Generated Sub-queries</h2>
//             <ul className="space-y-3">
//               {query.generated_queries.map((subQuery: any) => (
//                 <li key={subQuery.id} className="bg-gray-50 rounded border-l-2 border-orange-300 px-4 py-2">
//                   <div className="text-sm text-gray-900 font-medium">{subQuery.query_text}</div>
//                   <div className="text-xs text-gray-500 mt-1">
//                     {new Date(subQuery.created_at).toLocaleString()}
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* Citations */}
//         {query.citations && query.citations.length > 0 && (
//           <div className="mb-8">
//             <h2 className="text-base font-bold text-gray-800 mb-3">Citations</h2>
//             <ul className="space-y-3">
//               {query.citations.map((citation: any, index: number) => (
//                 <li key={index} className="bg-gray-50 rounded border-l-2 border-blue-300 px-4 py-2">
//                   <div className="flex flex-col">
//                     {citation.title && citation.url ? (
//                       <a
//                         href={citation.url}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-sm text-blue-700 underline font-medium"
//                       >
//                         {citation.title}
//                       </a>
//                     ) : null}
//                     {citation.content_snippet && (
//                       <span className="text-xs text-gray-600 mt-0.5">{citation.content_snippet}</span>
//                     )}
//                     {citation.relevance_score?.score !== undefined && (
//                       <span className="text-xs text-gray-400 mt-0.5">Relevance: {citation.relevance_score.score}</span>
//                     )}
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* Search Results */}
//         {query.search_results && query.search_results.length > 0 && (
//           <div className="mb-8">
//             <h2 className="text-base font-bold text-gray-800 mb-3">Search Results</h2>
//             <ul className="space-y-3">
//               {query.search_results.map((result: any, index: number) => (
//                 <li key={index} className="bg-gray-50 rounded border-l-2 border-green-300 px-4 py-2">
//                   {result.response_text && (
//                     <div className="text-xs text-gray-700 mb-1 whitespace-pre-line">{result.response_text}</div>
//                   )}
//                   {result.result_data && Array.isArray(result.result_data) && result.result_data.length > 0 && (
//                     <ul className="list-disc list-inside ml-2">
//                       {result.result_data.map((ref: any, idx: number) =>
//                         Object.entries(ref).map(([_, value]: [string, any], i) =>
//                           Object.entries(value).map(([title, url]) => (
//                             <li key={title + url} className="ml-2">
//                               <a
//                                 href={url as string}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="text-xs text-blue-700 underline"
//                               >
//                                 {title}
//                               </a>
//                             </li>
//                           ))
//                         )
//                       )}
//                     </ul>
//                   )}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// } 

// app/(chat)/history/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, CheckCircle, XCircle, Search } from "lucide-react";
import { NewQueryInput } from "@/components/new-query-input";
import { QueryManager } from "@/components/query-manager";
import { toast } from "sonner";

interface ChatSession {
  chat_id: string;
  created_at: string;
  last_activity: string;
  is_active: boolean;
  questions: Question[];
}

interface Question {
  id: number;
  question_id: string;
  user_query_id: number;
  question_text: string;
  sequence_number: number;
  created_at: string;
  generated_queries: Array<{
    id: number;
    query_text: string;
    parent_id: number;
    is_selected: boolean;
    created_at: string;
  }>;
  search_results: Array<{
    id: number;
    result_data: any;
    response_text?: string;
    created_at: string;
  }>;
  citations: Array<{
    id: number;
    title: string;
    url: string;
    content_snippet?: string;
    relevance_score?: any;
    created_at: string;
  }>;
  final_responses: Array<{
    id: number;
    response_text?: string;
    result_data: any;
    created_at: string;
  }>;
}

export default function ChatHistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [showNewQuery, setShowNewQuery] = useState(false);

  const fetchChatHistory = async () => {
    setLoading(true);
    
    try {
      // Fetch the complete chat history
      const response = await fetch(`/api/chat-history`);
      const data = await response.json();
      
      // Find the chat session and question
      let foundSession = null;
      let foundQuestion = null;
      
      if (Array.isArray(data)) {
        for (const session of data) {
          if (session.questions) {
            const question = session.questions.find((q: Question) => 
              String(q.user_query_id) === String(id)
            );
            if (question) {
              foundSession = session;
              foundQuestion = question;
              break;
            }
          }
        }
      }
      
      setChatSession(foundSession);
      setCurrentQuestion(foundQuestion);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchChatHistory();
    }
  }, [id]);

  const handleAddQuestion = async (newQuery: string) => {
    if (!chatSession) return;
    
    setAddingQuestion(true);
    
    try {
      const response = await fetch(`/api/chat/${chatSession.chat_id}/add-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: newQuery }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add question');
      }
      
      const data = await response.json();
      toast.success('Question added successfully');
      
      // Navigate to the new question
      router.push(`/history/${data.id}`);
      
      // Emit event to refresh sidebar
      window.dispatchEvent(new CustomEvent('newQuery', { 
        detail: { 
          action: 'add_to_chat',
          chatId: chatSession.chat_id,
          queryId: data.id,
          queryText: data.query_text,
          timestamp: new Date().toISOString()
        } 
      }));
      
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error('Failed to add question');
    } finally {
      setAddingQuestion(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!currentQuestion || !chatSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-lg text-red-500 mb-4">Question not found</div>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    );
  }

  const selectedQueries = currentQuestion.generated_queries.filter(q => q.is_selected);
  const latestResponse = currentQuestion.final_responses[currentQuestion.final_responses.length - 1];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Chat History</h1>
          {chatSession.is_active && (
            <Badge variant="success">Active Chat</Badge>
          )}
        </div>

        {/* Chat Questions */}
        {chatSession.questions.length > 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Questions in this Chat ({chatSession.questions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {chatSession.questions.map((q, idx) => (
                  <div
                    key={q.question_id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      q.user_query_id === currentQuestion.user_query_id
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                    onClick={() => router.push(`/history/${q.user_query_id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {idx + 1}. {q.question_text}
                      </span>
                      <Badge variant="outline">
                        {new Date(q.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Question */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Question {currentQuestion.sequence_number}</span>
              <Badge variant="secondary">
                {new Date(currentQuestion.created_at).toLocaleDateString()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{currentQuestion.question_text}</p>
          </CardContent>
        </Card>

        {/* Query Manager for Research */}
        {currentQuestion.generated_queries.length > 0 && (
          <div className="mb-6">
            <QueryManager
              queries={currentQuestion.generated_queries}
              parentQueryId={currentQuestion.user_query_id}
              hideHeader={false}
              showDeepResearch={true}
            />
          </div>
        )}

        {/* Citations */}
        {currentQuestion.citations.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Citations ({currentQuestion.citations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentQuestion.citations.map((citation) => (
                  <div key={citation.id} className="p-3 border rounded-lg hover:bg-accent">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium flex items-center gap-1"
                        >
                          {citation.title}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        {citation.content_snippet && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {citation.content_snippet}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Final Response */}
        {latestResponse && latestResponse.response_text && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Generated Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{latestResponse.response_text}</p>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Generated on: {new Date(latestResponse.created_at).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add New Question */}
        <div className="mt-8">
          <NewQueryInput
            chatId={chatSession.chat_id}
            onSubmit={handleAddQuestion}
            disabled={addingQuestion}
          />
        </div>
      </div>
    </div>
  );
}