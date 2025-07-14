import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GoogleLoginButton } from './GoogleLoginButton'
import { useAuth } from '../atoms/useAuth'

// Mock the useAuth hook
jest.mock('../atoms/useAuth')
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000'
  },
  writable: true
})

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

  it('renders with default props', () => {
    render(<GoogleLoginButton />)
    
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Continue with Google')).toBeInTheDocument()
  })

  it('renders with custom children', () => {
    render(<GoogleLoginButton>Sign in with Google</GoogleLoginButton>)
    
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<GoogleLoginButton className="custom-class" />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('handles Google login click successfully', async () => {
    const mockAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=test'
    mockGetGoogleAuthUrl.mockResolvedValue(mockAuthUrl)

    render(<GoogleLoginButton />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockGetGoogleAuthUrl).toHaveBeenCalled()
      expect(window.location.href).toBe(mockAuthUrl)
    })
  })

  it('shows loading state when getting auth URL', async () => {
    mockGetGoogleAuthUrl.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve('https://accounts.google.com/o/oauth2/v2/auth'), 100)
    }))

    render(<GoogleLoginButton />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByText('Connecting...')).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('handles error when getting auth URL fails', async () => {
    const error = new Error('Failed to get auth URL')
    mockGetGoogleAuthUrl.mockRejectedValue(error)

    render(<GoogleLoginButton />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockGetGoogleAuthUrl).toHaveBeenCalled()
    })

    // Button should be re-enabled after error
    expect(button).not.toBeDisabled()
  })

  it('shows loading spinner when hook is loading', () => {
    mockedUseAuth.mockReturnValue({
      getGoogleAuthUrl: mockGetGoogleAuthUrl,
      loading: true,
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      error: null,
      loginWithGoogle: jest.fn(),
      logout: jest.fn(),
      handleOAuthCallback: jest.fn()
    })

    render(<GoogleLoginButton />)
    
    expect(screen.getByText('Connecting...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies different variants', () => {
    const { rerender } = render(<GoogleLoginButton variant="default" />)
    expect(screen.getByRole('button')).toHaveClass('bg-primary')

    rerender(<GoogleLoginButton variant="outline" />)
    expect(screen.getByRole('button')).toHaveClass('border')

    rerender(<GoogleLoginButton variant="ghost" />)
    expect(screen.getByRole('button')).toHaveClass('hover:bg-accent')
  })

  it('applies different sizes', () => {
    const { rerender } = render(<GoogleLoginButton size="sm" />)
    expect(screen.getByRole('button')).toHaveClass('h-9')

    rerender(<GoogleLoginButton size="default" />)
    expect(screen.getByRole('button')).toHaveClass('h-10')

    rerender(<GoogleLoginButton size="lg" />)
    expect(screen.getByRole('button')).toHaveClass('h-11')
  })
}) 