// import { auth } from '@/app/(auth)/auth';

// export async function GET() {
//   const session = await auth();

//   // Only proceed for authenticated users
//   if (!session?.user?.id) {
//     console.error('User not authenticated');
//     return Response.json({ error: 'Authentication required' }, { status: 401 });
//   }

//   try {
//     // Get the API URL from environment variables
    
//     // Use the session user ID as the reference_id directly
//     const userReferenceId = session.user.id;
    
   
    
//     const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/queries?user_reference_id=${userReferenceId}&limit=100000`;

//     console.log(`Fetching history from: ${endpoint}`);
    
//     // Make request to the backend history endpoint
//     const response = await fetch(endpoint, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json'
//       },
//       credentials: 'include',
//     });

//     console.log(`History API response status: ${response.status}`);
//     console.log(`History API response headers:`, Object.fromEntries(response.headers.entries()));

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error(`History API error: ${response.status}`, errorText);
//       return Response.json({ error: `Backend API error: ${response.status}` }, { status: response.status });
//     }

//     let historyData = await response.json();
    
//     // Validate and transform the response if needed
//     if (!Array.isArray(historyData)) {
//       // If data is not an array but has a results property that is an array, use that
//       if (historyData.results && Array.isArray(historyData.results)) {
//         console.log('Using results array from response');
//         historyData = historyData.results;
//       } else {
//         console.error('Invalid response format: expected an array');
//         return Response.json({ error: 'Invalid response format' }, { status: 500 });
//       }
//     }

//     // // Log the structure of the response for debugging
//     // console.log('History data received, count:', historyData.length);
//     // console.log('History data structure:', JSON.stringify(historyData, null, 2));
    
//     // Return the data as is since it matches the expected format
//     return Response.json(historyData);
//   } catch (error) {
//     console.error('Error fetching query history:', error);
//     return Response.json({ error: 'Failed to fetch query history' }, { status: 500 });
//   }
// } 

// app/api/query-history/route.ts
import { auth } from '@/app/(auth)/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await auth();
    console.log('[API Route] Session:', JSON.stringify(session, null, 2));
    
    if (!session?.user?.id) {
      console.log('[API Route] No user session found');
      return NextResponse.json([], { status: 200 });  // Return empty array instead of 401
    }
    
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!API_BASE_URL) {
      console.error('[API Route] NEXT_PUBLIC_API_URL not configured');
      return NextResponse.json({ error: 'API URL not configured' }, { status: 500 });
    }
    
    const apiUrl = `${API_BASE_URL}/api/v1/query-history?user_id=${session.user.id}`;
    console.log('[API Route] Fetching from:', apiUrl);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('[API Route] Backend response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[API Route] Backend error:', errorText);
        // Return empty array instead of error
        return NextResponse.json([], { status: 200 });
      }
      
      const data = await response.json();
      console.log('[API Route] Data received:', JSON.stringify(data, null, 2));
      
      return NextResponse.json(data);
      
    } catch (fetchError) {
      console.error('[API Route] Fetch error:', fetchError);
      return NextResponse.json([], { status: 200 });
    }
    
  } catch (error) {
    console.error('[API Route] Unexpected error:', error);
    return NextResponse.json([], { status: 200 });
  }
}