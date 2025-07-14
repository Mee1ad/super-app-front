import { 
  MealType, 
  FoodEntry, 
  FoodEntryCreate, 
  FoodEntryUpdate, 
  FoodSummaryResponse, 
  CalendarResponse,
  DaySummary,
  FoodEntriesResponse,
  MealTypesResponse,
  ImageUploadResponse
} from './types'
import { mockMealTypes, mockFoodEntries, generateId } from '@/app/api/food-planner/mock-data'

// Mock data storage for demo mode
let demoFoodEntries = [...mockFoodEntries]

// Mock API functions for demo mode
export const mockFoodPlannerApi = {
  // Meal type operations
  getMealTypes: async (): Promise<MealTypesResponse> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    return { meal_types: mockMealTypes }
  },

  // Food entry operations
  getFoodEntries: async (params?: {
    search?: string
    category?: 'planned' | 'eaten'
    meal_type?: string
    date_filter?: string
    page?: number
    limit?: number
  }): Promise<FoodEntriesResponse> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    let filteredEntries = [...demoFoodEntries]
    
    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      filteredEntries = filteredEntries.filter(entry => 
        entry.name.toLowerCase().includes(searchLower) ||
        (entry.comment && entry.comment.toLowerCase().includes(searchLower))
      )
    }
    
    if (params?.category) {
      filteredEntries = filteredEntries.filter(entry => entry.category === params.category)
    }
    
    if (params?.meal_type) {
      filteredEntries = filteredEntries.filter(entry => entry.meal_type_id === params.meal_type)
    }
    
    if (params?.date_filter) {
      filteredEntries = filteredEntries.filter(entry => entry.date === params.date_filter)
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

  getFoodEntry: async (id: string): Promise<FoodEntry> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    const entry = demoFoodEntries.find(entry => entry.id === id)
    if (!entry) throw new Error('Food entry not found')
    return entry
  },

  createFoodEntry: async (data: FoodEntryCreate): Promise<FoodEntry> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    const mealType = mockMealTypes.find(mt => mt.id === data.meal_type_id)
    if (!mealType) throw new Error('Meal type not found')
    
    const newEntry: FoodEntry = {
      id: generateId(),
      name: data.name,
      category: data.category,
      meal_type_id: data.meal_type_id,
      time: data.time,
      date: data.date,
      comment: data.comment,
      image: data.image,
      followed_plan: data.followed_plan,
      symptoms: data.symptoms || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      meal_type: mealType
    }
    
    demoFoodEntries.unshift(newEntry)
    return newEntry
  },

  updateFoodEntry: async (id: string, data: FoodEntryUpdate): Promise<FoodEntry> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    const entryIndex = demoFoodEntries.findIndex(entry => entry.id === id)
    if (entryIndex === -1) throw new Error('Food entry not found')
    
    const mealType = data.meal_type_id 
      ? mockMealTypes.find(mt => mt.id === data.meal_type_id)
      : demoFoodEntries[entryIndex].meal_type
    
    if (data.meal_type_id && !mealType) throw new Error('Meal type not found')
    
    const updatedEntry = {
      ...demoFoodEntries[entryIndex],
      ...data,
      meal_type: mealType!,
      updated_at: new Date().toISOString()
    }
    
    demoFoodEntries[entryIndex] = updatedEntry
    return updatedEntry
  },

  deleteFoodEntry: async (id: string): Promise<{ message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    const entryIndex = demoFoodEntries.findIndex(entry => entry.id === id)
    if (entryIndex === -1) throw new Error('Food entry not found')
    
    demoFoodEntries.splice(entryIndex, 1)
    return { message: 'Food entry deleted successfully' }
  },

  // Summary operations
  getFoodSummary: async (params?: {
    start_date?: string
    end_date?: string
  }): Promise<FoodSummaryResponse> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    let filteredEntries = [...demoFoodEntries]
    
    if (params?.start_date) {
      filteredEntries = filteredEntries.filter(entry => entry.date >= params.start_date!)
    }
    
    if (params?.end_date) {
      filteredEntries = filteredEntries.filter(entry => entry.date <= params.end_date!)
    }
    
    const plannedCount = filteredEntries.filter(entry => entry.category === 'planned').length
    const eatenCount = filteredEntries.filter(entry => entry.category === 'eaten').length
    const followedPlanCount = filteredEntries.filter(entry => 
      entry.category === 'eaten' && entry.followed_plan === true
    ).length
    const offPlanCount = filteredEntries.filter(entry => 
      entry.category === 'eaten' && entry.followed_plan === false
    ).length
    
    return {
      planned_count: plannedCount,
      eaten_count: eatenCount,
      followed_plan_count: followedPlanCount,
      off_plan_count: offPlanCount
    }
  },

  getCalendarData: async (params?: {
    start_date?: string
    end_date?: string
  }): Promise<CalendarResponse> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    let filteredEntries = [...demoFoodEntries]
    
    if (params?.start_date) {
      filteredEntries = filteredEntries.filter(entry => entry.date >= params.start_date!)
    }
    
    if (params?.end_date) {
      filteredEntries = filteredEntries.filter(entry => entry.date <= params.end_date!)
    }
    
    // Group entries by date
    const entriesByDate = filteredEntries.reduce((acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = {
          planned: 0,
          eaten: 0,
          followed_plan: true
        }
      }
      
      if (entry.category === 'planned') {
        acc[entry.date].planned++
      } else if (entry.category === 'eaten') {
        acc[entry.date].eaten++
        if (entry.followed_plan === false) {
          acc[entry.date].followed_plan = false
        }
      }
      
      return acc
    }, {} as Record<string, { planned: number; eaten: number; followed_plan: boolean }>)
    
    const days: DaySummary[] = Object.entries(entriesByDate).map(([date, data]) => ({
      date,
      planned_count: data.planned,
      eaten_count: data.eaten,
      followed_plan: data.followed_plan
    }))
    
    return { days }
  },

  // Image upload
  uploadFoodImage: async (file: File): Promise<ImageUploadResponse> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    // Mock image upload - return a placeholder URL
    return {
      url: `https://via.placeholder.com/300x200/cccccc/666666?text=${encodeURIComponent(file.name)}`
    }
  }
} 