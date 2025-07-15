import { 
  DiaryEntry, 
  DiaryEntryCreate, 
  DiaryEntryUpdate, 
  DiaryEntriesResponse,
  MoodsResponse, 
  ImageUploadResponse
} from './types'
import { getAccessToken } from '@/lib/auth-token'
import { mockMoods, mockDiaryEntries, generateId } from '@/app/api/diary/mock-data'

// API base URL - change this for different environments
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// Mock API for non-authenticated users
const mockDiaryApi = {
  async getMoods(): Promise<MoodsResponse> {
    return { moods: mockMoods }
  },

  async getDiaryEntries(params?: {
    search?: string
    mood?: string
    page?: number
    limit?: number
  }): Promise<DiaryEntriesResponse> {
    let filteredEntries = [...mockDiaryEntries]
    
    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      filteredEntries = filteredEntries.filter(entry => 
        entry.title.toLowerCase().includes(searchLower) || 
        entry.content.toLowerCase().includes(searchLower)
      )
    }
    
    if (params?.mood) {
      filteredEntries = filteredEntries.filter(entry => entry.mood === params.mood)
    }
    
    const page = params?.page || 1
    const limit = params?.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex)
    
    return {
      entries: paginatedEntries,
      meta: {
        total: filteredEntries.length,
        page,
        limit,
        pages: Math.ceil(filteredEntries.length / limit)
      }
    }
  },

  async getDiaryEntry(id: string): Promise<DiaryEntry> {
    const entry = mockDiaryEntries.find(e => e.id === id)
    if (!entry) {
      throw new Error('Diary entry not found')
    }
    return entry
  },

  async createDiaryEntry(data: DiaryEntryCreate): Promise<DiaryEntry> {
    const newEntry: DiaryEntry = {
      id: generateId(),
      title: data.title,
      content: data.content,
      mood: data.mood,
      date: data.date || new Date().toISOString().slice(0, 10),
      images: data.images || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    mockDiaryEntries.unshift(newEntry)
    return newEntry
  },

  async updateDiaryEntry(id: string, data: DiaryEntryUpdate): Promise<DiaryEntry> {
    const index = mockDiaryEntries.findIndex(e => e.id === id)
    if (index === -1) {
      throw new Error('Diary entry not found')
    }
    
    const updatedEntry = {
      ...mockDiaryEntries[index],
      ...data,
      updated_at: new Date().toISOString()
    }
    mockDiaryEntries[index] = updatedEntry
    return updatedEntry
  },

  async deleteDiaryEntry(id: string): Promise<{ message: string }> {
    const index = mockDiaryEntries.findIndex(e => e.id === id)
    if (index === -1) {
      throw new Error('Diary entry not found')
    }
    mockDiaryEntries.splice(index, 1)
    return { message: 'Diary entry deleted successfully' }
  },

  async uploadImage(): Promise<ImageUploadResponse> {
    // Mock image upload - return a fake URL
    return { url: `https://via.placeholder.com/400x300?text=Mock+Image` }
  }
}

// API functions
export const diaryApi = {
  // Get all moods
  async getMoods(): Promise<MoodsResponse> {
    const token = getAccessToken()
    if (!token) {
      return mockDiaryApi.getMoods()
    }

    const response = await fetch(`${API_BASE_URL}/moods`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) {
      if (response.status === 401) {
        return mockDiaryApi.getMoods()
      }
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
    const token = getAccessToken()
    if (!token) {
      return mockDiaryApi.getDiaryEntries(params)
    }

    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.append('search', params.search)
    if (params?.mood) searchParams.append('mood', params.mood)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    
    const url = `${API_BASE_URL}/diary-entries${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        return mockDiaryApi.getDiaryEntries(params)
      }
      throw new Error('Failed to fetch diary entries')
    }
    
    return response.json()
  },

  // Get single diary entry
  async getDiaryEntry(id: string): Promise<DiaryEntry> {
    const token = getAccessToken()
    if (!token) {
      return mockDiaryApi.getDiaryEntry(id)
    }

    const response = await fetch(`${API_BASE_URL}/diary-entries/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) {
      if (response.status === 401) {
        return mockDiaryApi.getDiaryEntry(id)
      }
      throw new Error('Diary entry not found')
    }
    return response.json()
  },

  // Create new diary entry
  async createDiaryEntry(data: DiaryEntryCreate): Promise<DiaryEntry> {
    const token = getAccessToken()
    if (!token) {
      return mockDiaryApi.createDiaryEntry(data)
    }

    // Ensure date is present and valid
    const entryWithDate = {
      ...data,
      date: data.date || new Date().toISOString().slice(0, 10)
    }
    const response = await fetch(`${API_BASE_URL}/diary-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(entryWithDate),
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        return mockDiaryApi.createDiaryEntry(data)
      }
      throw new Error('Failed to create diary entry')
    }
    
    return response.json()
  },

  // Update diary entry
  async updateDiaryEntry(id: string, data: DiaryEntryUpdate): Promise<DiaryEntry> {
    const token = getAccessToken()
    if (!token) {
      return mockDiaryApi.updateDiaryEntry(id, data)
    }

    const response = await fetch(`${API_BASE_URL}/diary-entries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        return mockDiaryApi.updateDiaryEntry(id, data)
      }
      throw new Error('Failed to update diary entry')
    }
    
    return response.json()
  },

  // Delete diary entry
  async deleteDiaryEntry(id: string): Promise<{ message: string }> {
    const token = getAccessToken()
    if (!token) {
      return mockDiaryApi.deleteDiaryEntry(id)
    }

    const response = await fetch(`${API_BASE_URL}/diary-entries/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        return mockDiaryApi.deleteDiaryEntry(id)
      }
      throw new Error('Failed to delete diary entry')
    }
    
    return response.json()
  },

  // Upload image
  async uploadImage(file: File): Promise<ImageUploadResponse> {
    const token = getAccessToken()
    if (!token) {
      return mockDiaryApi.uploadImage()
    }

    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${API_BASE_URL}/upload-image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        return mockDiaryApi.uploadImage()
      }
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to upload image')
    }
    
    return response.json()
  }
} 