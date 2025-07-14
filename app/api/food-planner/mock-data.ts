import { MealType, FoodEntry } from '@/app/food-planner/atoms/types'

// Mock meal types for non-authenticated users
export const mockMealTypes: MealType[] = [
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
  },
  {
    id: "dinner",
    name: "Dinner",
    emoji: "🍽️",
    time: "18:00",
    created_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "snack",
    name: "Snack",
    emoji: "☕",
    time: "15:00",
    created_at: "2024-12-01T10:00:00Z"
  }
]

// Mock food entries for non-authenticated users
export const mockFoodEntries: FoodEntry[] = [
  {
    id: "demo-1",
    name: "Oatmeal with berries",
    category: "planned",
    meal_type_id: "breakfast",
    time: "08:00",
    date: "2024-12-01",
    comment: "Healthy start to the day with fresh berries",
    image: undefined,
    followed_plan: undefined,
    symptoms: [],
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z",
    meal_type: mockMealTypes[0]
  },
  {
    id: "demo-2",
    name: "Grilled chicken salad",
    category: "eaten",
    meal_type_id: "lunch",
    time: "12:30",
    date: "2024-12-01",
    comment: "Felt great after this meal, very satisfying",
    image: undefined,
    followed_plan: true,
    symptoms: ["energy", "satisfied"],
    created_at: "2024-12-01T15:30:00Z",
    updated_at: "2024-12-01T15:30:00Z",
    meal_type: mockMealTypes[1]
  },
  {
    id: "demo-3",
    name: "Pasta with tomato sauce",
    category: "eaten",
    meal_type_id: "dinner",
    time: "19:00",
    date: "2024-12-01",
    comment: "Comfort food after a long day",
    image: undefined,
    followed_plan: false,
    symptoms: ["full", "comforted"],
    created_at: "2024-12-01T20:00:00Z",
    updated_at: "2024-12-01T20:00:00Z",
    meal_type: mockMealTypes[2]
  },
  {
    id: "demo-4",
    name: "Greek yogurt with honey",
    category: "planned",
    meal_type_id: "snack",
    time: "15:00",
    date: "2024-12-02",
    comment: "Protein-rich afternoon snack",
    image: undefined,
    followed_plan: undefined,
    symptoms: [],
    created_at: "2024-12-02T09:00:00Z",
    updated_at: "2024-12-02T09:00:00Z",
    meal_type: mockMealTypes[3]
  },
  {
    id: "demo-5",
    name: "Avocado toast",
    category: "eaten",
    meal_type_id: "breakfast",
    time: "08:15",
    date: "2024-12-02",
    comment: "Quick and nutritious breakfast",
    image: undefined,
    followed_plan: true,
    symptoms: ["satisfied", "energized"],
    created_at: "2024-12-02T08:30:00Z",
    updated_at: "2024-12-02T08:30:00Z",
    meal_type: mockMealTypes[0]
  },
  {
    id: "demo-6",
    name: "Quinoa bowl with vegetables",
    category: "planned",
    meal_type_id: "lunch",
    time: "12:00",
    date: "2024-12-02",
    comment: "High-protein vegetarian option",
    image: undefined,
    followed_plan: undefined,
    symptoms: [],
    created_at: "2024-12-02T10:00:00Z",
    updated_at: "2024-12-02T10:00:00Z",
    meal_type: mockMealTypes[1]
  },
  {
    id: "demo-7",
    name: "Salmon with roasted vegetables",
    category: "eaten",
    meal_type_id: "dinner",
    time: "18:30",
    date: "2024-12-02",
    comment: "Omega-3 rich dinner, felt very healthy",
    image: undefined,
    followed_plan: true,
    symptoms: ["satisfied", "healthy"],
    created_at: "2024-12-02T19:00:00Z",
    updated_at: "2024-12-02T19:00:00Z",
    meal_type: mockMealTypes[2]
  },
  {
    id: "demo-8",
    name: "Mixed nuts and dried fruits",
    category: "eaten",
    meal_type_id: "snack",
    time: "15:30",
    date: "2024-12-02",
    comment: "Natural energy boost",
    image: undefined,
    followed_plan: true,
    symptoms: ["energized"],
    created_at: "2024-12-02T15:45:00Z",
    updated_at: "2024-12-02T15:45:00Z",
    meal_type: mockMealTypes[3]
  },
  {
    id: "demo-9",
    name: "Smoothie bowl",
    category: "planned",
    meal_type_id: "breakfast",
    time: "08:00",
    date: "2024-12-03",
    comment: "Refreshing start with tropical fruits",
    image: undefined,
    followed_plan: undefined,
    symptoms: [],
    created_at: "2024-12-03T07:00:00Z",
    updated_at: "2024-12-03T07:00:00Z",
    meal_type: mockMealTypes[0]
  },
  {
    id: "demo-10",
    name: "Chicken stir-fry",
    category: "planned",
    meal_type_id: "dinner",
    time: "19:00",
    date: "2024-12-03",
    comment: "Quick and healthy dinner option",
    image: undefined,
    followed_plan: undefined,
    symptoms: [],
    created_at: "2024-12-03T16:00:00Z",
    updated_at: "2024-12-03T16:00:00Z",
    meal_type: mockMealTypes[2]
  }
]

// Generate UUID for new entries
export const generateId = () => {
  return 'demo-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
} 