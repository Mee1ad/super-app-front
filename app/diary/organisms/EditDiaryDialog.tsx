'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageAlbum } from '../molecules/ImageAlbum'
import { DiaryEntry, Mood } from '../atoms/types'

interface EditDiaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: DiaryEntry
  onUpdate: (id: string, updatedEntry: Partial<DiaryEntry>) => void
  mood: Mood
}

export function EditDiaryDialog({ open, onOpenChange, entry, onUpdate, mood }: EditDiaryDialogProps) {
  const [title, setTitle] = useState(entry.title)
  const [content, setContent] = useState(entry.content)
  const [moodId, setMoodId] = useState(entry.mood)
  const [images, setImages] = useState<string[]>(entry.images)

  // Reset form when entry changes
  useEffect(() => {
    setTitle(entry.title)
    setContent(entry.content)
    setMoodId(entry.mood)
    setImages(entry.images)
  }, [entry])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !moodId) return

    onUpdate(entry.id, {
      title: title.trim(),
      content: content.trim(),
      mood: moodId,
      images,
    })

    onOpenChange(false)
  }

  const moods: Mood[] = [
    { id: 'happy', name: 'Happy', emoji: '😊', color: 'text-yellow-500' },
    { id: 'excited', name: 'Excited', emoji: '🤩', color: 'text-orange-500' },
    { id: 'calm', name: 'Calm', emoji: '😌', color: 'text-blue-500' },
    { id: 'sad', name: 'Sad', emoji: '😔', color: 'text-gray-500' },
    { id: 'angry', name: 'Angry', emoji: '😠', color: 'text-red-500' },
    { id: 'neutral', name: 'Neutral', emoji: '😐', color: 'text-gray-400' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Diary Entry</DialogTitle>
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
              placeholder="What's on your mind?"
              required
            />
          </div>

          <div>
            <label htmlFor="edit-content" className="block text-sm font-medium mb-2">
              Content *
            </label>
            <Textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write about your day..."
              rows={6}
              required
            />
          </div>

          <div>
            <label htmlFor="edit-mood" className="block text-sm font-medium mb-2">
              How are you feeling? *
            </label>
            <Select value={moodId} onValueChange={setMoodId} required>
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
            <Button type="submit" disabled={!title.trim() || !content.trim() || !moodId}>
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 