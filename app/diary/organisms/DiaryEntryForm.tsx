'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, ArrowLeft, Image, Smile, Calendar, Save, Camera, X } from 'lucide-react'
import { format } from 'date-fns'

import { DiaryEntryCreate, DiaryEntryUpdate, Mood, DiaryEntry } from '../atoms/types'
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { usePageTransition } from '../atoms/usePageTransition'

import { diaryApi } from '../atoms/api'
import { useDiaryApi } from '../atoms/useDiaryApi'

interface DiaryEntryFormProps {
  mode: 'create' | 'edit'
  entry?: DiaryEntry
  moods: Mood[]
  onUpdate?: (id: string, updatedEntry: DiaryEntryUpdate) => Promise<void>
  onCancel?: () => void
}

export function DiaryEntryForm({ 
  mode, 
  entry, 
  moods, 
  onUpdate, 
  onCancel 
}: DiaryEntryFormProps) {
  const router = useRouter()
  const { navigateWithAnimation } = usePageTransition()
  const titleInputRef = useRef<HTMLInputElement>(null)
  const contentInputRef = useRef<HTMLTextAreaElement>(null)
  const actionBarRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [title, setTitle] = useState(entry?.title || '')
  const [content, setContent] = useState(entry?.content || '')
  const [mood, setMood] = useState(entry?.mood || '')
  const [images, setImages] = useState<string[]>(entry?.images || [])
  const [selectedDate, setSelectedDate] = useState<Date>(
    entry?.date ? new Date(entry.date) : new Date()
  )

  const [showMoodPicker, setShowMoodPicker] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    title?: string
    content?: string
    mood?: string
  }>({})

  const { createEntry } = useDiaryApi()

  // Reset form when entry changes (for edit mode)
  useEffect(() => {
    if (entry) {
      setTitle(entry.title)
      setContent(entry.content)
      setMood(entry.mood)
      setImages(entry.images)
      setSelectedDate(entry.date ? new Date(entry.date) : new Date())
      setValidationErrors({})
    }
  }, [entry])

  // Clear validation errors when user starts typing/selecting
  useEffect(() => {
    if (title.trim() && validationErrors.title) {
      setValidationErrors(prev => ({ ...prev, title: undefined }))
    }
    if (content.trim() && validationErrors.content) {
      setValidationErrors(prev => ({ ...prev, content: undefined }))
    }
    if (mood && validationErrors.mood) {
      setValidationErrors(prev => ({ ...prev, mood: undefined }))
    }
  }, [title, content, mood, validationErrors])

  // Auto-focus title input on mobile for keyboard activation
  useEffect(() => {
    // Only auto-focus on mobile devices and in create mode
    const isMobile = window.innerWidth <= 768
    const isCreateMode = mode === 'create'
    
    if (isMobile && isCreateMode && titleInputRef.current) {
      // Short delay to ensure the component is fully rendered
      const timer = setTimeout(() => {
        titleInputRef.current?.focus()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [mode])

  // Handle keyboard visibility for action bar positioning
  useEffect(() => {
    let initialViewportHeight = window.innerHeight
    let keyboardHeight = 0

    const handleResize = () => {
      // Use visual viewport API if available (better for mobile keyboard detection)
      if (window.visualViewport) {
        const visualViewport = window.visualViewport
        keyboardHeight = initialViewportHeight - visualViewport.height
        
        if (keyboardHeight > 80 && visualViewport.height < initialViewportHeight * 0.9) {
          // Keyboard is likely open
          setIsKeyboardOpen(true)
          console.log('Keyboard detected as open, height:', keyboardHeight)
          
          // Update action bar position to be above keyboard
          if (actionBarRef.current) {
            actionBarRef.current.style.setProperty('--keyboard-height', `${keyboardHeight}px`)
            actionBarRef.current.style.bottom = `${keyboardHeight}px`
            actionBarRef.current.classList.add('keyboard-open')
            // Force reflow to ensure the change is applied
            void actionBarRef.current.offsetHeight
          }
        } else {
          // Keyboard is likely closed
          setIsKeyboardOpen(false)
          
          // Reset action bar position
          if (actionBarRef.current) {
            actionBarRef.current.style.removeProperty('--keyboard-height')
            actionBarRef.current.style.bottom = '0px'
            actionBarRef.current.classList.remove('keyboard-open')
            // Force reflow to ensure the change is applied
            void actionBarRef.current.offsetHeight
          }
        }
      } else {
        // Fallback for browsers without visual viewport API
        const currentViewportHeight = window.innerHeight
        const heightDifference = initialViewportHeight - currentViewportHeight
        
        if (heightDifference > 120 && currentViewportHeight < initialViewportHeight * 0.9) {
          // Keyboard is likely open
          setIsKeyboardOpen(true)
          
          // Update action bar position to be above keyboard
          if (actionBarRef.current) {
            actionBarRef.current.style.setProperty('--keyboard-height', `${heightDifference}px`)
            actionBarRef.current.style.bottom = `${heightDifference}px`
            actionBarRef.current.classList.add('keyboard-open')
            // Force reflow to ensure the change is applied
            void actionBarRef.current.offsetHeight
          }
        } else {
          // Keyboard is likely closed
          setIsKeyboardOpen(false)
          
          // Reset action bar position
          if (actionBarRef.current) {
            actionBarRef.current.style.removeProperty('--keyboard-height')
            actionBarRef.current.style.bottom = '0px'
            actionBarRef.current.classList.remove('keyboard-open')
            // Force reflow to ensure the change is applied
            void actionBarRef.current.offsetHeight
          }
        }
      }
    }

    const handleFocus = () => {
      // When input is focused, keyboard is likely to open
      // Set keyboard as open immediately for better responsiveness
      setIsKeyboardOpen(true)
      
      // Also check after a delay to ensure accuracy
      setTimeout(() => {
        handleResize()
      }, 150) // Shorter delay for faster response
      
      // Additional check after keyboard animation completes
      setTimeout(() => {
        handleResize()
      }, 400) // Check after keyboard animation
    }

    const handleBlur = () => {
      // When input loses focus, keyboard is likely to close
      setTimeout(() => {
        handleResize()
      }, 100)
    }

    // Listen for input focus/blur events
    const titleInput = titleInputRef.current
    const contentInput = contentInputRef.current
    
    if (titleInput) {
      titleInput.addEventListener('focus', handleFocus)
      titleInput.addEventListener('blur', handleBlur)
    }
    if (contentInput) {
      contentInput.addEventListener('focus', handleFocus)
      contentInput.addEventListener('blur', handleBlur)
    }

    // Use visual viewport API if available
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    }
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', () => {
      // Reset initial height on orientation change
      setTimeout(() => {
        initialViewportHeight = window.innerHeight
        handleResize()
      }, 500)
    })
    
    // Handle iOS Safari keyboard events
    if ('ontouchstart' in window) {
      window.addEventListener('focusin', () => {
        setTimeout(() => {
          handleResize()
        }, 100)
      })
      
      window.addEventListener('focusout', () => {
        setTimeout(() => {
          handleResize()
        }, 100)
      })
    }
    
    // Initial call
    handleResize()

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      }
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      
      // Remove iOS Safari keyboard event listeners
      if ('ontouchstart' in window) {
        window.removeEventListener('focusin', handleResize)
        window.removeEventListener('focusout', handleResize)
      }
      
      if (titleInput) {
        titleInput.removeEventListener('focus', handleFocus)
        titleInput.removeEventListener('blur', handleBlur)
      }
      if (contentInput) {
        contentInput.removeEventListener('focus', handleFocus)
        contentInput.removeEventListener('blur', handleBlur)
      }
    }
  }, [])

  const handleSubmit = async () => {
    // Validate all required fields
    const errors: typeof validationErrors = {}
    
    if (!title.trim()) {
      errors.title = 'Title is required'
    }
    if (!content.trim()) {
      errors.content = 'Content is required'
    }
    if (!mood) {
      errors.mood = 'Please select your mood'
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setLoading(true)
    try {
      if (mode === 'create') {
        const entryData: DiaryEntryCreate = {
          title: title.trim(),
          content: content.trim(),
          mood,
          images,
          date: selectedDate.toISOString().split('T')[0],
        }
        await createEntry(entryData)
        navigateWithAnimation('/diary')
      } else if (mode === 'edit' && entry && onUpdate) {
        const updateData: DiaryEntryUpdate = {
          title: title.trim(),
          content: content.trim(),
          mood,
          images,
        }
        await onUpdate(entry.id, updateData)
        if (onCancel) {
          onCancel()
        }
      }
    } catch (error) {
      console.error(`Failed to ${mode} entry:`, error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/diary');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newImages: string[] = []
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        newImages.push(result)
        if (newImages.length === files.length) {
          setImages([...images, ...newImages])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const openCamera = () => {
    // Create a temporary input for camera capture
    const cameraInput = document.createElement('input')
    cameraInput.type = 'file'
    cameraInput.accept = 'image/*'
    cameraInput.capture = 'environment' // Use back camera by default
    cameraInput.onchange = (event) => {
      const target = event.target as HTMLInputElement
      if (target.files && target.files[0]) {
        const file = target.files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setImages([...images, result])
          setShowImagePicker(false)
        }
        reader.readAsDataURL(file)
      }
    }
    cameraInput.click()
  }

  const selectedMood = moods.find((m: Mood) => m.id === mood)
  const isEditMode = mode === 'edit'

  return (
    <motion.div 
      className="w-full min-h-screen bg-background flex flex-col overflow-x-hidden diary-entry-page scrollbar-hide"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration: 0.3,
        delay: 0.1
      }}
    >
      {/* Mobile Header */}
      <motion.div 
        className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border overflow-x-hidden"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.4,
          delay: 0.1,
          type: "spring",
          damping: 25,
          stiffness: 300
        }}
      >
        <div className="px-4 py-3 overflow-x-hidden">
          <div className="flex items-center justify-between w-full overflow-x-hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-8 w-8"
            >
              <ArrowLeft className="scale-150" strokeWidth={2.5} />
            </Button>
            <div className="text-center flex-1 min-w-0 relative px-4">
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newDate = new Date(e.target.value)
                  setSelectedDate(newDate)
                }}
                className="text-lg font-semibold bg-transparent border-none outline-none text-center cursor-pointer"
                style={{ 
                  direction: 'ltr',
                  color: 'inherit',
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                  position: 'absolute',
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  top: 0,
                  left: 0
                }}
              />

              <div 
                className="text-lg font-semibold cursor-pointer"
                onClick={() => {
                  const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
                  dateInput?.click()
                }}
              >
                {format(selectedDate, "EEEE, MMM d, yyyy")}
              </div>
            </div>
            <div className="w-8"></div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Content */}
      <motion.div 
        className="flex-1 px-6 py-4 space-y-6 overflow-x-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5,
          delay: 0.2,
          type: "spring",
          damping: 25,
          stiffness: 300
        }}
      >
        {/* Title Section */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4,
            delay: 0.3,
            type: "spring",
            damping: 25,
            stiffness: 300
          }}
        >
          {/* Hidden Title Input */}
          <Input
            ref={titleInputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder=""
            className="!m-0 !p-0 !border-0 !outline-none !ring-0 !focus:ring-0 !focus:border-0 !focus:outline-none !absolute !inset-0 !w-full !h-full !bg-transparent !text-transparent !z-10 !shadow-none !text-2xl !font-semibold h-12"
            required
            disabled={loading}
            style={{ 
              direction: 'ltr', 
              textAlign: 'left', 
              unicodeBidi: 'isolate',
              writingMode: 'horizontal-tb',
              textOrientation: 'mixed',
              color: 'transparent',
              caretColor: 'black',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none',
              fontSize: '1.5rem',
              lineHeight: '2rem',
              fontWeight: '600',
              fontFamily: 'inherit'
            }}
            onKeyDown={handleKeyDown}
          />
          
          {/* Visible Title Placeholder */}
          <div 
            className={`text-2xl font-semibold cursor-text break-words px-0 text-left relative z-0 ${
              validationErrors.title ? 'text-destructive' : title ? 'text-foreground' : 'text-muted-foreground'
            }`}
            onClick={() => titleInputRef.current?.focus()}
            style={{ 
              direction: 'ltr', 
              textAlign: 'left', 
              unicodeBidi: 'isolate',
              writingMode: 'horizontal-tb',
              textOrientation: 'mixed',
              fontSize: '1.5rem',
              lineHeight: '2rem',
              fontWeight: '600',
              fontFamily: 'inherit'
            }}
          >
            {title || "What's on your mind?"}
          </div>
          {validationErrors.title && (
            <div className="text-sm text-destructive mt-1 flex items-center gap-1">
              <span className="text-xs">⚠</span>
              {validationErrors.title}
            </div>
          )}
        </motion.div>

        {/* Content Section */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4,
            delay: 0.4,
            type: "spring",
            damping: 25,
            stiffness: 300
          }}
        >
          {/* Hidden Content Input */}
          <Textarea
            ref={contentInputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder=""
            className="!m-0 !p-0 !border-0 !outline-none !ring-0 !focus:ring-0 !focus:border-0 !focus:outline-none !resize-none !absolute !inset-0 !w-full !h-full !bg-transparent !text-transparent !z-10 !shadow-none !text-base !leading-relaxed"
            rows={1}
            required
            disabled={loading}
            style={{ 
              direction: 'ltr', 
              textAlign: 'left', 
              unicodeBidi: 'isolate',
              writingMode: 'horizontal-tb',
              textOrientation: 'mixed',
              color: 'transparent',
              caretColor: 'black',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none',
              fontSize: '1rem',
              lineHeight: '1.625',
              fontWeight: '400',
              fontFamily: 'inherit'
            }}
            onKeyDown={handleKeyDown}
          />

          {/* Visible Content Placeholder */}
          <div 
            className={`flex-1 text-base leading-relaxed cursor-text min-h-[200px] break-words px-0 pb-32 text-left relative z-0 ${
              validationErrors.content ? 'text-destructive' : content ? 'text-foreground' : 'text-muted-foreground'
            }`}
            onClick={() => contentInputRef.current?.focus()}
            style={{ 
              direction: 'ltr', 
              textAlign: 'left', 
              unicodeBidi: 'isolate',
              writingMode: 'horizontal-tb',
              textOrientation: 'mixed',
              fontSize: '1rem',
              lineHeight: '1.625',
              fontWeight: '400',
              fontFamily: 'inherit',
              whiteSpace: 'pre-wrap'
            }}
          >
            {content || "Write about your day..."}
          </div>
          {validationErrors.content && (
            <div className="text-sm text-destructive mt-1 flex items-center gap-1">
              <span className="text-xs">⚠</span>
              {validationErrors.content}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Bottom Action Bar - Keyboard Aware */}
      <motion.div 
        ref={actionBarRef}
        className={`fixed left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border px-6 py-3 keyboard-aware ${
          isKeyboardOpen ? 'keyboard-open' : ''
        }`}
        style={{ 
          bottom: '0px',
          transition: 'bottom 0.3s ease',
          position: 'fixed',
          transform: 'translateZ(0)' // Force hardware acceleration
        }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1
        }}
        transition={{ 
          duration: 0.3,
          delay: 0.2, // Delay to match page animation
          ease: "easeOut"
        }}
      >
        <div className="w-full space-y-3">
          {/* Validation Error for Mood */}
          {validationErrors.mood && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
              <span className="text-xs">⚠</span>
              <span>{validationErrors.mood}</span>
            </div>
          )}
          
          {/* All Action Buttons in One Row */}
          <div className="flex items-center justify-center gap-2 w-full">
            {/* Enhanced touch targets for better mobile UX */}
            {/* Mood Button */}
            <Button
              variant={validationErrors.mood ? "destructive" : selectedMood ? "default" : "outline"}
              size="sm"
              onClick={() => setShowMoodPicker(true)}
              className={`flex items-center gap-1 flex-1 h-10 ${
                validationErrors.mood ? 'animate-pulse' : ''
              }`}
              disabled={loading}
            >
              {selectedMood ? (
                <span style={{ color: selectedMood.color }} className="flex-shrink-0 text-lg">{selectedMood.emoji}</span>
              ) : (
                <>
                  <Smile className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-shrink-0 text-xs">
                    Mood {!selectedMood && <span className="text-destructive">*</span>}
                  </span>
                </>
              )}
            </Button>

            {/* Date Button - Only show for create mode */}
            {!isEditMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDatePicker(true)}
                className="flex items-center gap-1 flex-1 h-10"
                disabled={loading}
              >
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="flex-shrink-0 text-xs">
                  {selectedDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </Button>
            )}

            {/* Camera Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={openCamera}
              className="flex items-center gap-1 flex-1 h-10"
              disabled={loading}
            >
              <Camera className="h-4 w-4 flex-shrink-0" />
              <span className="flex-shrink-0 text-xs">Camera</span>
            </Button>

            {/* Gallery Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={openFileDialog}
              className="flex items-center gap-1 flex-1 h-10"
              disabled={loading}
            >
              <Image className="h-4 w-4 flex-shrink-0" />
              <span className="flex-shrink-0 text-xs">Gallery</span>
              {images.length > 0 && (
                <span className="text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 flex-shrink-0">
                  {images.length}
                </span>
              )}
            </Button>
          </div>

          {/* Full Width Save Button */}
          <div className="w-full">
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || !mood || loading}
              className="w-full h-12"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  {isEditMode ? 'Update Entry' : 'Save Entry'}
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Hidden Mood Picker */}
      <div className={`fixed inset-0 z-50 bg-background/80 backdrop-blur overflow-x-hidden ${showMoodPicker ? 'block' : 'hidden'}`}>
        <div className="flex flex-col h-full overflow-x-hidden">
          <div className="flex items-center justify-between p-4 border-b overflow-x-hidden">
            <h2 className="text-lg font-semibold" dir="ltr">How are you feeling?</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMoodPicker(false)}
            >
              Done
            </Button>
          </div>
          <div className="flex-1 p-6 overflow-x-hidden">
            <div className="grid grid-cols-2 gap-3">
              {moods.map((m: Mood) => (
                <Button
                  key={m.id}
                  variant={mood === m.id ? "default" : "outline"}
                  className="h-16 flex flex-col items-center justify-center gap-1"
                  onClick={() => {
                    setMood(m.id)
                    setShowMoodPicker(false)
                  }}
                >
                  <span style={{ color: m.color }} className="text-xl">{m.emoji}</span>
                  <span className="text-xs">{m.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Date Picker - Only for create mode */}
      {!isEditMode && (
        <div className={`fixed inset-0 z-50 bg-background/80 backdrop-blur overflow-x-hidden ${showDatePicker ? 'block' : 'hidden'}`}>
          <div className="flex flex-col h-full overflow-x-hidden">
            <div className="flex items-center justify-between p-4 border-b overflow-x-hidden">
              <h2 className="text-lg font-semibold" dir="ltr">Select Date</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDatePicker(false)}
              >
                Done
              </Button>
            </div>
            <div className="flex-1 p-6 overflow-x-hidden">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date: Date | undefined) => {
                  if (date) {
                    setSelectedDate(date)
                    setShowDatePicker(false)
                  }
                }}
                className="rounded-md border"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={loading}
      />

      {/* Custom Image Picker Modal */}
      <div className={`fixed inset-0 z-50 bg-background/80 backdrop-blur overflow-x-hidden ${showImagePicker ? 'block' : 'hidden'}`}>
        <div className="flex flex-col h-full overflow-x-hidden">
          <div className="flex items-center justify-between p-4 border-b overflow-x-hidden">
            <h2 className="text-lg font-semibold" dir="ltr">Add Images</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImagePicker(false)}
            >
              Done
            </Button>
          </div>
          <div className="flex-1 p-6 overflow-x-hidden">
            <div className="grid grid-cols-3 gap-4">
              {/* Camera Option */}
              <div 
                className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onClick={openCamera}
              >
                <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground text-center">Camera</span>
              </div>

              {/* Gallery Option */}
              <div 
                className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onClick={() => {
                  setShowImagePicker(false)
                  setTimeout(() => openFileDialog(), 100)
                }}
              >
                <Image className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground text-center">Gallery</span>
              </div>

              {/* Selected Images */}
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={image}
                      alt={`Selected image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = images.filter((_, i) => i !== index)
                      setImages(newImages)
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 