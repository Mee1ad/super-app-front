import { NextRequest } from 'next/server';
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

export async function GET(req: NextRequest) {
  console.log('SSE stream request received');
  
  // Check for auth token in Authorization header
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    console.log('SSE stream request rejected: No token provided');
    return new Response('Unauthorized - No token provided', { status: 401 });
  }

  // Validate JWT token
  if (!isTokenValid(token)) {
    console.log('SSE stream request rejected: Invalid or expired token');
    return new Response('Unauthorized - Invalid or expired token', { status: 401 });
  }

  // Extract user ID from JWT token
  let userId = 'anonymous';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    userId = payload.sub || payload.user_id || payload.id || 'anonymous';
    console.log('SSE stream user ID from token:', userId);
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
  
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      console.log('SSE stream started, registering client for user:', userId);
      // Register this client for notifications with user ID
      sseManager.addClient(controller, userId);
      
      // Send initial connection message
      controller.enqueue(encoder.encode('data: connected\n\n'));
      console.log('SSE connected message sent');
      
      // Keep connection alive with periodic messages (fallback)
      const interval = setInterval(() => {
        controller.enqueue(encoder.encode('data: ping\n\n'));
        console.log('SSE ping sent');
      }, 30000); // Send ping every 30 seconds
      
      // Clean up on close
      req.signal.addEventListener('abort', () => {
        console.log('SSE connection aborted');
        clearInterval(interval);
        sseManager.removeClient(controller);
        controller.close();
      });
    }
  });

  console.log('SSE stream response created');
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}