export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodEntry {
  id: string;
  name: string;
  price?: number;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  mealType: MealType;
  created_at: string;
  updated_at: string;
}

export interface FoodEntryCreate {
  name: string;
  price?: number;
  description?: string;
  date: string;
  time: string;
  mealType: MealType;
}

export interface FoodEntryUpdate {
  name?: string;
  price?: number;
  description?: string;
  date?: string;
  time?: string;
  mealType?: MealType;
}