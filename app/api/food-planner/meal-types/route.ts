import { NextResponse } from 'next/server'
import { mealTypes } from '../data'

export async function GET() {
  try {
    return NextResponse.json({ meal_types: mealTypes })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch meal types' },
      { status: 500 }
    )
  }
} 