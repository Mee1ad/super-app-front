import { MealType, FoodEntry } from '@/app/food-planner/atoms/types'

// Shared in-memory storage for all food planner API routes
export const mealTypes: MealType[] = [
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

export let foodEntries: FoodEntry[] = [
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
    meal_type: mealTypes[0]
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
    meal_type: mealTypes[1]
  }
]

// Generate UUID
export const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
} 