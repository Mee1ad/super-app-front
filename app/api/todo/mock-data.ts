import { TaskResponse, ShoppingItemResponse } from '@/app/todo/atoms/types'

// Mock tasks for non-authenticated users
export const mockTasks: TaskResponse[] = [
  {
    id: "demo-task-1",
    list_id: "demo-list-1",
    title: "Complete project presentation",
    description: "Finish the slides for the quarterly review meeting",
    checked: false,
    variant: "default",
    position: 1,
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "demo-task-2",
    list_id: "demo-list-1",
    title: "Call dentist",
    description: "Schedule annual checkup",
    checked: true,
    variant: "default",
    position: 2,
    created_at: "2024-12-01T11:00:00Z",
    updated_at: "2024-12-02T14:30:00Z"
  },
  {
    id: "demo-task-3",
    list_id: "demo-list-1",
    title: "Buy groceries",
    description: "Milk, bread, eggs, and vegetables",
    checked: false,
    variant: "default",
    position: 3,
    created_at: "2024-12-01T12:00:00Z",
    updated_at: "2024-12-01T12:00:00Z"
  },
  {
    id: "demo-task-4",
    list_id: "demo-list-1",
    title: "Read new book",
    description: "Start reading 'The Psychology of Money'",
    checked: false,
    variant: "default",
    position: 4,
    created_at: "2024-12-01T13:00:00Z",
    updated_at: "2024-12-01T13:00:00Z"
  },
  {
    id: "demo-task-5",
    list_id: "demo-list-1",
    title: "Exercise",
    description: "30 minutes cardio workout",
    checked: true,
    variant: "default",
    position: 5,
    created_at: "2024-12-01T14:00:00Z",
    updated_at: "2024-12-02T07:00:00Z"
  },
  {
    id: "demo-task-6",
    list_id: "demo-list-1",
    title: "Pay bills",
    description: "Electricity, internet, and phone bills",
    checked: false,
    variant: "default",
    position: 6,
    created_at: "2024-12-01T15:00:00Z",
    updated_at: "2024-12-01T15:00:00Z"
  },
  {
    id: "demo-task-7",
    list_id: "demo-list-1",
    title: "Plan weekend trip",
    description: "Research destinations and book accommodation",
    checked: false,
    variant: "default",
    position: 7,
    created_at: "2024-12-01T16:00:00Z",
    updated_at: "2024-12-01T16:00:00Z"
  },
  {
    id: "demo-task-8",
    list_id: "demo-list-1",
    title: "Update resume",
    description: "Add recent projects and achievements",
    checked: false,
    variant: "default",
    position: 8,
    created_at: "2024-12-01T17:00:00Z",
    updated_at: "2024-12-01T17:00:00Z"
  },
  {
    id: "demo-task-9",
    list_id: "demo-list-1",
    title: "Clean apartment",
    description: "Vacuum, dust, and organize",
    checked: true,
    variant: "default",
    position: 9,
    created_at: "2024-12-01T18:00:00Z",
    updated_at: "2024-12-01T18:00:00Z"
  },
  {
    id: "demo-task-10",
    list_id: "demo-list-1",
    title: "Learn new skill",
    description: "Start online course on data analysis",
    checked: false,
    variant: "default",
    position: 10,
    created_at: "2024-12-01T19:00:00Z",
    updated_at: "2024-12-01T19:00:00Z"
  }
]

