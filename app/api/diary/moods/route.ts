import { NextResponse } from 'next/server'
import { Mood } from '@/app/diary/atoms/types'

const moods: Mood[] = [
  {
    id: "happy",
    name: "Happy",
    emoji: "😊",
    color: "#4CAF50",
    created_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "sad",
    name: "Sad",
    emoji: "😢",
    color: "#2196F3",
    created_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "angry",
    name: "Angry",
    emoji: "😠",
    color: "#F44336",
    created_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "calm",
    name: "Calm",
    emoji: "😌",
    color: "#9C27B0",
    created_at: "2024-12-01T10:00:00Z"
  }
]

export async function GET() {
  try {
    return NextResponse.json({ moods })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch moods' },
      { status: 500 }
    )
  }
} 