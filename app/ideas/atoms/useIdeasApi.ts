import { useState, useEffect, useCallback } from 'react'
import { ideasApi } from './api'
import { Category, Idea, IdeaCreate, IdeaUpdate } from './types'

interface UseIdeasApiReturn {
  // Data
  ideas: Idea[]
  categories: Category[]
  meta: {
    total: number
    page: number
    limit: number
    pages: number
  } | null
  
  // Loading states
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  
  // Actions
  loadIdeas: (params?: {
    search?: string
    category?: string
    page?: number
    limit?: number
  }) => Promise<void>
  loadCategories: () => Promise<void>
  createIdea: (idea: IdeaCreate) => Promise<Idea | null>
  updateIdea: (id: string, idea: IdeaUpdate) => Promise<Idea | null>
  deleteIdea: (id: string) => Promise<boolean>
  
  // Error state
  error: string | null
  clearError: () => void
}

export function useIdeasApi(): UseIdeasApiReturn {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [meta, setMeta] = useState<UseIdeasApiReturn['meta']>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const loadIdeas = useCallback(async (params?: {
    search?: string
    category?: string
    page?: number
    limit?: number
  }) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await ideasApi.getIdeas(params)
      setIdeas(result.ideas)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ideas')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadCategories = useCallback(async () => {
    setError(null)
    
    try {
      const result = await ideasApi.getCategories()
      setCategories(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
      throw err
    }
  }, [])

  const createIdea = useCallback(async (idea: IdeaCreate): Promise<Idea | null> => {
    setIsCreating(true)
    setError(null)
    
    try {
      const result = await ideasApi.createIdea(idea)
      setIdeas(prev => [result, ...prev])
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create idea')
      return null
    } finally {
      setIsCreating(false)
    }
  }, [])

  const updateIdea = useCallback(async (id: string, idea: IdeaUpdate): Promise<Idea | null> => {
    setIsUpdating(true)
    setError(null)
    
    try {
      const result = await ideasApi.updateIdea(id, idea)
      setIdeas(prev => prev.map(item => item.id === id ? result : item))
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update idea')
      return null
    } finally {
      setIsUpdating(false)
    }
  }, [])

  const deleteIdea = useCallback(async (id: string): Promise<boolean> => {
    setIsDeleting(true)
    setError(null)
    
    try {
      await ideasApi.deleteIdea(id)
      setIdeas(prev => prev.filter(item => item.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete idea')
      return false
    } finally {
      setIsDeleting(false)
    }
  }, [])

  // Load initial data
  useEffect(() => {
    loadCategories()
    loadIdeas()
  }, [loadCategories, loadIdeas])

  return {
    ideas,
    categories,
    meta,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    loadIdeas,
    loadCategories,
    createIdea,
    updateIdea,
    deleteIdea,
    error,
    clearError,
  }
} 