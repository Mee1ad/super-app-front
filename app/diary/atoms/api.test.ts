import { diaryApi } from './api'

// Mock fetch globally
global.fetch = jest.fn()

describe('diaryApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getMoods', () => {
    it('should get moods', async () => {
      const mockResponse = {
        moods: [
          { id: 'happy', name: 'Happy', emoji: '😊', color: '#4CAF50', created_at: '2024-12-01T10:00:00Z' },
          { id: 'sad', name: 'Sad', emoji: '😢', color: '#2196F3', created_at: '2024-12-01T10:00:00Z' },
          { id: 'angry', name: 'Angry', emoji: '😡', color: '#F44336', created_at: '2024-12-01T10:00:00Z' },
          { id: 'calm', name: 'Calm', emoji: '😌', color: '#9C27B0', created_at: '2024-12-01T10:00:00Z' },
          { id: 'excited', name: 'Excited', emoji: '🤩', color: '#FF9800', created_at: '2024-12-01T10:00:00Z' }
        ]
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })
      const result = await diaryApi.getMoods()
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/v1/moods', { headers: { 'Content-Type': 'application/json' } })
    })
  })

  describe('getDiaryEntries', () => {
    it('should return all entries when no filters are applied', async () => {
      const mockResponse = {
        entries: [
          {
            id: 'demo-1',
            title: 'My First Entry',
            content: 'Today was a great day! I started my new project and everything went smoothly. The team was supportive and I feel really motivated about what we\'re building.',
            mood: 'happy',
            date: '2024-12-01',
            images: [],
            created_at: '2024-12-01T10:00:00Z',
            updated_at: '2024-12-01T10:00:00Z'
          },
          {
            id: 'demo-2',
            title: 'Reflection Time',
            content: 'Feeling a bit down today. Work was challenging and I didn\'t get as much done as I hoped. But I\'m trying to stay positive and focus on tomorrow.',
            mood: 'sad',
            date: '2024-12-02',
            images: ["/static/uploads/reflection.jpg"],
            created_at: '2024-12-02T15:30:00Z',
            updated_at: '2024-12-02T15:30:00Z'
          }
        ],
        meta: {
          limit: 20,
          page: 1,
          pages: 1,
          total: 10
        }
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })
      const result = await diaryApi.getDiaryEntries()
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/v1/diary-entries', { headers: { 'Content-Type': 'application/json' } })
    })

    it('should filter entries by search term', async () => {
      const mockResponse = {
        entries: [
          {
            id: 'demo-1',
            title: 'My First Entry',
            content: 'Today was a great day! I started my new project and everything went smoothly. The team was supportive and I feel really motivated about what we\'re building.',
            mood: 'happy',
            date: '2024-12-01',
            images: [],
            created_at: '2024-12-01T10:00:00Z',
            updated_at: '2024-12-01T10:00:00Z'
          },
          {
            id: 'demo-9',
            title: 'Meditation Session',
            content: 'Had a great meditation session this morning. I\'m trying to make it a daily habit. It really helps me start the day with a clear mind.',
            mood: 'calm',
            date: '2024-12-09',
            images: [],
            created_at: '2024-12-09T07:00:00Z',
            updated_at: '2024-12-09T07:00:00Z'
          }
        ],
        meta: {
          limit: 20,
          page: 1,
          pages: 1,
          total: 2
        }
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })
      const result = await diaryApi.getDiaryEntries({ search: 'great' })
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/v1/diary-entries?search=great', { headers: { 'Content-Type': 'application/json' } })
    })

    it('should filter entries by mood', async () => {
      const mockResponse = {
        entries: [
          {
            id: 'demo-1',
            title: 'My First Entry',
            content: 'Today was a great day! I started my new project and everything went smoothly. The team was supportive and I feel really motivated about what we\'re building.',
            mood: 'happy',
            date: '2024-12-01',
            images: [],
            created_at: '2024-12-01T10:00:00Z',
            updated_at: '2024-12-01T10:00:00Z'
          },
          {
            id: 'demo-6',
            title: 'Weekend Plans',
            content: 'Planning a fun weekend with friends. We\'re going hiking and then having a barbecue. I\'m really looking forward to spending time outdoors.',
            mood: 'happy',
            date: '2024-12-06',
            images: [],
            created_at: '2024-12-06T09:30:00Z',
            updated_at: '2024-12-06T09:30:00Z'
          }
        ],
        meta: {
          limit: 20,
          page: 1,
          pages: 1,
          total: 2
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await diaryApi.getDiaryEntries({ mood: 'happy' })
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/v1/diary-entries?mood=happy', { headers: { 'Content-Type': 'application/json' } })
    })

    it('should apply pagination correctly', async () => {
      const mockResponse = {
        entries: [
          {
            id: 'demo-1',
            title: 'My First Entry',
            content: 'Today was a great day! I started my new project and everything went smoothly. The team was supportive and I feel really motivated about what we\'re building.',
            mood: 'happy',
            date: '2024-12-01',
            images: [],
            created_at: '2024-12-01T10:00:00Z',
            updated_at: '2024-12-01T10:00:00Z'
          }
        ],
        meta: {
          limit: 1,
          page: 1,
          pages: 10,
          total: 10
        }
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await diaryApi.getDiaryEntries({ page: 1, limit: 1 })
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/v1/diary-entries?page=1&limit=1', { headers: { 'Content-Type': 'application/json' } })
    })

    it('should respect maximum limit', async () => {
      const mockResponse = {
        entries: [
          {
            id: 'demo-1',
            title: 'My First Entry',
            content: 'Today was a great day! I started my new project and everything went smoothly. The team was supportive and I feel really motivated about what we\'re building.',
            mood: 'happy',
            date: '2024-12-01',
            images: [],
            created_at: '2024-12-01T10:00:00Z',
            updated_at: '2024-12-01T10:00:00Z'
          },
          {
            id: 'demo-2',
            title: 'Reflection Time',
            content: 'Feeling a bit down today. Work was challenging and I didn\'t get as much done as I hoped. But I\'m trying to stay positive and focus on tomorrow.',
            mood: 'sad',
            date: '2024-12-02',
            images: [],
            created_at: '2024-12-02T15:30:00Z',
            updated_at: '2024-12-02T15:30:00Z'
          },
          {
            id: 'demo-3',
            title: 'Frustrated with Technology',
            content: 'My computer crashed three times today while working on an important project. Lost some progress and feeling really frustrated with technology right now.',
            mood: 'angry',
            date: '2024-12-03',
            images: [],
            created_at: '2024-12-03T14:20:00Z',
            updated_at: '2024-12-03T14:20:00Z'
          },
          {
            id: 'demo-4',
            title: 'Peaceful Evening',
            content: 'Spent the evening reading a good book and listening to calming music. The sunset was beautiful and I feel really at peace right now.',
            mood: 'calm',
            date: '2024-12-04',
            images: [],
            created_at: '2024-12-04T19:45:00Z',
            updated_at: '2024-12-04T19:45:00Z'
          },
          {
            id: 'demo-5',
            title: 'Big News!',
            content: 'I got the job offer I\'ve been waiting for! This is exactly what I wanted and I\'m so excited to start this new chapter in my career.',
            mood: 'excited',
            date: '2024-12-05',
            images: [],
            created_at: '2024-12-05T11:15:00Z',
            updated_at: '2024-12-05T11:15:00Z'
          },
          {
            id: 'demo-6',
            title: 'Weekend Plans',
            content: 'Planning a fun weekend with friends. We\'re going hiking and then having a barbecue. I\'m really looking forward to spending time outdoors.',
            mood: 'happy',
            date: '2024-12-06',
            images: [],
            created_at: '2024-12-06T09:30:00Z',
            updated_at: '2024-12-06T09:30:00Z'
          },
          {
            id: 'demo-7',
            title: 'Learning Something New',
            content: 'Started learning a new programming language today. It\'s challenging but exciting. I love the feeling of expanding my skills.',
            mood: 'excited',
            date: '2024-12-07',
            images: [],
            created_at: '2024-12-07T16:00:00Z',
            updated_at: '2024-12-07T16:00:00Z'
          },
          {
            id: 'demo-8',
            title: 'Missing Home',
            content: 'Feeling homesick today. It\'s been a while since I\'ve seen my family. Planning to call them this weekend and maybe plan a visit soon.',
            mood: 'sad',
            date: '2024-12-08',
            images: [],
            created_at: '2024-12-08T20:10:00Z',
            updated_at: '2024-12-08T20:10:00Z'
          },
          {
            id: 'demo-9',
            title: 'Meditation Session',
            content: 'Had a great meditation session this morning. I\'m trying to make it a daily habit. It really helps me start the day with a clear mind.',
            mood: 'calm',
            date: '2024-12-09',
            images: [],
            created_at: '2024-12-09T07:00:00Z',
            updated_at: '2024-12-09T07:00:00Z'
          },
          {
            id: 'demo-10',
            title: 'Traffic Rage',
            content: 'Stuck in traffic for over an hour today. People were driving so recklessly and I was late for an important meeting. Completely ruined my mood.',
            mood: 'angry',
            date: '2024-12-10',
            images: [],
            created_at: '2024-12-10T08:45:00Z',
            updated_at: '2024-12-10T08:45:00Z'
          }
        ],
        meta: {
          limit: 150,
          page: 1,
          pages: 1,
          total: 10
        }
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await diaryApi.getDiaryEntries({ limit: 150 })
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/v1/diary-entries?limit=150', { headers: { 'Content-Type': 'application/json' } })
    })
  })

  describe('getDiaryEntry', () => {
    it('should return a specific entry by ID', async () => {
      const mockEntry = {
        id: 'demo-1',
        title: 'My First Entry',
        content: 'Today was a great day! I started my new project and everything went smoothly. The team was supportive and I feel really motivated about what we\'re building.',
        mood: 'happy',
        date: '2024-12-01',
        images: [],
        created_at: '2024-12-01T10:00:00Z',
        updated_at: '2024-12-01T10:00:00Z'
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEntry
      })

      const result = await diaryApi.getDiaryEntry('demo-1')
      expect(result).toEqual(mockEntry)
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/v1/diary-entries/demo-1', { headers: { 'Content-Type': 'application/json' } })
    })

    it('should throw error for non-existent entry', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      const promise = diaryApi.getDiaryEntry('non-existent-id')
      await expect(promise).rejects.toThrow('Diary entry not found')
    })
  })

  describe('createDiaryEntry', () => {
    it('should create a new diary entry', async () => {
      const newEntry = {
        title: 'New Entry',
        content: 'New content',
        mood: 'happy',
        date: '2024-12-03'
      }

      const createdEntry = {
        id: 'demo-cbcce404-3e4a-4fca-872a-a77facd8d667',
        title: 'New Entry',
        content: 'New content',
        mood: 'happy',
        date: '2025-07-17',
        images: [],
        created_at: '2025-07-17T20:00:10.500Z',
        updated_at: '2025-07-17T20:00:10.500Z'
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => createdEntry
      })

      const result = await diaryApi.createDiaryEntry(newEntry)
      expect(result).toEqual(createdEntry)
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/v1/diary-entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newEntry) })
    })

    it('should use current date when no date is provided', async () => {
      const newEntry = {
        title: 'New Entry',
        content: 'New content',
        mood: 'happy'
      }

      const createdEntry = {
        id: 'demo-cbcce404-3e4a-4fca-872a-a77facd8d667',
        title: 'New Entry',
        content: 'New content',
        mood: 'happy',
        date: '2025-07-17',
        images: [],
        created_at: '2025-07-17T20:00:10.500Z',
        updated_at: '2025-07-17T20:00:10.500Z'
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => createdEntry
      })

      const result = await diaryApi.createDiaryEntry(newEntry)
      expect(result.date).toBe('2025-07-17')
    })

    it('should use provided date when available', async () => {
      const newEntry = {
        title: 'New Entry',
        content: 'New content',
        mood: 'happy',
        date: '2024-12-03'
      }

      const createdEntry = {
        id: 'demo-cbcce404-3e4a-4fca-872a-a77facd8d667',
        title: 'New Entry',
        content: 'New content',
        mood: 'happy',
        date: '2024-12-03',
        images: [],
        created_at: '2025-07-17T20:00:10.500Z',
        updated_at: '2025-07-17T20:00:10.500Z'
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => createdEntry
      })

      const result = await diaryApi.createDiaryEntry(newEntry)
      expect(result.date).toBe('2024-12-03')
    })
  })

  describe('updateDiaryEntry', () => {
    it('should update an existing diary entry', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content'
      }

      const updatedEntry = {
        id: 'demo-1',
        title: 'Updated Title',
        content: 'Updated content',
        mood: 'happy',
        date: '2024-12-01',
        images: [],
        created_at: '2024-12-01T10:00:00Z',
        updated_at: '2024-12-01T10:00:00Z'
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedEntry
      })

      const result = await diaryApi.updateDiaryEntry('demo-1', updateData)
      expect(result).toEqual(updatedEntry)
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/v1/diary-entries/demo-1', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updateData) })
    })

    it('should throw error for non-existent entry', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      const promise = diaryApi.updateDiaryEntry('non-existent-id', { title: 'Updated' })
      await expect(promise).rejects.toThrow('Diary entry not found')
    })
  })

  describe('deleteDiaryEntry', () => {
    it('should delete an existing diary entry', async () => {
      const deleteResponse = { message: 'Diary entry deleted successfully' }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => deleteResponse
      })

      const result = await diaryApi.deleteDiaryEntry('demo-1')
      expect(result).toEqual(deleteResponse)
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/v1/diary-entries/demo-1', { method: 'DELETE', headers: { 'Content-Type': 'application/json' } })
    })

    it('should throw error for non-existent entry', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      const promise = diaryApi.deleteDiaryEntry('non-existent-id')
      await expect(promise).rejects.toThrow('Diary entry not found')
    })
  })

  describe('uploadImage', () => {
    it('should upload a valid image file', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const uploadResponse = { url: 'https://via.placeholder.com/400x300?text=Mock+Image' }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => uploadResponse
      })

      const result = await diaryApi.uploadImage(file)
      expect(result).toEqual(uploadResponse)
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/v1/upload-image', { method: 'POST', headers: {}, body: expect.any(FormData) })
    })

    it('should reject invalid file types', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })

      const promise = diaryApi.uploadImage(file)
      await expect(promise).rejects.toThrow('Invalid file type. Only JPG, PNG, and GIF are supported.')
    })

    it('should reject files that are too large', async () => {
      const file = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })

      const promise = diaryApi.uploadImage(file)
      await expect(promise).rejects.toThrow('File too large. Maximum size is 5MB.')
    })

    it('should accept PNG files', async () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const uploadResponse = { url: 'https://via.placeholder.com/400x300?text=Mock+Image' }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => uploadResponse
      })

      const result = await diaryApi.uploadImage(file)
      expect(result).toEqual(uploadResponse)
    })

    it('should accept GIF files', async () => {
      const file = new File(['test'], 'test.gif', { type: 'image/gif' })
      const uploadResponse = { url: 'https://via.placeholder.com/400x300?text=Mock+Image' }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => uploadResponse
      })

      const result = await diaryApi.uploadImage(file)
      expect(result).toEqual(uploadResponse)
    })
  })
}) 