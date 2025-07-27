'use client'

// import { useRouter } from 'next/navigation' // Using navigateWithAnimation instead
import { Trash2, Calendar, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DiaryEntry, Mood, DiaryEntryUpdate } from '../atoms/types'
import { motion } from 'framer-motion'
import { usePageTransition } from '../atoms/usePageTransition'
import Image from 'next/image'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

interface DiaryCardProps {
  entry: DiaryEntry
  mood: Mood
  moods: Mood[]
  onDelete: (id: string) => void
  onUpdate: (id: string, updatedEntry: DiaryEntryUpdate) => Promise<void>
  loading?: boolean
}

export function DiaryCard({ entry, mood, onDelete }: DiaryCardProps) {
  // const router = useRouter() // Using navigateWithAnimation instead
  const { navigateWithAnimation } = usePageTransition()

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

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const handleCardClick = () => {
    navigateWithAnimation(`/diary/${entry.id}/edit`)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigateWithAnimation(`/diary/${entry.id}/edit`)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(entry.id)
  }

  return (
      <>
        {/* Mobile: Native app look */}
        <ContextMenu>
          <ContextMenuTrigger>
            <motion.div
                className="flex flex-row w-full bg-transparent dark:bg-transparent py-4 cursor-pointer md:hidden overflow-hidden select-none border-b border-border px-4"
                onClick={handleCardClick}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {/* Date Sidebar (left) */}
              <div className="flex flex-col items-start justify-center min-w-[48px] max-w-[48px] mr-1">
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
                  <h3 className="font-semibold text-base truncate">{entry.title}</h3>
                  <span className="text-2xl flex-shrink-0" style={{ color: mood.color }}>{mood.emoji}</span>
                </div>
                <p className="text-sm leading-relaxed mb-1 break-words line-clamp-2">
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
            </motion.div>
          </ContextMenuTrigger>
          <ContextMenuContent className="p-2">
            <ContextMenuItem onClick={handleEditClick}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleDeleteClick} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {/* Tablet/Desktop: Card UI */}
        <ContextMenu>
          <ContextMenuTrigger>
            <motion.div
                className="hidden md:flex w-full bg-transparent dark:bg-transparent py-6 cursor-pointer overflow-hidden select-none border-b border-border px-6"
                onClick={handleCardClick}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {/* Date badge */}
              <div className="flex flex-col items-start justify-center min-w-[44px] max-w-[44px] mr-6">
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
                <p className="text-base leading-relaxed mb-2 break-words line-clamp-3">
                  {truncateContent(entry.content, 150)}
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
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleEditClick}
                        className="h-8 w-8 p-0"
                        aria-label="Edit entry"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={e => { e.stopPropagation(); onDelete(entry.id); }}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        aria-label="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </ContextMenuTrigger>
          <ContextMenuContent className="p-2">
            <ContextMenuItem onClick={handleEditClick}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleDeleteClick} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </>
  )
} 