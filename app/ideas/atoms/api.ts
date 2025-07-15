import { toast } from '@/hooks/use-toast'
import { 
  Category, 
  Idea, 
  IdeaCreate, 
  IdeaUpdate, 
  CategoriesResponse, 
  IdeasResponse, 
  DeleteResponse 
} from './types'
import { getAccessToken } from '@/lib/auth-token'
// import { mockIdeasApi } from './mock-data'

// API base URL - change this for different environments
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000/api/v1' 
  : '/api'

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'An unexpected error occurred'
    let errorCode: string | undefined

    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.detail || errorMessage
      errorCode = errorData.code
    } catch {
      // If error response is not JSON, use status text
      errorMessage = response.statusText || errorMessage
    }

    throw new ApiError(errorMessage, response.status, errorCode)
  }

  return response.json()
}

function authHeaders(): HeadersInit {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const ideasApi = {
  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: {
          ...authHeaders()
        } as HeadersInit
      })
      const data: CategoriesResponse = await handleResponse(response)
      return data.categories
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: 'Failed to load categories',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Network error',
          description: 'Failed to connect to the server',
          variant: 'destructive',
        })
      }
      throw error
    }
  },

  // Ideas
  async getIdeas(params?: {
    search?: string
    category?: string
    page?: number
    limit?: number
  }): Promise<{ ideas: Idea[], meta: IdeasResponse['meta'] }> {
    try {
      const searchParams = new URLSearchParams()
      if (params?.search) searchParams.append('search', params.search)
      if (params?.category) searchParams.append('category', params.category)
      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())

      const url = `${API_BASE_URL}/ideas${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      const response = await fetch(url, {
        headers: {
          ...authHeaders()
        } as HeadersInit
      })
      const data: IdeasResponse = await handleResponse(response)
      
      return {
        ideas: data.ideas,
        meta: data.meta
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: 'Failed to load ideas',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Network error',
          description: 'Failed to connect to the server',
          variant: 'destructive',
        })
      }
      throw error
    }
  },

  async getIdea(id: string): Promise<Idea> {
    try {
      const response = await fetch(`${API_BASE_URL}/ideas/${id}`, {
        headers: {
          ...authHeaders()
        } as HeadersInit
      })
      return await handleResponse(response)
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: 'Failed to load idea',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Network error',
          description: 'Failed to connect to the server',
          variant: 'destructive',
        })
      }
      throw error
    }
  },

  async createIdea(idea: IdeaCreate): Promise<Idea> {
    try {
      const response = await fetch(`${API_BASE_URL}/ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify(idea),
      })
      
      const result = await handleResponse<Idea>(response)
      
      toast({
        title: 'Idea created',
        description: 'Your idea has been successfully created',
      })
      
      return result
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: 'Failed to create idea',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Network error',
          description: 'Failed to connect to the server',
          variant: 'destructive',
        })
      }
      throw error
    }
  },

  async updateIdea(id: string, idea: IdeaUpdate): Promise<Idea> {
    try {
      const response = await fetch(`${API_BASE_URL}/ideas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify(idea),
      })
      
      const result = await handleResponse<Idea>(response)
      
      toast({
        title: 'Idea updated',
        description: 'Your idea has been successfully updated',
      })
      
      return result
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: 'Failed to update idea',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Network error',
          description: 'Failed to connect to the server',
          variant: 'destructive',
        })
      }
      throw error
    }
  },

  async deleteIdea(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/ideas/${id}`, {
        method: 'DELETE',
        headers: {
          ...authHeaders()
        } as HeadersInit
      })
      
      await handleResponse<DeleteResponse>(response)
      
      toast({
        title: 'Idea deleted',
        description: 'Your idea has been successfully deleted',
      })
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: 'Failed to delete idea',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Network error',
          description: 'Failed to connect to the server',
          variant: 'destructive',
        })
      }
      throw error
    }
  },
} 