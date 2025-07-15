import {
  MealTypesResponse,
  FoodEntry,
  FoodEntryCreate,
  FoodEntryUpdate,
  FoodEntriesResponse,
  FoodSummaryResponse,
  CalendarResponse,
  ImageUploadResponse
} from './types'
import { getAccessToken } from '@/lib/auth-token'
// import { mockFoodPlannerApi } from './mock-data'

// API base URL - change this for different environments
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000/api/v1' 
  : '/api'

// API functions
export const foodPlannerApi = {
  // Get all meal types
  async getMealTypes(): Promise<MealTypesResponse> {
    const response = await fetch(`${API_BASE_URL}/meal-types`, {
      headers: {
        'Content-Type': 'application/json',
        ...(getAccessToken() && { 'Authorization': `Bearer ${getAccessToken()}` })
      }
    })
    if (!response.ok) {
      throw new Error('Failed to fetch meal types')
    }
    return response.json()
  },

  // Get food entries with filtering and pagination
  async getFoodEntries(params?: {
    search?: string
    category?: 'planned' | 'eaten'
    meal_type?: string
    date_filter?: string
    page?: number
    limit?: number
  }): Promise<FoodEntriesResponse> {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.append('search', params.search)
    if (params?.category) searchParams.append('category', params.category)
    if (params?.meal_type) searchParams.append('meal_type', params.meal_type)
    if (params?.date_filter) searchParams.append('date_filter', params.date_filter)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    
    const url = `${API_BASE_URL}/food-entries${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(getAccessToken() && { 'Authorization': `Bearer ${getAccessToken()}` })
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch food entries')
    }
    
    return response.json()
  },

  // Get single food entry
  async getFoodEntry(id: string): Promise<FoodEntry> {
    const response = await fetch(`${API_BASE_URL}/food-entries/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(getAccessToken() && { 'Authorization': `Bearer ${getAccessToken()}` })
      }
    })
    if (!response.ok) {
      throw new Error('Food entry not found')
    }
    return response.json()
  },

  // Create new food entry
  async createFoodEntry(data: FoodEntryCreate): Promise<FoodEntry> {
    const response = await fetch(`${API_BASE_URL}/food-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(getAccessToken() && { 'Authorization': `Bearer ${getAccessToken()}` })
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create food entry')
    }
    
    return response.json()
  },

  // Update food entry
  async updateFoodEntry(id: string, data: FoodEntryUpdate): Promise<FoodEntry> {
    const response = await fetch(`${API_BASE_URL}/food-entries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(getAccessToken() && { 'Authorization': `Bearer ${getAccessToken()}` })
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update food entry')
    }
    
    return response.json()
  },

  // Delete food entry
  async deleteFoodEntry(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/food-entries/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(getAccessToken() && { 'Authorization': `Bearer ${getAccessToken()}` })
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete food entry')
    }
    
    return response.json()
  },

  // Get food summary
  async getFoodSummary(params?: {
    start_date?: string
    end_date?: string
  }): Promise<FoodSummaryResponse> {
    const searchParams = new URLSearchParams()
    if (params?.start_date) searchParams.append('start_date', params.start_date)
    if (params?.end_date) searchParams.append('end_date', params.end_date)
    
    const url = `${API_BASE_URL}/food-entries/summary${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(getAccessToken() && { 'Authorization': `Bearer ${getAccessToken()}` })
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch food summary')
    }
    
    return response.json()
  },

  // Get calendar data
  async getCalendarData(params?: {
    start_date?: string
    end_date?: string
  }): Promise<CalendarResponse> {
    const searchParams = new URLSearchParams()
    if (params?.start_date) searchParams.append('start_date', params.start_date)
    if (params?.end_date) searchParams.append('end_date', params.end_date)
    
    const url = `${API_BASE_URL}/food-entries/calendar${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(getAccessToken() && { 'Authorization': `Bearer ${getAccessToken()}` })
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch calendar data')
    }
    
    return response.json()
  },

  // Upload food image
  async uploadFoodImage(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${API_BASE_URL}/upload-food-image`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(getAccessToken() && { 'Authorization': `Bearer ${getAccessToken()}` })
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to upload food image')
    }
    
    return response.json()
  }
} 