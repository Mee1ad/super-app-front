import { 
  Mood, 
  DiaryEntry, 
  DiaryEntryCreate, 
  DiaryEntryUpdate, 
  DiaryEntriesResponse, 
  MoodsResponse, 
  ImageUploadResponse,
  PaginationMeta 
} from './types'
import { getAccessToken } from '@/lib/auth-token'

// API functions
export const diaryApi = {
  // Get all moods
  async getMoods(): Promise<MoodsResponse> {
    const response = await fetch('/api/diary/moods', {
      headers: {
        'Content-Type': 'application/json',
        ...(getAccessToken() && { 'Authorization': `Bearer ${getAccessToken()}` })
      }
    })
    if (!response.ok) {
      throw new Error('Failed to fetch moods')
    }
    return response.json()
  },

  // Get diary entries with filtering and pagination
  async getDiaryEntries(params?: {
    search?: string
    mood?: string
    page?: number
    limit?: number
  }): Promise<DiaryEntriesResponse> {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.append('search', params.search)
    if (params?.mood) searchParams.append('mood', params.mood)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    
    const url = `/api/diary/entries${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(getAccessToken() && { 'Authorization': `Bearer ${getAccessToken()}` })
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch diary entries')
    }
    
    return response.json()
  },

  // Get single diary entry
  async getDiaryEntry(id: string): Promise<DiaryEntry> {
    const response = await fetch(`/api/diary/entries/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(getAccessToken() && { 'Authorization': `Bearer ${getAccessToken()}` })
      }
    })
    if (!response.ok) {
      throw new Error('Diary entry not found')
    }
    return response.json()
  },

  // Create new diary entry
  async createDiaryEntry(data: DiaryEntryCreate): Promise<DiaryEntry> {
    const response = await fetch('/api/diary/entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(getAccessToken() && { 'Authorization': `Bearer ${getAccessToken()}` })
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create diary entry')
    }
    
    return response.json()
  },

  // Update diary entry
  async updateDiaryEntry(id: string, data: DiaryEntryUpdate): Promise<DiaryEntry> {
    const response = await fetch(`/api/diary/entries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(getAccessToken() && { 'Authorization': `Bearer ${getAccessToken()}` })
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update diary entry')
    }
    
    return response.json()
  },

  // Delete diary entry
  async deleteDiaryEntry(id: string): Promise<{ message: string }> {
    const response = await fetch(`/api/diary/entries/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(getAccessToken() && { 'Authorization': `Bearer ${getAccessToken()}` })
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete diary entry')
    }
    
    return response.json()
  },

  // Upload image
  async uploadImage(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/diary/upload', {
      method: 'POST',
      body: formData,
      headers: {
        ...(getAccessToken() && { 'Authorization': `Bearer ${getAccessToken()}` })
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to upload image')
    }
    
    return response.json()
  }
} 