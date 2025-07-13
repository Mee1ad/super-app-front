import { DiaryEntry } from '@/app/diary/atoms/types'

// Shared in-memory storage for all diary API routes
export let diaryEntries: DiaryEntry[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "My First Entry",
    content: "Today was a great day...",
    mood: "happy",
    date: "2024-12-01",
    images: [],
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440001",
    title: "Reflection Time",
    content: "Feeling a bit down today...",
    mood: "sad",
    date: "2024-12-02",
    images: ["/static/uploads/reflection.jpg"],
    created_at: "2024-12-02T15:30:00Z",
    updated_at: "2024-12-02T15:30:00Z"
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