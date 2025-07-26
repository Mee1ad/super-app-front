'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, Save, X, Plus } from 'lucide-react'
import { IdeaCreate, IdeaUpdate, Idea, Category } from '../atoms/types'
import { useIdeasApi } from '../atoms/useIdeasApi'

interface IdeaFormProps {
  mode: 'create' | 'edit'
  idea?: Idea
  onCancel?: () => void
}

export function IdeaForm({ mode, idea, onCancel }: IdeaFormProps) {
  const router = useRouter()
  const { createIdea, updateIdea, categories } = useIdeasApi()
  
  const titleInputRef = useRef<HTMLInputElement>(null)
  const contentInputRef = useRef<HTMLTextAreaElement>(null)
  const actionBarRef = useRef<HTMLDivElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)
  
  const [title, setTitle] = useState(idea?.title || '')
  const [description, setDescription] = useState(idea?.description || '')
  const [category, setCategory] = useState(idea?.category_id || '')
  const [tags, setTags] = useState<string[]>(idea?.tags || [])
  const [tagInput, setTagInput] = useState('')

  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    title?: string
    description?: string
    category?: string
  }>({})

  // Reset form when idea changes (for edit mode)
  useEffect(() => {
    if (idea) {
      setTitle(idea.title)
      setDescription(idea.description || '')
      setCategory(idea.category_id)
      setTags(idea.tags || [])
      setValidationErrors({})
    }
  }, [idea])

  // Clear validation errors when user starts typing/selecting
  useEffect(() => {
    if (title.trim() && validationErrors.title) {
      setValidationErrors(prev => ({ ...prev, title: undefined }))
    }
    if (description.trim() && validationErrors.description) {
      setValidationErrors(prev => ({ ...prev, description: undefined }))
    }
    if (category && validationErrors.category) {
      setValidationErrors(prev => ({ ...prev, category: undefined }))
    }
  }, [title, description, category, validationErrors])

  // Auto-focus title input on mobile for keyboard activation
  useEffect(() => {
    const isMobile = window.innerWidth <= 768
    const isCreateMode = mode === 'create'
    
    if (isMobile && isCreateMode && titleInputRef.current) {
      const timer = setTimeout(() => {
        titleInputRef.current?.focus()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [mode])

  // Handle keyboard visibility for action bar positioning
  useEffect(() => {
    const handleResize = () => {
      const visualViewport = window.visualViewport
      if (visualViewport) {
        const keyboardHeight = window.innerHeight - visualViewport.height
        // Consider keyboard open if it takes up more than 150px of screen height
        setIsKeyboardOpen(keyboardHeight > 150)
      } else {
        // Fallback for browsers without visualViewport support
        const screenHeight = window.screen.height
        const windowHeight = window.innerHeight
        const keyboardHeight = screenHeight - windowHeight
        setIsKeyboardOpen(keyboardHeight > 150)
      }
    }

    const handleFocus = () => {
      // When any input is focused, assume keyboard might open
      setTimeout(() => {
        const visualViewport = window.visualViewport
        if (visualViewport) {
          const keyboardHeight = window.innerHeight - visualViewport.height
          setIsKeyboardOpen(keyboardHeight > 150)
        } else {
          // Fallback
          const screenHeight = window.screen.height
          const windowHeight = window.innerHeight
          const keyboardHeight = screenHeight - windowHeight
          setIsKeyboardOpen(keyboardHeight > 150)
        }
      }, 300) // Small delay to allow keyboard to open
    }

    const handleBlur = () => {
      // Small delay to allow for other focus events
      setTimeout(() => {
        const activeElement = document.activeElement
        if (!activeElement || !actionBarRef.current?.contains(activeElement)) {
          const visualViewport = window.visualViewport
          if (visualViewport) {
            const keyboardHeight = window.innerHeight - visualViewport.height
            setIsKeyboardOpen(keyboardHeight > 150)
          } else {
            // Fallback
            const screenHeight = window.screen.height
            const windowHeight = window.innerHeight
            const keyboardHeight = screenHeight - windowHeight
            setIsKeyboardOpen(keyboardHeight > 150)
          }
        }
      }, 100)
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      window.addEventListener('focus', handleFocus, true)
      window.addEventListener('blur', handleBlur, true)
      
      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize)
        window.removeEventListener('focus', handleFocus, true)
        window.removeEventListener('blur', handleBlur, true)
      }
    } else {
      // Fallback for browsers without visualViewport
      window.addEventListener('resize', handleResize)
      window.addEventListener('focus', handleFocus, true)
      window.addEventListener('blur', handleBlur, true)
      
      return () => {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('focus', handleFocus, true)
        window.removeEventListener('blur', handleBlur, true)
      }
    }
  }, [])

  const handleFocus = () => {
    setIsKeyboardOpen(true)
  }

  const handleBlur = () => {
    // Small delay to allow for other focus events
    setTimeout(() => {
      const activeElement = document.activeElement
      if (!activeElement || !actionBarRef.current?.contains(activeElement)) {
        setIsKeyboardOpen(false)
      }
    }, 100)
  }

  const validateForm = () => {
    const errors: typeof validationErrors = {}
    
    if (!title.trim()) {
      errors.title = 'Title is required'
    }
    
    if (!description.trim()) {
      errors.description = 'Description is required'
    }
    
    if (!category) {
      errors.category = 'Category is required'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      if (mode === 'create') {
        const newIdea: IdeaCreate = {
          title: title.trim(),
          description: description.trim(),
          category,
          tags: tags.length > 0 ? tags : undefined,
        }
        
        const result = await createIdea(newIdea)
        if (result) {
          router.push('/ideas')
        }
      } else if (idea) {
        const updatedIdea: IdeaUpdate = {
          title: title.trim(),
          description: description.trim(),
          category,
          tags: tags.length > 0 ? tags : undefined,
        }
        
        const result = await updateIdea(idea.id, updatedIdea)
        if (result) {
          router.push('/ideas')
        }
      }
    } catch (error) {
      console.error('Failed to save idea:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.push('/ideas')
    }
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const selectedCategory = categories.find(c => c.id === category)
  const isEditMode = mode === 'edit'

  return (
    <div className="w-full min-h-screen bg-background flex flex-col overflow-x-hidden scrollbar-hide">
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
              <div className="text-lg font-semibold">
                {isEditMode ? 'Edit Idea' : 'New Idea'}
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
            className="!m-0 !p-0 !border-0 !outline-none !ring-0 !focus:ring-0 !focus:border-0 !focus:outline-none !absolute !inset-0 !w-full !h-full !bg-transparent !text-transparent !z-10 !shadow-none !text-2xl !font-semibold"
            required
            disabled={loading}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleFormKeyDown}
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
            {title || "What's your idea?"}
          </div>
          {validationErrors.title && (
            <div className="text-sm text-destructive mt-1 flex items-center gap-1">
              <span className="text-xs">⚠</span>
              {validationErrors.title}
            </div>
          )}
        </motion.div>

        {/* Description Section */}
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
          {/* Hidden Description Input */}
          <Textarea
            ref={contentInputRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder=""
            className="!m-0 !p-0 !border-0 !outline-none !ring-0 !focus:ring-0 !focus:border-0 !focus:outline-none !resize-none !absolute !inset-0 !w-full !h-full !bg-transparent !text-transparent !z-10 !shadow-none !text-base !leading-relaxed"
            rows={1}
            required
            disabled={loading}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleFormKeyDown}
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
          />

          {/* Visible Description Placeholder */}
          <div 
            className={`flex-1 text-base leading-relaxed cursor-text min-h-[200px] break-words px-0 pb-32 text-left relative z-0 ${
              validationErrors.description ? 'text-destructive' : description ? 'text-foreground' : 'text-muted-foreground'
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
              fontFamily: 'inherit'
            }}
          >
            {description || "Describe your idea in detail..."}
          </div>
          {validationErrors.description && (
            <div className="text-sm text-destructive mt-1 flex items-center gap-1">
              <span className="text-xs">⚠</span>
              {validationErrors.description}
            </div>
          )}
        </motion.div>

        {/* Tags Section */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4,
            delay: 0.5,
            type: "spring",
            damping: 25,
            stiffness: 300
          }}
        >
          <div className="flex items-center gap-2">
            <Input
              ref={tagInputRef}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tags..."
              className="flex-1"
              onKeyPress={handleKeyPress}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={addTag}
              disabled={!tagInput.trim()}
              className="h-10 px-3"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-sm px-3 py-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Bottom Action Bar - Fixed at bottom */}
      <motion.div 
        ref={actionBarRef}
        className="fixed left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border px-6 py-3"
        style={{ 
          bottom: isKeyboardOpen ? 'env(keyboard-inset-height, 0px)' : '0px',
          transition: 'bottom 0.3s ease',
          position: 'fixed'
        }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1
        }}
        transition={{ 
          duration: 0.2,
          delay: 0,
          ease: "easeOut"
        }}
      >
        <div className="w-full space-y-3">
          {/* Validation Error for Category */}
          {validationErrors.category && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
              <span className="text-xs">⚠</span>
              <span>{validationErrors.category}</span>
            </div>
          )}
          
          {/* Category and Save buttons in one row */}
          <div className="flex items-center gap-3">
            {/* Category Button */}
            <Button
              variant={validationErrors.category ? "destructive" : selectedCategory ? "default" : "outline"}
              size="sm"
              onClick={() => setShowCategoryPicker(true)}
              className={`flex-1 h-12 ${
                validationErrors.category ? 'animate-pulse' : ''
              }`}
              disabled={loading}
            >
              {selectedCategory ? (
                <span className="flex items-center gap-2">
                  <span className="text-lg">{selectedCategory.emoji}</span>
                  <span>{selectedCategory.name}</span>
                </span>
              ) : (
                <span>
                  Select Category {!selectedCategory && <span className="text-destructive">*</span>}
                </span>
              )}
            </Button>

            {/* Save Button */}
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || !description.trim() || !category || loading}
              className="flex-1 h-12"
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
                  {isEditMode ? 'Update Idea' : 'Save Idea'}
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Hidden Category Picker */}
      <div className={`fixed inset-0 z-50 bg-background/80 backdrop-blur overflow-x-hidden ${showCategoryPicker ? 'block' : 'hidden'}`}>
        <div className="flex flex-col h-full overflow-x-hidden">
          <div className="flex items-center justify-between p-4 border-b overflow-x-hidden">
            <h2 className="text-lg font-semibold" dir="ltr">Select Category</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCategoryPicker(false)}
            >
              Done
            </Button>
          </div>
          <div className="flex-1 p-6 overflow-x-hidden">
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat: Category) => (
                <Button
                  key={cat.id}
                  variant={category === cat.id ? "default" : "outline"}
                  className="h-16 flex flex-col items-center justify-center gap-1"
                  onClick={() => {
                    setCategory(cat.id)
                    setShowCategoryPicker(false)
                  }}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-xs">{cat.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 