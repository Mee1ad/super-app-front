'use client'

import { CheckCircle, XCircle, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FoodEntry } from '../atoms/types'

interface CalendarViewProps {
  entries: FoodEntry[]
}

export function CalendarView({ entries }: CalendarViewProps) {
  const getDaySummary = (date: Date) => {
    const dayEntries = entries.filter(entry => 
      entry.date.toDateString() === date.toDateString()
    )
    
    const plannedCount = dayEntries.filter(e => e.category === 'planned').length
    const eatenCount = dayEntries.filter(e => e.category === 'eaten').length
    const followedPlan = dayEntries.filter(e => e.category === 'eaten' && e.followedPlan).length > 0
    
    return { plannedCount, eatenCount, followedPlan }
  }

  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date)
    }
    return days
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Last 7 Days</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getLast7Days().map(date => {
          const summary = getDaySummary(date)
          return (
            <Card key={date.toISOString()} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  {formatDate(date)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Planned:</span>
                    <span className="font-medium">{summary.plannedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Eaten:</span>
                    <span className="font-medium">{summary.eatenCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    {summary.eatenCount > 0 ? (
                      summary.followedPlan ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Followed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600">
                          <XCircle className="h-4 w-4" />
                          <span className="text-sm">Off Plan</span>
                        </div>
                      )
                    ) : (
                      <span className="text-sm text-muted-foreground">No data</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 