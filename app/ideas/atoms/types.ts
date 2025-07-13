export interface Category {
  id: string
  name: string
  emoji: string
  created_at: string
  updated_at: string
}

export interface Idea {
  id: string
  title: string
  description?: string
  category_id: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface IdeaCreate {
  title: string
  description?: string
  category: string
  tags?: string[]
}

export interface IdeaUpdate {
  title?: string
  description?: string
  category?: string
  tags?: string[]
}

export interface CategoriesResponse {
  categories: Category[]
}

export interface IdeasResponse {
  ideas: Idea[]
  meta: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface DeleteResponse {
  message: string
} 