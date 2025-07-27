'use client'

import { Calendar, Edit, Trash2 } from 'lucide-react'
import { CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClickableListItem, ClickableCard } from '@/components/ui/clickable-item'
import { Idea } from '../atoms/types'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

interface IdeaCardProps {
  idea: Idea
  onEdit?: (idea: Idea) => void
  onDelete?: (id: string) => void
}

export function IdeaCard({ idea, onEdit, onDelete }: IdeaCardProps) {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString))
  }

  const handleCardClick = () => {
    if (onEdit) {
      onEdit(idea)
    } else {
      router.push(`/ideas/${idea.id}/edit`)
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(idea)
    } else {
      router.push(`/ideas/${idea.id}/edit`)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(idea.id)
  }

  const renderContent = () => (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg leading-tight mb-1">{idea.title}</h3>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{formatDate(idea.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
      {idea.description && (
        <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed line-clamp-3" style={{ whiteSpace: 'pre-wrap' }}>{idea.description}</p>
      )}
      {idea.tags && idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {idea.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Mobile: Full width without card */}
      <ContextMenu>
        <ContextMenuTrigger>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="block md:hidden">
              <ClickableListItem onClick={handleCardClick}>
                {renderContent()}
              </ClickableListItem>
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

      {/* Desktop: Card view */}
      <ContextMenu>
        <ContextMenuTrigger>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="hidden md:block">
              <ClickableCard onClick={handleCardClick}>
                <CardHeader className="pb-3 px-4 sm:px-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg leading-tight mb-1">{idea.title}</h3>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{formatDate(idea.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                  {idea.description && (
                    <p className="text-sm sm:text-base text-muted-foreground mb-3 leading-relaxed line-clamp-3" style={{ whiteSpace: 'pre-wrap' }}>{idea.description}</p>
                  )}
                  {idea.tags && idea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {idea.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </ClickableCard>
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