import { authApi } from './api'

// Mock fetch globally
global.fetch = jest.fn()

describe('authApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getGoogleAuthUrl', () => {
    it('should return Google OAuth URL successfully', async () => {
      const mockResponse = {
        auth_url: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=test&response_type=code&scope=openid%20email%20profile&redirect_uri=http://localhost:8000/api/v1/auth/google/callback&access_type=offline',
        client_id: 'test-client-id',
        redirect_uri: 'http://localhost:8000/api/v1/auth/google/callback'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await authApi.getGoogleAuthUrl()

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/v1/auth/google/url')
      expect(result).toEqual(mockResponse)
    })

    it('should throw error when API call fails', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      await expect(authApi.getGoogleAuthUrl()).rejects.toThrow('Failed to get Google OAuth URL')
    })

    it('should use custom API base URL when environment variable is set', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_URL
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com'

      // Clear the module cache to force re-import with new env var
      jest.resetModules()
      
      // Re-import the module to get the updated environment variable
      const { authApi: freshAuthApi } = await import('./api')

      const mockResponse = {
        auth_url: 'https://accounts.google.com/o/oauth2/v2/auth',
        client_id: 'test-client-id',
        redirect_uri: 'https://api.example.com/api/v1/auth/google/callback'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      await freshAuthApi.getGoogleAuthUrl()

      expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/v1/auth/google/url')

      // Restore original environment
      process.env.NEXT_PUBLIC_API_URL = originalEnv
    })
  })

  describe('loginWithGoogle', () => {
    it('should login successfully with valid code', async () => {
      const mockResponse = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          picture: 'https://example.com/avatar.jpg'
        }
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await authApi.loginWithGoogle('test-auth-code')

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/v1/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: 'test-auth-code' })
      })
      expect(result).toEqual(mockResponse)
    })

    it('should throw error with custom message when API returns error', async () => {
      const errorResponse = { error: 'Invalid authorization code' }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => errorResponse
      })

      await expect(authApi.loginWithGoogle('invalid-code')).rejects.toThrow('Invalid authorization code')
    })

    it('should throw generic error when API call fails without error message', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({})
      })

      await expect(authApi.loginWithGoogle('test-code')).rejects.toThrow('Failed to login with Google')
    })

    it('should handle JSON parsing errors gracefully', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('JSON parse error')
        }
      })

      await expect(authApi.loginWithGoogle('test-code')).rejects.toThrow('Failed to login with Google')
    })
  })
}) 