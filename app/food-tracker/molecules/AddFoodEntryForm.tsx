'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Check, Plus, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMobileKeyboardFocusWithBackGesture } from '@/hooks/use-mobile-keyboard-focus'
import { FoodEntry, FoodEntryCreate, FoodEntryUpdate } from '../atoms/types'


export type AddFoodEntryFormProps = {
  onCreate: (data: FoodEntryCreate) => Promise<void>
  onUpdate?: (id: string, data: FoodEntryUpdate) => Promise<void>
  editEntry?: FoodEntry | null
  loading?: boolean
}

export function AddFoodEntryForm({ onCreate, onUpdate, editEntry, loading = false }: AddFoodEntryFormProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [showPriceInput, setShowPriceInput] = useState(false)
  const [showDescriptionInput, setShowDescriptionInput] = useState(false)
  const [showImageInput, setShowImageInput] = useState(false)
  const [mealType, setMealType] = useState('breakfast')
  const [showMealTypeDropdown, setShowMealTypeDropdown] = useState(false)

  // Prevent scroll when form is open
  useEffect(() => {
    if (showForm) {
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    } else {
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }
    
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
  }, [showForm])

  const { ref: nameInputRef, keyboardHeight } = useMobileKeyboardFocusWithBackGesture(
    showForm,
    () => {
      if (window.innerWidth <= 768) {
        handleCancel()
      }
    },
    () => {
      if (window.innerWidth <= 768 && showForm) {
        handleCancel()
      }
    }
  )

  // Update form when editEntry changes
  useEffect(() => {
    if (editEntry) {
      setName(editEntry.name)
      setDescription(editEntry.description || '')
      setPrice(editEntry.price?.toString() || '')
      setImageUrl(editEntry.image_url || '')
      setDate(new Date(editEntry.date).toISOString().split('T')[0])
      
      setShowPriceInput(!!editEntry.price)
      setShowDescriptionInput(!!editEntry.description)
      setShowImageInput(!!editEntry.image_url)
      
      setShowForm(true)
    } else {
      // Reset form when not editing
      setName('')
      setDescription('')
      setPrice('')
      setImageUrl('')
      setDate(new Date().toISOString().split('T')[0])
      setShowPriceInput(false)
      setShowDescriptionInput(false)
      setShowImageInput(false)
      setShowForm(false)
    }
  }, [editEntry])

  const handleCreateEntry = async () => {
    if (!name.trim()) return

    try {
      const data: FoodEntryCreate = {
        name: name.trim(),
        description: description.trim() || undefined,
        price: price ? parseFloat(price) : undefined,
        image_url: imageUrl.trim() || undefined,
        date: new Date(date).toISOString()
      }

      await onCreate(data)
      handleCancel()
    } catch (error) {
      console.error('Failed to create food entry:', error)
    }
  }

  const handleUpdateEntry = async () => {
    if (!name.trim() || !editEntry) return

    try {
      const data: FoodEntryUpdate = {
        name: name.trim(),
        description: description.trim() || undefined,
        price: price ? parseFloat(price) : undefined,
        image_url: imageUrl.trim() || undefined,
        date: new Date(date).toISOString()
      }

      await onUpdate!(editEntry.id, data)
      handleCancel()
    } catch (error) {
      console.error('Failed to update food entry:', error)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setName('')
    setDescription('')
    setPrice('')
    setImageUrl('')
    setDate(new Date().toISOString().split('T')[0])
    setShowPriceInput(false)
    setShowDescriptionInput(false)
    setShowImageInput(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (editEntry) {
        handleUpdateEntry()
      } else {
        handleCreateEntry()
      }
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleFormClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleFormTouch = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  const handleCameraClick = () => {
    // Create a file input element for camera access
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment' // Use back camera by default
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // Convert the captured image to a data URL
        const reader = new FileReader()
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string
          setImageUrl(dataUrl)
          setShowImageInput(true)
        }
        reader.readAsDataURL(file)
      }
    }
    
    // Trigger the file input
    input.click()
  }

  const isEditing = !!editEntry

  return (
    <>
      {/* Full-width form overlay */}
      {showForm && (
        <>
          {/* Dark background overlay */}
          <div className="fixed inset-0 bg-black/40 z-[9998]" onClick={handleCancel} />
          
          <div className="fixed inset-0 z-[9999] flex items-end" onClick={handleCancel}>
            <div 
              className="w-full bg-white rounded-t-xl animate-in fade-in-0 duration-300 shadow-lg" 
              onClick={(e) => e.stopPropagation()}
              onMouseDown={handleFormClick}
              onTouchStart={handleFormTouch}
              style={{
                transform: keyboardHeight > 0 ? `translateY(-${keyboardHeight}px)` : 'none',
                transition: 'transform 0.3s ease-out'
              }}
            >
              <div className="flex flex-col h-full">
                {/* Form content area */}
                <div className="flex flex-col gap-2 p-6 flex-1" onMouseDown={handleFormClick} onTouchStart={handleFormTouch}>
                  {/* Title */}
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Food name"
                      className="w-full text-base border-none outline-none bg-transparent font-medium"
                      autoFocus
                      ref={nameInputRef}
                    />
                  </div>

                  {/* Description */}
                  {showDescriptionInput && (
                    <div className="relative">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Description (optional)"
                        className="w-full text-base border-none outline-none bg-transparent resize-none"
                        rows={2}
                      />
                    </div>
                  )}

                  {/* Price */}
                  {showPriceInput && (
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Price (optional)"
                        className="w-full text-base border-none outline-none bg-transparent"
                      />
                    </div>
                  )}

                  {/* Image URL */}
                  {showImageInput && (
                    <div className="relative">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Image URL (optional)"
                        className="w-full text-base border-none outline-none bg-transparent"
                      />
                    </div>
                  )}

                  {/* Image Thumbnail Preview */}
                  {imageUrl && (
                    <div className="relative mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={imageUrl}
                            alt="Food preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Hide image on error
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Image preview</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setImageUrl('')
                            setShowImageInput(false)
                          }}
                          className="p-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Date */}
                  <div className="relative">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="w-full text-base border-none outline-none bg-transparent"
                    />
                  </div>
                </div>

                                {/* Action buttons positioned at bottom of form overlay */}
                <div className="flex flex-col gap-3 p-6 border-t border-gray-200">
                  {/* Row 1: Toggle Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={cn(
                        "px-3 py-2 rounded-md border-2 text-sm font-medium transition-all duration-200 touch-manipulation",
                        showDescriptionInput 
                          ? 'border-primary bg-primary text-primary-foreground shadow-md' 
                          : 'border-primary text-primary active:bg-primary active:text-primary-foreground active:scale-95'
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowDescriptionInput(!showDescriptionInput)
                        // Refocus the name input to keep keyboard open
                        setTimeout(() => {
                          nameInputRef.current?.focus()
                        }, 0)
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                      Description
                    </button>
                    
                    <button
                      type="button"
                      className={cn(
                        "px-3 py-2 rounded-md border-2 text-sm font-medium transition-all duration-200 touch-manipulation",
                        showPriceInput 
                          ? 'border-secondary bg-secondary text-secondary-foreground shadow-md' 
                          : 'border-secondary text-secondary-foreground active:bg-secondary active:text-secondary-foreground active:scale-95'
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowPriceInput(!showPriceInput)
                        // Refocus the name input to keep keyboard open
                        setTimeout(() => {
                          nameInputRef.current?.focus()
                        }, 0)
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                      Price
                    </button>
                    
                    <button
                      type="button"
                      className={cn(
                        "px-3 py-2 rounded-md border-2 text-sm font-medium transition-all duration-200 touch-manipulation",
                        showImageInput 
                          ? 'border-accent bg-accent text-accent-foreground shadow-md' 
                          : 'border-accent text-accent-foreground active:bg-accent active:text-accent-foreground active:scale-95'
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleCameraClick()
                        // Refocus the name input to keep keyboard open after camera
                        setTimeout(() => {
                          nameInputRef.current?.focus()
                        }, 100)
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                      Camera
                    </button>
                  </div>

                  {/* Row 2: Meal Type, Close, and Save buttons */}
                  <div className="flex items-center justify-between gap-3">
                    {/* Meal Type Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setShowMealTypeDropdown(!showMealTypeDropdown)
                          // Keep keyboard open
                          setTimeout(() => {
                            nameInputRef.current?.focus()
                          }, 0)
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onTouchStart={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        className="w-32 h-10 border-2 border-muted text-muted-foreground bg-background rounded-md flex items-center justify-between px-3 text-sm font-medium"
                      >
                        <span className="capitalize">{mealType}</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      
                      {showMealTypeDropdown && (
                        <div className="absolute bottom-full left-0 mb-1 w-32 bg-background border-2 border-muted rounded-md shadow-lg z-[10000]">
                          {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setMealType(type)
                                setShowMealTypeDropdown(false)
                                // Keep keyboard open
                                setTimeout(() => {
                                  nameInputRef.current?.focus()
                                }, 0)
                              }}
                              onMouseDown={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                              onTouchStart={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                              className={cn(
                                "w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors",
                                mealType === type ? "bg-muted text-muted-foreground" : "text-muted-foreground"
                              )}
                            >
                              <span className="capitalize">{type}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleCancel()
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onTouchStart={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        className="p-3 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-colors shadow-lg"
                        aria-label="Close form"
                        disabled={loading}
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (editEntry) {
                            handleUpdateEntry()
                          } else {
                            handleCreateEntry()
                          }
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onTouchStart={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        disabled={!name.trim() || loading}
                        className={cn(
                          "p-3 rounded-full transition-colors shadow-lg",
                          name.trim() && !loading
                            ? "bg-primary hover:bg-primary/90 text-white" 
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        )}
                      >
                        <Check className="w-7 h-7 font-bold" strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Floating Action Button - Only show when not editing */}
      {!isEditing && (
        <motion.button
          type="button"
          onClick={() => setShowForm(true)}
          className={cn(
            "fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg",
            "flex items-center justify-center"
          )}
          aria-label="Add food entry"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ 
            duration: 0.4, 
            ease: "easeOut",
            delay: 0.2,
            type: "spring", 
            damping: 25, 
            stiffness: 300
          }}
                 >
           <Plus className="w-6 h-6" />
         </motion.button>
      )}
    </>
  )
} 