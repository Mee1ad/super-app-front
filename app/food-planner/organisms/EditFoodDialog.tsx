'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ImageAlbum } from '../molecules/ImageAlbum'
import { FoodEntry, MealType } from '../atoms/types'

interface EditFoodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: FoodEntry
  onUpdate: (id: string, updatedEntry: Partial<FoodEntry>) => void
  mealTypes: MealType[]
}

export function EditFoodDialog({ open, onOpenChange, entry, onUpdate, mealTypes }: EditFoodDialogProps) {
  const [name, setName] = useState(entry.name)
  const [category, setCategory] = useState<'planned' | 'eaten'>(entry.category)
  const [mealTypeId, setMealTypeId] = useState(entry.meal_type_id)
  const [time, setTime] = useState(entry.time)
  const [comment, setComment] = useState(entry.comment || '')
  const [image, setImage] = useState<string>(entry.image || '')
  const [followedPlan, setFollowedPlan] = useState(entry.followed_plan || false)

  // Reset form when entry changes
  useEffect(() => {
    setName(entry.name)
    setCategory(entry.category)
    setMealTypeId(entry.meal_type_id)
    setTime(entry.time)
    setComment(entry.comment || '')
    setImage(entry.image || '')
    setFollowedPlan(entry.followed_plan || false)
  }, [entry])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !mealTypeId || !time) return

    onUpdate(entry.id, {
      name: name.trim(),
      category,
      meal_type_id: mealTypeId,
      time,
      comment: comment.trim() || undefined,
      image: image || undefined,
      followed_plan: category === 'eaten' ? followedPlan : undefined,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Food Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium mb-2">
              Food Name *
            </label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Grilled chicken salad"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-category" className="block text-sm font-medium mb-2">
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
              <label htmlFor="edit-mealType" className="block text-sm font-medium mb-2">
                Meal Type *
              </label>
              <Select value={mealTypeId} onValueChange={setMealTypeId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  {mealTypes?.map(meal => (
                    <SelectItem key={meal.id} value={meal.id}>
                      {meal?.emoji} {meal?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label htmlFor="edit-time" className="block text-sm font-medium mb-2">
              Time *
            </label>
            <Input
              id="edit-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="edit-comment" className="block text-sm font-medium mb-2">
              Comment
            </label>
            <Textarea
              id="edit-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How did you feel? Any symptoms?"
              rows={3}
            />
          </div>

          {category === 'eaten' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-followedPlan"
                checked={followedPlan}
                onCheckedChange={(checked) => setFollowedPlan(checked as boolean)}
              />
              <label htmlFor="edit-followedPlan" className="text-sm font-medium">
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
            <Button type="submit" disabled={!name.trim() || !mealTypeId || !time}>
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 