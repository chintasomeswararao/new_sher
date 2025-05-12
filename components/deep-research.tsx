import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

interface DeepResearchProps {
  isActive: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  activity?: Array<{
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
  }>;
  sources?: Array<{
    url: string;
    title: string;
    relevance: number;
  }>;
  deepResearch?: boolean;
}

// Helper function to extract domain and ID from URLs
const formatSourceUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Handle PubMed/NCBI links
    if (hostname.includes('pubmed.ncbi.nlm.nih.gov')) {
      const id = url.split('/').pop();
      return { domain: 'PubMed', id };
    } else if (hostname.includes('pmc.ncbi.nlm.nih.gov')) {
      const id = url.split('/').pop();
      return { domain: 'PMC', id };
    } else if (hostname.includes('ncbi.nlm.nih.gov')) {
      if (url.includes('/books/')) {
        const id = url.split('/books/').pop()?.replace('/', '');
        return { domain: 'NCBI Books', id };
      }
      const id = url.split('/').pop();
      return { domain: 'NCBI', id };
    }
    
    // Handle general URLs
    return { domain: hostname.replace('www.', ''), id: null };
  } catch (e) {
    return { domain: url, id: null };
  }
};
// Helper function to generate a unique key for an activity item
const getActivityKey = (item: {
  type: string;
  message: string;
  status: string;
}) => {
  return `${item.type}:${item.message}:${item.status}`;
};
export function DeepResearch({
  isLoading,
  activity = [],
  sources = [],
  deepResearch = true
}: DeepResearchProps) {
  const [activeTab, setActiveTab] = useState<'activity' | 'sources'>('sources');
  const [allSources, setAllSources] = useState<Array<{url: string; title: string; relevance: number}>>([]);
  const prevSourcesRef = useRef<string[]>([]);
  const [dedupedActivity, setDedupedActivity] = useState<Array<{
    type: string;
    status: string;
    message: string;
    timestamp: string;
  }>>([]);
  const seenActivityRef = useRef<Set<string>>(new Set());
  // Update accumulated sources when new sources come in
  useEffect(() => {
    if (sources.length > 0) {
      // Extract current source URLs for comparison
      const currentSourceUrls = sources.map(source => source.url);
      const prevSourceUrls = prevSourcesRef.current;

      
      // Find new sources that weren't in previous array
      const newSources = sources.filter(source => 
        source.url && !prevSourceUrls.includes(source.url)
      );
      
      if (newSources.length > 0) {
        // Add new sources to the beginning of allSources
        setAllSources(prev => [...newSources, ...prev]);
      }
      
      // Update reference of source URLs we've seen
      prevSourcesRef.current = [...currentSourceUrls, ...prevSourceUrls];
    }
  }, [sources]);
  // Deduplicate activity items
  useEffect(() => {
    if (activity.length > 0) {
      const newActivity = activity.filter(item => {
        const key = getActivityKey(item);
        if (seenActivityRef.current.has(key)) {
          return false;
        }
        seenActivityRef.current.add(key);
        return true;
      });
      
      if (newActivity.length > 0) {
        setDedupedActivity(prev => [...prev, ...newActivity]);
      }
    }
  }, [activity]);
  // Filter sources to only include those with URLs
  const validSources = allSources.filter(source => source.url);
  
  // // Hide component if both tabs have no content
  // if (activity.length === 0 && validSources.length === 0) {
  //   return null;
  // }

  return (
    <>
      {/* Main UI Container */}
      <div className="fixed right-0 top-0 w-64 h-screen z-20 border-l bg-white shadow-md flex flex-col">
        {/* Tab Navigation */}
        <div className="flex border-b bg-white pt-20">
          {dedupedActivity.length > 0 && (
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-2 px-4 text-center ${
                activeTab === 'activity'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-500'
              }`}
            >
              Activity
            </button>
          )}
          <button
            onClick={() => setActiveTab('sources')}
            className={`flex-1 py-2 px-4 text-center ${
              activeTab === 'sources'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-500'
            }`}
          >
            Sources
          </button>
        </div>

       {/* Tab Content */}
       <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar">
          {activeTab === 'activity' && dedupedActivity.length > 0 && (
            <div className="space-y-4">
              {dedupedActivity.length === 0 && (
                <div className="text-sm text-gray-500">No activity yet.</div>
              )}
              {[...dedupedActivity].reverse().map((item, index) => (
                <motion.div
                  key={`activity-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className={cn(
                      'size-2 rounded-full shrink-0 mt-1',
                      item.status === 'pending' && 'bg-yellow-500',
                      item.status === 'complete' && 'bg-green-500',
                      item.status === 'error' && 'bg-red-500',
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground break-words whitespace-pre-wrap">
                      {item.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {activeTab === 'sources' && (
            <div className="space-y-3">
              {validSources.length > 0 ? (
                <div className="border rounded-md p-2 hover:bg-gray-50 transition-colors duration-200 overflow-x-hidden">
                  {validSources.map((source, index) => {
                    const { domain, id } = formatSourceUrl(source.url);
                    return (
                      <motion.div
                        key={`source-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={index > 0 ? "mt-3 pt-3 border-t" : ""}
                      >
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 group"
                        >
                          <ExternalLink className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0 group-hover:text-blue-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-blue-600 break-all whitespace-normal group-hover:text-blue-700 group-hover:underline">
                              {source.url}
                            </p>
                          </div>
                        </a>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-2 text-sm text-gray-500">
                  No sources found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
