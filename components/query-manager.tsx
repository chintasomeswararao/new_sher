// 'use client';

// import React, { useState, useEffect } from 'react';
// import { QueryList } from './query-list';
// import { DeepResearch } from './deep-research';
// import { SourceCards } from './source-cards';

// // Define the structure for query items received from the API
// interface QueryItem {
//   id: number;
//   query_text: string;
//   parent_id: number;
//   is_selected: boolean;
//   created_at: 
// string;
// }

// // Props for the QueryManager component
// interface QueryManagerProps {
//   queries: QueryItem[];      // Initial list of queries to display
//   parentQueryId: number;     // Parent query ID for API requests
//   hideHeader?: boolean;      // Optional prop to hide the header
//   onResearchStart?: () => void;
//   onResearchEnd?: () => void;
//   showDeepResearch?: boolean; // Optional prop to control deep research visibility
// }

// export function QueryManager({ queries, parentQueryId, hideHeader = false, onResearchStart, onResearchEnd, showDeepResearch = false }: QueryManagerProps) {
//   // State management for the component
//   const [managedQueries, setManagedQueries] = useState<QueryItem[]>(queries);
//   const [isLoading, setIsLoading] = useState<boolean>(false);                  // Loading state for API operations
//   const [statusMessage, setStatusMessage] = useState<{message: string, isError: boolean} | null>(null);  // Success/status messages
//   const [isRunningSearch, setIsRunningSearch] = useState<boolean>(false);      // Loading state for research operation
//   const [searchResults, setSearchResults] = useState<any>(null);               // Research results from API
//   const [newQueryText, setNewQueryText] = useState<string>('');                // Input value for new queries
//   const [showAddQueryInput, setShowAddQueryInput] = useState<boolean>(false);  // Toggle for showing add query input
//   const [alertMessage, setAlertMessage] = useState<string | null>(null);       // Message for the central alert modal
//   const [searchStreamData, setSearchStreamData] = useState<any[]>([]);         // Search stream data for structured rendering
//   const [progressPercent, setProgressPercent] = useState<number>(0);

//   // Base URL for API, defined in .env as NEXT_PUBLIC_API_URL
//   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
//   console.log("==QueryManger====>",API_BASE_URL)

//     // Save scroll position
//     const saveScrollPosition = () => {
//       return window.scrollY;
//     };
  
//     // Restore scroll position
//     const restoreScrollPosition = (y: number) => {
//       window.scrollTo(0, y);
//     };
  
//     // Scroll to the queries section
//     const scrollToTopOfQueries = () => {
//       const querySection = document.getElementById('generated-queries-section');
//       if (querySection) {
//         querySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
//       } else {
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//       }
//     };
  
//     // Lock scroll position to prevent browser auto-scrolling to added content
//     const lockScrollPosition = () => {
//       const scrollY = window.scrollY;
//       const lockScroll = () => {
//         window.scrollTo(0, scrollY);
//       };
//       window.addEventListener('scroll', lockScroll);
//       return () => window.removeEventListener('scroll', lockScroll);
//     };
  
//   // Deep Research state
//   const [activity, setActivity] = useState<Array<{
//     type: 'search' | 'extract' | 'analyze' | 'reasoning' | 'synthesis' | 'thought';
//     status: 'pending' | 'complete' | 'error';
//     message: string;
//     timestamp: string;
//   }>>([]);
//   const [sources, setSources] = useState<Array<{
//     url: string;
//     title: string;
//     relevance: number;
//   }>>([]);

//   // Initialize with a welcome activity for visibility
//   useEffect(() => {
//     if (activity.length === 0) {
//       addActivity({
//         type: 'thought',
//         status: 'complete',
//         message: 'Research assistant ready. Select queries and click "Run Research".',
//       });
//     }
//   }, []);

//   // When queries are loaded initially, log them in the activity feed
//   useEffect(() => {
//     if (queries.length > 0 && activity.length <= 1) {
//       // Only add this if we have the initial welcome message
//       addActivity({
//         type: 'analyze',
//         status: 'complete',
//         message: `Generated ${queries.length} research sub-queries`,
//       });
      
//       // Log each query
//       queries.forEach(query => {
//         addActivity({
//           type: 'thought',
//           status: 'complete',
//           message: `Generated query: "${query.query_text}"`,
//         });
        
//         // Log selected queries
//         if (query.is_selected) {
//           addActivity({
//             type: 'thought',
//             status: 'complete',
//             message: `Selected query: "${query.query_text}"`,
//           });
//         }
//       });
      
//       addActivity({
//         type: 'thought',
//         status: 'complete',
//         message: 'Query processing complete, ready for research',
//       });
//     }
//   }, [queries]);

//   // Display a success/status message that auto-dismisses after 3 seconds
//   const showMessage = (message: string, isError: boolean = false) => {
//     setStatusMessage({ message, isError });
//     // Clear the message after 3 seconds
//     setTimeout(() => setStatusMessage(null), 3000);
//   };

//   // Display a modal alert that requires user interaction to dismiss
//   const showAlert = (message: string) => {
//     setAlertMessage(message);
//     // Alert will be closed by user clicking the close button
//   };

//   // Close the alert modal
//   const closeAlert = () => {
//     setAlertMessage(null);
//   };

//   // Add activity to the DeepResearch component
//   const addActivity = (newActivity: {
//     type: 'search' | 'extract' | 'analyze' | 'reasoning' | 'synthesis' | 'thought';
//     status: 'pending' | 'complete' | 'error';
//     message: string;
//   }) => {
//     const activityWithTimestamp = {
//       ...newActivity,
//       timestamp: new Date().toISOString()
//     };
//     setActivity(prev => [...prev, activityWithTimestamp]);
//   };

//   // Add source to the DeepResearch component
//   const addSource = (newSource: {
//     url: string;
//     title: string;
//     relevance: number;
//   }) => {
//     // Use the URL with a basic title instead of empty strings
//     const source = {
//       url: newSource.url,
//       title: newSource.title || new URL(newSource.url).hostname, // Use domain name if title is empty
//       relevance: newSource.relevance || 1 // Use a default relevance of 1
//     };
    
//     // Check if source already exists to prevent duplicates
//     setSources(prev => {
//       if (prev.some(s => s.url === source.url)) {
//         return prev; // Don't add duplicates
//       }
//       return [...prev, source];
//     });
//   };

//   // Handle editing a query text
//   const handleEditQuery = async (id: number, newText: string) => {
//     const scrollPos = saveScrollPosition();
//     setIsLoading(true);
//     try {
//       console.log(`Editing query ${id} with new text: ${newText}`);
      
