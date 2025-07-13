import { renderHook, act, waitFor } from '@testing-library/react'
import { useIdeasApi } from './useIdeasApi'
import { ideasApi } from './api'

// Mock the API
jest.mock('./api', () => ({
  ideasApi: {
    getCategories: jest.fn(),
    getIdeas: jest.fn(),
    createIdea: jest.fn(),
    updateIdea: jest.fn(),
    deleteIdea: jest.fn(),
  },
}))

describe('useIdeasApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set up default mocks
    ;(ideasApi.getCategories as jest.Mock).mockResolvedValue([])
    ;(ideasApi.getIdeas as jest.Mock).mockResolvedValue({ ideas: [], meta: null })
  })

  it('should initialize with default state', async () => {
    const { result } = renderHook(() => useIdeasApi())

    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.ideas).toEqual([])
    expect(result.current.categories).toEqual([])
    expect(result.current.meta).toBeNull()
    expect(result.current.isCreating).toBe(false)
    expect(result.current.isUpdating).toBe(false)
    expect(result.current.isDeleting).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should load categories and ideas on mount', async () => {
    const mockCategories = [
      { id: '1', name: 'Project', emoji: '🚀', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    ]
    const mockIdeas = [
      { id: '1', title: 'Test Idea', category_id: '1', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    ]
    const mockMeta = { total: 1, page: 1, limit: 20, pages: 1 }

    ;(ideasApi.getCategories as jest.Mock).mockResolvedValue(mockCategories)
    ;(ideasApi.getIdeas as jest.Mock).mockResolvedValue({ ideas: mockIdeas, meta: mockMeta })

    const { result } = renderHook(() => useIdeasApi())

    await waitFor(() => {
      expect(result.current.categories).toEqual(mockCategories)
      expect(result.current.ideas).toEqual(mockIdeas)
      expect(result.current.meta).toEqual(mockMeta)
    })
  })

  it('should handle loadIdeas with parameters', async () => {
    const mockIdeas = [{ id: '1', title: 'Test', category_id: '1', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }]
    const mockMeta = { total: 1, page: 1, limit: 20, pages: 1 }

    ;(ideasApi.getIdeas as jest.Mock).mockResolvedValue({ ideas: mockIdeas, meta: mockMeta })

    const { result } = renderHook(() => useIdeasApi())

    await act(async () => {
      await result.current.loadIdeas({ search: 'test', category: '1', page: 2, limit: 10 })
    })

    expect(ideasApi.getIdeas).toHaveBeenCalledWith({ search: 'test', category: '1', page: 2, limit: 10 })
    expect(result.current.ideas).toEqual(mockIdeas)
    expect(result.current.meta).toEqual(mockMeta)
  })

  it('should handle createIdea successfully', async () => {
    const newIdea = { title: 'New Idea', category: '1' }
    const createdIdea = { id: '1', ...newIdea, category_id: '1', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }

    ;(ideasApi.createIdea as jest.Mock).mockResolvedValue(createdIdea)

    const { result } = renderHook(() => useIdeasApi())

    await act(async () => {
      const createdResult = await result.current.createIdea(newIdea)
      expect(createdResult).toEqual(createdIdea)
    })

    expect(ideasApi.createIdea).toHaveBeenCalledWith(newIdea)
    expect(result.current.ideas).toContain(createdIdea)
  })

  it('should handle updateIdea successfully', async () => {
    const existingIdea = { id: '1', title: 'Old Title', category_id: '1', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
    const updateData = { title: 'New Title' }
    const updatedIdea = { ...existingIdea, ...updateData }

    ;(ideasApi.updateIdea as jest.Mock).mockResolvedValue(updatedIdea)

    const { result } = renderHook(() => useIdeasApi())

    // Set initial state
    act(() => {
      result.current.ideas = [existingIdea]
    })

    await act(async () => {
      const updatedResult = await result.current.updateIdea('1', updateData)
      expect(updatedResult).toEqual(updatedIdea)
    })

    expect(ideasApi.updateIdea).toHaveBeenCalledWith('1', updateData)
    expect(result.current.ideas[0]).toEqual(updatedIdea)
  })

  it('should handle deleteIdea successfully', async () => {
    const existingIdea = { id: '1', title: 'Test', category_id: '1', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }

    ;(ideasApi.deleteIdea as jest.Mock).mockResolvedValue(undefined)

    const { result } = renderHook(() => useIdeasApi())

    // Set initial state
    act(() => {
      result.current.ideas = [existingIdea]
    })

    await act(async () => {
      const success = await result.current.deleteIdea('1')
      expect(success).toBe(true)
    })

    expect(ideasApi.deleteIdea).toHaveBeenCalledWith('1')
    expect(result.current.ideas).toEqual([])
  })

  it('should handle errors during loadIdeas', async () => {
    const error = new Error('Failed to load')
    ;(ideasApi.getIdeas as jest.Mock).mockRejectedValue(error)

    const { result } = renderHook(() => useIdeasApi())

    await act(async () => {
      try {
        await result.current.loadIdeas()
      } catch (e) {
        // Expected to throw
      }
    })

    expect(result.current.error).toBe('Failed to load')
  })

  it('should handle errors during createIdea', async () => {
    const error = new Error('Failed to create')
    ;(ideasApi.createIdea as jest.Mock).mockRejectedValue(error)

    const { result } = renderHook(() => useIdeasApi())

    await act(async () => {
      const createResult = await result.current.createIdea({ title: 'Test', category: '1' })
      expect(createResult).toBeNull()
    })

    expect(result.current.error).toBe('Failed to create')
  })

  it('should clear error', async () => {
    const { result } = renderHook(() => useIdeasApi())

    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.error = 'Test error'
    })

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })

  it('should set loading states correctly', async () => {
    const mockIdeas = [{ id: '1', title: 'Test', category_id: '1', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }]
    const mockMeta = { total: 1, page: 1, limit: 20, pages: 1 }

    ;(ideasApi.getIdeas as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ideas: mockIdeas, meta: mockMeta }), 100)))
    ;(ideasApi.createIdea as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockIdeas[0]), 100)))

    const { result } = renderHook(() => useIdeasApi())

    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Test loading state for getIdeas
    act(() => {
      result.current.loadIdeas()
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Test loading state for createIdea
    act(() => {
      result.current.createIdea({ title: 'Test', category: '1' })
    })

    expect(result.current.isCreating).toBe(true)

    await waitFor(() => {
      expect(result.current.isCreating).toBe(false)
    })
  })
}) 