export interface Mood {
  id: string
  name: string
  emoji: string
  color: string
  created_at: string
}

export interface DiaryEntry {
  id: string
  title: string
  content: string
  mood: string
  date: string
  images: string[]
  created_at: string
  updated_at: string
}

export interface DiaryEntryCreate {
  title: string
  content: string
  mood: string
  date?: string
  images?: string[]
}

export interface DiaryEntryUpdate {
  title?: string
  content?: string
  mood?: string
  date?: string
  images?: string[]
}

export interface ImageFile {
  id: string
  name: string
  url: string
  size: number
}

export interface ApiResponse<T> {
  data: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
    request_id: string
    timestamp: string
  }
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  pages: number
}

export interface DiaryEntriesResponse {
  entries: DiaryEntry[]
  meta: PaginationMeta
}

export interface MoodsResponse {
  moods: Mood[]
}

export interface ImageUploadResponse {
  url: string
} 