import { foodPlannerApi } from './api'
import { MealType, FoodEntry, FoodEntryCreate, FoodEntryUpdate } from './types'

// Mock fetch globally
global.fetch = jest.fn()

// Mock data
const mockMealTypes: MealType[] = [
  {
    id: "breakfast",
    name: "Breakfast",
    emoji: "🌅",
    time: "08:00",
    created_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "lunch",
    name: "Lunch",
    emoji: "🍕",
    time: "12:00",
    created_at: "2024-12-01T10:00:00Z"
  }
]

const mockFoodEntries: FoodEntry[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Oatmeal with berries",
    category: "planned",
    meal_type_id: "breakfast",
    time: "08:00",
    date: "2024-12-01",
    comment: "Healthy start to the day",
    image: undefined,
    followed_plan: undefined,
    symptoms: [],
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z",
    meal_type: mockMealTypes[0]
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440001",
    name: "Grilled chicken salad",
    category: "eaten",
    meal_type_id: "lunch",
    time: "12:30",
    date: "2024-12-01",
    comment: "Felt great after this meal",
    image: "/static/uploads/food/salad.jpg",
    followed_plan: true,
    symptoms: ["energy", "satisfied"],
    created_at: "2024-12-01T15:30:00Z",
    updated_at: "2024-12-01T15:30:00Z",
    meal_type: mockMealTypes[1]
  }
]

