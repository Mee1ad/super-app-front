import { 
  Category, 
  Idea, 
  IdeaCreate, 
  IdeaUpdate, 
  IdeasResponse
} from './types'
import { mockCategories, mockIdeas, generateId } from '@/app/api/ideas/mock-data'

// Mock data storage for demo mode
// eslint-disable-next-line prefer-const
let demoIdeas = [...mockIdeas]

// Mock API functions for demo mode
export const mockIdeasApi = {
  // Category operations
  getCategories: async (): Promise<Category[]> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    return mockCategories
  },

  // Idea operations
  getIdeas: async (params?: {
    search?: string
    category?: string
    page?: number
    limit?: number
  }): Promise<{ ideas: Idea[], meta: IdeasResponse['meta'] }> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    let filteredIdeas = [...demoIdeas]
    
    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      filteredIdeas = filteredIdeas.filter(idea => 
        idea.title.toLowerCase().includes(searchLower) ||
        (idea.description && idea.description.toLowerCase().includes(searchLower)) ||
        (idea.tags && idea.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      )
    }
    
    if (params?.category) {
      filteredIdeas = filteredIdeas.filter(idea => idea.category_id === params.category)
    }
    
    const page = params?.page || 1
    const limit = params?.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedIdeas = filteredIdeas.slice(startIndex, endIndex)
    
    return {
      ideas: paginatedIdeas,
      meta: {
        total: filteredIdeas.length,
        page,
        limit,
        pages: Math.ceil(filteredIdeas.length / limit)
      }
    }
  },

  getIdea: async (id: string): Promise<Idea> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    const idea = demoIdeas.find(idea => idea.id === id)
    if (!idea) throw new Error('Idea not found')
    return idea
  },

  createIdea: async (data: IdeaCreate): Promise<Idea> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const newIdea: Idea = {
      id: generateId(),
      title: data.title,
      description: data.description,
      category_id: data.category,
      tags: data.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    demoIdeas.unshift(newIdea)
    return newIdea
  },

  updateIdea: async (id: string, data: IdeaUpdate): Promise<Idea> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    const ideaIndex = demoIdeas.findIndex(idea => idea.id === id)
    if (ideaIndex === -1) throw new Error('Idea not found')
    
    const updatedIdea = {
      ...demoIdeas[ideaIndex],
      ...data,
      category_id: data.category || demoIdeas[ideaIndex].category_id,
      updated_at: new Date().toISOString()
    }
    
    demoIdeas[ideaIndex] = updatedIdea
    return updatedIdea
  },

  deleteIdea: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    const ideaIndex = demoIdeas.findIndex(idea => idea.id === id)
    if (ideaIndex === -1) throw new Error('Idea not found')
    
    demoIdeas.splice(ideaIndex, 1)
  }
} 