'use client'

import React, { useState, useRef } from 'react'
import { X, Send, Upload, Trash2 } from 'lucide-react'
import { Button } from './button'
import { Textarea } from './textarea'

interface FeedbackDialogProps {
  isOpen: boolean
  onClose: () => void
}

const emojiRatings = [
  { emoji: '😡', value: 1, label: 'Very Dissatisfied' },
  { emoji: '😐', value: 2, label: 'Dissatisfied' },
  { emoji: '🙂', value: 3, label: 'Neutral' },
  { emoji: '😍', value: 4, label: 'Satisfied' },
  { emoji: '😍', value: 5, label: 'Very Satisfied' },
]

export function FeedbackDialog({ isOpen, onClose }: FeedbackDialogProps) {
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    if (!feedback.trim()) return
    
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitted(true)
    setIsSubmitting(false)
    
    // Auto close after 3 seconds
    setTimeout(() => {
      handleClose()
    }, 3000)
  }

  const handleClose = () => {
    setFeedback('')
    setRating(null)
    setIsSubmitted(false)
    setIsSubmitting(false)
    setImages([])
    onClose()
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (images.length + validFiles.length > 3) {
      alert('You can only upload up to 3 images')
      return
    }
    
    setImages(prev => [...prev, ...validFiles])
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const validFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (images.length + validFiles.length > 3) {
      alert('You can only upload up to 3 images')
      return
    }
    
    setImages(prev => [...prev, ...validFiles])
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              We'd love your feedback
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isSubmitted ? (
            <>
              {/* Rating Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How would you rate your experience?
                </label>
                <div className="flex justify-center gap-4">
                  {emojiRatings.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setRating(item.value)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                        rating === item.value
                          ? 'bg-blue-50 border-2 border-blue-200'
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="text-xs text-gray-600">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Textarea */}
              <div className="mb-6">
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us more about your experience
                </label>
                <Textarea
                  id="feedback"
                  placeholder="Share your thoughts, suggestions, or any issues you encountered..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </div>

              {/* Image Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add images (optional, max 3)
                </label>
                
                {/* Image Preview Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Upload Button */}
                {images.length < 3 && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
                      isDragOver 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className={`w-6 h-6 mx-auto mb-2 ${
                      isDragOver ? 'text-blue-400' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm ${
                      isDragOver ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {isDragOver 
                        ? 'Drop images here' 
                        : `Click to upload or drag & drop images (${images.length}/3)`
                      }
                    </span>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!feedback.trim() || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Submit Feedback
                  </div>
                )}
              </Button>
            </>
          ) : (
            /* Success Message */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Thank you for your feedback!
              </h3>
              <p className="text-gray-600">
                We appreciate you taking the time to share your thoughts with us.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 