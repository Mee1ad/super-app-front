import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from './useAuth'
import { authApi } from './api'

// Mock the authApi
jest.mock('./api')
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>

// Mock useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000'
  },
  writable: true
})

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('initial state', () => {
    it('should initialize with default state when no stored auth data', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)
      expect(result.current.accessToken).toBe(null)
      expect(result.current.refreshToken).toBe(null)
      expect(result.current.loading).toBe(true)
      expect(result.current.error).toBe(null)
    })

    it('should load stored auth state from localStorage', () => {
      const storedUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg'
      }

      localStorageMock.getItem
        .mockReturnValueOnce('test-access-token') // ACCESS_TOKEN
        .mockReturnValueOnce('test-refresh-token') // REFRESH_TOKEN
        .mockReturnValueOnce(JSON.stringify(storedUser)) // USER

      const { result } = renderHook(() => useAuth())

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(storedUser)
      expect(result.current.accessToken).toBe('test-access-token')
      expect(result.current.refreshToken).toBe('test-refresh-token')
      expect(result.current.loading).toBe(false)
    })

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      const { result } = renderHook(() => useAuth())

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.loading).toBe(false)
    })
  })

  describe('getGoogleAuthUrl', () => {
    it('should get Google OAuth URL successfully', async () => {
      const mockAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=test'
      mockedAuthApi.getGoogleAuthUrl.mockResolvedValue({
        auth_url: mockAuthUrl,
        client_id: 'test-client-id',
        redirect_uri: 'http://localhost:8000/api/v1/auth/google/callback'
      })

      const { result } = renderHook(() => useAuth())

      let authUrl: string | undefined
      await act(async () => {
        authUrl = await result.current.getGoogleAuthUrl()
      })

      expect(authUrl).toBe(mockAuthUrl)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('should handle errors and show toast', async () => {
      const errorMessage = 'Failed to get Google OAuth URL'
      mockedAuthApi.getGoogleAuthUrl.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await expect(result.current.getGoogleAuthUrl()).rejects.toThrow(errorMessage)
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.loading).toBe(false)
    })
  })

  describe('loginWithGoogle', () => {
    it('should login successfully and store auth data', async () => {
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

      mockedAuthApi.loginWithGoogle.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.loginWithGoogle('test-code')
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockResponse.user)
      expect(result.current.accessToken).toBe(mockResponse.access_token)
      expect(result.current.refreshToken).toBe(mockResponse.refresh_token)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)

      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_access_token', mockResponse.access_token)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_refresh_token', mockResponse.refresh_token)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify(mockResponse.user))
    })

    it('should handle login errors', async () => {
      const errorMessage = 'Invalid authorization code'
      mockedAuthApi.loginWithGoogle.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await expect(result.current.loginWithGoogle('invalid-code')).rejects.toThrow(errorMessage)
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBe(errorMessage)
      expect(result.current.loading).toBe(false)
    })
  })

  describe('logout', () => {
    it('should clear auth state and localStorage', () => {
      const { result } = renderHook(() => useAuth())

      act(() => {
        result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)
      expect(result.current.accessToken).toBe(null)
      expect(result.current.refreshToken).toBe(null)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_access_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_refresh_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user')
    })
  })

  describe('handleOAuthCallback', () => {
    it('should handle OAuth callback successfully', async () => {
      const mockResponse = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User'
        }
      }

      mockedAuthApi.loginWithGoogle.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.handleOAuthCallback('test-code')
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockResponse.user)
    })

    it('should handle OAuth callback errors', async () => {
      const errorMessage = 'Invalid code'
      mockedAuthApi.loginWithGoogle.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.handleOAuthCallback('invalid-code')
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })
  })
}) 