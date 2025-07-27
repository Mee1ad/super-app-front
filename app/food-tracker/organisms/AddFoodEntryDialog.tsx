'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Calendar } from 'lucide-react'
import { FoodEntry, FoodEntryCreate, FoodEntryUpdate } from '../atoms/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useMobileKeyboardFocusWithBackGesture } from '@/hooks/use-mobile-keyboard-focus'

interface AddFoodEntryDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FoodEntryCreate | FoodEntryUpdate) => Promise<void>
  entry?: FoodEntry | null
  loading?: boolean
}

export function AddFoodEntryDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  entry, 
  loading = false 
}: AddFoodEntryDialogProps) {
  const [formData, setFormData] = useState<FoodEntryCreate>({
    name: '',
    price: undefined,
    description: '',
    image_url: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { ref: keyboardRef } = useMobileKeyboardFocusWithBackGesture(isOpen, undefined, onClose)

  // Initialize form data when editing
  useEffect(() => {
    if (entry) {
      setFormData({
        name: entry.name,
        price: entry.price,
        description: entry.description || '',
        image_url: entry.image_url || '',
        date: new Date(entry.date).toISOString().split('T')[0]
      })
    } else {
      setFormData({
        name: '',
        price: undefined,
        description: '',
        image_url: '',
        date: new Date().toISOString().split('T')[0]
      })
    }
    setErrors({})
  }, [entry, isOpen])

  // Scroll prevention
  useEffect(() => {
    const scrollY = window.scrollY
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    } else {
      const y = parseInt(document.body.style.top || '0') * -1
      Object.assign(document.body.style, {
        overflow: '', position: '', top: '', width: ''
      })
      window.scrollTo(0, y)
    }
    return () => {
      const y = parseInt(document.body.style.top || '0') * -1
      Object.assign(document.body.style, {
        overflow: '', position: '', top: '', width: ''
      })
      window.scrollTo(0, y)
    }
  }, [isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (formData.price !== undefined && formData.price < 0) {
      newErrors.price = 'Price cannot be negative'
    }
    
    if (formData.image_url && !isValidUrl(formData.image_url)) {
      newErrors.image_url = 'Please enter a valid URL'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Failed to save food entry:', error)
    }
  }

  const handleInputChange = (field: keyof FoodEntryCreate, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center sm:items-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full bg-white rounded-t-xl animate-in slide-in-from-bottom-2 duration-300 shadow-lg max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="flex flex-col gap-2 p-6 flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {entry ? 'Edit Food Entry' : 'Add Food Entry'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter food name"
                      className={`h-12 ${errors.name ? 'border-red-500' : ''}`}
                      ref={keyboardRef}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (optional)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price || ''}
                      onChange={(e) => handleInputChange('price', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="0.00"
                      className={`h-12 ${errors.price ? 'border-red-500' : ''}`}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-500">{errors.price}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the food item..."
                      rows={3}
                    />
                  </div>

                  {/* Image URL */}
                  <div className="space-y-2">
                    <Label htmlFor="image_url">Image URL (optional)</Label>
                    <div className="relative">
                      <Input
                        id="image_url"
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => handleInputChange('image_url', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className={`h-12 ${errors.image_url ? 'border-red-500' : ''}`}
                      />
                      <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.image_url && (
                      <p className="text-sm text-red-500">{errors.image_url}</p>
                    )}
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="h-12 pr-10"
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </form>
              </div>

              <div className="flex items-center justify-between gap-3 p-6">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !formData.name.trim()}
                >
                  {loading ? 'Saving...' : (entry ? 'Update' : 'Add')}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 