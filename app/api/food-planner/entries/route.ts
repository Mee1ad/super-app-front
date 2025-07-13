import { NextRequest, NextResponse } from 'next/server'
import { FoodEntry, FoodEntryCreate, PaginationMeta } from '@/app/food-planner/atoms/types'
import { foodEntries, mealTypes, generateId } from '../data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category') as 'planned' | 'eaten' | null
    const meal_type = searchParams.get('meal_type')
    const date_filter = searchParams.get('date_filter')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    
    let filteredEntries = [...foodEntries]
    
    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase()
      filteredEntries = filteredEntries.filter(entry =>
        entry.name.toLowerCase().includes(searchTerm) ||
        (entry.comment && entry.comment.toLowerCase().includes(searchTerm))
      )
    }
    
    // Apply category filter
    if (category) {
      filteredEntries = filteredEntries.filter(entry => entry.category === category)
    }
    
    // Apply meal type filter
    if (meal_type) {
      filteredEntries = filteredEntries.filter(entry => entry.meal_type_id === meal_type)
    }
    
    // Apply date filter
    if (date_filter) {
      filteredEntries = filteredEntries.filter(entry => entry.date === date_filter)
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
      { error: 'Failed to fetch food entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: FoodEntryCreate = await request.json()
    
    // Validate meal type exists
    const mealType = mealTypes.find(mt => mt.id === data.meal_type_id)
    if (!mealType) {
      return NextResponse.json(
        { error: 'Invalid meal type ID' },
        { status: 400 }
      )
    }
    
    const now = new Date().toISOString()
    const newEntry: FoodEntry = {
      id: generateId(),
      name: data.name,
      category: data.category,
      meal_type_id: data.meal_type_id,
      time: data.time,
      date: data.date,
      comment: data.comment,
      image: data.image,
      followed_plan: data.followed_plan,
      symptoms: data.symptoms || [],
      created_at: now,
      updated_at: now,
      meal_type: mealType
    }
    
    foodEntries.unshift(newEntry)
    
    return NextResponse.json(newEntry, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create food entry' },
      { status: 500 }
    )
  }
} 