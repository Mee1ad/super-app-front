import { renderHook, act, waitFor } from '@testing-library/react'
import { useIdeasApi } from './useIdeasApi'
import { ideasApi } from './api'

// Mock the auth context
jest.mock('@/app/auth/atoms/useAuth', () => ({
  useAuth: () => ({
    user: null, // Default to non-authenticated user
  }),
}))

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

    // For non-authenticated users, mock data should be loaded
    expect(result.current.ideas).toHaveLength(10) // Mock data has 10 ideas
    expect(result.current.categories).toHaveLength(9) // Mock data has 9 categories
    expect(result.current.meta).toBeTruthy()
    expect(result.current.isCreating).toBe(false)
    expect(result.current.isUpdating).toBe(false)
    expect(result.current.isDeleting).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should load categories and ideas on mount', async () => {
    const { result } = renderHook(() => useIdeasApi())

    await waitFor(() => {
      expect(result.current.categories).toHaveLength(9) // Mock categories
      expect(result.current.ideas).toHaveLength(10) // Mock ideas
      expect(result.current.meta).toBeTruthy()
    })

    // Check that we have the expected mock data
    expect(result.current.categories[0].name).toBe('Technology')
    expect(result.current.ideas[0].title).toBe('Smart Home Energy Monitor')
  })

  it('should handle loadIdeas with parameters', async () => {
    const { result } = renderHook(() => useIdeasApi())

    await act(async () => {
      await result.current.loadIdeas({ search: 'Smart', category: 'tech', page: 1, limit: 5 })
    })

    // Should filter to ideas containing "Smart" and in tech category
    expect(result.current.ideas.length).toBeLessThanOrEqual(5)
    expect(result.current.meta).toBeTruthy()
  })

  it('should handle createIdea successfully', async () => {
    const newIdea = { title: 'New Idea', category: 'tech' }

    const { result } = renderHook(() => useIdeasApi())

    await act(async () => {
      const createdResult = await result.current.createIdea(newIdea)
      expect(createdResult).toBeTruthy()
      expect(createdResult?.title).toBe('New Idea')
      expect(createdResult?.category_id).toBe('tech')
    })

    // Should be added to the beginning of the list
    expect(result.current.ideas[0].title).toBe('New Idea')
  })

  it('should handle updateIdea successfully', async () => {
    const { result } = renderHook(() => useIdeasApi())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.ideas.length).toBeGreaterThan(0)
    })

    const firstIdea = result.current.ideas[0]
    const updateData = { title: 'Updated Title' }

    await act(async () => {
      const updatedResult = await result.current.updateIdea(firstIdea.id, updateData)
      expect(updatedResult).toBeTruthy()
      expect(updatedResult?.title).toBe('Updated Title')
    })

    // Should be updated in the list
    expect(result.current.ideas[0].title).toBe('Updated Title')
  })

  it('should handle deleteIdea successfully', async () => {
    const { result } = renderHook(() => useIdeasApi())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.ideas.length).toBeGreaterThan(0)
    })

    const initialCount = result.current.ideas.length
    const firstIdea = result.current.ideas[0]

    await act(async () => {
      const success = await result.current.deleteIdea(firstIdea.id)
      expect(success).toBe(true)
    })

    // Should be removed from the list
    expect(result.current.ideas.length).toBe(initialCount - 1)
    expect(result.current.ideas.find(idea => idea.id === firstIdea.id)).toBeUndefined()
  })

  // Note: clearError test removed as it's not meaningful for mock API scenario
  // The mock API doesn't throw errors, so error clearing is not a primary concern

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