import { NextRequest, NextResponse } from 'next/server'
import { FoodEntry, FoodEntryUpdate } from '@/app/food-planner/atoms/types'
import { foodEntries, mealTypes } from '../../data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const entry = foodEntries.find(e => e.id === id)
    if (!entry) {
      return NextResponse.json(
        { error: 'Food entry not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(entry)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch food entry' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data: FoodEntryUpdate = await request.json()
    const { id } = await params
    
    const entryIndex = foodEntries.findIndex(e => e.id === id)
    if (entryIndex === -1) {
      return NextResponse.json(
        { error: 'Food entry not found' },
        { status: 404 }
      )
    }
    
    // Validate meal type if provided
    if (data.meal_type_id) {
      const mealType = mealTypes.find(mt => mt.id === data.meal_type_id)
      if (!mealType) {
        return NextResponse.json(
          { error: 'Invalid meal type ID' },
          { status: 400 }
        )
      }
    }
    
    const updatedEntry: FoodEntry = {
      ...foodEntries[entryIndex],
      ...data,
      updated_at: new Date().toISOString(),
      meal_type: data.meal_type_id 
        ? mealTypes.find(mt => mt.id === data.meal_type_id)!
        : foodEntries[entryIndex].meal_type
    }
    
    foodEntries[entryIndex] = updatedEntry
    return NextResponse.json(updatedEntry)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update food entry' },
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
    const entryIndex = foodEntries.findIndex(e => e.id === id)
    if (entryIndex === -1) {
      return NextResponse.json(
        { error: 'Food entry not found' },
        { status: 404 }
      )
    }
    
    foodEntries.splice(entryIndex, 1)
    return NextResponse.json({ message: "Food entry deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete food entry' },
      { status: 500 }
    )
  }
} 