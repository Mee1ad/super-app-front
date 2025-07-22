import { render, screen } from '@testing-library/react'
import { Sidebar } from './Sidebar'
import { useAuth } from '@/app/auth/atoms/useAuth'
import { usePathname } from 'next/navigation'

// Mock the hooks
jest.mock('@/app/auth/atoms/useAuth')
jest.mock('next/navigation')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

describe('Sidebar', () => {
  beforeEach(() => {
    // Default mock implementations
    mockUsePathname.mockReturnValue('/')
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
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders all navigation items for unauthenticated users except changelog', () => {
    render(<Sidebar />)
    
    expect(screen.getByText('Todo')).toBeInTheDocument()
    expect(screen.getByText('Food Planner')).toBeInTheDocument()
    expect(screen.getByText('Ideas')).toBeInTheDocument()
    expect(screen.getByText('Diary')).toBeInTheDocument()
    expect(screen.getByText('Habit')).toBeInTheDocument()
    expect(screen.queryByText('Changelog')).not.toBeInTheDocument()
  })

  it('shows changelog for authenticated users with changelog:view permission', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { 
        id: '1', 
        email: 'test@example.com',
        username: 'testuser',
        is_active: true,
        is_superuser: false,
        role_name: 'viewer'
      },
      accessToken: 'token',
      refreshToken: 'refresh',
      error: null,
      getGoogleAuthUrl: jest.fn(),
      loginWithGoogle: jest.fn(),
      handleOAuthCallback: jest.fn(),
      logout: jest.fn(),
      hasPermission: jest.fn().mockImplementation((permission) => {
        return permission === 'changelog:view'
      }),
      hasRole: jest.fn(),
    })

    render(<Sidebar />)
    
    expect(screen.getByText('Changelog')).toBeInTheDocument()
  })

  it('hides changelog for authenticated users without changelog:view permission', () => {
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
      hasPermission: jest.fn().mockReturnValue(false),
      hasRole: jest.fn(),
    })

    render(<Sidebar />)
    
    expect(screen.queryByText('Changelog')).not.toBeInTheDocument()
  })

  it('shows changelog for superusers', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { 
        id: '1', 
        email: 'admin@example.com',
        username: 'admin',
        is_active: true,
        is_superuser: true,
        role_name: 'admin'
      },
      accessToken: 'token',
      refreshToken: 'refresh',
      error: null,
      getGoogleAuthUrl: jest.fn(),
      loginWithGoogle: jest.fn(),
      handleOAuthCallback: jest.fn(),
      logout: jest.fn(),
      hasPermission: jest.fn().mockReturnValue(true),
      hasRole: jest.fn(),
    })

    render(<Sidebar />)
    
    expect(screen.getByText('Changelog')).toBeInTheDocument()
  })

  it('renders sign in button for unauthenticated users', () => {
    render(<Sidebar />)
    
    expect(screen.getByText('Sign in')).toBeInTheDocument()
  })

  it('renders user menu for authenticated users', () => {
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

    render(<Sidebar />)
    
    expect(screen.queryByText('Sign in')).not.toBeInTheDocument()
    // UserMenu component should be rendered (though we can't easily test its internal content)
  })

  it('highlights active navigation item', () => {
    mockUsePathname.mockReturnValue('/todo')
    
    render(<Sidebar />)
    
    const todoLink = screen.getByText('Todo').closest('a')
    expect(todoLink).toHaveClass('text-blue-600', 'bg-blue-50')
  })
}) 