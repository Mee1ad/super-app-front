import { Mood, DiaryEntry } from '@/app/diary/atoms/types'

// Mock moods for non-authenticated users
export const mockMoods: Mood[] = [
  {
    id: "happy",
    name: "Happy",
    emoji: "😊",
    color: "#4CAF50",
    created_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "sad",
    name: "Sad",
    emoji: "😢",
    color: "#2196F3",
    created_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "angry",
    name: "Angry",
    emoji: "😠",
    color: "#F44336",
    created_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "calm",
    name: "Calm",
    emoji: "😌",
    color: "#9C27B0",
    created_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "excited",
    name: "Excited",
    emoji: "🤩",
    color: "#FF9800",
    created_at: "2024-12-01T10:00:00Z"
  }
]

// Mock diary entries for non-authenticated users
export const mockDiaryEntries: DiaryEntry[] = [
  {
    id: "demo-1",
    title: "My First Entry",
    content: "Today was a great day! I started my new project and everything went smoothly. The team was supportive and I feel really motivated about what we're building.",
    mood: "happy",
    date: "2024-12-01",
    images: [],
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "demo-2",
    title: "Reflection Time",
    content: "Feeling a bit down today. Work was challenging and I didn't get as much done as I hoped. But I'm trying to stay positive and focus on tomorrow.",
    mood: "sad",
    date: "2024-12-02",
    images: [],
    created_at: "2024-12-02T15:30:00Z",
    updated_at: "2024-12-02T15:30:00Z"
  },
  {
    id: "demo-3",
    title: "Frustrated with Technology",
    content: "My computer crashed three times today while working on an important project. Lost some progress and feeling really frustrated with technology right now.",
    mood: "angry",
    date: "2024-12-03",
    images: [],
    created_at: "2024-12-03T14:20:00Z",
    updated_at: "2024-12-03T14:20:00Z"
  },
  {
    id: "demo-4",
    title: "Peaceful Evening",
    content: "Spent the evening reading a good book and listening to calming music. The sunset was beautiful and I feel really at peace right now.",
    mood: "calm",
    date: "2024-12-04",
    images: [],
    created_at: "2024-12-04T19:45:00Z",
    updated_at: "2024-12-04T19:45:00Z"
  },
  {
    id: "demo-5",
    title: "Big News!",
    content: "I got the job offer I've been waiting for! This is exactly what I wanted and I'm so excited to start this new chapter in my career.",
    mood: "excited",
    date: "2024-12-05",
    images: [],
    created_at: "2024-12-05T11:15:00Z",
    updated_at: "2024-12-05T11:15:00Z"
  },
  {
    id: "demo-6",
    title: "Weekend Plans",
    content: "Planning a fun weekend with friends. We're going hiking and then having a barbecue. I'm really looking forward to spending time outdoors.",
    mood: "happy",
    date: "2024-12-06",
    images: [],
    created_at: "2024-12-06T09:30:00Z",
    updated_at: "2024-12-06T09:30:00Z"
  },
  {
    id: "demo-7",
    title: "Learning Something New",
    content: "Started learning a new programming language today. It's challenging but exciting. I love the feeling of expanding my skills.",
    mood: "excited",
    date: "2024-12-07",
    images: [],
    created_at: "2024-12-07T16:00:00Z",
    updated_at: "2024-12-07T16:00:00Z"
  },
  {
    id: "demo-8",
    title: "Missing Home",
    content: "Feeling homesick today. It's been a while since I've seen my family. Planning to call them this weekend and maybe plan a visit soon.",
    mood: "sad",
    date: "2024-12-08",
    images: [],
    created_at: "2024-12-08T20:10:00Z",
    updated_at: "2024-12-08T20:10:00Z"
  },
  {
    id: "demo-9",
    title: "Meditation Session",
    content: "Had a great meditation session this morning. I'm trying to make it a daily habit. It really helps me start the day with a clear mind.",
    mood: "calm",
    date: "2024-12-09",
    images: [],
    created_at: "2024-12-09T07:00:00Z",
    updated_at: "2024-12-09T07:00:00Z"
  },
  {
    id: "demo-10",
    title: "Traffic Rage",
    content: "Stuck in traffic for over an hour today. People were driving so recklessly and I was late for an important meeting. Completely ruined my mood.",
    mood: "angry",
    date: "2024-12-10",
    images: [],
    created_at: "2024-12-10T08:45:00Z",
    updated_at: "2024-12-10T08:45:00Z"
  }
]

// Generate UUID for new entries
export const generateId = () => {
  return 'demo-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
} 