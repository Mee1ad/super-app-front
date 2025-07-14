import { diaryApi } from './api'
import { Mood, DiaryEntry, DiaryEntryCreate, DiaryEntryUpdate } from './types'

// Mock fetch globally
global.fetch = jest.fn()

// Mock data
const mockMoods: Mood[] = [
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
  }
]

const mockEntries: DiaryEntry[] = [
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

describe('diaryApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getMoods', () => {
    it('should return all available moods', async () => {
      const mockResponse = { moods: mockMoods }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await diaryApi.getMoods()
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/diary/moods', { headers: { 'Content-Type': 'application/json' } })
    })
  })

  describe('getDiaryEntries', () => {
    it('should return all entries when no filters are applied', async () => {
      const mockResponse = { entries: mockEntries, meta: { total: 2, page: 1, limit: 20, pages: 1 } }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await diaryApi.getDiaryEntries()
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/diary/entries', { headers: { 'Content-Type': 'application/json' } })
    })

    it('should filter entries by search term', async () => {
      const mockResponse = { entries: [mockEntries[0]], meta: { total: 1, page: 1, limit: 20, pages: 1 } }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await diaryApi.getDiaryEntries({ search: 'great' })
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/diary/entries?search=great', { headers: { 'Content-Type': 'application/json' } })
    })

    it('should filter entries by mood', async () => {
      const mockResponse = { entries: [mockEntries[0]], meta: { total: 1, page: 1, limit: 20, pages: 1 } }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await diaryApi.getDiaryEntries({ mood: 'happy' })
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/diary/entries?mood=happy', { headers: { 'Content-Type': 'application/json' } })
    })

    it('should apply pagination correctly', async () => {
      const mockResponse = { entries: [mockEntries[0]], meta: { total: 2, page: 1, limit: 1, pages: 2 } }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await diaryApi.getDiaryEntries({ page: 1, limit: 1 })
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/diary/entries?page=1&limit=1', { headers: { 'Content-Type': 'application/json' } })
    })

    it('should respect maximum limit', async () => {
      const mockResponse = { entries: mockEntries, meta: { total: 2, page: 1, limit: 100, pages: 1 } }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await diaryApi.getDiaryEntries({ limit: 150 })
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/diary/entries?limit=150', { headers: { 'Content-Type': 'application/json' } })
    })
  })

  describe('getDiaryEntry', () => {
    it('should return a specific entry by ID', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEntries[0]
      })

      const result = await diaryApi.getDiaryEntry('550e8400-e29b-41d4-a716-446655440000')
      expect(result).toEqual(mockEntries[0])
      expect(fetch).toHaveBeenCalledWith('/api/diary/entries/550e8400-e29b-41d4-a716-446655440000', { headers: { 'Content-Type': 'application/json' } })
    })

    it('should throw error for non-existent entry', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      const promise = diaryApi.getDiaryEntry('non-existent-id')
      await expect(promise).rejects.toThrow('Diary entry not found')
    })
  })

  describe('createDiaryEntry', () => {
    it('should create a new diary entry', async () => {
      const newEntry: DiaryEntryCreate = {
        title: 'New Entry',
        content: 'New content',
        mood: 'happy'
      }

      const createdEntry: DiaryEntry = {
        id: 'new-id',
        title: newEntry.title,
        content: newEntry.content,
        mood: newEntry.mood,
        date: '2024-12-03',
        images: [],
        created_at: '2024-12-03T10:00:00Z',
        updated_at: '2024-12-03T10:00:00Z'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => createdEntry
      })

      const result = await diaryApi.createDiaryEntry(newEntry)
      expect(result).toEqual(createdEntry)
      expect(fetch).toHaveBeenCalledWith('/api/diary/entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newEntry) })
    })

    it('should use current date when no date is provided', async () => {
      const newEntry: DiaryEntryCreate = {
        title: 'New Entry',
        content: 'New content',
        mood: 'happy'
      }

      const createdEntry: DiaryEntry = {
        id: 'new-id',
        title: newEntry.title,
        content: newEntry.content,
        mood: newEntry.mood,
        date: '2024-12-03',
        images: [],
        created_at: '2024-12-03T10:00:00Z',
        updated_at: '2024-12-03T10:00:00Z'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => createdEntry
      })

      const result = await diaryApi.createDiaryEntry(newEntry)
      expect(result.date).toBe('2024-12-03')
    })

    it('should use provided date when available', async () => {
      const newEntry: DiaryEntryCreate = {
        title: 'New Entry',
        content: 'New content',
        mood: 'happy',
        date: '2024-12-05'
      }

      const createdEntry: DiaryEntry = {
        id: 'new-id',
        title: newEntry.title,
        content: newEntry.content,
        mood: newEntry.mood,
        date: newEntry.date!,
        images: [],
        created_at: '2024-12-03T10:00:00Z',
        updated_at: '2024-12-03T10:00:00Z'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => createdEntry
      })

      const result = await diaryApi.createDiaryEntry(newEntry)
      expect(result.date).toBe('2024-12-05')
    })
  })

  describe('updateDiaryEntry', () => {
    it('should update an existing diary entry', async () => {
      const updateData: DiaryEntryUpdate = {
        title: 'Updated Title',
        content: 'Updated content'
      }

      const updatedEntry: DiaryEntry = {
        ...mockEntries[0],
        ...updateData,
        updated_at: '2024-12-03T11:00:00Z'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedEntry
      })

      const result = await diaryApi.updateDiaryEntry('550e8400-e29b-41d4-a716-446655440000', updateData)
      expect(result).toEqual(updatedEntry)
      expect(fetch).toHaveBeenCalledWith('/api/diary/entries/550e8400-e29b-41d4-a716-446655440000', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updateData) })
    })

    it('should throw error for non-existent entry', async () => {
      const updateData: DiaryEntryUpdate = {
        title: 'Updated Title'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      const promise = diaryApi.updateDiaryEntry('non-existent-id', updateData)
      await expect(promise).rejects.toThrow('Failed to update diary entry')
    })
  })

  describe('deleteDiaryEntry', () => {
    it('should delete an existing diary entry', async () => {
      const deleteResponse = { message: 'Diary entry deleted successfully' }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => deleteResponse
      })

      const result = await diaryApi.deleteDiaryEntry('550e8400-e29b-41d4-a716-446655440000')
      expect(result).toEqual(deleteResponse)
      expect(fetch).toHaveBeenCalledWith('/api/diary/entries/550e8400-e29b-41d4-a716-446655440000', { method: 'DELETE', headers: { 'Content-Type': 'application/json' } })
    })

    it('should throw error for non-existent entry', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      const promise = diaryApi.deleteDiaryEntry('non-existent-id')
      await expect(promise).rejects.toThrow('Failed to delete diary entry')
    })
  })

  describe('uploadImage', () => {
    it('should upload a valid image file', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const uploadResponse = { url: '/static/uploads/test.jpg' }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => uploadResponse
      })

      const result = await diaryApi.uploadImage(file)
      expect(result).toEqual(uploadResponse)
      expect(fetch).toHaveBeenCalledWith('/api/diary/upload', { method: 'POST', headers: {}, body: expect.any(FormData) })
    })

    it('should reject invalid file types', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid file type. Only JPG, PNG, and GIF are supported.' })
      })

      const promise = diaryApi.uploadImage(file)
      await expect(promise).rejects.toThrow('Invalid file type. Only JPG, PNG, and GIF are supported.')
    })

    it('should reject files that are too large', async () => {
      const file = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'File too large. Maximum size is 5MB.' })
      })

      const promise = diaryApi.uploadImage(file)
      await expect(promise).rejects.toThrow('File too large. Maximum size is 5MB.')
    })

    it('should accept PNG files', async () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const uploadResponse = { url: '/static/uploads/test.png' }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => uploadResponse
      })

      const result = await diaryApi.uploadImage(file)
      expect(result).toEqual(uploadResponse)
    })

    it('should accept GIF files', async () => {
      const file = new File(['test'], 'test.gif', { type: 'image/gif' })
      const uploadResponse = { url: '/static/uploads/test.gif' }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => uploadResponse
      })

      const result = await diaryApi.uploadImage(file)
      expect(result).toEqual(uploadResponse)
    })
  })
}) 