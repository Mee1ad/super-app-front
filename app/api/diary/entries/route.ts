import { NextRequest, NextResponse } from 'next/server'
import { DiaryEntry, DiaryEntryCreate, PaginationMeta } from '@/app/diary/atoms/types'
import { diaryEntries, generateId } from '../data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const mood = searchParams.get('mood')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    
    let filteredEntries = [...diaryEntries]
    
    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase()
      filteredEntries = filteredEntries.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm) ||
        entry.content.toLowerCase().includes(searchTerm)
      )
    }
    
    // Apply mood filter
    if (mood) {
      filteredEntries = filteredEntries.filter(entry => entry.mood === mood)
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex)
    
    const meta: PaginationMeta = {
      total: filteredEntries.length,
      page,
      limit,
      pages: Math.ceil(filteredEntries.length / limit)
    }
    
    return NextResponse.json({
      entries: paginatedEntries,
      meta
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch diary entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: DiaryEntryCreate = await request.json()
    
    const now = new Date().toISOString()
    const newEntry: DiaryEntry = {
      id: generateId(),
      title: data.title,
      content: data.content,
      mood: data.mood,
      date: data.date || new Date().toISOString().split('T')[0],
      images: data.images || [],
      created_at: now,
      updated_at: now
    }
    
    diaryEntries.unshift(newEntry)
    
    return NextResponse.json(newEntry, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create diary entry' },
      { status: 500 }
    )
  }
} 