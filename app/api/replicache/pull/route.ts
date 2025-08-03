import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory mutation tracking for development
// In production, this would be stored in a database
const mutationTracking = new Map<string, number>();

// JWT token validation function
function isTokenValid(token: string): boolean {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    
    return payload.exp > now;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check for auth token in Authorization header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    // Validate JWT token
    if (!isTokenValid(token)) {
      return NextResponse.json({ error: 'Unauthorized - Invalid or expired token' }, { status: 401 });
    }

    const body = await req.json();
    const { clientID, clientGroupID, profileID, cookie } = body;
    
    console.log('Pull request - clientID:', clientID, 'clientGroupID:', clientGroupID, 'profileID:', profileID, 'cookie:', cookie);
    
    // Parse cookie to get app info
    let appInfo = {};
    if (cookie) {
      try {
        appInfo = JSON.parse(cookie);
        console.log('App info from cookie:', appInfo);
      } catch (error) {
        console.warn('Could not parse cookie:', error);
      }
    }
    
    // Extract user ID from JWT token
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub || payload.user_id || payload.id;
    
    console.log('User ID from token:', userId);
    
    // Route data based on clientGroupID
    let patch: any[] = [];
    
    if (clientGroupID === 'todo-replicache-flat') {
      console.log('Processing todo pull request');
      // TODO: Implement todo data fetching
      // patch = await getTodoPatch(userId);
    } else if (clientGroupID === 'food-tracker-replicache') {
      console.log('Processing food pull request');
      // TODO: Implement food data fetching
      // patch = await getFoodPatch(userId);
    } else if (clientGroupID === 'diary-replicache') {
      console.log('Processing diary pull request');
      // TODO: Implement diary data fetching
      // patch = await getDiaryPatch(userId);
    } else if (clientGroupID === 'ideas-replicache') {
      console.log('Processing ideas pull request');
      // TODO: Implement ideas data fetching
      // patch = await getIdeasPatch(userId);
    } else {
      console.warn(`Unknown clientGroupID: ${clientGroupID}`);
    }
    
    // Get the last mutation ID for this client group
    const trackingKey = `${userId}-${clientGroupID}`;
    const lastMutationID = mutationTracking.get(trackingKey) || 0;
    
    console.log(`Returning lastMutationID: ${lastMutationID} for client group: ${clientGroupID}`);
    
    // Return the correct Replicache pull response format
    const response = {
      lastMutationID,
      cookie: null,
      patch
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Replicache pull error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}