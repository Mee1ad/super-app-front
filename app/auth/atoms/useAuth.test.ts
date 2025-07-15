import { renderHook, act } from '@testing-library/react'
import { useAuth } from './useAuth'
import { authApi } from './api'

// Mock the API
jest.mock('./api', () => ({
  authApi: {
    getGoogleAuthUrl: jest.fn(),
    loginWithGoogle: jest.fn(),
    getProfile: jest.fn()
  }
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

const mockAuthApi = authApi as jest.Mocked<typeof authApi>

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBe(null)
    expect(result.current.accessToken).toBe(null)
    expect(result.current.refreshToken).toBe(null)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('loads user from localStorage on mount', () => {
    const mockUser = { 
      id: '1', 
      email: 'test@example.com',
      username: 'testuser',
      is_active: true,
      is_superuser: false,
      role_name: 'user'
    }
    const mockTokens = {
      access_token: 'access123',
      refresh_token: 'refresh123'
    }

    localStorageMock.getItem
      .mockReturnValueOnce(mockTokens.access_token) // ACCESS_TOKEN
      .mockReturnValueOnce(mockTokens.refresh_token) // REFRESH_TOKEN
      .mockReturnValueOnce(JSON.stringify(mockUser)) // USER

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.accessToken).toBe(mockTokens.access_token)
    expect(result.current.refreshToken).toBe(mockTokens.refresh_token)
  })

  it('handles getGoogleAuthUrl successfully', async () => {
    const mockAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=test'
    mockAuthApi.getGoogleAuthUrl.mockResolvedValue({ 
      auth_url: mockAuthUrl,
      client_id: 'test-client-id',
      redirect_uri: 'http://localhost:8000/api/v1/auth/google/callback'
    })

    const { result } = renderHook(() => useAuth())

    let authUrl: string | null = null
    await act(async () => {
      authUrl = await result.current.getGoogleAuthUrl()
    })

    expect(authUrl).toBe(mockAuthUrl)
    expect(mockAuthApi.getGoogleAuthUrl).toHaveBeenCalled()
  })

  it('handles getGoogleAuthUrl error', async () => {
    const error = new Error('Failed to get auth URL')
    mockAuthApi.getGoogleAuthUrl.mockRejectedValue(error)

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      try {
        await result.current.getGoogleAuthUrl()
      } catch {
        // Expected to throw
      }
    })

    expect(mockAuthApi.getGoogleAuthUrl).toHaveBeenCalled()
  })

  it('handles loginWithGoogle successfully', async () => {
    const mockUser = { 
      id: '1', 
      email: 'test@example.com',
      username: 'testuser',
      is_active: true,
      is_superuser: false,
      role_name: 'user'
    }
    const mockTokens = {
      access_token: 'access123',
      refresh_token: 'refresh123'
    }
    const mockResponse = {
      user: mockUser,
      tokens: {
        access_token: mockTokens.access_token,
        refresh_token: mockTokens.refresh_token,
        expires_in: 3600
      }
    }

    mockAuthApi.loginWithGoogle.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.loginWithGoogle('auth_code_123')
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.accessToken).toBe(mockTokens.access_token)
    expect(result.current.refreshToken).toBe(mockTokens.refresh_token)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify(mockUser))
    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_access_token', mockTokens.access_token)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_refresh_token', mockTokens.refresh_token)
  })

  it('handles logout', () => {
    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBe(null)
    expect(result.current.accessToken).toBe(null)
    expect(result.current.refreshToken).toBe(null)
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_access_token')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_refresh_token')
  })
}) 