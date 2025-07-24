'use client'

import { useState } from 'react'
import { Trash2, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EditDiaryDialog } from '../organisms/EditDiaryDialog'
import { DiaryEntry, Mood, DiaryEntryUpdate } from '../atoms/types'
import Image from 'next/image'

interface DiaryCardProps {
  entry: DiaryEntry
  mood: Mood
  moods: Mood[]
  onDelete: (id: string) => void
  onUpdate: (id: string, updatedEntry: DiaryEntryUpdate) => Promise<void>
  loading?: boolean
}

export function DiaryCard({ entry, mood, moods, onDelete, onUpdate, loading = false }: DiaryCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      month: date.toLocaleString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      time: date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const { day, month, year } = formatDate(entry.date)

  // Generate a random time for demo
  function getRandomTime() {
    const hour = Math.floor(Math.random() * 12) + 1;
    const minute = Math.floor(Math.random() * 60);
    const ampm = Math.random() > 0.5 ? 'AM' : 'PM';
    return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }
  const demoTime = getRandomTime();

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const handleCardClick = () => {
    setIsEditDialogOpen(true)
  }

  return (
    <>
      {/* Mobile: Native app look */}
      <div
        className="flex flex-row w-full bg-transparent dark:bg-transparent px-3 py-4 border-b border-border cursor-pointer md:hidden overflow-hidden"
        onClick={handleCardClick}
      >
        {/* Date Sidebar (left) */}
        <div className="flex flex-col items-center justify-center min-w-[64px] max-w-[64px] mr-1">
          <span className="text-4xl leading-none">{day}</span>
          <span className="text-base font-semibold text-muted-foreground mt-1">{month}</span>
          <span className="text-xs text-muted-foreground mt-0.5">{year}</span>
        </div>
        {/* Vertical Divider */}
        <div className="w-1 bg-border mx-1 rounded-full" />
        {/* Entry Content (right) */}
        <div className="flex-1 flex flex-col items-start text-left pl-2 min-w-0">
          <span className="text-xs text-muted-foreground mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>{demoTime}</span>
          <div className="flex items-center gap-2 mb-1 w-full">
            <h3 className="font-semibold text-base truncate flex-1">{entry.title}</h3>
            <span className="text-2xl flex-shrink-0" style={{ color: mood.color }}>{mood.emoji}</span>
          </div>
          <p className="text-sm leading-relaxed mb-1 break-words">
            {truncateContent(entry.content)}
          </p>
          {/* Images, if any */}
          {entry.images && entry.images.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-hidden">
              {entry.images.slice(0, 3).map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt="Diary image"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover rounded-md"
                />
              ))}
              {entry.images.length > 3 && (
                <div className="flex-shrink-0 w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-xs text-muted-foreground">
                  +{entry.images.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tablet/Desktop: Card UI */}
      <div
        className="hidden md:flex w-full overflow-hidden"
        onClick={handleCardClick}
      >
        <Card className="flex flex-row w-full hover:shadow-md transition-shadow cursor-pointer rounded-lg p-6 gap-6 overflow-hidden">
          {/* Date badge */}
          <div className="flex flex-col items-center justify-center min-w-[56px] max-w-[56px]">
            <span className="text-3xl leading-none">{day}</span>
            <span className="text-sm font-semibold text-muted-foreground mt-1">{month}</span>
            <span className="text-xs text-muted-foreground mt-0.5">{year}</span>
          </div>
          {/* Entry Content */}
          <div className="flex-1 flex flex-col items-start text-left min-w-0">
            <div className="flex items-center gap-2 mb-1 w-full">
              <span className="text-xs text-muted-foreground flex-shrink-0" style={{ fontFamily: 'Inter, sans-serif' }}>{demoTime}</span>
              <h3 className="font-semibold text-lg truncate flex-1">{entry.title}</h3>
              <span className="text-2xl flex-shrink-0" style={{ color: mood.color }}>{mood.emoji}</span>
            </div>
            <p className="text-base leading-relaxed mb-2 break-words">
              {truncateContent(entry.content, 220)}
            </p>
            {/* Images, if any */}
            {entry.images && entry.images.length > 0 && (
              <div className="flex gap-2 mt-2 overflow-hidden">
                {entry.images.slice(0, 3).map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    alt="Diary image"
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                ))}
                {entry.images.length > 3 && (
                  <div className="flex-shrink-0 w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-xs text-muted-foreground">
                    +{entry.images.length - 3}
                  </div>
                )}
              </div>
            )}
            {/* Edit/Delete actions */}
            <div className="flex gap-2 mt-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={e => { e.stopPropagation(); setIsEditDialogOpen(true); }}
                className="h-8 w-8 p-0"
                aria-label="Edit entry"
              >
                <Calendar className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={e => { e.stopPropagation(); onDelete(entry.id); }}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                aria-label="Delete entry"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
      <EditDiaryDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        entry={entry}
        moods={moods}
        onUpdate={onUpdate}
        loading={loading}
      />
    </>
  )
} 