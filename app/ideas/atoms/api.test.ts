import { ideasApi } from './api'
import { toast } from '@/hooks/use-toast'

// Mock the toast function
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}))

// Mock fetch globally
global.fetch = jest.fn()

describe('ideasApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  describe('getCategories', () => {
    it('should fetch categories successfully', async () => {
      const mockCategories = [
        { id: '1', name: 'Project', emoji: '🚀', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
        { id: '2', name: 'Article', emoji: '📝', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      ]

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: mockCategories }),
      })

      const result = await ideasApi.getCategories()

      expect(fetch).toHaveBeenCalledWith('/api/categories', { headers: {} })
      expect(result).toEqual(mockCategories)
    })

    it('should handle API errors', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Authentication required' }),
      })

      await expect(ideasApi.getCategories()).rejects.toThrow('Authentication required')
      expect(toast).toHaveBeenCalledWith({
        title: 'Failed to load categories',
        description: 'Authentication required',
        variant: 'destructive',
      })
    })

    it('should handle network errors', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      await expect(ideasApi.getCategories()).rejects.toThrow('Network error')
      expect(toast).toHaveBeenCalledWith({
        title: 'Network error',
        description: 'Failed to connect to the server',
        variant: 'destructive',
      })
    })
  })

  describe('getIdeas', () => {
    it('should fetch ideas successfully', async () => {
      const mockResponse = {
        ideas: [
          {
            id: '1',
            title: 'Test Idea',
            description: 'Test description',
            category_id: '1',
            tags: ['test'],
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          pages: 1,
        },
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await ideasApi.getIdeas()

      expect(fetch).toHaveBeenCalledWith('/api/ideas', { headers: {} })
      expect(result).toEqual(mockResponse)
    })

    it('should handle query parameters', async () => {
      const mockResponse = {
        ideas: [],
        meta: { total: 0, page: 1, limit: 10, pages: 0 },
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await ideasApi.getIdeas({
        search: 'test',
        category: '1',
        page: 2,
        limit: 10,
      })

      expect(fetch).toHaveBeenCalledWith('/api/ideas?search=test&category=1&page=2&limit=10', { headers: {} })
    })
  })

  describe('createIdea', () => {
    it('should create idea successfully', async () => {
      const newIdea = {
        title: 'New Idea',
        description: 'New description',
        category: '1',
        tags: ['new'],
      }

      const mockResponse = {
        id: '1',
        ...newIdea,
        category_id: '1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await ideasApi.createIdea(newIdea)

      expect(fetch).toHaveBeenCalledWith('/api/ideas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newIdea) })
      expect(result).toEqual(mockResponse)
      expect(toast).toHaveBeenCalledWith({
        title: 'Idea created',
        description: 'Your idea has been successfully created',
      })
    })
  })

  describe('updateIdea', () => {
    it('should update idea successfully', async () => {
      const updateData = {
        title: 'Updated Idea',
        description: 'Updated description',
      }

      const mockResponse = {
        id: '1',
        ...updateData,
        category_id: '1',
        tags: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await ideasApi.updateIdea('1', updateData)

      expect(fetch).toHaveBeenCalledWith('/api/ideas/1', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updateData) })
      expect(result).toEqual(mockResponse)
      expect(toast).toHaveBeenCalledWith({
        title: 'Idea updated',
        description: 'Your idea has been successfully updated',
      })
    })
  })

  describe('deleteIdea', () => {
    it('should delete idea successfully', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Idea deleted successfully' }),
      })

      await ideasApi.deleteIdea('1')

      expect(fetch).toHaveBeenCalledWith('/api/ideas/1', { method: 'DELETE', headers: {} })
      expect(toast).toHaveBeenCalledWith({
        title: 'Idea deleted',
        description: 'Your idea has been successfully deleted',
      })
    })
  })
}) 