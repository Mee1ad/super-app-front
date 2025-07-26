'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FoodEntryCreate, MealType } from '../atoms/types'
import { useMobileKeyboardFocusWithDismissal } from '@/hooks/use-mobile-keyboard-focus'

interface AddFoodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (entry: FoodEntryCreate) => Promise<void>
  mealTypes: MealType[]
}

export function AddFoodDialog({ open, onOpenChange, onSubmit, mealTypes }: AddFoodDialogProps) {
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [category, setCategory] = useState<'planned' | 'eaten'>('planned')
  const [mealTypeId, setMealTypeId] = useState('')
  const [time, setTime] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  
  // Prevent scroll when dialog is open
  useEffect(() => {
    if (open) {
      // Store current scroll position
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }
    
    // Cleanup on unmount
    return () => {
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }
  }, [open])
  
  const { ref: nameInputRef } = useMobileKeyboardFocusWithDismissal(
    open,
    () => {
      // Auto-close dialog when keyboard is dismissed on mobile
      if (window.innerWidth <= 768) {
        handleCancel();
      }
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !category || !mealTypeId || !time) return

    try {
      await onSubmit({
        name: name.trim(),
        comment: comment.trim() || undefined,
        category,
        meal_type_id: mealTypeId,
        time,
        date,
      })

      // Reset form
      setName('')
      setComment('')
      setCategory('planned')
      setMealTypeId('')
      setTime('')
      setDate(new Date().toISOString().split('T')[0])
    } catch (error) {
      console.error('Failed to add food entry:', error)
    }
  }

  const handleCancel = () => {
    setName('')
    setComment('')
    setCategory('planned')
    setMealTypeId('')
    setTime('')
    setDate(new Date().toISOString().split('T')[0])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Food Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Food Name *
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Grilled chicken salad"
              required
              ref={nameInputRef}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Category *
              </label>
              <Select value={category} onValueChange={(value: 'planned' | 'eaten') => setCategory(value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="eaten">Eaten</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="mealType" className="block text-sm font-medium mb-2">
                Meal Type *
              </label>
              <Select value={mealTypeId} onValueChange={setMealTypeId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  {mealTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.emoji} {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Comment
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional comment..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="time" className="block text-sm font-medium mb-2">
                Time *
              </label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2">
                Date
              </label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !category || !mealTypeId || !time}>
              Add Food
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 