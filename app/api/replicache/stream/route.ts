import { NextRequest } from 'next/server';
import { sseManager } from '../sse-manager';

export async function GET(req: NextRequest) {
  console.log('SSE stream request received');
  
  // Get userId from query params
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || 'anonymous';
  
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