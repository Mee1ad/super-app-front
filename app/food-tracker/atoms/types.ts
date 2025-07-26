export interface FoodEntry {
  id: string;
  user_id: string;
  name: string;
  price?: number;
  description?: string;
  image_url?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface FoodEntryCreate {
  name: string;
  price?: number;
  description?: string;
  image_url?: string;
  date?: string;
}

export interface FoodEntryUpdate {
  name?: string;
  price?: number;
  description?: string;
  image_url?: string;
  date?: string;
}

export interface FoodEntriesResponse {
  entries: FoodEntry[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface FoodSummaryResponse {
  total_entries: number;
  total_spent: number;
  average_price: number;
  entries_by_date: Record<string, number>;
}

export interface FoodEntriesFilters {
  page?: number;
  limit?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  min_price?: number;
  max_price?: number;
} 