import { mockIdeasApi } from './mock-data'

describe('mockIdeasApi', () => {
  beforeEach(() => {
    // Reset any global state if needed
  })

  describe('getCategories', () => {
    it('should return mock categories', async () => {
      const result = await mockIdeasApi.getCategories()
      expect(result).toHaveLength(9)
      expect(result[0].name).toBe('Technology')
      expect(result[1].name).toBe('Business')
      expect(result[2].name).toBe('Education')
    })
  })

  describe('getIdeas', () => {
    it('should return mock ideas', async () => {
      const result = await mockIdeasApi.getIdeas()
      expect(result.ideas).toHaveLength(10)
      expect(result.meta.total).toBe(10)
      expect(result.meta.page).toBe(1)
      expect(result.meta.limit).toBe(10)
    })

    it('should filter by category', async () => {
      const result = await mockIdeasApi.getIdeas({ category: 'tech' })
      expect(result.ideas.every(idea => idea.category_id === 'tech')).toBe(true)
    })

    it('should filter by search term', async () => {
      const result = await mockIdeasApi.getIdeas({ search: 'Smart' })
      expect(result.ideas.every(idea => 
        idea.title.toLowerCase().includes('smart') ||
        (idea.description && idea.description.toLowerCase().includes('smart'))
      )).toBe(true)
    })

    it('should apply pagination', async () => {
      const result = await mockIdeasApi.getIdeas({ page: 1, limit: 5 })
      expect(result.ideas).toHaveLength(5)
      expect(result.meta.page).toBe(1)
      expect(result.meta.limit).toBe(5)
      expect(result.meta.pages).toBe(2)
    })
  })

  describe('getIdea', () => {
    it('should return a specific idea', async () => {
      const result = await mockIdeasApi.getIdea('demo-idea-1')
      expect(result.id).toBe('demo-idea-1')
      expect(result.title).toBe('Smart Home Energy Monitor')
    })

    it('should throw error for non-existent idea', async () => {
      await expect(mockIdeasApi.getIdea('non-existent')).rejects.toThrow('Idea not found')
    })
  })

  describe('createIdea', () => {
    it('should create a new idea', async () => {
      const newIdea = {
        title: 'Test Idea',
        description: 'Test description',
        category: 'tech',
        tags: ['test', 'demo']
      }

      const result = await mockIdeasApi.createIdea(newIdea)
      expect(result.title).toBe('Test Idea')
      expect(result.description).toBe('Test description')
      expect(result.category_id).toBe('tech')
      expect(result.tags).toEqual(['test', 'demo'])
      expect(result.id).toBeDefined()
      expect(result.created_at).toBeDefined()
      expect(result.updated_at).toBeDefined()
    })
  })

  describe('updateIdea', () => {
    it('should update an existing idea', async () => {
      // First create an idea
      const newIdea = {
        title: 'Original Idea',
        description: 'Original description',
        category: 'tech'
      }

      const created = await mockIdeasApi.createIdea(newIdea)
      
      // Then update it
      const updated = await mockIdeasApi.updateIdea(created.id, {
        title: 'Updated Idea',
        description: 'Updated description'
      })

      expect(updated.title).toBe('Updated Idea')
      expect(updated.description).toBe('Updated description')
      expect(updated.id).toBe(created.id)
    })

    it('should throw error for non-existent idea', async () => {
      await expect(mockIdeasApi.updateIdea('non-existent', { title: 'Updated' }))
        .rejects.toThrow('Idea not found')
    })
  })

  describe('deleteIdea', () => {
    it('should delete an idea', async () => {
      // First create an idea
      const newIdea = {
        title: 'To Delete',
        description: 'Will be deleted',
        category: 'tech'
      }

      const created = await mockIdeasApi.createIdea(newIdea)
      
      // Then delete it
      await expect(mockIdeasApi.deleteIdea(created.id)).resolves.not.toThrow()
      
      // Verify it's deleted
      await expect(mockIdeasApi.getIdea(created.id)).rejects.toThrow('Idea not found')
    })

    it('should throw error for non-existent idea', async () => {
      await expect(mockIdeasApi.deleteIdea('non-existent')).rejects.toThrow('Idea not found')
    })
  })
}) 