import { Idea, Category } from '@/app/ideas/atoms/types'

// Mock categories for non-authenticated users
export const mockCategories: Category[] = [
  {
    id: "tech",
    name: "Technology",
    emoji: "💻",
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "business",
    name: "Business",
    emoji: "💼",
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "education",
    name: "Education",
    emoji: "📚",
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "health",
    name: "Health",
    emoji: "🏥",
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "agriculture",
    name: "Agriculture",
    emoji: "🌾",
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "finance",
    name: "Finance",
    emoji: "💰",
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "community",
    name: "Community",
    emoji: "🤝",
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "transportation",
    name: "Transportation",
    emoji: "🚗",
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "consumer",
    name: "Consumer Goods",
    emoji: "🛍️",
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  }
]

// Mock ideas for non-authenticated users
export const mockIdeas: Idea[] = [
  {
    id: "demo-idea-1",
    title: "Smart Home Energy Monitor",
    description: "A device that tracks energy usage in real-time and provides insights to reduce electricity bills. Integrates with smart plugs and provides mobile notifications for unusual usage patterns.",
    category_id: "tech",
    tags: ["IoT", "Energy", "Smart Home"],
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "demo-idea-2",
    title: "Local Food Delivery App",
    description: "A platform connecting local farmers with consumers for fresh produce delivery. Features include seasonal availability, organic certification, and direct farm-to-table traceability.",
    category_id: "business",
    tags: ["Food", "Local Business", "Sustainability"],
    created_at: "2024-12-01T11:00:00Z",
    updated_at: "2024-12-01T11:00:00Z"
  },
  {
    id: "demo-idea-3",
    title: "Language Learning Game",
    description: "An interactive mobile game that teaches languages through storytelling and role-playing. Uses AI to adapt difficulty and provides real-time pronunciation feedback.",
    category_id: "education",
    tags: ["Education", "Gaming", "AI"],
    created_at: "2024-12-01T12:00:00Z",
    updated_at: "2024-12-02T15:30:00Z"
  },
  {
    id: "demo-idea-4",
    title: "Sustainable Fashion Marketplace",
    description: "An online marketplace for eco-friendly and ethically produced clothing. Features include carbon footprint tracking, fair trade certification, and circular fashion initiatives.",
    category_id: "business",
    tags: ["Fashion", "Sustainability", "E-commerce"],
    created_at: "2024-12-01T13:00:00Z",
    updated_at: "2024-12-01T13:00:00Z"
  },
  {
    id: "demo-idea-5",
    title: "Mental Health Chatbot",
    description: "An AI-powered chatbot that provides mental health support and resources. Offers mood tracking, breathing exercises, and connects users with professional help when needed.",
    category_id: "health",
    tags: ["Mental Health", "AI", "Wellness"],
    created_at: "2024-12-01T14:00:00Z",
    updated_at: "2024-12-01T14:00:00Z"
  },
  {
    id: "demo-idea-6",
    title: "Urban Vertical Farm",
    description: "A modular vertical farming system for urban environments. Uses hydroponics and LED lighting to grow fresh vegetables year-round in small spaces like apartments and offices.",
    category_id: "agriculture",
    tags: ["Agriculture", "Urban", "Sustainability"],
    created_at: "2024-12-01T15:00:00Z",
    updated_at: "2024-12-01T15:00:00Z"
  },
  {
    id: "demo-idea-7",
    title: "Personal Finance Dashboard",
    description: "A comprehensive financial management tool that aggregates all accounts, tracks spending patterns, and provides personalized saving and investment recommendations.",
    category_id: "finance",
    tags: ["Finance", "Analytics", "Personal"],
    created_at: "2024-12-01T16:00:00Z",
    updated_at: "2024-12-03T10:00:00Z"
  },
  {
    id: "demo-idea-8",
    title: "Community Skill Sharing Platform",
    description: "A platform where people can teach and learn skills from their neighbors. Features include skill matching, scheduling, and a rating system for quality assurance.",
    category_id: "community",
    tags: ["Community", "Education", "Sharing Economy"],
    created_at: "2024-12-01T17:00:00Z",
    updated_at: "2024-12-01T17:00:00Z"
  },
  {
    id: "demo-idea-9",
    title: "Smart Parking Solution",
    description: "A sensor-based parking system that helps drivers find available spots quickly. Integrates with mobile apps and provides real-time parking availability and navigation.",
    category_id: "transportation",
    tags: ["Transportation", "IoT", "Smart City"],
    created_at: "2024-12-01T18:00:00Z",
    updated_at: "2024-12-01T18:00:00Z"
  },
  {
    id: "demo-idea-10",
    title: "Eco-Friendly Cleaning Products",
    description: "A line of biodegradable and non-toxic cleaning products made from natural ingredients. Focuses on reducing plastic waste and harmful chemicals in households.",
    category_id: "consumer",
    tags: ["Cleaning", "Eco-friendly", "Consumer Goods"],
    created_at: "2024-12-01T19:00:00Z",
    updated_at: "2024-12-01T19:00:00Z"
  }
]

// Generate UUID for new ideas
export const generateId = () => {
  return 'demo-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
} 