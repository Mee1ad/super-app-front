'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { ImageAlbum } from '../molecules/ImageAlbum'
import { DiaryEntryCreate, Mood } from '../atoms/types'
import { DatePicker } from "@/components/ui/date-picker";
import { addDays } from "date-fns";
import React from 'react';

interface AddDiaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (entry: DiaryEntryCreate) => Promise<void>
  moods: Mood[]
  loading?: boolean
}

export function AddDiaryDialog({ open, onOpenChange, onAdd, moods, loading = false }: AddDiaryDialogProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [images, setImages] = useState<string[]>([])
  // Add a date state to the form
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !mood) return

    try {
      const entryData = {
        title: title.trim(),
        content: content.trim(),
        mood,
        images,
        date: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      };
      await onAdd(entryData)

      // Reset form
      setTitle('')
      setContent('')
      setMood('')
      setImages([])
    } catch {
      // Error is handled by the parent component
    }
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="mood" className="block text-sm font-medium mb-2">
              How are you feeling? *
            </label>
            <Select value={mood} onValueChange={setMood} required disabled={loading}>
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
            <label htmlFor="date" className="block text-sm font-medium mb-2">
              Date *
            </label>
            <DatePicker date={date} onChange={setDate} />
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
            <Button type="submit" disabled={!title.trim() || !content.trim() || !mood || loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Entry'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 