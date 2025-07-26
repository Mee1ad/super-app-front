import { useState, useCallback } from 'react'
import { useAuth } from '@/app/auth/atoms/useAuth'
import { foodTrackerApi } from './api'
import { mockFoodTrackerApi } from './mock-data'
import { FoodEntry, FoodEntryCreate, FoodEntryUpdate, FoodEntriesResponse, FoodSummaryResponse, FoodEntriesFilters } from './types'

export function useFoodTrackerApi() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use real API for authenticated users, mock API for non-authenticated users
  const api = authLoading ? null : (isAuthenticated ? foodTrackerApi : mockFoodTrackerApi)

  const handleApiCall = useCallback(async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    if (!api) return null
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiCall()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [api])

  const getFoodEntries = useCallback(async (filters: FoodEntriesFilters = {}): Promise<FoodEntriesResponse | null> => {
    return handleApiCall(() => api!.getFoodEntries(filters))
  }, [handleApiCall, api])

  const getFoodEntry = useCallback(async (id: string): Promise<FoodEntry | null> => {
    return handleApiCall(() => api!.getFoodEntry(id))
  }, [handleApiCall, api])

  const createFoodEntry = useCallback(async (data: FoodEntryCreate): Promise<FoodEntry | null> => {
    return handleApiCall(() => api!.createFoodEntry(data))
  }, [handleApiCall, api])

  const updateFoodEntry = useCallback(async (id: string, data: FoodEntryUpdate): Promise<FoodEntry | null> => {
    return handleApiCall(() => api!.updateFoodEntry(id, data))
  }, [handleApiCall, api])

  const deleteFoodEntry = useCallback(async (id: string): Promise<boolean> => {
    const result = await handleApiCall(() => api!.deleteFoodEntry(id))
    return result !== null
  }, [handleApiCall, api])

  const getFoodSummary = useCallback(async (start_date?: string, end_date?: string): Promise<FoodSummaryResponse | null> => {
    return handleApiCall(() => api!.getFoodSummary(start_date, end_date))
  }, [handleApiCall, api])

  return {
    // API methods
    getFoodEntries,
    getFoodEntry,
    createFoodEntry,
    updateFoodEntry,
    deleteFoodEntry,
    getFoodSummary,
    
    // State
    loading,
    error,
    isAuthenticated,
    authLoading,
    
    // Clear error
    clearError: () => setError(null)
  }
} 