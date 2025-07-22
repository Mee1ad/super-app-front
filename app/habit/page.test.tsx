import { render, screen, waitFor } from '@testing-library/react'
import HabitPage from './page'

describe('HabitPage', () => {
  it('renders habit tracker content after client-side hydration', async () => {
    render(<HabitPage />)
    
    // Initially should show basic content without dark mode classes
    expect(screen.getByText('Habit Tracker')).toBeInTheDocument()
    expect(screen.getByText('Coming Soon')).toBeInTheDocument()
    expect(screen.getByText(/We're working on building an amazing habit tracking experience/)).toBeInTheDocument()
    
    // Wait for client-side hydration
    await waitFor(() => {
      // After hydration, should still show the same content
      expect(screen.getByText('Habit Tracker')).toBeInTheDocument()
      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
      expect(screen.getByText(/We're working on building an amazing habit tracking experience/)).toBeInTheDocument()
    })
  })

  it('renders Target icon', () => {
    render(<HabitPage />)
    
    // The Target icon should be present as an SVG
    const iconContainer = screen.getByText('Habit Tracker').closest('div')?.querySelector('svg')
    expect(iconContainer).toBeInTheDocument()
  })

  it('has correct layout structure', () => {
    render(<HabitPage />)
    
    // Should have the main heading
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Habit Tracker')
    
    // Should have the subheading
    const subheading = screen.getByRole('heading', { level: 3 })
    expect(subheading).toHaveTextContent('Coming Soon')
  })
}) 