import { NextRequest, NextResponse } from 'next/server'
import { CalendarResponse, DaySummary } from '@/app/food-planner/atoms/types'
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
    
    // Group entries by date
    const entriesByDate = new Map<string, typeof filteredEntries>()
    
    filteredEntries.forEach(entry => {
      if (!entriesByDate.has(entry.date)) {
        entriesByDate.set(entry.date, [])
      }
      entriesByDate.get(entry.date)!.push(entry)
    })
    
    // Create day summaries
    const days: DaySummary[] = Array.from(entriesByDate.entries()).map(([date, entries]) => {
      const plannedCount = entries.filter(entry => entry.category === 'planned').length
      const eatenCount = entries.filter(entry => entry.category === 'eaten').length
      const followedPlan = entries.some(entry => 
        entry.category === 'eaten' && entry.followed_plan === true
      )
      
      return {
        date,
        planned_count: plannedCount,
        eaten_count: eatenCount,
        followed_plan: followedPlan
      }
    })
    
    // Sort by date
    days.sort((a, b) => a.date.localeCompare(b.date))
    
    const calendarData: CalendarResponse = { days }
    
    return NextResponse.json(calendarData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch calendar data' },
      { status: 500 }
    )
  }
} 