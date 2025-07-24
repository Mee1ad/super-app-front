import { render, screen } from '@testing-library/react'
import { AppLayout } from './AppLayout'

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
    expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'pt-20', 'pb-6', 'md:px-6', 'md:py-8', 'max-w-6xl')
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
    expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'pt-20', 'pb-6', 'md:px-6', 'md:py-8', 'max-w-6xl')
  })
}) 