describe('foodPlannerApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getMealTypes', () => {
    it('should return all available meal types', async () => {
      const mockResponse = { meal_types: mockMealTypes }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await foodPlannerApi.getMealTypes()
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/food-planner/meal-types', { headers: { 'Content-Type': 'application/json' } })
    })
  })

  describe('getFoodEntries', () => {
    it('should return all entries when no filters are applied', async () => {
      const mockResponse = { entries: mockFoodEntries, meta: { total: 2, page: 1, limit: 20, pages: 1 } }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await foodPlannerApi.getFoodEntries()
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/food-planner/entries', { headers: { 'Content-Type': 'application/json' } })
    })

    it('should filter entries by search term', async () => {
      const mockResponse = { entries: [mockFoodEntries[0]], meta: { total: 1, page: 1, limit: 20, pages: 1 } }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await foodPlannerApi.getFoodEntries({ search: 'oatmeal' })
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/food-planner/entries?search=oatmeal', { headers: { 'Content-Type': 'application/json' } })
    })

    it('should filter entries by category', async () => {
      const mockResponse = { entries: [mockFoodEntries[0]], meta: { total: 1, page: 1, limit: 20, pages: 1 } }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await foodPlannerApi.getFoodEntries({ category: 'planned' })
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/food-planner/entries?category=planned', { headers: { 'Content-Type': 'application/json' } })
    })

    it('should filter entries by meal type', async () => {
      const mockResponse = { entries: [mockFoodEntries[0]], meta: { total: 1, page: 1, limit: 20, pages: 1 } }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await foodPlannerApi.getFoodEntries({ meal_type: 'breakfast' })
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/food-planner/entries?meal_type=breakfast', { headers: { 'Content-Type': 'application/json' } })
    })

    it('should apply pagination correctly', async () => {
      const mockResponse = { entries: [mockFoodEntries[0]], meta: { total: 2, page: 1, limit: 1, pages: 2 } }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await foodPlannerApi.getFoodEntries({ page: 1, limit: 1 })
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/food-planner/entries?page=1&limit=1', { headers: { 'Content-Type': 'application/json' } })
    })
  })

  describe('getFoodEntry', () => {
    it('should return a specific entry by ID', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFoodEntries[0]
      })

      const result = await foodPlannerApi.getFoodEntry('550e8400-e29b-41d4-a716-446655440000')
      expect(result).toEqual(mockFoodEntries[0])
      expect(fetch).toHaveBeenCalledWith('/api/food-planner/entries/550e8400-e29b-41d4-a716-446655440000', { headers: { 'Content-Type': 'application/json' } })
    })

    it('should throw error for non-existent entry', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      const promise = foodPlannerApi.getFoodEntry('non-existent-id')
      await expect(promise).rejects.toThrow('Food entry not found')
    })
  })

  describe('createFoodEntry', () => {
    it('should create a new food entry', async () => {
      const newEntry: FoodEntryCreate = {
        name: 'New Meal',
        category: 'planned',
        meal_type_id: 'breakfast',
        time: '08:00',
        date: '2024-12-01'
      }

      const createdEntry: FoodEntry = {
        id: 'new-id',
        ...newEntry,
        comment: undefined,
        image: undefined,
        followed_plan: undefined,
        symptoms: [],
        created_at: '2024-12-01T10:00:00Z',
        updated_at: '2024-12-01T10:00:00Z',
        meal_type: mockMealTypes[0]
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => createdEntry
      })

      const result = await foodPlannerApi.createFoodEntry(newEntry)
      expect(result).toEqual(createdEntry)
      expect(fetch).toHaveBeenCalledWith('/api/food-planner/entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newEntry) })
    })
  })

  describe('updateFoodEntry', () => {
    it('should update an existing food entry', async () => {
      const updateData: FoodEntryUpdate = {
        name: 'Updated Meal',
        comment: 'Updated comment'
      }

      const updatedEntry: FoodEntry = {
        ...mockFoodEntries[0],
        ...updateData,
        updated_at: '2024-12-01T11:00:00Z'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedEntry
      })

      const result = await foodPlannerApi.updateFoodEntry('550e8400-e29b-41d4-a716-446655440000', updateData)
      expect(result).toEqual(updatedEntry)
      expect(fetch).toHaveBeenCalledWith('/api/food-planner/entries/550e8400-e29b-41d4-a716-446655440000', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updateData) })
    })

    it('should throw error for non-existent entry', async () => {
      const updateData: FoodEntryUpdate = {
        name: 'Updated Meal'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      const promise = foodPlannerApi.updateFoodEntry('non-existent-id', updateData)
      await expect(promise).rejects.toThrow('Failed to update food entry')
    })
  })

  describe('deleteFoodEntry', () => {
    it('should delete an existing food entry', async () => {
      const deleteResponse = { message: 'Food entry deleted successfully' }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => deleteResponse
      })

      const result = await foodPlannerApi.deleteFoodEntry('550e8400-e29b-41d4-a716-446655440000')
      expect(result).toEqual(deleteResponse)
      expect(fetch).toHaveBeenCalledWith('/api/food-planner/entries/550e8400-e29b-41d4-a716-446655440000', { method: 'DELETE', headers: { 'Content-Type': 'application/json' } })
    })

    it('should throw error for non-existent entry', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      const promise = foodPlannerApi.deleteFoodEntry('non-existent-id')
      await expect(promise).rejects.toThrow('Failed to delete food entry')
    })
  })

  describe('getFoodSummary', () => {
    it('should return food summary without date range', async () => {
      const mockResponse = {
        planned_count: 1,
        eaten_count: 1,
        followed_plan_count: 1,
        off_plan_count: 0
      }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await foodPlannerApi.getFoodSummary()
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/food-planner/entries/summary', { headers: { 'Content-Type': 'application/json' } })
    })

    it('should return food summary with date range', async () => {
      const mockResponse = {
        planned_count: 1,
        eaten_count: 1,
        followed_plan_count: 1,
        off_plan_count: 0
      }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await foodPlannerApi.getFoodSummary({
        start_date: '2024-12-01',
        end_date: '2024-12-31'
      })
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/food-planner/entries/summary?start_date=2024-12-01&end_date=2024-12-31', { headers: { 'Content-Type': 'application/json' } })
    })
  })

  describe('getCalendarData', () => {
    it('should return calendar data without date range', async () => {
      const mockResponse = {
        days: [
          {
            date: '2024-12-01',
            planned_count: 1,
            eaten_count: 1,
            followed_plan: true
          }
        ]
      }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await foodPlannerApi.getCalendarData()
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/food-planner/entries/calendar', { headers: { 'Content-Type': 'application/json' } })
    })

    it('should return calendar data with date range', async () => {
      const mockResponse = {
        days: [
          {
            date: '2024-12-01',
            planned_count: 1,
            eaten_count: 1,
            followed_plan: true
          }
        ]
      }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await foodPlannerApi.getCalendarData({
        start_date: '2024-12-01',
        end_date: '2024-12-31'
      })
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/food-planner/entries/calendar?start_date=2024-12-01&end_date=2024-12-31', { headers: { 'Content-Type': 'application/json' } })
    })
  })

  describe('uploadFoodImage', () => {
    it('should upload a valid image file', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const uploadResponse = { url: '/static/uploads/food/test.jpg' }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => uploadResponse
      })

      const result = await foodPlannerApi.uploadFoodImage(file)
      expect(result).toEqual(uploadResponse)
      expect(fetch).toHaveBeenCalledWith('/api/food-planner/upload-food-image', { method: 'POST', headers: {}, body: expect.any(FormData) })
    })

    it('should reject invalid file types', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid file type. Only JPG, PNG, and GIF are supported.' })
      })

      const promise = foodPlannerApi.uploadFoodImage(file)
      await expect(promise).rejects.toThrow('Invalid file type. Only JPG, PNG, and GIF are supported.')
    })

    it('should reject files that are too large', async () => {
      const file = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'File too large. Maximum size is 5MB.' })
      })

      const promise = foodPlannerApi.uploadFoodImage(file)
      await expect(promise).rejects.toThrow('File too large. Maximum size is 5MB.')
    })
  })
}) 