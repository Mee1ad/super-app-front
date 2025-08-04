import { NextResponse, NextRequest } from 'next/server';
import { sseManager } from '../sse-manager';

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
      console.log('Poke-user request rejected: No token provided');
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    // Validate JWT token
    if (!isTokenValid(token)) {
      console.log('Poke-user request rejected: Invalid or expired token');
      return NextResponse.json({ error: 'Unauthorized - Invalid or expired token' }, { status: 401 });
    }

    // Extract user ID from JWT token
    let userId = 'anonymous';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub || payload.user_id || payload.id || 'anonymous';
      console.log('Poke-user user ID from token:', userId);
    } catch (error) {
      console.error('Error extracting user ID from token:', error);
      userId = 'anonymous';
    }
    
    // Get userId from query params as fallback or override
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get('userId');
    if (queryUserId && queryUserId !== 'anonymous') {
      userId = queryUserId;
    }
    
    console.log('Poke-user endpoint called for user:', userId);
    console.log(`Current connected clients: ${sseManager.getClientCount()}`);
    
    // Notify only the specific user
    sseManager.notifyUser(userId, 'sync');
    
    console.log(`Poke-user triggered sync for user: ${userId}`);
    
    return NextResponse.json({ 
      success: true, 
      userId,
      clientsNotified: sseManager.getUserClientCount(userId)
    });
  } catch (error) {
    console.error('Replicache poke-user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 