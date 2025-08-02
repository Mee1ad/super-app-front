import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // For now, just acknowledge the poke
    // In a real implementation, this would trigger a pull for all connected clients
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Replicache poke error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}