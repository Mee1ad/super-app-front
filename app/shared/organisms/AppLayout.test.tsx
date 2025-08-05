import { render, screen } from '@testing-library/react'
import { AppLayout } from './AppLayout'

// Mock the dependencies
jest.mock('./SidebarContext', () => ({
  useSidebar: () => ({
    toggleMobileMenu: jest.fn()
  })
}))

jest.mock('./Header', () => ({
  Header: ({ title, onMenuClick }: { title: string; onMenuClick?: () => void }) => (
    <div data-testid="header">
      <button onClick={onMenuClick} data-testid="menu-button">Menu</button>
      <h1>{title}</h1>
    </div>
  )
}))

describe('AppLayout', () => {
  it('renders children with correct layout classes', () => {
    render(
      <AppLayout>
        <div data-testid="test-content">Test content</div>
      </AppLayout>
    )

    const content = screen.getByTestId('test-content')
    expect(content).toBeInTheDocument()
    
    // Check that the layout container has the correct classes
    const container = content.parentElement
    expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'pb-6', 'md:px-6', 'md:py-8', 'max-w-6xl')
  })

  it('applies custom className when provided', () => {
    render(
      <AppLayout className="custom-class">
        <div data-testid="test-content">Test content</div>
      </AppLayout>
    )

    const container = screen.getByTestId('test-content').parentElement
    expect(container).toHaveClass('custom-class')
  })

  it('renders without custom className', () => {
    render(
      <AppLayout>
        <div data-testid="test-content">Test content</div>
      </AppLayout>
    )

    const container = screen.getByTestId('test-content').parentElement
    expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'pb-6', 'md:px-6', 'md:py-8', 'max-w-6xl')
  })

  it('renders header when title is provided', () => {
    render(
      <AppLayout title="Test Title">
        <div data-testid="test-content">Test content</div>
      </AppLayout>
    )

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders custom header when provided', () => {
    const customHeader = <div data-testid="custom-header">Custom Header</div>
    
    render(
      <AppLayout customHeader={customHeader}>
        <div data-testid="test-content">Test content</div>
      </AppLayout>
    )

    expect(screen.getByTestId('custom-header')).toBeInTheDocument()
    expect(screen.queryByTestId('header')).not.toBeInTheDocument()
  })
}) 