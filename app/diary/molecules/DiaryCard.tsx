'use client'

import { useState } from 'react'
import { Trash2, Calendar, Image as ImageIcon } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EditDiaryDialog } from '../organisms/EditDiaryDialog'
import { DiaryEntry, Mood } from '../atoms/types'
import Image from 'next/image'

interface DiaryCardProps {
  entry: DiaryEntry
  mood: Mood
  onDelete: (id: string) => void
  onUpdate: (id: string, updatedEntry: Partial<DiaryEntry>) => void
}

export function DiaryCard({ entry, mood, onDelete, onUpdate }: DiaryCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const handleCardClick = () => {
    setIsEditDialogOpen(true)
  }

  return (
    <>
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer" 
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <span className={`text-2xl ${mood.color}`}>{mood.emoji}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1">{entry.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-3 w-3" />
                  {formatDate(entry.date)}
                  <span className="text-xs">•</span>
                  <span className={mood.color}>{mood.name}</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  {truncateContent(entry.content)}
                </p>
                
                {/* Image Preview */}
                {entry.images && entry.images.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ImageIcon className="h-3 w-3" />
                      {entry.images.length} image{entry.images.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex gap-2 overflow-x-auto">
                      {entry.images.slice(0, 3).map((image, index) => (
                        <div key={index} className="flex-shrink-0">
                          <Image
                            src={image}
                            alt="Diary image"
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        </div>
                      ))}
                      {entry.images.length > 3 && (
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-muted-foreground">
                          +{entry.images.length - 3}
                        </div>
                      )}
                    </div>
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

      <EditDiaryDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        entry={entry}
        onUpdate={onUpdate}
      />
    </>
  )
} 