// Mock shopping items for non-authenticated users
export const mockShoppingItems: ShoppingItemResponse[] = [
  {
    id: "demo-shopping-1",
    list_id: "demo-list-2",
    title: "Wireless Earbuds",
    url: "https://amazon.com/wireless-earbuds",
    price: "$89.99",
    source: "Amazon",
    checked: false,
    variant: "default",
    position: 1,
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "demo-shopping-2",
    list_id: "demo-list-2",
    title: "Smartphone Case",
    url: "https://bestbuy.com/smartphone-case",
    price: "$24.99",
    source: "Best Buy",
    checked: true,
    variant: "default",
    position: 2,
    created_at: "2024-12-01T11:00:00Z",
    updated_at: "2024-12-02T14:30:00Z"
  },
  {
    id: "demo-shopping-3",
    list_id: "demo-list-2",
    title: "USB-C Cable",
    url: "https://newegg.com/usb-c-cable",
    price: "$12.99",
    source: "Newegg",
    checked: false,
    variant: "default",
    position: 3,
    created_at: "2024-12-01T12:00:00Z",
    updated_at: "2024-12-01T12:00:00Z"
  },
  {
    id: "demo-shopping-4",
    list_id: "demo-list-2",
    title: "Bluetooth Speaker",
    url: "https://walmart.com/bluetooth-speaker",
    price: "$45.99",
    source: "Walmart",
    checked: false,
    variant: "default",
    position: 4,
    created_at: "2024-12-01T13:00:00Z",
    updated_at: "2024-12-01T13:00:00Z"
  },
  {
    id: "demo-shopping-5",
    list_id: "demo-list-2",
    title: "Laptop Stand",
    url: "https://amazon.com/laptop-stand",
    price: "$29.99",
    source: "Amazon",
    checked: true,
    variant: "default",
    position: 5,
    created_at: "2024-12-01T14:00:00Z",
    updated_at: "2024-12-02T07:00:00Z"
  },
  {
    id: "demo-shopping-6",
    list_id: "demo-list-2",
    title: "Mechanical Keyboard",
    url: "https://amazon.com/mechanical-keyboard",
    price: "$129.99",
    source: "Amazon",
    checked: false,
    variant: "default",
    position: 6,
    created_at: "2024-12-01T15:00:00Z",
    updated_at: "2024-12-01T15:00:00Z"
  },
  {
    id: "demo-shopping-7",
    list_id: "demo-list-2",
    title: "Webcam",
    url: "https://bestbuy.com/webcam",
    price: "$79.99",
    source: "Best Buy",
    checked: false,
    variant: "default",
    position: 7,
    created_at: "2024-12-01T16:00:00Z",
    updated_at: "2024-12-01T16:00:00Z"
  },
  {
    id: "demo-shopping-8",
    list_id: "demo-list-2",
    title: "External SSD",
    url: "https://newegg.com/external-ssd",
    price: "$89.99",
    source: "Newegg",
    checked: true,
    variant: "default",
    position: 8,
    created_at: "2024-12-01T17:00:00Z",
    updated_at: "2024-12-02T19:30:00Z"
  },
  {
    id: "demo-shopping-9",
    list_id: "demo-list-2",
    title: "Wireless Mouse",
    url: "https://amazon.com/wireless-mouse",
    price: "$34.99",
    source: "Amazon",
    checked: false,
    variant: "default",
    position: 9,
    created_at: "2024-12-01T18:00:00Z",
    updated_at: "2024-12-01T18:00:00Z"
  },
  {
    id: "demo-shopping-10",
    list_id: "demo-list-2",
    title: "Monitor Stand",
    url: "https://walmart.com/monitor-stand",
    price: "$39.99",
    source: "Walmart",
    checked: false,
    variant: "default",
    position: 10,
    created_at: "2024-12-01T19:00:00Z",
    updated_at: "2024-12-01T19:00:00Z"
  },
  {
    id: "demo-shopping-11",
    list_id: "demo-list-2",
    title: "Gaming Headset",
    url: "https://amazon.com/gaming-headset",
    price: "$149.99",
    source: "Amazon",
    checked: false,
    variant: "default",
    position: 11,
    created_at: "2024-12-01T20:00:00Z",
    updated_at: "2024-12-01T20:00:00Z"
  },
  {
    id: "demo-shopping-12",
    list_id: "demo-list-2",
    title: "Tablet Stand",
    url: "https://bestbuy.com/tablet-stand",
    price: "$19.99",
    source: "Best Buy",
    checked: true,
    variant: "default",
    position: 12,
    created_at: "2024-12-01T21:00:00Z",
    updated_at: "2024-12-02T10:15:00Z"
  },
  {
    id: "demo-shopping-13",
    list_id: "demo-list-2",
    title: "Power Bank",
    url: "https://newegg.com/power-bank",
    price: "$49.99",
    source: "Newegg",
    checked: false,
    variant: "default",
    position: 13,
    created_at: "2024-12-01T22:00:00Z",
    updated_at: "2024-12-01T22:00:00Z"
  },
  {
    id: "demo-shopping-14",
    list_id: "demo-list-2",
    title: "Cable Organizer",
    url: "https://walmart.com/cable-organizer",
    price: "$15.99",
    source: "Walmart",
    checked: false,
    variant: "default",
    position: 14,
    created_at: "2024-12-01T23:00:00Z",
    updated_at: "2024-12-01T23:00:00Z"
  },
  {
    id: "demo-shopping-15",
    list_id: "demo-list-2",
    title: "USB Hub",
    url: "https://amazon.com/usb-hub",
    price: "$22.99",
    source: "Amazon",
    checked: false,
    variant: "default",
    position: 15,
    created_at: "2024-12-02T00:00:00Z",
    updated_at: "2024-12-02T00:00:00Z"
  }
]

// Generate UUID for new items
export const generateId = () => {
  return 'demo-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
} 