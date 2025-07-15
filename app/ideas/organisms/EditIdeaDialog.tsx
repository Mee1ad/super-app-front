'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { Category, Idea, IdeaUpdate } from '../atoms/types'
import { LoadingSpinner } from '../atoms/LoadingSpinner'

interface EditIdeaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  idea: Idea
  onUpdate: (id: string, updatedIdea: IdeaUpdate) => Promise<Idea>
  categories?: Category[]
  isLoading?: boolean
}

export function EditIdeaDialog({ 
  open, 
  onOpenChange, 
  idea, 
  onUpdate, 
  categories = [],
  isLoading = false 
}: EditIdeaDialogProps) {
  const [title, setTitle] = useState(idea.title)
  const [description, setDescription] = useState(idea.description || '')
  const [categoryId, setCategoryId] = useState(idea.category_id)
  const [tags, setTags] = useState<string[]>(idea.tags || [])
  const [tagInput, setTagInput] = useState('')

  // Reset form when idea changes
  useEffect(() => {
    setTitle(idea.title)
    setDescription(idea.description || '')
    setCategoryId(idea.category_id)
    setTags(idea.tags || [])
    setTagInput('')
  }, [idea])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !categoryId) return

    const result = await onUpdate(idea.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      category: categoryId,
      tags: tags.length > 0 ? tags : undefined,
    })

    if (result) {
      onOpenChange(false)
    }
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Idea</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium mb-2">
              Title *
            </label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter idea title..."
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="edit-category" className="block text-sm font-medium mb-2">
              Category *
            </label>
            <Select value={categoryId} onValueChange={setCategoryId} required disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="edit-tags" className="block text-sm font-medium mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                id="edit-tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add tags..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="button" variant="outline" onClick={addTag} disabled={isLoading}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || !categoryId || isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner size={16} className="mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 