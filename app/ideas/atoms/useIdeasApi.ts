import { useState, useEffect, useCallback } from 'react'
import { ideasApi } from './api'
import { mockIdeasApi } from './mock-data'
import { useAuth } from '@/app/auth/atoms/useAuth'
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
  const { isAuthenticated } = useAuth()
  
  // Use mock API for non-authenticated users, real API for authenticated users
  const api = isAuthenticated ? ideasApi : mockIdeasApi

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
      const result = await api.getIdeas(params)
      setIdeas(result.ideas)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ideas')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [api])

  const loadCategories = useCallback(async () => {
    setError(null)
    
    try {
      const result = await api.getCategories()
      setCategories(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
      throw err
    }
  }, [api])

  const createIdea = useCallback(async (idea: IdeaCreate): Promise<Idea | null> => {
    setIsCreating(true)
    setError(null)
    
    try {
      const result = await api.createIdea(idea)
      setIdeas(prev => [result, ...prev])
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create idea')
      return null
    } finally {
      setIsCreating(false)
    }
  }, [api])

  const updateIdea = useCallback(async (id: string, idea: IdeaUpdate): Promise<Idea | null> => {
    setIsUpdating(true)
    setError(null)
    
    try {
      const result = await api.updateIdea(id, idea)
      setIdeas(prev => prev.map(item => item.id === id ? result : item))
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update idea')
      return null
    } finally {
      setIsUpdating(false)
    }
  }, [api])

  const deleteIdea = useCallback(async (id: string): Promise<boolean> => {
    setIsDeleting(true)
    setError(null)
    
    try {
      await api.deleteIdea(id)
      setIdeas(prev => prev.filter(item => item.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete idea')
      return false
    } finally {
      setIsDeleting(false)
    }
  }, [api])

  // Load initial data
  useEffect(() => {
    loadCategories()
    loadIdeas()
  }, [loadCategories, loadIdeas])

  // Clear mock data when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      setIdeas([])
      setMeta(null)
      setError(null)
      // Reload data from real API when user becomes authenticated
      loadCategories()
      loadIdeas()
    }
  }, [isAuthenticated, loadCategories, loadIdeas])

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