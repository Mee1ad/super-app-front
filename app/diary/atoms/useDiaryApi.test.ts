import { renderHook, act } from '@testing-library/react'
import { useDiaryApi } from './useDiaryApi'
import { diaryApi } from './api'
import { DiaryEntryCreate, DiaryEntryUpdate, DiaryEntry } from './types'

// Mock the diaryApi
jest.mock('./api')
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}))

const mockDiaryApi = diaryApi as jest.Mocked<typeof diaryApi>

describe('useDiaryApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useDiaryApi())

      expect(result.current.moods).toEqual([])
      expect(result.current.entries).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.meta).toBeNull()
    })
  })

  describe('loadMoods', () => {
    it('should load moods successfully', async () => {
      const mockMoods = [
        { id: 'happy', name: 'Happy', emoji: '😊', color: '#4CAF50', created_at: '2024-12-01T10:00:00Z' }
      ]
      mockDiaryApi.getMoods.mockResolvedValue({ moods: mockMoods })

      const { result } = renderHook(() => useDiaryApi())

      await act(async () => {
        await result.current.loadMoods()
      })

      expect(result.current.moods).toEqual(mockMoods)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle mood loading error', async () => {
      const errorMessage = 'Failed to load moods'
      mockDiaryApi.getMoods.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useDiaryApi())

      await act(async () => {
        await result.current.loadMoods()
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.loading).toBe(false)
    })
  })

  describe('loadEntries', () => {
    it('should load entries successfully', async () => {
      const mockEntries = [
        {
          id: '1',
          title: 'Test Entry',
          content: 'Test content',
          mood: 'happy',
          date: '2024-12-01',
          images: [],
          created_at: '2024-12-01T10:00:00Z',
          updated_at: '2024-12-01T10:00:00Z'
        }
      ]
      const mockMeta = {
        total: 1,
        page: 1,
        limit: 20,
        pages: 1
      }
      mockDiaryApi.getDiaryEntries.mockResolvedValue({
        entries: mockEntries,
        meta: mockMeta
      })

      const { result } = renderHook(() => useDiaryApi())

      await act(async () => {
        await result.current.loadEntries()
      })

      expect(result.current.entries).toEqual(mockEntries)
      expect(result.current.meta).toEqual(mockMeta)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should load entries with filters', async () => {
      const mockEntries: DiaryEntry[] = []
      const mockMeta = {
        total: 0,
        page: 1,
        limit: 20,
        pages: 0
      }
      mockDiaryApi.getDiaryEntries.mockResolvedValue({
        entries: mockEntries,
        meta: mockMeta
      })

      const { result } = renderHook(() => useDiaryApi())

      await act(async () => {
        await result.current.loadEntries({ search: 'test', mood: 'happy' })
      })

      expect(mockDiaryApi.getDiaryEntries).toHaveBeenCalledWith({
        search: 'test',
        mood: 'happy'
      })
    })

    it('should handle entry loading error', async () => {
      const errorMessage = 'Failed to load entries'
      mockDiaryApi.getDiaryEntries.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useDiaryApi())

      await act(async () => {
        await result.current.loadEntries()
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.loading).toBe(false)
    })
  })

  describe('createEntry', () => {
    it('should create entry successfully', async () => {
      const newEntry: DiaryEntryCreate = {
        title: 'New Entry',
        content: 'New content',
        mood: 'happy'
      }
      const createdEntry = {
        id: 'new-id',
        ...newEntry,
        date: '2024-12-01',
        images: [],
        created_at: '2024-12-01T10:00:00Z',
        updated_at: '2024-12-01T10:00:00Z'
      }
      mockDiaryApi.createDiaryEntry.mockResolvedValue(createdEntry)

      const { result } = renderHook(() => useDiaryApi())

      let createdResult: DiaryEntry | undefined
      await act(async () => {
        createdResult = await result.current.createEntry(newEntry)
      })

      expect(createdResult).toEqual(createdEntry)
      expect(result.current.entries).toContain(createdEntry)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle creation error', async () => {
      const newEntry: DiaryEntryCreate = {
        title: 'New Entry',
        content: 'New content',
        mood: 'happy'
      }
      const errorMessage = 'Failed to create entry'
      mockDiaryApi.createDiaryEntry.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useDiaryApi())

      await expect(async () => {
        await act(async () => {
          await result.current.createEntry(newEntry)
        })
      }).rejects.toThrow(errorMessage)

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.loading).toBe(false)
    })
  })

  describe('updateEntry', () => {
    it('should update entry successfully', async () => {
      const updateData: DiaryEntryUpdate = {
        title: 'Updated Title',
        content: 'Updated content'
      }
      const updatedEntry = {
        id: '1',
        title: 'Updated Title',
        content: 'Updated content',
        mood: 'happy',
        date: '2024-12-01',
        images: [],
        created_at: '2024-12-01T10:00:00Z',
        updated_at: '2024-12-01T11:00:00Z'
      }
      mockDiaryApi.updateDiaryEntry.mockResolvedValue(updatedEntry)

      const { result } = renderHook(() => useDiaryApi())

      // First add an entry to update
      const existingEntry = {
        id: '1',
        title: 'Original Title',
        content: 'Original content',
        mood: 'happy',
        date: '2024-12-01',
        images: [],
        created_at: '2024-12-01T10:00:00Z',
        updated_at: '2024-12-01T10:00:00Z'
      }
      
      await act(async () => {
        result.current.entries = [existingEntry]
      })

      let updatedResult: DiaryEntry | undefined
      await act(async () => {
        updatedResult = await result.current.updateEntry('1', updateData)
      })

      expect(updatedResult).toEqual(updatedEntry)
      expect(result.current.entries[0]).toEqual(updatedEntry)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle update error', async () => {
      const updateData: DiaryEntryUpdate = {
        title: 'Updated Title'
      }
      const errorMessage = 'Failed to update entry'
      mockDiaryApi.updateDiaryEntry.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useDiaryApi())

      await expect(async () => {
        await act(async () => {
          await result.current.updateEntry('1', updateData)
        })
      }).rejects.toThrow(errorMessage)

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.loading).toBe(false)
    })
  })

  describe('deleteEntry', () => {
    it('should delete entry successfully', async () => {
      mockDiaryApi.deleteDiaryEntry.mockResolvedValue({ message: 'Diary entry deleted successfully' })

      const { result } = renderHook(() => useDiaryApi())

      // First add an entry to delete
      const existingEntry = {
        id: '1',
        title: 'Test Entry',
        content: 'Test content',
        mood: 'happy',
        date: '2024-12-01',
        images: [],
        created_at: '2024-12-01T10:00:00Z',
        updated_at: '2024-12-01T10:00:00Z'
      }
      
      await act(async () => {
        result.current.entries = [existingEntry]
      })

      await act(async () => {
        await result.current.deleteEntry('1')
      })

      expect(result.current.entries).toHaveLength(0)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle delete error', async () => {
      const errorMessage = 'Failed to delete entry'
      mockDiaryApi.deleteDiaryEntry.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useDiaryApi())

      await expect(async () => {
        await act(async () => {
          await result.current.deleteEntry('1')
        })
      }).rejects.toThrow(errorMessage)

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.loading).toBe(false)
    })
  })

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const uploadResponse = { url: '/static/uploads/test.jpg' }
      mockDiaryApi.uploadImage.mockResolvedValue(uploadResponse)

      const { result } = renderHook(() => useDiaryApi())

      let uploadResult: string | undefined
      await act(async () => {
        uploadResult = await result.current.uploadImage(file)
      })

      expect(uploadResult).toBe('/static/uploads/test.jpg')
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle upload error', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const errorMessage = 'Invalid file type'
      mockDiaryApi.uploadImage.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useDiaryApi())

      await expect(async () => {
        await act(async () => {
          await result.current.uploadImage(file)
        })
      }).rejects.toThrow(errorMessage)

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.loading).toBe(false)
    })
  })
}) 