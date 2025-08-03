import { NextResponse } from 'next/server';
import { sseManager } from '../sse-manager';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Get userId from query params
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'anonymous';
    
    console.log('Poke endpoint called for user:', userId);
    console.log(`Current connected clients: ${sseManager.getClientCount()}`);
    
    // Notify only the specific user
    sseManager.notifyUser(userId, 'sync');
    
    console.log(`Poke triggered sync for user: ${userId}`);
    
    return NextResponse.json({ 
      success: true, 
      userId,
      clientsNotified: sseManager.getUserClientCount(userId)
    });
  } catch (error) {
    console.error('Replicache poke error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}