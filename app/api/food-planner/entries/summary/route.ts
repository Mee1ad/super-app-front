import { NextRequest, NextResponse } from 'next/server'
import { FoodSummaryResponse } from '@/app/food-planner/atoms/types'
import { foodEntries } from '../../data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    
    let filteredEntries = [...foodEntries]
    
    // Apply date range filter if provided
    if (startDate || endDate) {
      filteredEntries = filteredEntries.filter(entry => {
        const entryDate = entry.date
        if (startDate && entryDate < startDate) return false
        if (endDate && entryDate > endDate) return false
        return true
      })
    }
    
    const plannedCount = filteredEntries.filter(entry => entry.category === 'planned').length
    const eatenCount = filteredEntries.filter(entry => entry.category === 'eaten').length
    const followedPlanCount = filteredEntries.filter(entry => 
      entry.category === 'eaten' && entry.followed_plan === true
    ).length
    const offPlanCount = filteredEntries.filter(entry => 
      entry.category === 'eaten' && entry.followed_plan === false
    ).length
    
    const summary: FoodSummaryResponse = {
      planned_count: plannedCount,
      eaten_count: eatenCount,
      followed_plan_count: followedPlanCount,
      off_plan_count: offPlanCount
    }
    
    return NextResponse.json(summary)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch food summary' },
      { status: 500 }
    )
  }
} 