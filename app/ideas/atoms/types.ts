export interface Category {
  id: string
  name: string
  emoji: string
}

export interface Idea {
  id: string
  title: string
  description?: string
  category: string
  tags?: string[]
  createdAt: Date
} 