//       addActivity({
//         type: 'thought',
//         status: 'pending',
//         message: `Editing query: "${newText}"`,
//       });
      
//       // Make request to the edit endpoint using the exact format expected by the FastAPI backend
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/query/edit`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           query_id: id,
//           query_text: newText
//         }),
//       });

//       const responseData = await response.json();
//       console.log('Edit response:', responseData);

//       if (!response.ok) {
//         // If we get a structured error response, use it
//         if (responseData.detail) {
//           throw new Error(responseData.detail);
//         }
//         throw new Error(`Failed to edit query`);
//       }
      
//       // Update the local state with the edited query
//       setManagedQueries(prev => 
//         prev.map(q => q.id === id ? { 
//           ...q, 
//           query_text: responseData.query_text || newText 
//         } : q)
//       );

//       addActivity({
//         type: 'thought',
//         status: 'complete',
//         message: `Query edited successfully: "${newText}"`,
//       });

//       showMessage("Query updated successfully");
//     } catch (error) {
//       console.error('Error editing query:', error);
      
//       addActivity({
//         type: 'thought',
//         status: 'error',
//         message: `Failed to edit query: ${error instanceof Error ? error.message : 'Unknown error'}`,
//       });
      
//       showAlert(`Failed to edit query: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     } finally {
//       setIsLoading(false);
//       setTimeout(() => {
//         restoreScrollPosition(scrollPos);
//       }, 0);
//     }
//   };

//   // Handle deleting a query
//   const handleDeleteQuery = async (id: number) => {
//     if (!confirm("Are you sure you want to delete this query?")) {
//       return;
//     }
//     const scrollPos = saveScrollPosition();
//     setIsLoading(true);
//     try {
//       console.log(`Deleting query ${id}`);
      
//       addActivity({
//         type: 'thought',
//         status: 'pending',
//         message: `Deleting query #${id}`,
//       });
      
//       // Make request to the delete endpoint using the format expected by the FastAPI backend
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/query/delete`, {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           query_id: id
//         }),
//       });

//       const responseData = await response.json();
//       console.log('Delete response:', responseData);

//       if (!response.ok) {
//         // If we get a structured error response, use it
//         if (responseData.detail) {
//           throw new Error(responseData.detail);
//         }
//         throw new Error(`Failed to delete query`);
//       }

//       // Remove the deleted query from local state
//       setManagedQueries(prev => prev.filter(q => q.id !== id));

//       addActivity({
//         type: 'thought',
//         status: 'complete',
//         message: `Query #${id} deleted successfully`,
//       });

//       showMessage("Query deleted successfully");
//     } catch (error) {
//       console.error('Error deleting query:', error);
      
//       addActivity({
//         type: 'thought',
//         status: 'error',
//         message: `Failed to delete query: ${error instanceof Error ? error.message : 'Unknown error'}`,
//       });
      
//       showAlert(`Failed to delete query: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     } finally {
//       setIsLoading(false);
//       setTimeout(() => {
//         restoreScrollPosition(scrollPos);
//       }, 0);
//     }
//   };

//   // Handle toggling the selection state of a query
//   const handleToggleSelection = async (id: number, currentlySelected: boolean) => {
//     const scrollPos = saveScrollPosition();
//     setIsLoading(true);
//     try {
//       console.log(`Toggling selection for query ${id} to ${!currentlySelected}`);
      
//       addActivity({
//         type: 'thought',
//         status: 'pending',
//         message: `${!currentlySelected ? 'Selecting' : 'Deselecting'} query #${id}`,
//       });
      
//       // Make request to the selection toggle endpoint
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/query/select`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           query_id: id,
//           is_selected: !currentlySelected
//         }),
//       });

//       const responseData = await response.json();
//       console.log('Selection toggle response:', responseData);

//       if (!response.ok) {
//         if (responseData.detail) {
//           throw new Error(responseData.detail);
//         }
//         throw new Error(`Failed to update query selection`);
//       }

//       // Update the local state with the new selection state
//       setManagedQueries(prev => 
//         prev.map(q => q.id === id ? { 
//           ...q, 
//           is_selected: !currentlySelected 
//         } : q)
//       );

//       addActivity({
//         type: 'thought',
//         status: 'complete',
//         message: `Query #${id} ${!currentlySelected ? 'selected' : 'deselected'} successfully`,
//       });

//       showMessage(`Query ${!currentlySelected ? 'selected' : 'unselected'} successfully`);
//     } catch (error) {
//       console.error('Error toggling query selection:', error);
      
//       addActivity({
//         type: 'thought',
//         status: 'error',
//         message: `Failed to update selection: ${error instanceof Error ? error.message : 'Unknown error'}`,
//       });
      
//       showAlert(`Failed to update selection: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     } finally {
//       setIsLoading(false);
//       setTimeout(() => {
//         restoreScrollPosition(scrollPos);
//       }, 0);
//     }
//   };

//   // Run research on selected queries
//   const handleRunResearch = async () => {
//     if (onResearchStart) {
//       onResearchStart();
//     }
//     // Check if there are any selected queries
//     const selectedQueries = managedQueries.filter(q => q.is_selected);
//     if (selectedQueries.length === 0) {
//       showAlert("Please select at least one query to run research");
//       return;
//     }
//     scrollToTopOfQueries();
//     setIsRunningSearch(true);
//     setProgressPercent(0);
    
//     // // Clear previous research data
//     // setActivity([]);  // Clear activity feed
//     // setSources([]);   // Clear sources
//     // setSearchStreamData([]); // Clear search stream data
    
//   // Add initial progress activity
//   addActivity({
//     type: 'thought',
//     status: 'pending',
//     message: `Initializing research...`,
//   });
  
//   // Start progress animation
//   const progressInterval = setInterval(() => {
//     setProgressPercent(prev => {
//       // More predictable progress fill pattern that slows down as it approaches 95%
//       if (prev < 20) {
//         // Start quickly (0-20%)
//         return prev + 2;
//       } else if (prev < 50) {
//         // Medium speed (20-50%)
//         return prev + 1;
//       } else if (prev < 75) {
//         // Slower (50-75%)
//         return prev + 0.5;
//       } else if (prev < 98) {
//         // Very slow for the last part (75-98%)
//         return prev + 0.2;
//       }
//       // Extremely slow for the final bit (98-99.9%)
//       return Math.min(99.9, prev + 0.05);
//     });
//   }, 300);
  
//   // Lock scroll position to prevent auto-scrolling to results
//   const unlockScroll = lockScrollPosition();
  
  


//     try {
//       console.log(`Running research for parent query ID: ${parentQueryId}`);
      
//       // Reset previous results
//       setSearchResults(null);
      
//       // Move query threads, search, and extracted info to activity tab
//       addActivity({
//         type: 'thought',
//         status: 'pending',
//         message: `Starting research for parent query ID: ${parentQueryId}`,
//       });
      
//       addActivity({
//         type: 'thought',
//         status: 'pending',
//         message: `Starting research on ${selectedQueries.length} selected queries...`,
//       });
      
//       // Log each selected query
//       selectedQueries.forEach(query => {
//         addActivity({
//           type: 'search',
//           status: 'pending',
//           message: `Researching: "${query.query_text}"`,
//         });
//       });
      
//       // Make request to the search/run endpoint
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/search/run`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           parent_query_id: parentQueryId
//         }),
//       });

//       // Log API response status
//       addActivity({
//         type: 'thought',
//         status: 'complete',
//         message: `Research API response status: ${response.status}`,
//       });

//       const responseData = await response.json();
//       console.log('Research run response:', responseData);

//       if (!response.ok) {
//         if (responseData.detail) {
//           throw new Error(responseData.detail);
//         }
//         throw new Error(`Failed to run research`);
//       }

//       // Store the search results
//       setSearchResults(responseData);
      
//       // Process stream data for structured rendering and extract sources
//       const extractedUrls = new Set<string>();
      
//       if (Array.isArray(responseData)) {
//         setSearchStreamData(responseData);
        
//         // Move query threads to activity tab
//         responseData.forEach(item => {
//           if (item.query) {
//             addActivity({
//               type: 'search',
//               status: 'complete',
//               message: `Query thread: "${item.query}"`,
//             });
//           }
          
//           if (item.status) {
//             addActivity({
//               type: 'extract',
//               status: 'complete',
//               message: `Query status: ${item.status.replace(/_/g, ' ')}`,
//             });
//           }
          
//           // Extract source URLs from results directly
//           if (item.result && typeof item.result === 'object') {
//             Object.entries(item.result).forEach(([title, url]) => {
//               // Add result to activity feed
//               addActivity({
//                 type: 'extract',
//                 status: 'complete',
//                 message: `Extracted result: "${title}" - ${url}`,
//               });
              
//               // Add source if it's a valid URL and not already added
//               if (typeof url === 'string' && url.startsWith('http') && !extractedUrls.has(url)) {
//                 extractedUrls.add(url);
//                 addSource({
//                   url: url,
//                   title: title,
//                   relevance: 1
//                 });
//               }
//             });
//           }
          
//           // Also extract URLs from grouped results if available
//           if (item.results && Array.isArray(item.results)) {
//             item.results.forEach((group: any) => {
//               if (typeof group === 'object') {
//                 Object.values(group).forEach((citationGroup: any) => {
//                   if (typeof citationGroup === 'object') {
//                     Object.entries(citationGroup).forEach(([title, url]) => {
//                       if (typeof url === 'string' && url.startsWith('http') && !extractedUrls.has(url)) {
//                         extractedUrls.add(url);
//                         addSource({
//                           url: url,
//                           title: title,
//                           relevance: 1
//                         });
//                       }
//                     });
//                   }
//                 });
//               }
//             });
//           }
//         });
//       }

//       // Log search completion
//       addActivity({
//         type: 'search',
//         status: 'complete',
//         message: 'Completed search across selected queries',
//       });
      
//       // Process citations if available
//       if (responseData.citations) {
//         // Log synthesis beginning
//         addActivity({
//           type: 'synthesis',
//           status: 'pending',
//           message: 'Processing research findings...',
//         });
        
//         // Extract sources from citations
//         const citationsArray = Array.isArray(responseData.citations) 
//           ? responseData.citations 
//           : [responseData.citations];
        
//         if (citationsArray.length > 0) {
//           // Log reasoning about sources
//           addActivity({
//             type: 'reasoning',
//             status: 'complete',
//             message: `Found ${citationsArray.length} relevant sources`,
//           });
          
//           // Process citations to extract URLs
//           citationsArray.forEach((citation: any) => {
//             try {
//               if (citation && typeof citation === 'object') {
//                 // Direct citation key-value pairs
//                 Object.entries(citation).forEach(([key, value]) => {
//                   // If value is a direct URL string
//                   if (typeof value === 'string' && value.startsWith('http') && !extractedUrls.has(value)) {
//                     extractedUrls.add(value);
//                     addSource({
//                       url: value,
//                       title: key,
//                       relevance: 1
//                     });
                    
//                     addActivity({
//                       type: 'extract',
//                       status: 'complete',
//                       message: `Extracted URL: ${value}`,
//                     });
//                   }
//                   // If value is an object with title-URL pairs
//                   else if (value && typeof value === 'object') {
//                     Object.entries(value).forEach(([title, url]) => {
//                       if (typeof url === 'string' && url.startsWith('http') && !extractedUrls.has(url)) {
//                         extractedUrls.add(url);
//                         addSource({
//                           url: url,
//                           title: title,
//                           relevance: 1
//                         });
                        
//                         addActivity({
//                           type: 'extract',
//                           status: 'complete',
//                           message: `Extracted URL: ${url}`,
//                         });
//                       }
//                     });
//                   }
//                 });
//               }
//             } catch (error) {
//               console.error('Error processing citation:', error);
//             }
//           });
//         }
        
//         // Log synthesis completion
//         addActivity({
//           type: 'synthesis',
//           status: 'complete',
//           message: `Synthesized information from ${extractedUrls.size} sources`,
//         });
//       }
      
//       // If we still don't have any sources, check if we can parse the response string
//       if (extractedUrls.size === 0 && responseData.response) {
//         try {
//           // Try to extract URLs from the response text
//           const urlRegex = /(https?:\/\/[^\s]+)/g;
//           const matches = responseData.response.match(urlRegex);
          
//           if (matches && matches.length > 0) {
//             matches.forEach((url: string) => {
//               // Clean up URL
//               const cleanUrl = url.replace(/[.,;:"\])}]+$/, '');
//               if (!extractedUrls.has(cleanUrl)) {
//                 extractedUrls.add(cleanUrl);
//                 addSource({
//                   url: cleanUrl,
//                   title: `Source from response text`,
//                   relevance: 1
//                 });
                
//                 addActivity({
//                   type: 'extract',
//                   status: 'complete',
//                   message: `Extracted URL from response: ${cleanUrl}`,
//                 });
//               }
//             });
            
//             addActivity({
//               type: 'synthesis',
//               status: 'complete',
//               message: `Found ${matches.length} URLs in response text`,
//             });
//           }
//         } catch (error) {
//           console.error('Error extracting URLs from response text:', error);
//         }
//       }
      
//       // Log research completion with source count
//       addActivity({
//         type: 'thought',
//         status: 'complete',
//         message: `Research complete. Found ${extractedUrls.size} sources.`,
//       });

//       showMessage("Research completed successfully");
//       scrollToTopOfQueries();
//     } catch (error) {
//       console.error('Error running research:', error);
      
//       addActivity({
//         type: 'thought',
//         status: 'error',
//         message: `Failed to run research: ${error instanceof Error ? error.message : 'Unknown error'}`,
//       });
      
//       showAlert(`Failed to run research: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     } finally {
//       setIsRunningSearch(false);
//       setProgressPercent(100);
//       clearInterval(progressInterval);
//       if (typeof unlockScroll === 'function') {
//         unlockScroll();
//       }
//       setTimeout(() => {
//         scrollToTopOfQueries();
//       }, 100);
//       if (onResearchEnd) {
//         onResearchEnd();
//       }
//     }
    
//   };

//   // Add a new query
//   const handleAddQuery = async () => {
//     if (!newQueryText || newQueryText.trim() === '') {
//       showAlert("Please enter a query text");
//       return;
//     }
    
//     setIsLoading(true);
//     try {
//       console.log(`Adding new query to parent ID: ${parentQueryId}`);
      
//       addActivity({
//         type: 'thought',
//         status: 'pending',
//         message: `Adding new query: "${newQueryText}"`,
//       });
      
//       // Make request to the add endpoint
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/query/add`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           parent_query_id: parentQueryId,
//           query_text: newQueryText
//         }),
//       });

//       const responseData = await response.json();
//       console.log('Add query response:', responseData);

//       if (!response.ok) {
//         if (responseData.detail) {
//           throw new Error(responseData.detail);
//         }
//         throw new Error(`Failed to add query`);
//       }

//       // Add the new query to the local state
//       setManagedQueries(prev => [...prev, responseData]);
      
//       // Clear the input field after successful addition
//       setNewQueryText('');
//       // Hide the input field after adding
//       setShowAddQueryInput(false);
      
//       addActivity({
//         type: 'thought',
//         status: 'complete',
//         message: `Added new query: "${newQueryText}"`,
//       });
      
//       showMessage("Query added successfully");
//     } catch (error) {
//       console.error('Error adding query:', error);
      
//       addActivity({
//         type: 'thought',
//         status: 'error',
//         message: `Failed to add query: ${error instanceof Error ? error.message : 'Unknown error'}`,
//       });
      
//       showAlert(`Failed to add query: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Merge new queries with previous ones, avoiding duplicates
//   useEffect(() => {
//     setManagedQueries(prev => {
//       const existingIds = new Set(prev.map(q => q.id));
//       const merged = [...prev];
//       queries.forEach(q => {
//         if (!existingIds.has(q.id)) {
//           merged.push(q);
//         }
//       });
//       return merged;
//     });
//   }, [queries]);

//   return (
//     <div className="mt-4 relative">
//       {/* Status message for notifications */}
//       {statusMessage && (
//         <div className={`p-3 mb-4 rounded-md ${statusMessage.isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
//           {statusMessage.message}
//         </div>
//       )}
//       {!hideHeader && managedQueries.length > 0 && (
//         <div className="mb-6">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-2xl font-bold">Research Query Results</h2>
//           </div>
//           <p className="text-muted-foreground">
//             Based on your question, we've generated the following research queries. 
//             Select the queries you want to use and click "Run Research".
//           </p>
//         </div>
//       )}
      
//       {/* Modal Alert for important messages */}
//       {alertMessage && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
//             <div className="flex justify-between items-start mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">Alert</h3>
//               <button 
//                 onClick={closeAlert}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   <line x1="18" y1="6" x2="6" y2="18"></line>
//                   <line x1="6" y1="6" x2="18" y2="18"></line>
//                 </svg>
//               </button>
//             </div>
//             <div className="mb-5">
//               <p className="text-gray-700">{alertMessage}</p>
//             </div>
//             <div className="flex justify-end">
//               <button
//                 onClick={closeAlert}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//               >
//                 OK
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
      
//       {/* List of queries with edit/delete/selection controls */}
//       <QueryList 
//         queries={managedQueries} 
//         onEdit={handleEditQuery} 
//         onDelete={handleDeleteQuery} 
//         onToggleSelection={handleToggleSelection}
//         disabled={isRunningSearch}
//       />
      
//       {/* Query actions section */}
//       <div className="mt-6 flex flex-wrap gap-3 items-center">
//         {showAddQueryInput ? (
//           // Input field and buttons when adding a new query
//           <>
//             <div className="flex-grow">
//               <input
//                 type="text"
//                 value={newQueryText}
//                 onChange={(e) => setNewQueryText(e.target.value)}
//                 placeholder="Enter new query text"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 onKeyPress={(e) => {
//                   if (e.key === 'Enter') {
//                     handleAddQuery();
//                   }
//                 }}
//                 autoFocus
//               />
//             </div>
//             <button
//               onClick={handleAddQuery}
//               disabled={isLoading || isRunningSearch}
//               className={`px-4 py-2 rounded-md text-white font-medium ${
//                 isLoading 
//                   ? 'bg-gray-400 cursor-not-allowed' 
//                   : 'bg-green-600 hover:bg-green-700'
//               }`}
//             >
//               Add
//             </button>
//             <button
//               onClick={() => {
//                 setShowAddQueryInput(false);
//                 setNewQueryText('');
//               }}
//               className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
//               aria-label="Close"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <line x1="18" y1="6" x2="6" y2="18"></line>
//                 <line x1="6" y1="6" x2="18" y2="18"></line>
//               </svg>
//             </button>
//           </>
//         ) : (
//           // Add Query button when not in add mode
//           <button
//   onClick={() => setShowAddQueryInput(true)}
//   disabled={isRunningSearch}
//   title={isRunningSearch ? "Research is in progress..." : "Add a new query"}
//   className={`px-4 py-2 rounded-md text-white font-medium transition ${
//     isRunningSearch 
//       ? 'bg-gray-400 cursor-not-allowed'
//       : 'bg-green-600 hover:bg-green-700'
//   }`}
// >
//   Add Query
// </button>

//         )}
        
//         {/* Run Research button */}
//         <button
//           onClick={handleRunResearch}
//           disabled={isRunningSearch}
//           className={`px-4 py-2 rounded-md text-white font-medium ${
//             isRunningSearch 
//               ? 'bg-gray-400 cursor-not-allowed' 
//               : 'bg-orange-600 hover:bg-orange-700'
//           }`}
//         >
//           {isRunningSearch ? 'Running...' : 'Run Research on Selected Queries'}
//         </button>
//       </div>
      
//       {isRunningSearch && (
//         <div className="mt-4 mb-4">
//           <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
//             <div 
//               className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
//                 progressPercent === 100 ? 'bg-green-600' : 'bg-orange-600'
//               }`}
//               style={{ width: `${progressPercent}%` }}
//             ></div>
//           </div>
//           <p className="text-sm text-center text-muted-foreground">
//             {progressPercent === 100 
//               ? <span className="text-green-600 font-medium">Research complete! 100%</span> 
//               : `Research in progress... ${Math.round(progressPercent)}%`
//             }
//           </p>
//         </div>
//       )}

      

//       {/* Source Cards Component */}
//       {sources.length > 0 && (
//         <div className="mt-8 border-t pt-6">
//           <h3 className="text-xl font-semibold mb-4">Research Sources</h3>
//           <p className="text-muted-foreground mb-4">
//             Select a source to open it in a new tab.
//           </p>
//           <SourceCards sources={sources} />
//         </div>
//       )}
      
//       {/* Deep Research Component - only visible when showDeepResearch is true */}
//       {showDeepResearch && (
//         <DeepResearch
//           isActive={true}
//           onToggle={() => {}}
//           isLoading={isLoading || isRunningSearch}
//           activity={activity}
//           sources={sources}
//           deepResearch={true}
//         />
//       )}
//     </div>
//   );
// }


'use client';

import React, { useState, useEffect } from 'react';
import { QueryList } from './query-list';
import { DeepResearch } from './deep-research';
import { SourceCards } from './source-cards';

// Define the structure for query items received from the API
interface QueryItem {
  id: number;
  query_text: string;
  parent_id: number;
  is_selected: boolean;
  created_at: string;
}

// Props for the QueryManager component
interface QueryManagerProps {
  queries: QueryItem[];      // Initial list of queries to display
  parentQueryId: number;     // Parent query ID for API requests
  hideHeader?: boolean;      // Optional prop to hide the header
  onResearchStart?: () => void;
  onResearchEnd?: () => void;
  showDeepResearch?: boolean; // Optional prop to control deep research visibility
}

export function QueryManager({ queries, parentQueryId, hideHeader = false, onResearchStart, onResearchEnd, showDeepResearch = false }: QueryManagerProps) {
  // State management for the component
  const [managedQueries, setManagedQueries] = useState<QueryItem[]>(queries);
  const [isLoading, setIsLoading] = useState<boolean>(false);                  // Loading state for API operations
  const [statusMessage, setStatusMessage] = useState<{message: string, isError: boolean} | null>(null);  // Success/status messages
  const [isRunningSearch, setIsRunningSearch] = useState<boolean>(false);      // Loading state for research operation
  const [searchResults, setSearchResults] = useState<any>(null);               // Research results from API
  const [newQueryText, setNewQueryText] = useState<string>('');                // Input value for new queries
  const [showAddQueryInput, setShowAddQueryInput] = useState<boolean>(false);  // Toggle for showing add query input
  const [alertMessage, setAlertMessage] = useState<string | null>(null);       // Message for the central alert modal
  const [searchStreamData, setSearchStreamData] = useState<any[]>([]);         // Search stream data for structured rendering
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Base URL for API, defined in .env as NEXT_PUBLIC_API_URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  console.log("==QueryManager====>", API_BASE_URL);

  // Save scroll position
  const saveScrollPosition = () => {
    return window.scrollY;
  };

  // Restore scroll position
  const restoreScrollPosition = (y: number) => {
    window.scrollTo(0, y);
  };

  // Scroll to the queries section
  const scrollToTopOfQueries = () => {
    const querySection = document.getElementById('generated-queries-section');
    if (querySection) {
      querySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Lock scroll position to prevent browser auto-scrolling to added content
  const lockScrollPosition = () => {
    const scrollY = window.scrollY;
    const lockScroll = () => {
      window.scrollTo(0, scrollY);
    };
    window.addEventListener('scroll', lockScroll);
    return () => window.removeEventListener('scroll', lockScroll);
  };

  // Deep Research state
  const [activity, setActivity] = useState<Array<{
    type: 'search' | 'extract' | 'analyze' | 'reasoning' | 'synthesis' | 'thought';
    status: 'pending' | 'complete' | 'error';
    message: string;
    timestamp: string;
  }>>([]);
  const [sources, setSources] = useState<Array<{
    url: string;
    title: string;
    relevance: number;
  }>>([]);

  // Initialize with a welcome activity for visibility
  useEffect(() => {
    if (activity.length === 0) {
      addActivity({
        type: 'thought',
        status: 'complete',
        message: 'Research assistant ready. Select queries and click "Run Research".',
      });
    }
  }, []);

  // When queries are loaded initially, log them in the activity feed
  useEffect(() => {
    if (queries.length > 0 && activity.length <= 1) {
      // Only add this if we have the initial welcome message
      addActivity({
        type: 'analyze',
        status: 'complete',
        message: `Generated ${queries.length} research sub-queries`,
      });
      
      // Log each query
      queries.forEach(query => {
        addActivity({
          type: 'thought',
          status: 'complete',
          message: `Generated query: "${query.query_text}"`,
        });
        
        // Log selected queries
        if (query.is_selected) {
          addActivity({
            type: 'thought',
            status: 'complete',
            message: `Selected query: "${query.query_text}"`,
          });
        }
      });
      
      addActivity({
        type: 'thought',
        status: 'complete',
        message: 'Query processing complete, ready for research',
      });
    }
  }, [queries]);

  // Display a success/status message that auto-dismisses after 3 seconds
  const showMessage = (message: string, isError: boolean = false) => {
    setStatusMessage({ message, isError });
    // Clear the message after 3 seconds
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Display a modal alert that requires user interaction to dismiss
  const showAlert = (message: string) => {
    setAlertMessage(message);
    // Alert will be closed by user clicking the close button
  };

  // Close the alert modal
  const closeAlert = () => {
    setAlertMessage(null);
  };

  // Add activity to the DeepResearch component
  const addActivity = (newActivity: {
    type: 'search' | 'extract' | 'analyze' | 'reasoning' | 'synthesis' | 'thought';
    status: 'pending' | 'complete' | 'error';
    message: string;
  }) => {
    const activityWithTimestamp = {
      ...newActivity,
      timestamp: new Date().toISOString()
    };
    setActivity(prev => [...prev, activityWithTimestamp]);
  };

  // Add source to the DeepResearch component
  const addSource = (newSource: {
    url: string;
    title: string;
    relevance: number;
  }) => {
    // Use the URL with a basic title instead of empty strings
    const source = {
      url: newSource.url,
      title: newSource.title || new URL(newSource.url).hostname, // Use domain name if title is empty
      relevance: newSource.relevance || 1 // Use a default relevance of 1
    };
    
    // Check if source already exists to prevent duplicates
    setSources(prev => {
      if (prev.some(s => s.url === source.url)) {
        return prev; // Don't add duplicates
      }
      return [...prev, source];
    });
  };

  // Handle editing a query text
  const handleEditQuery = async (id: number, newText: string) => {
    const scrollPos = saveScrollPosition();
    setIsLoading(true);
    try {
      console.log(`Editing query ${id} with new text: ${newText}`);
      
      addActivity({
        type: 'thought',
        status: 'pending',
        message: `Editing query: "${newText}"`,
      });
      
      // Make request to the edit endpoint using the exact format expected by the FastAPI backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/query/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query_id: id,
          query_text: newText
        }),
      });

      const responseData = await response.json();
      console.log('Edit response:', responseData);

      if (!response.ok) {
        // If we get a structured error response, use it
        if (responseData.detail) {
          throw new Error(responseData.detail);
        }
        throw new Error(`Failed to edit query`);
      }
      
      // Update the local state with the edited query
      setManagedQueries(prev => 
        prev.map(q => q.id === id ? { 
          ...q, 
          query_text: responseData.query_text || newText 
        } : q)
      );

      addActivity({
        type: 'thought',
        status: 'complete',
        message: `Query edited successfully: "${newText}"`,
      });

      showMessage("Query updated successfully");
      
      // Emit event to notify sidebar to refresh
      window.dispatchEvent(new CustomEvent('newQuery', { 
        detail: { 
          action: 'edit',
          queryId: id,
          parentQueryId: parentQueryId,
          timestamp: new Date().toISOString()
        } 
      }));
      
    } catch (error) {
      console.error('Error editing query:', error);
      
      addActivity({
        type: 'thought',
        status: 'error',
        message: `Failed to edit query: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      
      showAlert(`Failed to edit query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        restoreScrollPosition(scrollPos);
      }, 0);
    }
  };

  // Handle deleting a query
  const handleDeleteQuery = async (id: number) => {
    if (!confirm("Are you sure you want to delete this query?")) {
      return;
    }
    const scrollPos = saveScrollPosition();
    setIsLoading(true);
    try {
      console.log(`Deleting query ${id}`);
      
      addActivity({
        type: 'thought',
        status: 'pending',
        message: `Deleting query #${id}`,
      });
      
      // Make request to the delete endpoint using the format expected by the FastAPI backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/query/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query_id: id
        }),
      });

      const responseData = await response.json();
      console.log('Delete response:', responseData);

      if (!response.ok) {
        // If we get a structured error response, use it
        if (responseData.detail) {
          throw new Error(responseData.detail);
        }
        throw new Error(`Failed to delete query`);
      }

      // Remove the deleted query from local state
      setManagedQueries(prev => prev.filter(q => q.id !== id));

      addActivity({
        type: 'thought',
        status: 'complete',
        message: `Query #${id} deleted successfully`,
      });

      showMessage("Query deleted successfully");
      
      // Emit event to notify sidebar to refresh
      window.dispatchEvent(new CustomEvent('newQuery', { 
        detail: { 
          action: 'delete',
          queryId: id,
          parentQueryId: parentQueryId,
          timestamp: new Date().toISOString()
        } 
      }));
      
    } catch (error) {
      console.error('Error deleting query:', error);
      
      addActivity({
        type: 'thought',
        status: 'error',
        message: `Failed to delete query: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      
      showAlert(`Failed to delete query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        restoreScrollPosition(scrollPos);
      }, 0);
    }
  };

  // Handle toggling the selection state of a query
  const handleToggleSelection = async (id: number, currentlySelected: boolean) => {
    const scrollPos = saveScrollPosition();
    setIsLoading(true);
    try {
      console.log(`Toggling selection for query ${id} to ${!currentlySelected}`);
      
      addActivity({
        type: 'thought',
        status: 'pending',
        message: `${!currentlySelected ? 'Selecting' : 'Deselecting'} query #${id}`,
      });
      
      // Make request to the selection toggle endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/query/select`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query_id: id,
          is_selected: !currentlySelected
        }),
      });

      const responseData = await response.json();
      console.log('Selection toggle response:', responseData);

      if (!response.ok) {
        if (responseData.detail) {
          throw new Error(responseData.detail);
        }
        throw new Error(`Failed to update query selection`);
      }

      // Update the local state with the new selection state
      setManagedQueries(prev => 
        prev.map(q => q.id === id ? { 
          ...q, 
          is_selected: !currentlySelected 
        } : q)
      );

      addActivity({
        type: 'thought',
        status: 'complete',
        message: `Query #${id} ${!currentlySelected ? 'selected' : 'deselected'} successfully`,
      });

      showMessage(`Query ${!currentlySelected ? 'selected' : 'unselected'} successfully`);
      
      // Emit event to notify sidebar to refresh
      window.dispatchEvent(new CustomEvent('newQuery', { 
        detail: { 
          action: 'selection',
          queryId: id,
          parentQueryId: parentQueryId,
          isSelected: !currentlySelected,
          timestamp: new Date().toISOString()
        } 
      }));
      
    } catch (error) {
      console.error('Error toggling query selection:', error);
      
      addActivity({
        type: 'thought',
        status: 'error',
        message: `Failed to update selection: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      
      showAlert(`Failed to update selection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        restoreScrollPosition(scrollPos);
      }, 0);
    }
  };

  // Run research on selected queries
  const handleRunResearch = async () => {
    if (onResearchStart) {
      onResearchStart();
    }
    // Check if there are any selected queries
    const selectedQueries = managedQueries.filter(q => q.is_selected);
    if (selectedQueries.length === 0) {
      showAlert("Please select at least one query to run research");
      return;
    }
    scrollToTopOfQueries();
    setIsRunningSearch(true);
    setProgressPercent(0);
    
    // Add initial progress activity
    addActivity({
      type: 'thought',
      status: 'pending',
      message: `Initializing research...`,
    });
    
    // Start progress animation
    const progressInterval = setInterval(() => {
      setProgressPercent(prev => {
        // More predictable progress fill pattern that slows down as it approaches 95%
        if (prev < 20) {
          // Start quickly (0-20%)
          return prev + 2;
        } else if (prev < 50) {
          // Medium speed (20-50%)
          return prev + 1;
        } else if (prev < 75) {
          // Slower (50-75%)
          return prev + 0.5;
        } else if (prev < 98) {
          // Very slow for the last part (75-98%)
          return prev + 0.2;
        }
        // Extremely slow for the final bit (98-99.9%)
        return Math.min(99.9, prev + 0.05);
      });
    }, 300);
    
    // Lock scroll position to prevent auto-scrolling to results
    const unlockScroll = lockScrollPosition();

    try {
      console.log(`Running research for parent query ID: ${parentQueryId}`);
      
      // Reset previous results
      setSearchResults(null);
      
      // Move query threads, search, and extracted info to activity tab
      addActivity({
        type: 'thought',
        status: 'pending',
        message: `Starting research for parent query ID: ${parentQueryId}`,
      });
      
      addActivity({
        type: 'thought',
        status: 'pending',
        message: `Starting research on ${selectedQueries.length} selected queries...`,
      });
      
      // Log each selected query
      selectedQueries.forEach(query => {
        addActivity({
          type: 'search',
          status: 'pending',
          message: `Researching: "${query.query_text}"`,
        });
      });
      
      // Make request to the search/run endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/search/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parent_query_id: parentQueryId
        }),
      });

      // Log API response status
      addActivity({
        type: 'thought',
        status: 'complete',
        message: `Research API response status: ${response.status}`,
      });

      const responseData = await response.json();
      console.log('Research run response:', responseData);

      if (!response.ok) {
        if (responseData.detail) {
          throw new Error(responseData.detail);
        }
        throw new Error(`Failed to run research`);
      }

      // Store the search results
      setSearchResults(responseData);
      
      // Process stream data for structured rendering and extract sources
      const extractedUrls = new Set<string>();
      
      if (Array.isArray(responseData)) {
        setSearchStreamData(responseData);
        
        // Move query threads to activity tab
        responseData.forEach(item => {
          if (item.query) {
            addActivity({
              type: 'search',
              status: 'complete',
              message: `Query thread: "${item.query}"`,
            });
          }
          
          if (item.status) {
            addActivity({
              type: 'extract',
              status: 'complete',
              message: `Query status: ${item.status.replace(/_/g, ' ')}`,
            });
          }
          
          // Extract source URLs from results directly
          if (item.result && typeof item.result === 'object') {
            Object.entries(item.result).forEach(([title, url]) => {
              // Add result to activity feed
              addActivity({
                type: 'extract',
                status: 'complete',
                message: `Extracted result: "${title}" - ${url}`,
              });
              
              // Add source if it's a valid URL and not already added
              if (typeof url === 'string' && url.startsWith('http') && !extractedUrls.has(url)) {
                extractedUrls.add(url);
                addSource({
                  url: url,
                  title: title,
                  relevance: 1
                });
              }
            });
          }
          
          // Also extract URLs from grouped results if available
          if (item.results && Array.isArray(item.results)) {
            item.results.forEach((group: any) => {
              if (typeof group === 'object') {
                Object.values(group).forEach((citationGroup: any) => {
                  if (typeof citationGroup === 'object') {
                    Object.entries(citationGroup).forEach(([title, url]) => {
                      if (typeof url === 'string' && url.startsWith('http') && !extractedUrls.has(url)) {
                        extractedUrls.add(url);
                        addSource({
                          url: url,
                          title: title,
                          relevance: 1
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }

      // Log search completion
      addActivity({
        type: 'search',
        status: 'complete',
        message: 'Completed search across selected queries',
      });
      
      // Process citations if available
      if (responseData.citations) {
        // Log synthesis beginning
        addActivity({
          type: 'synthesis',
          status: 'pending',
          message: 'Processing research findings...',
        });
        
        // Extract sources from citations
        const citationsArray = Array.isArray(responseData.citations) 
          ? responseData.citations 
          : [responseData.citations];
        
        if (citationsArray.length > 0) {
          // Log reasoning about sources
          addActivity({
            type: 'reasoning',
            status: 'complete',
            message: `Found ${citationsArray.length} relevant sources`,
          });
          
          // Process citations to extract URLs
          citationsArray.forEach((citation: any) => {
            try {
              if (citation && typeof citation === 'object') {
                // Direct citation key-value pairs
                Object.entries(citation).forEach(([key, value]) => {
                  // If value is a direct URL string
                  if (typeof value === 'string' && value.startsWith('http') && !extractedUrls.has(value)) {
                    extractedUrls.add(value);
                    addSource({
                      url: value,
                      title: key,
                      relevance: 1
                    });
                    
                    addActivity({
                      type: 'extract',
                      status: 'complete',
                      message: `Extracted URL: ${value}`,
                    });
                  }
                  // If value is an object with title-URL pairs
                  else if (value && typeof value === 'object') {
                    Object.entries(value).forEach(([title, url]) => {
                      if (typeof url === 'string' && url.startsWith('http') && !extractedUrls.has(url)) {
                        extractedUrls.add(url);
                        addSource({
                          url: url,
                          title: title,
                          relevance: 1
                        });
                        
                        addActivity({
                          type: 'extract',
                          status: 'complete',
                          message: `Extracted URL: ${url}`,
                        });
                      }
                    });
                  }
                });
              }
            } catch (error) {
              console.error('Error processing citation:', error);
            }
          });
        }
        
        // Log synthesis completion
        addActivity({
          type: 'synthesis',
          status: 'complete',
          message: `Synthesized information from ${extractedUrls.size} sources`,
        });
      }
      
      // If we still don't have any sources, check if we can parse the response string
      if (extractedUrls.size === 0 && responseData.response) {
        try {
          // Try to extract URLs from the response text
          const urlRegex = /(https?:\/\/[^\s]+)/g;
          const matches = responseData.response.match(urlRegex);
          
          if (matches && matches.length > 0) {
            matches.forEach((url: string) => {
              // Clean up URL
              const cleanUrl = url.replace(/[.,;:"\])}]+$/, '');
              if (!extractedUrls.has(cleanUrl)) {
                extractedUrls.add(cleanUrl);
                addSource({
                  url: cleanUrl,
                  title: `Source from response text`,
                  relevance: 1
                });
                
                addActivity({
                  type: 'extract',
                  status: 'complete',
                  message: `Extracted URL from response: ${cleanUrl}`,
                });
              }
            });
            
            addActivity({
              type: 'synthesis',
              status: 'complete',
              message: `Found ${matches.length} URLs in response text`,
            });
          }
        } catch (error) {
          console.error('Error extracting URLs from response text:', error);
        }
      }
      
      // Log research completion with source count
      addActivity({
        type: 'thought',
        status: 'complete',
        message: `Research complete. Found ${extractedUrls.size} sources.`,
      });

      showMessage("Research completed successfully");
      scrollToTopOfQueries();
      
      // Emit event to notify sidebar to refresh
      window.dispatchEvent(new CustomEvent('newQuery', { 
        detail: { 
          action: 'research_complete',
          parentQueryId: parentQueryId,
          selectedQueries: selectedQueries.map(q => ({
            id: q.id,
            text: q.query_text
          })),
          sourcesFound: extractedUrls.size,
          timestamp: new Date().toISOString()
        } 
      }));
      
    } catch (error) {
      console.error('Error running research:', error);
      
      addActivity({
        type: 'thought',
        status: 'error',
        message: `Failed to run research: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      
      showAlert(`Failed to run research: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunningSearch(false);
      setProgressPercent(100);
      clearInterval(progressInterval);
      if (typeof unlockScroll === 'function') {
        unlockScroll();
      }
      setTimeout(() => {
        scrollToTopOfQueries();
      }, 100);
      if (onResearchEnd) {
        onResearchEnd();
      }
    }
  };

  // Add a new query
  const handleAddQuery = async () => {
    if (!newQueryText || newQueryText.trim() === '') {
      showAlert("Please enter a query text");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log(`Adding new query to parent ID: ${parentQueryId}`);
      
      addActivity({
        type: 'thought',
        status: 'pending',
        message: `Adding new query: "${newQueryText}"`,
      });
      
      // Make request to the add endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/query/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parent_query_id: parentQueryId,
          query_text: newQueryText
        }),
      });

      const responseData = await response.json();
      console.log('Add query response:', responseData);

      if (!response.ok) {
        if (responseData.detail) {
          throw new Error(responseData.detail);
        }
        throw new Error(`Failed to add query`);
      }

      // Add the new query to the local state
      setManagedQueries(prev => [...prev, responseData]);
      
      // Clear the input field after successful addition
      setNewQueryText('');
      // Hide the input field after adding
      setShowAddQueryInput(false);
      
      addActivity({
        type: 'thought',
        status: 'complete',
        message: `Added new query: "${newQueryText}"`,
      });
      
      showMessage("Query added successfully");
      
      // Emit event to notify sidebar to refresh
      window.dispatchEvent(new CustomEvent('newQuery', { 
        detail: { 
          action: 'add',
          queryId: responseData.id,
          parentQueryId: parentQueryId,
          queryText: newQueryText,
          timestamp: new Date().toISOString()
        } 
      }));
      
    } catch (error) {
      console.error('Error adding query:', error);
      
      addActivity({
        type: 'thought',
        status: 'error',
        message: `Failed to add query: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      
      showAlert(`Failed to add query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Merge new queries with previous ones, avoiding duplicates
  useEffect(() => {
    setManagedQueries(prev => {
      const existingIds = new Set(prev.map(q => q.id));
      const merged = [...prev];
      queries.forEach(q => {
        if (!existingIds.has(q.id)) {
          merged.push(q);
        }
      });
      return merged;
    });
  }, [queries]);

  return (
    <div className="mt-4 relative">
      {/* Status message for notifications */}
      {statusMessage && (
        <div className={`p-3 mb-4 rounded-md ${statusMessage.isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {statusMessage.message}
        </div>
      )}
      {!hideHeader && managedQueries.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Research Query Results</h2>
          </div>
          <p className="text-muted-foreground">
            Based on your question, we've generated the following research queries. 
            Select the queries you want to use and click "Run Research".
          </p>
        </div>
      )}
      
      {/* Modal Alert for important messages */}
      {alertMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Alert</h3>
              <button 
                onClick={closeAlert}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="mb-5">
              <p className="text-gray-700">{alertMessage}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={closeAlert}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* List of queries with edit/delete/selection controls */}
      <QueryList 
        queries={managedQueries} 
        onEdit={handleEditQuery} 
        onDelete={handleDeleteQuery} 
        onToggleSelection={handleToggleSelection}
        disabled={isRunningSearch}
      />
      
      {/* Query actions section */}
      <div className="mt-6 flex flex-wrap gap-3 items-center">
        {showAddQueryInput ? (
          // Input field and buttons when adding a new query
          <>
            <div className="flex-grow">
              <input
                type="text"
                value={newQueryText}
                onChange={(e) => setNewQueryText(e.target.value)}
                placeholder="Enter new query text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddQuery();
                  }
                }}
                autoFocus
              />
            </div>
            <button
              onClick={handleAddQuery}
              disabled={isLoading || isRunningSearch}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddQueryInput(false);
                setNewQueryText('');
              }}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </>
        ) : (
          // Add Query button when not in add mode
          <button
            onClick={() => setShowAddQueryInput(true)}
            disabled={isRunningSearch}
            title={isRunningSearch ? "Research is in progress..." : "Add a new query"}
            className={`px-4 py-2 rounded-md text-white font-medium transition ${
              isRunningSearch 
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Add Query
          </button>
        )}
        
        {/* Run Research button */}
        <button
          onClick={handleRunResearch}
          disabled={isRunningSearch}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isRunningSearch 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-orange-600 hover:bg-orange-700'
          }`}
        >
          {isRunningSearch ? 'Running...' : 'Run Research on Selected Queries'}
        </button>
      </div>
      
      {isRunningSearch && (
        <div className="mt-4 mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                progressPercent === 100 ? 'bg-green-600' : 'bg-orange-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-sm text-center text-muted-foreground">
            {progressPercent === 100 
              ? <span className="text-green-600 font-medium">Research complete! 100%</span> 
              : `Research in progress... ${Math.round(progressPercent)}%`
            }
          </p>
        </div>
      )}

      {/* Source Cards Component */}
      {sources.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-semibold mb-4">Research Sources</h3>
          <p className="text-muted-foreground mb-4">
            Select a source to open it in a new tab.
          </p>
          <SourceCards sources={sources} />
        </div>
      )}
      
      {/* Deep Research Component - only visible when showDeepResearch is true */}
      {showDeepResearch && (
        <DeepResearch
          isActive={true}
          onToggle={() => {}}
          isLoading={isLoading || isRunningSearch}
          activity={activity}
          sources={sources}
          deepResearch={true}
        />
      )}
    </div>
  );
}