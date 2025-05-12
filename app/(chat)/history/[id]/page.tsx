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

export default function QueryHistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [query, setQuery] = useState<QueryHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    
    // Fetch the history using the Next.js API route
    fetch(`/api/query-history`)
      .then((res) => res.json())
      .then((data) => {
        // Find the query with the matching ID
        const found = Array.isArray(data) ? data.find((q) => String(q.id) === String(id)) : null;
        setQuery(found);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching history:', error);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!query) return <div className="p-4 text-red-500">Query not found.</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-10">
      <div className="max-w-3xl mx-auto mt-8 px-4">
        <div className="bg-white rounded-xl shadow-md border-l-4 border-orange-500 p-6 mb-8">
          <div className="text-xs text-gray-500 mb-1">Created: {new Date(query.created_at).toLocaleString()}</div>
          <div className="text-lg font-semibold text-gray-900 mb-2">{query.query_text}</div>
        </div>

        {/* Generated Sub-queries */}
        {query.generated_queries && query.generated_queries.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-bold text-gray-800 mb-3">Generated Sub-queries</h2>
            <ul className="space-y-3">
              {query.generated_queries.map((subQuery: any) => (
                <li key={subQuery.id} className="bg-gray-50 rounded border-l-2 border-orange-300 px-4 py-2">
                  <div className="text-sm text-gray-900 font-medium">{subQuery.query_text}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(subQuery.created_at).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Citations */}
        {query.citations && query.citations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-bold text-gray-800 mb-3">Citations</h2>
            <ul className="space-y-3">
              {query.citations.map((citation: any, index: number) => (
                <li key={index} className="bg-gray-50 rounded border-l-2 border-blue-300 px-4 py-2">
                  <div className="flex flex-col">
                    {citation.title && citation.url ? (
                      <a
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-700 underline font-medium"
                      >
                        {citation.title}
                      </a>
                    ) : null}
                    {citation.content_snippet && (
                      <span className="text-xs text-gray-600 mt-0.5">{citation.content_snippet}</span>
                    )}
                    {citation.relevance_score?.score !== undefined && (
                      <span className="text-xs text-gray-400 mt-0.5">Relevance: {citation.relevance_score.score}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Search Results */}
        {query.search_results && query.search_results.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-bold text-gray-800 mb-3">Search Results</h2>
            <ul className="space-y-3">
              {query.search_results.map((result: any, index: number) => (
                <li key={index} className="bg-gray-50 rounded border-l-2 border-green-300 px-4 py-2">
                  {result.response_text && (
                    <div className="text-xs text-gray-700 mb-1 whitespace-pre-line">{result.response_text}</div>
                  )}
                  {result.result_data && Array.isArray(result.result_data) && result.result_data.length > 0 && (
                    <ul className="list-disc list-inside ml-2">
                      {result.result_data.map((ref: any, idx: number) =>
                        Object.entries(ref).map(([_, value]: [string, any], i) =>
                          Object.entries(value).map(([title, url]) => (
                            <li key={title + url} className="ml-2">
                              <a
                                href={url as string}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-700 underline"
                              >
                                {title}
                              </a>
                            </li>
                          ))
                        )
                      )}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}