'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, Save, X } from 'lucide-react'
import { IdeaCreate, IdeaUpdate, Idea } from '../atoms/types'
import { useIdeasApi } from '../atoms/useIdeasApi'
import { useMobileKeyboardDetection } from '@/hooks/use-mobile-keyboard-focus'

interface IdeaFormProps {
  mode: 'create' | 'edit'
  idea?: Idea
  onCancel?: () => void
}

export function IdeaForm({ mode, idea, onCancel }: IdeaFormProps) {
  const router = useRouter()
  const { createIdea, updateIdea } = useIdeasApi()
  
  const titleInputRef = useRef<HTMLInputElement>(null)
  const contentInputRef = useRef<HTMLTextAreaElement>(null)
  const actionBarRef = useRef<HTMLDivElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)
  
  const [title, setTitle] = useState(idea?.title || '')
  const [description, setDescription] = useState(idea?.description || '')
  const [tags, setTags] = useState<string[]>(idea?.tags || [])
  const [tagInput, setTagInput] = useState('')

  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    title?: string
    description?: string
  }>({})

  const keyboardHeight = useMobileKeyboardDetection()
  const isKeyboardOpen = keyboardHeight > 0

  useEffect(() => {
    if (idea) {
      setTitle(idea.title)
      setDescription(idea.description || '')
      setTags(idea.tags || [])
      setValidationErrors({})
    }
  }, [idea])

  useEffect(() => {
    if (title.trim() && validationErrors.title) {
      setValidationErrors(prev => ({ ...prev, title: undefined }))
    }
    if (description.trim() && validationErrors.description) {
      setValidationErrors(prev => ({ ...prev, description: undefined }))
    }
  }, [title, description, validationErrors])

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

  const validateForm = () => {
    const errors: typeof validationErrors = {}
    if (!title.trim()) {
      errors.title = 'Title is required'
    }
    if (!description.trim()) {
      errors.description = 'Description is required'
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
        }
        const result = await createIdea(newIdea)
        if (result) {
          router.push('/ideas')
        }
      } else if (idea) {
        const updatedIdea: IdeaUpdate = {}
        if (title.trim()) updatedIdea.title = title.trim()
        if (description.trim()) updatedIdea.description = description.trim()
        if (tags.length > 0) updatedIdea.tags = tags
        await updateIdea(idea.id, updatedIdea)
        router.push('/ideas')
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
    // Only submit on Enter if not in a textarea (description)
    if (e.key === 'Enter' && !e.shiftKey && e.target !== contentInputRef.current) {
      e.preventDefault();
      handleSubmit();
    }
  };

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
            onKeyDown={(e) => {
              // Prevent Enter from submitting the form in description
              if (e.key === 'Enter' && !e.shiftKey) {
                e.stopPropagation();
              }
              handleFormKeyDown(e);
            }}
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
              fontFamily: 'inherit',
              paddingBottom: isKeyboardOpen ? `${keyboardHeight + 20}px` : '20px',
              whiteSpace: 'pre-wrap'
            }}
          />
          
          {/* Visible Description Placeholder */}
          <div 
            className={`flex-1 text-base leading-relaxed cursor-text min-h-[200px] break-words px-0 text-left relative z-0 ${
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
              fontFamily: 'inherit',
              paddingBottom: isKeyboardOpen ? `${keyboardHeight + 20}px` : '20px',
              whiteSpace: 'pre-wrap'
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
        <div className="flex flex-col gap-3">
          <div className="flex-1">
            <Input
              ref={tagInputRef}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tag"
              className="w-full h-12"
              onKeyPress={handleKeyPress}
            />
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-16 overflow-y-auto">
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
        </div>
      </motion.div>

      {/* Bottom Action Bar - Fixed at bottom */}
      <motion.div 
        ref={actionBarRef}
        className="fixed left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border px-6 py-3"
        style={{ 
          bottom: isKeyboardOpen ? `${keyboardHeight}px` : '0px',
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
          {/* Save Button */}
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !description.trim() || loading}
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
                {isEditMode ? 'Update Idea' : 'Save Idea'}
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
} 