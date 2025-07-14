import { useState, useCallback, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { foodPlannerApi } from './api'
import { mockFoodPlannerApi } from './mock-data'
import { useAuth } from '@/app/auth/atoms/useAuth'
import {
  MealType,
  FoodEntry,
  FoodEntryCreate,
  FoodEntryUpdate,
  FoodSummaryResponse,
  CalendarResponse
} from './types'

export function useFoodPlannerApi() {
  const [mealTypes, setMealTypes] = useState<MealType[]>([])
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([])
  const [summary, setSummary] = useState<FoodSummaryResponse | null>(null)
  const [calendarData, setCalendarData] = useState<CalendarResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { isAuthenticated, loading: authLoading } = useAuth()
  
  // Use mock API for non-authenticated users, real API for authenticated users
  // Only decide after auth loading is complete
  const api = authLoading ? null : (isAuthenticated ? foodPlannerApi : mockFoodPlannerApi)

  const showError = useCallback((message: string) => {
    setError(message)
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    })
  }, [toast])

  const showSuccess = useCallback((message: string) => {
    toast({
      title: "Success",
      description: message,
    })
  }, [toast])

  // Load meal types
  const loadMealTypes = useCallback(async () => {
    if (!api) return
    try {
      setLoading(true)
      setError(null)
      const response = await api.getMealTypes()
      setMealTypes(response.meal_types)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load meal types'
      showError(message)
    } finally {
      setLoading(false)
    }
  }, [showError, api])

  // Load food entries
  const loadFoodEntries = useCallback(async (params?: {
    search?: string
    category?: 'planned' | 'eaten'
    meal_type?: string
    date_filter?: string
    page?: number
    limit?: number
  }) => {
    if (!api) return
    try {
      setLoading(true)
      setError(null)
      const response = await api.getFoodEntries(params)
      setFoodEntries(response.entries)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load food entries'
      showError(message)
    } finally {
      setLoading(false)
    }
  }, [showError, api])

  // Create food entry
  const createFoodEntry = useCallback(async (data: FoodEntryCreate) => {
    if (!api) throw new Error('API not ready')
    try {
      setLoading(true)
      setError(null)
      const newEntry = await api.createFoodEntry(data)
      setFoodEntries(prev => [newEntry, ...prev])
      showSuccess('Food entry created successfully')
      return newEntry
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create food entry'
      showError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [showError, showSuccess, api])

  // Update food entry
  const updateFoodEntry = useCallback(async (id: string, data: FoodEntryUpdate) => {
    if (!api) throw new Error('API not ready')
    try {
      setLoading(true)
      setError(null)
      const updatedEntry = await api.updateFoodEntry(id, data)
      setFoodEntries(prev => prev.map(entry => 
        entry.id === id ? updatedEntry : entry
      ))
      showSuccess('Food entry updated successfully')
      return updatedEntry
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update food entry'
      showError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [showError, showSuccess, api])

  // Delete food entry
  const deleteFoodEntry = useCallback(async (id: string) => {
    if (!api) throw new Error('API not ready')
    try {
      setLoading(true)
      setError(null)
      await api.deleteFoodEntry(id)
      setFoodEntries(prev => prev.filter(entry => entry.id !== id))
      showSuccess('Food entry deleted successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete food entry'
      showError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [showError, showSuccess, api])

  // Load summary
  const loadSummary = useCallback(async (params?: {
    start_date?: string
    end_date?: string
  }) => {
    if (!api) return
    try {
      setLoading(true)
      setError(null)
      const response = await api.getFoodSummary(params)
      setSummary(response)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load summary'
      showError(message)
    } finally {
      setLoading(false)
    }
  }, [showError, api])

  // Load calendar data
  const loadCalendarData = useCallback(async (params?: {
    start_date?: string
    end_date?: string
  }) => {
    if (!api) return
    try {
      setLoading(true)
      setError(null)
      const response = await api.getCalendarData(params)
      setCalendarData(response)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load calendar data'
      showError(message)
    } finally {
      setLoading(false)
    }
  }, [showError, api])

  // Upload food image
  const uploadFoodImage = useCallback(async (file: File) => {
    if (!api) throw new Error('API not ready')
    try {
      setLoading(true)
      setError(null)
      const response = await api.uploadFoodImage(file)
      showSuccess('Image uploaded successfully')
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload image'
      showError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [showError, showSuccess, api])

  // Load initial data - wait for auth loading to complete first
  useEffect(() => {
    if (!authLoading && api) {
      loadMealTypes()
      loadFoodEntries()
      loadSummary()
    }
  }, [loadMealTypes, loadFoodEntries, loadSummary, authLoading, api])

  // Clear mock data when user logs in
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      setFoodEntries([])
      setSummary(null)
      setCalendarData(null)
      setError(null)
      // Reload data from real API when user becomes authenticated
      loadMealTypes()
      loadFoodEntries()
      loadSummary()
    }
  }, [isAuthenticated, authLoading, loadMealTypes, loadFoodEntries, loadSummary])

  return {
    // State
    mealTypes,
    foodEntries,
    summary,
    calendarData,
    loading,
    error,
    
    // Actions
    loadMealTypes,
    loadFoodEntries,
    createFoodEntry,
    updateFoodEntry,
    deleteFoodEntry,
    loadSummary,
    loadCalendarData,
    uploadFoodImage,
    
    // Utilities
    clearError: () => setError(null)
  }
} 