'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, DollarSign, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import { FoodEntry } from '../atoms/types'
import { Card, CardContent } from '@/components/ui/card'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu'

interface FoodEntryCardProps {
  entry: FoodEntry
  onEdit: (entry: FoodEntry) => void
  onDelete: (id: string) => void
}

export function FoodEntryCard({ entry, onEdit, onDelete }: FoodEntryCardProps) {
  const [imageError, setImageError] = useState(false)
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      month: date.toLocaleString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      dayName: date.toLocaleString('en-US', { weekday: 'short' })
    }
  }

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return null
    return `$${price.toFixed(2)}`
  }

  const getMealType = (dateString: string) => {
    const hour = new Date(dateString).getHours()
    if (hour >= 5 && hour < 11) return 'Breakfast'
    if (hour >= 11 && hour < 16) return 'Lunch'
    if (hour >= 16 && hour < 22) return 'Dinner'
    return 'Snack'
  }

  const { day, time, dayName } = formatDate(entry.date)
  const mealType = getMealType(entry.date)
  const price = formatPrice(entry.price)

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (!content || content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <>
      {/* Mobile: Native app look */}
      <div className="md:hidden">
        <ContextMenu>
          <ContextMenuTrigger data-testid="context-menu-trigger">
            <motion.div
              className="flex flex-row w-full bg-transparent dark:bg-transparent py-4 cursor-pointer overflow-hidden select-none border-b border-border px-4"
              whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={() => onEdit(entry)}
            >
        {/* Left Side: Day and Meal Type */}
        <div className="flex flex-col items-start justify-center min-w-[67px] max-w-[80px]">
          <span className="text-md text-muted-foreground mt-0.5">{mealType}</span>
          {price && (
              <span className="text-lg flex-shrink-0 text-red-600 font-semibold">{price}</span>
          )}
        </div>
        
        {/* Vertical Divider */}
        <div className="w-1 bg-border mx-2 rounded-full" />
        
        {/* Center: Entry Content */}
        <div className="flex-1 flex flex-col items-start text-left pl-2 min-w-0">
          <span className="text-xs text-muted-foreground mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>{time}</span>
          <div className="flex items-center gap-2 mb-1 w-full">
            <h3 className="font-semibold text-base truncate">{entry.name}</h3>

          </div>
          {entry.description && (
            <p className="text-sm leading-relaxed mb-1 break-words line-clamp-2">
              {truncateContent(entry.description)}
            </p>
          )}
        </div>

        {/* Right Side: Image */}
        {entry.image_url && !imageError && (
          <div className="flex-shrink-0 ml-3">
            <img
              src={entry.image_url}
              alt={entry.name}
              className="w-16 h-16 object-cover rounded-md"
              onError={() => setImageError(true)}
            />
          </div>
        )}
            </motion.div>
          </ContextMenuTrigger>

          <ContextMenuContent className="p-2">
            <ContextMenuItem onClick={() => onEdit(entry)}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onDelete(entry.id)} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>

      {/* Desktop: Card layout */}
      <div className="hidden md:block">
        <ContextMenu>
          <ContextMenuTrigger data-testid="context-menu-trigger">
            <motion.div
              whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={() => onEdit(entry)}
            >
              <Card className="cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Left Side: Day and Meal Type */}
                    <div className="flex-shrink-0 min-w-[80px]">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{day}</div>
                        <div className="text-sm text-muted-foreground">{dayName}</div>
                        <div className="text-xs text-muted-foreground">{mealType}</div>
                      </div>
                    </div>

                    {/* Center: Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{entry.name}</h3>
                          {entry.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {entry.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Meta information */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(entry.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}</span>
                        </div>
                        {price && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span className="text-red-600 font-semibold">{price}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Side: Image */}
                    <div className="flex-shrink-0">
                      {entry.image_url && !imageError ? (
                        <img
                          src={entry.image_url}
                          alt={entry.name}
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </ContextMenuTrigger>

          <ContextMenuContent className="p-2">
            <ContextMenuItem onClick={() => onEdit(entry)}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onDelete(entry.id)} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </>
  )
} 