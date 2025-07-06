'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageAlbum } from '../molecules/ImageAlbum'
import { DiaryEntry, Mood } from '../atoms/types'

interface AddDiaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (entry: Omit<DiaryEntry, 'id' | 'date'>) => void
  moods: Mood[]
}

export function AddDiaryDialog({ open, onOpenChange, onAdd, moods }: AddDiaryDialogProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [images, setImages] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !mood) return

    onAdd({
      title: title.trim(),
      content: content.trim(),
      mood,
      images,
    })

    // Reset form
    setTitle('')
    setContent('')
    setMood('')
    setImages([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Diary Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title *
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Content *
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write about your day..."
              rows={6}
              required
            />
          </div>

          <div>
            <label htmlFor="mood" className="block text-sm font-medium mb-2">
              How are you feeling? *
            </label>
            <Select value={mood} onValueChange={setMood} required>
              <SelectTrigger>
                <SelectValue placeholder="Select your mood" />
              </SelectTrigger>
              <SelectContent>
                {moods.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    <span className="flex items-center gap-2">
                      <span className={m.color}>{m.emoji}</span>
                      {m.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Images
            </label>
            <ImageAlbum
              images={images}
              onImagesChange={setImages}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || !content.trim() || !mood}>
              Save Entry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 