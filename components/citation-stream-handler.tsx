'use client';

import { useState, useEffect } from 'react';
import { useDeepResearch } from '@/lib/deep-research-context';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

interface CitationStreamHandlerProps {
  query: string;
  onComplete?: () => void;
}

export function CitationStreamHandler({ query, onComplete }: CitationStreamHandlerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addCitation, clearCitations } = useDeepResearch();
  
  const fetchCitations = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    clearCitations();
    
    try {
      // Create queries based on the main query
      const queries = [
        query,
        `What is the optimal dosing of ${query}?`,
        `What are the safety and efficacy data for ${query}?`,
        `What are the side effects of ${query}?`,
        `What clinical trials exist for ${query}?`
      ];
      
      // Create a new ReadableStream to handle the streaming response
      const response = await fetch('/api/stream_citations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queries }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      // Process the stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is not readable');
      
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete JSON objects in the buffer
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              
              // Handle different types of stream data
              if (data.type === 'citation_result' && data.result) {
                const title = Object.keys(data.result)[0];
                const url = data.result[title];
                addCitation({ title, url, query: data.query || '' });
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
      
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('Error fetching citations:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (query) {
      fetchCitations();
    }
  }, [query]);
  
  return (
    <div className="citation-stream-handler">
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Fetching citations...</span>
        </div>
      )}
      
      {error && (
        <div className="text-red-500 py-2">
          <p>Error: {error}</p>
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={fetchCitations}
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
} 