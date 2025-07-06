export interface Mood {
  id: string
  name: string
  emoji: string
  color: string
}

export interface DiaryEntry {
  id: string
  title: string
  content: string
  mood: string
  date: Date
  images: string[]
}

export interface ImageFile {
  id: string
  name: string
  url: string
  size: number
} 