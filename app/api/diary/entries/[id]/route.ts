import { NextRequest, NextResponse } from 'next/server'
import { DiaryEntry, DiaryEntryUpdate } from '@/app/diary/atoms/types'
import { diaryEntries } from '../../data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const entry = diaryEntries.find(e => e.id === id)
    if (!entry) {
      return NextResponse.json(
        { error: 'Diary entry not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(entry)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch diary entry' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data: DiaryEntryUpdate = await request.json()
    const { id } = await params
    
    const entryIndex = diaryEntries.findIndex(e => e.id === id)
    if (entryIndex === -1) {
      return NextResponse.json(
        { error: 'Diary entry not found' },
        { status: 404 }
      )
    }
    
    const updatedEntry: DiaryEntry = {
      ...diaryEntries[entryIndex],
      ...data,
      updated_at: new Date().toISOString()
    }
    
    diaryEntries[entryIndex] = updatedEntry
    return NextResponse.json(updatedEntry)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update diary entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const entryIndex = diaryEntries.findIndex(e => e.id === id)
    if (entryIndex === -1) {
      return NextResponse.json(
        { error: 'Diary entry not found' },
        { status: 404 }
      )
    }
    
    diaryEntries.splice(entryIndex, 1)
    return NextResponse.json({ message: "Diary entry deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete diary entry' },
      { status: 500 }
    )
  }
} 