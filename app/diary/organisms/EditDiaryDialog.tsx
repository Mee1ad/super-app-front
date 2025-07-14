'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { ImageAlbum } from '../molecules/ImageAlbum'
import { DiaryEntry, Mood, DiaryEntryUpdate } from '../atoms/types'

interface EditDiaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: DiaryEntry
  moods: Mood[]
  onUpdate: (id: string, updatedEntry: DiaryEntryUpdate) => Promise<void>
  loading?: boolean
}

export function EditDiaryDialog({ 
  open, 
  onOpenChange, 
  entry, 
  moods, 
  onUpdate, 
  loading = false 
}: EditDiaryDialogProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !moodId) return

    try {
      await onUpdate(entry.id, {
        title: title.trim(),
        content: content.trim(),
        mood: moodId,
        images,
      })
      onOpenChange(false)
    } catch {
      // Error is handled by the parent component
    }
  }

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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="edit-mood" className="block text-sm font-medium mb-2">
              How are you feeling? *
            </label>
            <Select value={moodId} onValueChange={setMoodId} required disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select your mood" />
              </SelectTrigger>
              <SelectContent>
                {moods.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    <span className="flex items-center gap-2">
                      <span style={{ color: m.color }}>{m.emoji}</span>
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
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || !content.trim() || !moodId || loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
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