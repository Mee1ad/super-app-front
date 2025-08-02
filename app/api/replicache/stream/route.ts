import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode('data: connected\n\n'));
      
      // Keep connection alive with periodic messages
      const interval = setInterval(() => {
        controller.enqueue(encoder.encode('data: ping\n\n'));
      }, 30000); // Send ping every 30 seconds
      
      // Clean up on close
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}