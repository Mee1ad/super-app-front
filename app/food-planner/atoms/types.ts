export interface FoodEntry {
  id: string
  name: string
  category: 'planned' | 'eaten'
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  time: string
  date: Date
  image?: string
  comment?: string
  followedPlan?: boolean
  symptoms?: string[]
}

export interface MealType {
  id: string
  name: string
  emoji: string
  time: string
}

export interface DaySummary {
  date: Date
  plannedCount: number
  eatenCount: number
  followedPlan: boolean
} 