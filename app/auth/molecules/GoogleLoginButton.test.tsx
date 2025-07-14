import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GoogleLoginButton } from './GoogleLoginButton'
import { useAuth } from '../atoms/useAuth'

// Mock the useAuth hook
jest.mock('../atoms/useAuth')

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('GoogleLoginButton', () => {
  const mockGetGoogleAuthUrl = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseAuth.mockReturnValue({
      getGoogleAuthUrl: mockGetGoogleAuthUrl,
      loading: false,
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      error: null,
      loginWithGoogle: jest.fn(),
      logout: jest.fn(),
      handleOAuthCallback: jest.fn()
    })
  })

  it('renders Google login button', () => {
    render(<GoogleLoginButton />)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Continue with Google')
  })

  it('handles Google login click successfully', async () => {
    const mockAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=test'
    mockGetGoogleAuthUrl.mockResolvedValue(mockAuthUrl)

    render(<GoogleLoginButton />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockGetGoogleAuthUrl).toHaveBeenCalled()
    })
  })

  it('handles Google login click error', async () => {
    const error = new Error('Failed to get auth URL')
    mockGetGoogleAuthUrl.mockRejectedValue(error)

    render(<GoogleLoginButton />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockGetGoogleAuthUrl).toHaveBeenCalled()
    })
  })
}) 