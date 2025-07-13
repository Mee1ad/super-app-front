// Meal Type Types
export interface MealType {
  id: string
  name: string
  emoji: string
  time: string
  created_at: string
}

export interface MealTypesResponse {
  meal_types: MealType[]
}

// Food Entry Types
export interface FoodEntry {
  id: string
  name: string
  category: 'planned' | 'eaten'
  meal_type_id: string
  time: string
  date: string
  comment?: string
  image?: string
  followed_plan?: boolean
  symptoms: string[]
  created_at: string
  updated_at: string
  meal_type: MealType
}

export interface FoodEntryCreate {
  name: string
  category: 'planned' | 'eaten'
  meal_type_id: string
  time: string
  date: string
  comment?: string
  image?: string
  followed_plan?: boolean
  symptoms?: string[]
}

export interface FoodEntryUpdate {
  name?: string
  category?: 'planned' | 'eaten'
  meal_type_id?: string
  time?: string
  date?: string
  comment?: string
  image?: string
  followed_plan?: boolean
  symptoms?: string[]
}

export interface FoodEntryResponse {
  id: string
  name: string
  category: 'planned' | 'eaten'
  meal_type_id: string
  time: string
  date: string
  comment?: string
  image?: string
  followed_plan?: boolean
  symptoms: string[]
  created_at: string
  updated_at: string
  meal_type: MealType
}

// Response Types
export interface FoodEntriesResponse {
  entries: FoodEntry[]
  meta: PaginationMeta
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  pages: number
}

// Summary Types
export interface FoodSummaryResponse {
  planned_count: number
  eaten_count: number
  followed_plan_count: number
  off_plan_count: number
}

export interface DaySummary {
  date: string
  planned_count: number
  eaten_count: number
  followed_plan: boolean
}

export interface CalendarResponse {
  days: DaySummary[]
}

// Image Upload Types
export interface ImageUploadResponse {
  url: string
} 