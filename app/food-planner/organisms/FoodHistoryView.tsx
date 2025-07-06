'use client'

import { useState } from 'react'
import { Trash2, Clock, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EditFoodDialog } from './EditFoodDialog'
import { FoodEntry, MealType } from '../atoms/types'

interface FoodHistoryViewProps {
  entries: FoodEntry[]
  mealTypes: MealType[]
  onDelete: (id: string) => void
  onUpdate: (id: string, updatedEntry: Partial<FoodEntry>) => void
}

export function FoodHistoryView({ entries, mealTypes, onDelete, onUpdate }: FoodHistoryViewProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<FoodEntry | null>(null)

  const handleCardClick = (entry: FoodEntry) => {
    setSelectedEntry(entry)
    setIsEditDialogOpen(true)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const getMealType = (mealTypeId: string) => {
    return mealTypes.find(meal => meal.id === mealTypeId)!
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-muted-foreground text-center">
            <p className="text-lg font-medium mb-2">No food history</p>
            <p className="text-sm">Start by logging what you ate</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {entries.map(entry => {
          const mealType = getMealType(entry.mealType)
          return (
            <Card 
              key={entry.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCardClick(entry)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{mealType.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{entry.name}</h3>
                        {entry.followedPlan !== undefined && (
                          <Badge variant={entry.followedPlan ? "default" : "secondary"}>
                            {entry.followedPlan ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Followed Plan
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Off Plan
                              </>
                            )}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Clock className="h-3 w-3" />
                        {entry.time}
                        <span className="text-xs">•</span>
                        {formatDate(entry.date)}
                        <span className="text-xs">•</span>
                        {mealType.name}
                      </div>
                      {entry.comment && (
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {entry.comment}
                        </p>
                      )}
                      {entry.images && entry.images.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <ImageIcon className="h-3 w-3" />
                          {entry.images.length} image{entry.images.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(entry.id)
                      }}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {selectedEntry && (
        <EditFoodDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          entry={selectedEntry}
          onUpdate={onUpdate}
          mealTypes={mealTypes}
        />
      )}
    </>
  )
} 