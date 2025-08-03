import { NextResponse } from 'next/server';
import { sseManager } from '../sse-manager';

export async function POST() {
  try {
    // Notify all connected SSE clients to trigger immediate sync
    sseManager.notifyAll('sync');
    
    console.log(`Poke triggered sync for ${sseManager.getClientCount()} connected clients`);
    
    return NextResponse.json({ 
      success: true, 
      clientsNotified: sseManager.getClientCount() 
    });
  } catch (error) {
    console.error('Replicache poke error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}