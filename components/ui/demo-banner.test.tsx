import { render, screen, fireEvent } from '@testing-library/react'
import { DemoBanner } from './demo-banner'
import { useAuth } from '@/app/auth/atoms/useAuth'
import { usePersistentState } from '@/hooks/use-persistent-state'

// Mock the hooks
jest.mock('@/app/auth/atoms/useAuth')
jest.mock('@/hooks/use-persistent-state')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUsePersistentState = usePersistentState as jest.MockedFunction<typeof usePersistentState>

describe('DemoBanner', () => {
  beforeEach(() => {
    // Reset localStorage
    localStorage.clear()
    
    // Default mock implementations
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      error: null,
      getGoogleAuthUrl: jest.fn(),
      loginWithGoogle: jest.fn(),
      handleOAuthCallback: jest.fn(),
      logout: jest.fn(),
      hasPermission: jest.fn(),
      hasRole: jest.fn(),
    })

    mockUsePersistentState.mockReturnValue([
      true, // isVisible
      jest.fn(), // setIsVisible
    ])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders demo banner when user is not authenticated and banner is visible', () => {
    render(<DemoBanner />)
    
    expect(screen.getByText('Demo Mode')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('does not render when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { 
        id: '1', 
        email: 'test@example.com',
        username: 'testuser',
        is_active: true,
        is_superuser: false,
        role_name: 'user'
      },
      accessToken: 'token',
      refreshToken: 'refresh',
      error: null,
      getGoogleAuthUrl: jest.fn(),
      loginWithGoogle: jest.fn(),
      handleOAuthCallback: jest.fn(),
      logout: jest.fn(),
      hasPermission: jest.fn(),
      hasRole: jest.fn(),
    })

    render(<DemoBanner />)
    
    expect(screen.queryByText('Demo Mode')).not.toBeInTheDocument()
  })

  it('does not render when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
      user: null,
      accessToken: null,
      refreshToken: null,
      error: null,
      getGoogleAuthUrl: jest.fn(),
      loginWithGoogle: jest.fn(),
      handleOAuthCallback: jest.fn(),
      logout: jest.fn(),
      hasPermission: jest.fn(),
      hasRole: jest.fn(),
    })

    render(<DemoBanner />)
    
    expect(screen.queryByText('Demo Mode')).not.toBeInTheDocument()
  })

  it('does not render when banner is dismissed', () => {
    mockUsePersistentState.mockReturnValue([
      false, // isVisible
      jest.fn(), // setIsVisible
    ])

    render(<DemoBanner />)
    
    expect(screen.queryByText('Demo Mode')).not.toBeInTheDocument()
  })

  it('calls setIsVisible when close button is clicked', () => {
    const mockSetIsVisible = jest.fn()
    mockUsePersistentState.mockReturnValue([
      true, // isVisible
      mockSetIsVisible, // setIsVisible
    ])

    render(<DemoBanner />)
    
    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)
    
    expect(mockSetIsVisible).toHaveBeenCalledWith(false)
  })

  it('uses persistent state hook with correct key', () => {
    render(<DemoBanner />)
    
    expect(mockUsePersistentState).toHaveBeenCalledWith('demo-banner-dismissed', true)
  })

  it('has correct layout structure with sidebar offset', () => {
    render(<DemoBanner />)
    
    // Find the container div that has the ml-64 class
    const container = screen.getByText('Demo Mode').closest('.ml-64')
    expect(container).toBeInTheDocument()
  })
}) 