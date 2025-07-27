import { render, screen, fireEvent } from '@testing-library/react'
import { FoodEntryCard } from './FoodEntryCard'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
}))

describe('FoodEntryCard', () => {
  const mockOnEdit = jest.fn()
  const mockOnDelete = jest.fn()

  const sampleEntry = {
    id: '1',
    name: 'Burger',
    description: 'Tasty burger with fries',
    price: 12.99,
    image_url: 'burger.jpg',
    date: '2025-01-15T12:00:00Z',
    user_id: 'user1',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call onEdit when mobile card is clicked', () => {
    render(
      <FoodEntryCard
        entry={sampleEntry}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    // Find the mobile card container and click it
    const burgerElements = screen.getAllByText('Burger')
    const mobileCard = burgerElements[0].closest('div') // First occurrence is mobile
    fireEvent.click(mobileCard!)

    expect(mockOnEdit).toHaveBeenCalledWith(sampleEntry)
  })

  it('should call onEdit when desktop card is clicked', () => {
    render(
      <FoodEntryCard
        entry={sampleEntry}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    // Find the desktop card and click it
    const burgerElements = screen.getAllByText('Burger')
    const desktopCard = burgerElements[1].closest('div') // Second occurrence is desktop
    fireEvent.click(desktopCard!)

    expect(mockOnEdit).toHaveBeenCalledWith(sampleEntry)
  })

  it('should render both mobile and desktop versions', () => {
    render(
      <FoodEntryCard
        entry={sampleEntry}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const burgerElements = screen.getAllByText('Burger')
    expect(burgerElements).toHaveLength(2) // Mobile and desktop versions
  })

  it('should have context menu structure', () => {
    render(
      <FoodEntryCard
        entry={sampleEntry}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    // Check that context menu triggers are present (using data attributes)
    const contextMenuTriggers = screen.getAllByTestId('context-menu-trigger')
    expect(contextMenuTriggers.length).toBeGreaterThan(0)
    
    // Check that the component renders both mobile and desktop versions
    const burgerElements = screen.getAllByText('Burger')
    expect(burgerElements).toHaveLength(2) // Mobile and desktop versions
  })
}) 