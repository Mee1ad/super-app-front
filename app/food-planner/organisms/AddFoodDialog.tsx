'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ImageAlbum } from '../molecules/ImageAlbum'
import { FoodEntry, MealType } from '../atoms/types'

interface AddFoodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (entry: Omit<FoodEntry, 'id' | 'date'>) => void
  mealTypes: MealType[]
}

export function AddFoodDialog({ open, onOpenChange, onAdd, mealTypes }: AddFoodDialogProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<'planned' | 'eaten'>('planned')
  const [mealType, setMealType] = useState<FoodEntry['mealType']>('breakfast')
  const [time, setTime] = useState('')
  const [comment, setComment] = useState('')
  const [image, setImage] = useState<string>('')
  const [followedPlan, setFollowedPlan] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !mealType || !time) return

    onAdd({
      name: name.trim(),
      category,
      mealType,
      time,
      comment: comment.trim() || undefined,
      image: image || undefined,
      followedPlan: category === 'eaten' ? followedPlan : undefined,
    })

    // Reset form
    setName('')
    setCategory('planned')
    setMealType('breakfast')
    setTime('')
    setComment('')
    setImage('')
    setFollowedPlan(false)
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
              <Select value={mealType} onValueChange={value => setMealType(value as FoodEntry['mealType'])} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  {mealTypes.map(meal => (
                    <SelectItem key={meal.id} value={meal.id}>
                      {meal.emoji} {meal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Comment
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How did you feel? Any symptoms?"
              rows={3}
            />
          </div>

          {category === 'eaten' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="followedPlan"
                checked={followedPlan}
                onCheckedChange={(checked) => setFollowedPlan(checked as boolean)}
              />
              <label htmlFor="followedPlan" className="text-sm font-medium">
                Followed the planned meal
              </label>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Photos
            </label>
            <ImageAlbum
              images={image ? [image] : []}
              onImagesChange={(images) => setImage(images[0] || '')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !mealType || !time}>
              Add Entry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 