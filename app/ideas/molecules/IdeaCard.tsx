'use client'

import { Calendar } from 'lucide-react'
import { CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClickableListItem, ClickableCard } from '@/components/ui/clickable-item'
import { Idea } from '../atoms/types'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface IdeaCardProps {
  idea: Idea
}

export function IdeaCard({ idea }: IdeaCardProps) {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString))
  }

  const handleCardClick = () => {
    router.push(`/ideas/${idea.id}/edit`)
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
        <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">{idea.description}</p>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Mobile: Full width without card */}
      <div className="block md:hidden">
        <ClickableListItem onClick={handleCardClick}>
          {renderContent()}
        </ClickableListItem>
      </div>

      {/* Desktop: Card view */}
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
              <p className="text-sm sm:text-base text-muted-foreground mb-3 leading-relaxed">{idea.description}</p>
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
  )
} 