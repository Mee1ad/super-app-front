'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, ArrowLeft, Image, Smile, Calendar, Save } from 'lucide-react'
import { ImageAlbum } from '../molecules/ImageAlbum'
import { DiaryEntryCreate, Mood } from '../atoms/types'
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { diaryApi } from '../atoms/api'

export default function NewDiaryPage() {
  const router = useRouter()
  const titleInputRef = useRef<HTMLInputElement>(null)
  const contentInputRef = useRef<HTMLTextAreaElement>(null)
  const actionBarRef = useRef<HTMLDivElement>(null)
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [showMoodPicker, setShowMoodPicker] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [moods, setMoods] = useState<Mood[]>([])

  // Load moods on component mount
  useEffect(() => {
    const loadMoods = async () => {
      try {
        const response = await diaryApi.getMoods()
        setMoods(response.moods)
      } catch (error) {
        console.error('Failed to load moods:', error)
      }
    }
    loadMoods()
  }, [])

  // Handle keyboard visibility for action bar positioning
  useEffect(() => {
    let initialViewportHeight = window.innerHeight
    let isKeyboardOpen = false

    const handleResize = () => {
      if (actionBarRef.current) {
        const currentViewportHeight = window.innerHeight
        
        // Use visual viewport API if available (better for mobile keyboard detection)
        if (window.visualViewport) {
          const visualViewport = window.visualViewport
          const keyboardHeight = initialViewportHeight - visualViewport.height
          
          if (keyboardHeight > 150 && visualViewport.height < initialViewportHeight * 0.8) {
            // Keyboard is likely open
            if (!isKeyboardOpen) {
              isKeyboardOpen = true
              actionBarRef.current.style.bottom = `${keyboardHeight}px`
              actionBarRef.current.style.transition = 'bottom 0.3s ease'
            }
          } else {
            // Keyboard is likely closed
            if (isKeyboardOpen) {
              isKeyboardOpen = false
              actionBarRef.current.style.bottom = '0px'
              actionBarRef.current.style.transition = 'bottom 0.3s ease'
            }
          }
        } else {
          // Fallback for browsers without visual viewport API
          const heightDifference = initialViewportHeight - currentViewportHeight
          
          if (heightDifference > 200 && currentViewportHeight < initialViewportHeight * 0.8) {
            // Keyboard is likely open
            if (!isKeyboardOpen) {
              isKeyboardOpen = true
              actionBarRef.current.style.bottom = `${heightDifference}px`
              actionBarRef.current.style.transition = 'bottom 0.3s ease'
            }
          } else {
            // Keyboard is likely closed
            if (isKeyboardOpen) {
              isKeyboardOpen = false
              actionBarRef.current.style.bottom = '0px'
              actionBarRef.current.style.transition = 'bottom 0.3s ease'
            }
          }
        }
      }
    }

    const handleFocus = () => {
      // When input is focused, keyboard is likely to open
      setTimeout(() => {
        handleResize()
      }, 300) // Delay to allow keyboard to open
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
    
    // Initial call
    handleResize()

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      }
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
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
    if (!title.trim() || !content.trim() || !mood) return

    setLoading(true)
    try {
      const entryData: DiaryEntryCreate = {
        title: title.trim(),
        content: content.trim(),
        mood,
        images,
        date: selectedDate.toISOString().split('T')[0],
      }
      await diaryApi.createDiaryEntry(entryData)
      router.push('/diary')
    } catch (error) {
      console.error('Failed to create entry:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedMood = moods.find((m: Mood) => m.id === mood)

  return (
    <div className="w-full min-h-screen bg-background flex flex-col overflow-x-hidden diary-entry-page">
              {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border overflow-x-hidden">
          <div className="px-6 py-3 overflow-x-hidden">
                      <div className="flex items-center justify-between w-full overflow-x-hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-center flex-1 min-w-0">
              <h1 className="text-lg font-semibold truncate" dir="ltr">New Entry</h1>
            </div>
            <div className="w-8"></div>
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="flex-1 px-6 py-4 space-y-6 overflow-x-hidden">
        {/* Hidden Title Input */}
        <Input
          ref={titleInputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder=""
          className="!m-0 !p-0 !border-0 !outline-none !absolute !inset-0 !w-full !h-full !bg-transparent !text-transparent !caret-black !z-10"
          required
          disabled={loading}
          style={{ 
            direction: 'ltr', 
            textAlign: 'left', 
            unicodeBidi: 'isolate',
            writingMode: 'horizontal-tb',
            textOrientation: 'mixed',
            color: 'transparent',
            caretColor: 'black'
          }}
        />
        
        {/* Visible Title Placeholder */}
        <div 
          className="text-2xl font-semibold text-muted-foreground cursor-text break-words px-0 text-left relative z-0"
          onClick={() => titleInputRef.current?.focus()}
          style={{ 
            direction: 'ltr', 
            textAlign: 'left', 
            unicodeBidi: 'isolate',
            writingMode: 'horizontal-tb',
            textOrientation: 'mixed'
          }}
        >
          {title || "What's on your mind?"}
        </div>

        {/* Hidden Content Input */}
        <Textarea
          ref={contentInputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder=""
          className="!m-0 !p-0 !border-0 !outline-none !resize-none !absolute !inset-0 !w-full !h-full !bg-transparent !text-transparent !caret-black !z-10"
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
            caretColor: 'black'
          }}
        />

        {/* Visible Content Placeholder */}
        <div 
          className="flex-1 text-base leading-relaxed text-muted-foreground cursor-text min-h-[200px] break-words px-0 pb-32 text-left relative z-0"
          onClick={() => contentInputRef.current?.focus()}
          style={{ 
            direction: 'ltr', 
            textAlign: 'left', 
            unicodeBidi: 'isolate',
            writingMode: 'horizontal-tb',
            textOrientation: 'mixed'
          }}
        >
          {content || "Write about your day..."}
        </div>
      </div>

      {/* Bottom Action Bar - Fixed at bottom */}
      <div 
        ref={actionBarRef}
        className="fixed left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border px-6 py-3"
        style={{ bottom: '0px' }}
      >
        <div className="space-y-3">
          {/* Action Buttons Row */}
          <div className="flex items-center justify-between gap-4">
            {/* Mood Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMoodPicker(true)}
              className="flex items-center gap-2 flex-1"
              disabled={loading}
            >
              <Smile className="h-4 w-4 flex-shrink-0" />
              {selectedMood ? (
                <span style={{ color: selectedMood.color }} className="flex-shrink-0">{selectedMood.emoji}</span>
              ) : (
                <span className="flex-shrink-0">Mood</span>
              )}
            </Button>

            {/* Date Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDatePicker(true)}
              className="flex items-center gap-2 flex-1"
              disabled={loading}
            >
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="flex-shrink-0">
                {selectedDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </Button>

            {/* Image Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImagePicker(true)}
              className="flex items-center gap-2 flex-1"
              disabled={loading}
            >
              <Image className="h-4 w-4 flex-shrink-0" />
              {images.length > 0 && (
                <span className="text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 flex-shrink-0">
                  {images.length}
                </span>
              )}
            </Button>
          </div>

          {/* Full Width Save Button */}
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
                Save Entry
              </>
            )}
          </Button>
        </div>
      </div>

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

      {/* Hidden Date Picker */}
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

      {/* Hidden Image Picker */}
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
            <ImageAlbum
              images={images}
              onImagesChange={setImages}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 