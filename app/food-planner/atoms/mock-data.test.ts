import { mockFoodPlannerApi } from './mock-data'

describe('mockFoodPlannerApi', () => {
  beforeEach(() => {
    // Reset any global state if needed
  })

  describe('getMealTypes', () => {
    it('should return mock meal types', async () => {
      const result = await mockFoodPlannerApi.getMealTypes()
      expect(result.meal_types).toHaveLength(4)
      expect(result.meal_types[0].name).toBe('Breakfast')
      expect(result.meal_types[1].name).toBe('Lunch')
      expect(result.meal_types[2].name).toBe('Dinner')
      expect(result.meal_types[3].name).toBe('Snack')
    })
  })

  describe('getFoodEntries', () => {
    it('should return mock food entries', async () => {
      const result = await mockFoodPlannerApi.getFoodEntries()
      expect(result.entries).toHaveLength(10)
      expect(result.meta.total).toBe(10)
      expect(result.meta.page).toBe(1)
      expect(result.meta.limit).toBe(10)
    })

    it('should filter by category', async () => {
      const result = await mockFoodPlannerApi.getFoodEntries({ category: 'planned' })
      expect(result.entries.every(entry => entry.category === 'planned')).toBe(true)
    })

    it('should filter by meal type', async () => {
      const result = await mockFoodPlannerApi.getFoodEntries({ meal_type: 'breakfast' })
      expect(result.entries.every(entry => entry.meal_type_id === 'breakfast')).toBe(true)
    })
  })

  describe('getFoodSummary', () => {
    it('should return summary without date range', async () => {
      const result = await mockFoodPlannerApi.getFoodSummary()
      expect(result).toHaveProperty('planned_count')
      expect(result).toHaveProperty('eaten_count')
      expect(result).toHaveProperty('followed_plan_count')
      expect(result).toHaveProperty('off_plan_count')
      expect(typeof result.planned_count).toBe('number')
      expect(typeof result.eaten_count).toBe('number')
      expect(typeof result.followed_plan_count).toBe('number')
      expect(typeof result.off_plan_count).toBe('number')
    })

    it('should return summary with date range', async () => {
      const result = await mockFoodPlannerApi.getFoodSummary({
        start_date: '2024-12-01',
        end_date: '2024-12-02'
      })
      expect(result).toHaveProperty('planned_count')
      expect(result).toHaveProperty('eaten_count')
      expect(result).toHaveProperty('followed_plan_count')
      expect(result).toHaveProperty('off_plan_count')
    })

    it('should calculate correct summary counts', async () => {
      const result = await mockFoodPlannerApi.getFoodSummary()
      
      // Based on the mock data, we should have some planned and eaten meals
      expect(result.planned_count).toBeGreaterThan(0)
      expect(result.eaten_count).toBeGreaterThan(0)
      
      // The followed_plan_count should be less than or equal to eaten_count
      expect(result.followed_plan_count).toBeLessThanOrEqual(result.eaten_count)
      
      // The off_plan_count should be less than or equal to eaten_count
      expect(result.off_plan_count).toBeLessThanOrEqual(result.eaten_count)
    })
  })

  describe('getCalendarData', () => {
    it('should return calendar data', async () => {
      const result = await mockFoodPlannerApi.getCalendarData()
      expect(result).toHaveProperty('days')
      expect(Array.isArray(result.days)).toBe(true)
    })

    it('should return calendar data with date range', async () => {
      const result = await mockFoodPlannerApi.getCalendarData({
        start_date: '2024-12-01',
        end_date: '2024-12-03'
      })
      expect(result).toHaveProperty('days')
      expect(Array.isArray(result.days)).toBe(true)
    })
  })

  describe('createFoodEntry', () => {
    it('should create a new food entry', async () => {
      const newEntry = {
        name: 'Test Meal',
        category: 'planned' as const,
        meal_type_id: 'breakfast',
        time: '08:00',
        date: '2024-12-03',
        comment: 'Test comment'
      }

      const result = await mockFoodPlannerApi.createFoodEntry(newEntry)
      expect(result.name).toBe('Test Meal')
      expect(result.category).toBe('planned')
      expect(result.meal_type_id).toBe('breakfast')
      expect(result.id).toBeDefined()
      expect(result.created_at).toBeDefined()
      expect(result.updated_at).toBeDefined()
    })
  })

  describe('updateFoodEntry', () => {
    it('should update an existing food entry', async () => {
      // First create an entry
      const newEntry = {
        name: 'Original Meal',
        category: 'planned' as const,
        meal_type_id: 'breakfast',
        time: '08:00',
        date: '2024-12-03'
      }

      const created = await mockFoodPlannerApi.createFoodEntry(newEntry)
      
      // Then update it
      const updated = await mockFoodPlannerApi.updateFoodEntry(created.id, {
        name: 'Updated Meal',
        comment: 'Updated comment'
      })

      expect(updated.name).toBe('Updated Meal')
      expect(updated.comment).toBe('Updated comment')
      expect(updated.id).toBe(created.id)
    })
  })

  describe('deleteFoodEntry', () => {
    it('should delete a food entry', async () => {
      // First create an entry
      const newEntry = {
        name: 'To Delete',
        category: 'planned' as const,
        meal_type_id: 'breakfast',
        time: '08:00',
        date: '2024-12-03'
      }

      const created = await mockFoodPlannerApi.createFoodEntry(newEntry)
      
      // Then delete it
      const result = await mockFoodPlannerApi.deleteFoodEntry(created.id)
      expect(result.message).toBe('Food entry deleted successfully')
    })
  })

  describe('uploadFoodImage', () => {
    it('should return a mock image URL', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const result = await mockFoodPlannerApi.uploadFoodImage(file)
      expect(result).toHaveProperty('url')
      expect(result.url).toContain('placeholder.com')
      expect(result.url).toContain('test.jpg')
    })
  })
}) 