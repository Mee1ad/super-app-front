import { NextRequest, NextResponse } from 'next/server';

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
    const { clientID, cookie } = body;
    
    console.log('Pull request - clientID:', clientID, 'cookie:', cookie);
    
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
    
    // Return all relevant data for this user/app combination
    // The server decides what data to return based on user and app context
    const patch = [];
    
    // TODO: Implement data fetching based on userId and appInfo
    // Example:
    // if (appInfo.app === 'todo') {
    //   patch.push(...await getTodoData(userId));
    // } else if (appInfo.app === 'food') {
    //   patch.push(...await getFoodData(userId));
    // }
    
    // For now, return empty patch
    const response = {
      lastMutationID: 0,
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