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
    // const { lastPulledVersion = 0 } = body; // TODO: Use this when implementing real backend sync

    // For now, return empty data structure
    // In a real implementation, this would fetch data from your backend
    const response = {
      lastMutationID: 0,
      cookie: null,
      patch: []
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