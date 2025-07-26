import { FoodEntry, FoodEntryCreate, FoodEntryUpdate, FoodEntriesResponse, FoodSummaryResponse, FoodEntriesFilters } from './types'

// Generate a simple ID
const generateId = () => Math.random().toString(36).substr(2, 9)

// Helper function to create date with specific time
const createDateWithTime = (daysAgo: number, hour: number, minute: number = 0) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

// Mock food entries data
const mockFoodEntries: FoodEntry[] = [
  // Today
  {
    id: '1',
    user_id: 'user-1',
    name: 'Pizza Margherita',
    price: 12.99,
    description: 'Classic Italian pizza with tomato sauce and mozzarella',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    date: createDateWithTime(0, 19, 30), // Dinner time
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'user-1',
    name: 'Caesar Salad',
    price: 8.50,
    description: 'Fresh romaine lettuce with Caesar dressing and croutons',
    image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    date: createDateWithTime(0, 12, 30), // Lunch time
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    user_id: 'user-1',
    name: 'Oatmeal with Berries',
    price: 4.99,
    description: 'Steel-cut oats with fresh strawberries and blueberries',
    image_url: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=400',
    date: createDateWithTime(0, 8, 15), // Breakfast time
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Yesterday
  {
    id: '4',
    user_id: 'user-1',
    name: 'Chicken Burger',
    price: 9.99,
    description: 'Grilled chicken burger with lettuce and tomato',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    date: createDateWithTime(1, 18, 45), // Dinner time
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    user_id: 'user-1',
    name: 'Sushi Roll',
    price: 15.99,
    description: 'Fresh salmon and avocado sushi roll',
    image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
    date: createDateWithTime(1, 13, 0), // Lunch time
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    user_id: 'user-1',
    name: 'Scrambled Eggs',
    price: 6.50,
    description: 'Fluffy scrambled eggs with toast',
    image_url: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400',
    date: createDateWithTime(1, 7, 30), // Breakfast time
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // 2 days ago
  {
    id: '7',
    user_id: 'user-1',
    name: 'Pasta Carbonara',
    price: 11.50,
    description: 'Creamy pasta with bacon and parmesan cheese',
    image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
    date: createDateWithTime(2, 20, 0), // Dinner time
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '8',
    user_id: 'user-1',
    name: 'Greek Salad',
    price: 7.99,
    description: 'Fresh vegetables with feta cheese and olives',
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
    date: createDateWithTime(2, 12, 15), // Lunch time
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '9',
    user_id: 'user-1',
    name: 'Pancakes',
    price: 8.99,
    description: 'Fluffy pancakes with maple syrup',
    image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
    date: createDateWithTime(2, 9, 0), // Breakfast time
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Entries without price
  {
    id: '10',
    user_id: 'user-1',
    name: 'Apple',
    price: undefined,
    description: 'Fresh red apple',
    image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
    date: createDateWithTime(3, 15, 30), // Snack time
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '11',
    user_id: 'user-1',
    name: 'Banana',
    price: undefined,
    description: undefined,
    image_url: undefined,
    date: createDateWithTime(3, 10, 0), // Snack time
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Entry with only name and date
  {
    id: '12',
    user_id: 'user-1',
    name: 'Coffee',
    price: undefined,
    description: undefined,
    image_url: undefined,
    date: createDateWithTime(3, 7, 45), // Breakfast time
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Entry with price but no description or image
  {
    id: '13',
    user_id: 'user-1',
    name: 'Sandwich',
    price: 6.50,
    description: undefined,
    image_url: undefined,
    date: createDateWithTime(4, 12, 30), // Lunch time
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Entry with description but no price or image
  {
    id: '14',
    user_id: 'user-1',
    name: 'Homemade Soup',
    price: undefined,
    description: 'Chicken noodle soup made from scratch',
    image_url: undefined,
    date: createDateWithTime(4, 18, 0), // Dinner time
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Entry with image but no price or description
  {
    id: '15',
    user_id: 'user-1',
    name: 'Ice Cream',
    price: undefined,
    description: undefined,
    image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    date: createDateWithTime(4, 21, 0), // Snack time
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Simple entry with just name
  {
    id: '16',
    user_id: 'user-1',
    name: 'Water',
    price: undefined,
    description: undefined,
    image_url: undefined,
    date: createDateWithTime(5, 8, 0), // Breakfast time
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const mockFoodTrackerApi = {
  // Get food entries with filtering and pagination
  async getFoodEntries(filters: FoodEntriesFilters = {}): Promise<FoodEntriesResponse> {
    const { page = 1, limit = 20, search, start_date, end_date, min_price, max_price } = filters
    
    let filteredEntries = [...mockFoodEntries]
    
    // Apply search filter
    if (search) {
      filteredEntries = filteredEntries.filter(entry => 
        entry.name.toLowerCase().includes(search.toLowerCase()) ||
        entry.description?.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // Apply date range filter
    if (start_date) {
      filteredEntries = filteredEntries.filter(entry => 
        new Date(entry.date) >= new Date(start_date)
      )
    }
    if (end_date) {
      filteredEntries = filteredEntries.filter(entry => 
        new Date(entry.date) <= new Date(end_date)
      )
    }
    
    // Apply price range filter
    if (min_price !== undefined) {
      filteredEntries = filteredEntries.filter(entry => 
        entry.price !== undefined && entry.price >= min_price
      )
    }
    if (max_price !== undefined) {
      filteredEntries = filteredEntries.filter(entry => 
        entry.price !== undefined && entry.price <= max_price
      )
    }
    
    const total = filteredEntries.length
    const pages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex)
    
    return {
      entries: paginatedEntries,
      total,
      page,
      limit,
      pages
    }
  },
  
  // Get a specific food entry
  async getFoodEntry(id: string): Promise<FoodEntry> {
    const entry = mockFoodEntries.find(e => e.id === id)
    if (!entry) {
      throw new Error(`Food entry with ID ${id} not found`)
    }
    return entry
  },
  
  // Create a new food entry
  async createFoodEntry(data: FoodEntryCreate): Promise<FoodEntry> {
    const newEntry: FoodEntry = {
      id: generateId(),
      user_id: 'user-1',
      name: data.name,
      price: data.price,
      description: data.description,
      image_url: data.image_url,
      date: data.date || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    mockFoodEntries.unshift(newEntry) // Add to beginning of array
    return newEntry
  },
  
  // Update an existing food entry
  async updateFoodEntry(id: string, data: FoodEntryUpdate): Promise<FoodEntry> {
    const index = mockFoodEntries.findIndex(e => e.id === id)
    if (index === -1) {
      throw new Error(`Food entry with ID ${id} not found`)
    }
    
    const updatedEntry = {
      ...mockFoodEntries[index],
      ...data,
      updated_at: new Date().toISOString()
    }
    
    mockFoodEntries[index] = updatedEntry
    return updatedEntry
  },
  
  // Delete a food entry
  async deleteFoodEntry(id: string): Promise<void> {
    const index = mockFoodEntries.findIndex(e => e.id === id)
    if (index === -1) {
      throw new Error(`Food entry with ID ${id} not found`)
    }
    
    mockFoodEntries.splice(index, 1)
  },
  
  // Get food summary
  async getFoodSummary(start_date?: string, end_date?: string): Promise<FoodSummaryResponse> {
    let filteredEntries = [...mockFoodEntries]
    
    // Apply date range filter
    if (start_date) {
      filteredEntries = filteredEntries.filter(entry => 
        new Date(entry.date) >= new Date(start_date)
      )
    }
    if (end_date) {
      filteredEntries = filteredEntries.filter(entry => 
        new Date(entry.date) <= new Date(end_date)
      )
    }
    
    const total_entries = filteredEntries.length
    const total_spent = filteredEntries.reduce((sum, entry) => sum + (entry.price || 0), 0)
    const average_price = total_entries > 0 ? total_spent / total_entries : 0
    
    // Group entries by date
    const entries_by_date: Record<string, number> = {}
    filteredEntries.forEach(entry => {
      const dateStr = new Date(entry.date).toISOString().split('T')[0]
      entries_by_date[dateStr] = (entries_by_date[dateStr] || 0) + 1
    })
    
    return {
      total_entries,
      total_spent,
      average_price,
      entries_by_date
    }
  }
} 