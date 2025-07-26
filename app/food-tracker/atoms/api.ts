import { makeAuthenticatedRequest } from '@/lib/auth-request'
import { FoodEntry, FoodEntryCreate, FoodEntryUpdate, FoodEntriesResponse, FoodSummaryResponse, FoodEntriesFilters } from './types'

const API_BASE = '/api/food-entries'

export const foodTrackerApi = {
  // Get food entries with filtering and pagination
  async getFoodEntries(filters: FoodEntriesFilters = {}): Promise<FoodEntriesResponse> {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.search) params.append('search', filters.search)
    if (filters.start_date) params.append('start_date', filters.start_date)
    if (filters.end_date) params.append('end_date', filters.end_date)
    if (filters.min_price !== undefined) params.append('min_price', filters.min_price.toString())
    if (filters.max_price !== undefined) params.append('max_price', filters.max_price.toString())
    
    const url = `${API_BASE}?${params.toString()}`
    const response = await makeAuthenticatedRequest(url)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch food entries: ${response.statusText}`)
    }
    
    return response.json()
  },
  
  // Get a specific food entry
  async getFoodEntry(id: string): Promise<FoodEntry> {
    const response = await makeAuthenticatedRequest(`${API_BASE}/${id}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch food entry: ${response.statusText}`)
    }
    
    return response.json()
  },
  
  // Create a new food entry
  async createFoodEntry(data: FoodEntryCreate): Promise<FoodEntry> {
    const response = await makeAuthenticatedRequest(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to create food entry: ${response.statusText}`)
    }
    
    return response.json()
  },
  
  // Update an existing food entry
  async updateFoodEntry(id: string, data: FoodEntryUpdate): Promise<FoodEntry> {
    const response = await makeAuthenticatedRequest(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update food entry: ${response.statusText}`)
    }
    
    return response.json()
  },
  
  // Delete a food entry
  async deleteFoodEntry(id: string): Promise<void> {
    const response = await makeAuthenticatedRequest(`${API_BASE}/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error(`Failed to delete food entry: ${response.statusText}`)
    }
  },
  
  // Get food summary
  async getFoodSummary(start_date?: string, end_date?: string): Promise<FoodSummaryResponse> {
    const params = new URLSearchParams()
    if (start_date) params.append('start_date', start_date)
    if (end_date) params.append('end_date', end_date)
    
    const url = `${API_BASE}/summary?${params.toString()}`
    const response = await makeAuthenticatedRequest(url)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch food summary: ${response.statusText}`)
    }
    
    return response.json()
  }
} 