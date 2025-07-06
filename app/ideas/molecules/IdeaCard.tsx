'use client'

import { useState } from 'react'
import { Edit, Trash2, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EditIdeaDialog } from '../organisms/EditIdeaDialog'
import { Idea, Category } from '../atoms/types'

interface IdeaCardProps {
  idea: Idea
  category: Category
  onDelete: (id: string) => void
  onUpdate: (id: string, updatedIdea: Partial<Idea>) => void
}

export function IdeaCard({ idea, category, onDelete, onUpdate }: IdeaCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{category.emoji}</span>
              <div>
                <h3 className="font-semibold text-lg">{idea.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(idea.createdAt)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(idea.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {idea.description && (
            <p className="text-muted-foreground mb-3">{idea.description}</p>
          )}
          {idea.tags && idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {idea.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EditIdeaDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        idea={idea}
        onUpdate={onUpdate}
        category={category}
      />
    </>
  )
} 