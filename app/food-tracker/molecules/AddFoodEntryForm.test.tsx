import { render, screen, fireEvent } from '@testing-library/react'
import { AddFoodEntryForm } from './AddFoodEntryForm'

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true
})

// Mock the hooks and dependencies
jest.mock('@/hooks/use-mobile-keyboard-focus', () => ({
  useMobileKeyboardFocusWithBackGesture: () => ({
    ref: { current: null },
    keyboardHeight: 0
  })
}))

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: React.ComponentProps<'div'>) => <div>{children}</div>
}))

describe('AddFoodEntryForm', () => {
  const mockOnCreate = jest.fn()
  const mockOnUpdate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should have description button inactive by default', () => {
    render(
      <AddFoodEntryForm
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
        editEntry={null}
      />
    )

    // First, click the FAB to open the form
    const fabButton = screen.getByLabelText('Add food entry')
    fireEvent.click(fabButton)

    const descriptionButton = screen.getByText('Description')
    expect(descriptionButton).toBeInTheDocument()
    
    // Check that the button has inactive styling (gray border and text)
    expect(descriptionButton).toHaveClass('border-gray-300')
    expect(descriptionButton).toHaveClass('text-gray-600')
    expect(descriptionButton).toHaveClass('bg-white')
  })

  it('should show description input when description button is clicked', () => {
    render(
      <AddFoodEntryForm
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
        editEntry={null}
      />
    )

    // First, click the FAB to open the form
    const fabButton = screen.getByLabelText('Add food entry')
    fireEvent.click(fabButton)

    const descriptionButton = screen.getByText('Description')
    
    // Initially, description input should not be visible
    expect(screen.queryByPlaceholderText('Description (optional)')).not.toBeInTheDocument()
    
    // Click the description button
    fireEvent.click(descriptionButton)
    
    // Now description input should be visible
    expect(screen.getByPlaceholderText('Description (optional)')).toBeInTheDocument()
    
    // Button should now have active styling (consistent primary theme)
    expect(descriptionButton).toHaveClass('border-primary')
    expect(descriptionButton).toHaveClass('bg-primary')
    expect(descriptionButton).toHaveClass('text-primary-foreground')
  })

  it('should hide description input when description button is clicked again', () => {
    render(
      <AddFoodEntryForm
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
        editEntry={null}
      />
    )

    // First, click the FAB to open the form
    const fabButton = screen.getByLabelText('Add food entry')
    fireEvent.click(fabButton)

    const descriptionButton = screen.getByText('Description')
    
    // Click to show description input
    fireEvent.click(descriptionButton)
    expect(screen.getByPlaceholderText('Description (optional)')).toBeInTheDocument()
    
    // Click again to hide description input
    fireEvent.click(descriptionButton)
    expect(screen.queryByPlaceholderText('Description (optional)')).not.toBeInTheDocument()
  })

  it('should have description button inactive when editing an entry with description', () => {
    const editEntry = {
      id: '1',
      name: 'Test Food',
      description: 'Test description',
      price: 10.99,
      image_url: 'test.jpg',
      date: '2025-01-01T00:00:00Z',
      user_id: 'user1',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    }

    render(
      <AddFoodEntryForm
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
        editEntry={editEntry}
      />
    )

    // When editing, the form should be open automatically
    const descriptionButton = screen.getByText('Description')
    
    // Even though the entry has a description, the button should be inactive by default
    expect(descriptionButton).toHaveClass('border-gray-300')
    expect(descriptionButton).toHaveClass('text-gray-600')
    expect(descriptionButton).toHaveClass('bg-white')
    
    // Description input should not be visible by default
    expect(screen.queryByPlaceholderText('Description (optional)')).not.toBeInTheDocument()
  })

  it('should show description input when editing and description button is clicked', () => {
    const editEntry = {
      id: '1',
      name: 'Test Food',
      description: 'Test description',
      price: 10.99,
      image_url: 'test.jpg',
      date: '2025-01-01T00:00:00Z',
      user_id: 'user1',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    }

    render(
      <AddFoodEntryForm
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
        editEntry={editEntry}
      />
    )

    // When editing, the form should be open automatically, so we don't need to click the FAB
    const descriptionButton = screen.getByText('Description')
    
    // Click the description button
    fireEvent.click(descriptionButton)
    
    // Description input should be visible and contain the existing description
    const descriptionInput = screen.getByPlaceholderText('Description (optional)')
    expect(descriptionInput).toBeInTheDocument()
    expect(descriptionInput).toHaveValue('Test description')
  })

  it('should have consistent primary theme styling for all toggle buttons when active', () => {
    render(
      <AddFoodEntryForm
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
        editEntry={null}
      />
    )

    // First, click the FAB to open the form
    const fabButton = screen.getByLabelText('Add food entry')
    fireEvent.click(fabButton)

    const descriptionButton = screen.getByText('Description')
    const priceButton = screen.getByText('Price')
    const cameraButton = screen.getByText('Camera')

    // Click each button to activate them
    fireEvent.click(descriptionButton)
    fireEvent.click(priceButton)
    fireEvent.click(cameraButton)

    // All buttons should have the same primary theme styling when active
    const activeButtonClasses = [
      'border-primary',
      'bg-primary', 
      'text-primary-foreground',
      'shadow-md'
    ]

    activeButtonClasses.forEach(className => {
      expect(descriptionButton).toHaveClass(className)
      expect(priceButton).toHaveClass(className)
      expect(cameraButton).toHaveClass(className)
    })
  })

  it('should have consistent styling for meal type dropdown', () => {
    render(
      <AddFoodEntryForm
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
        editEntry={null}
      />
    )

    // First, click the FAB to open the form
    const fabButton = screen.getByLabelText('Add food entry')
    fireEvent.click(fabButton)

    // Find the meal type dropdown button (it shows "breakfast" by default)
    const mealTypeButton = screen.getByText('breakfast').closest('button')
    expect(mealTypeButton).toBeInTheDocument()

    // Check that it has the same inactive styling as other buttons
    expect(mealTypeButton).toHaveClass('border-gray-300')
    expect(mealTypeButton).toHaveClass('text-gray-600')
    expect(mealTypeButton).toHaveClass('bg-white')
  })

  it('should have readable text for all dropdown options including selected ones', () => {
    render(
      <AddFoodEntryForm
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
        editEntry={null}
      />
    )

    // First, click the FAB to open the form
    const fabButton = screen.getByLabelText('Add food entry')
    fireEvent.click(fabButton)

    // Click the meal type dropdown to open it
    const mealTypeButton = screen.getByText('breakfast').closest('button')
    fireEvent.click(mealTypeButton!)

    // Check that all options are visible and have proper styling
    const breakfastOptions = screen.getAllByText('breakfast')
    const lunchOption = screen.getByText('lunch')
    const dinnerOption = screen.getByText('dinner')
    const snackOption = screen.getByText('snack')

    // The second breakfast option (in dropdown) should have primary styling
    const breakfastDropdownOption = breakfastOptions[1] // Second occurrence is in dropdown
    expect(breakfastDropdownOption.closest('button')).toHaveClass('bg-primary')
    expect(breakfastDropdownOption.closest('button')).toHaveClass('text-primary-foreground')
    expect(breakfastDropdownOption.closest('button')).toHaveClass('hover:bg-primary/90')

    // Non-selected options should have gray text
    expect(lunchOption.closest('button')).toHaveClass('text-gray-600')
    expect(dinnerOption.closest('button')).toHaveClass('text-gray-600')
    expect(snackOption.closest('button')).toHaveClass('text-gray-600')
  })

  it('should open edit form automatically when editEntry is provided', () => {
    const editEntry = {
      id: '1',
      name: 'Test Food',
      description: 'Test description',
      price: 10.99,
      image_url: 'test.jpg',
      date: '2025-01-01T00:00:00Z',
      user_id: 'user1',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    }

    render(
      <AddFoodEntryForm
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
        editEntry={editEntry}
      />
    )

    // Form should be open automatically when editing
    expect(screen.getByDisplayValue('Test Food')).toBeInTheDocument()
    expect(screen.getByDisplayValue('10.99')).toBeInTheDocument()
    
    // FAB should not be visible when editing
    expect(screen.queryByLabelText('Add food entry')).not.toBeInTheDocument()
  })

  it('should populate form fields correctly when editing', () => {
    const editEntry = {
      id: '1',
      name: 'Pizza',
      description: 'Delicious pizza',
      price: 15.50,
      image_url: 'pizza.jpg',
      date: '2025-01-15T00:00:00Z',
      user_id: 'user1',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    }

    render(
      <AddFoodEntryForm
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
        editEntry={editEntry}
      />
    )

    // Check that all fields are populated correctly
    expect(screen.getByDisplayValue('Pizza')).toBeInTheDocument()
    expect(screen.getByDisplayValue('15.5')).toBeInTheDocument()
    expect(screen.getByDisplayValue('pizza.jpg')).toBeInTheDocument()
    
    // Description should be in the form data but not visible by default
    const descriptionButton = screen.getByText('Description')
    fireEvent.click(descriptionButton)
    expect(screen.getByDisplayValue('Delicious pizza')).toBeInTheDocument()
  })

  it('should show FAB after closing edit form', () => {
    const mockOnCancel = jest.fn()
    const editEntry = {
      id: '1',
      name: 'Pizza',
      description: 'Delicious pizza',
      price: 15.50,
      image_url: 'pizza.jpg',
      date: '2025-01-15T00:00:00Z',
      user_id: 'user1',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    }

    render(
      <AddFoodEntryForm
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
        editEntry={editEntry}
        onCancel={mockOnCancel}
      />
    )

    // Form should be open when editing
    expect(screen.getByDisplayValue('Pizza')).toBeInTheDocument()
    expect(screen.queryByLabelText('Add food entry')).not.toBeInTheDocument()

    // Close the form
    const closeButton = screen.getByLabelText('Close form')
    fireEvent.click(closeButton)

    // onCancel should be called
    expect(mockOnCancel).toHaveBeenCalled()

    // Form should be closed
    expect(screen.queryByDisplayValue('Pizza')).not.toBeInTheDocument()
  })

  it('should show FAB when editEntry becomes null', () => {
    const { rerender } = render(
      <AddFoodEntryForm
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
        editEntry={null}
      />
    )

    // FAB should be visible when not editing
    expect(screen.getByLabelText('Add food entry')).toBeInTheDocument()

    // Simulate editing by passing an editEntry
    const editEntry = {
      id: '1',
      name: 'Pizza',
      description: 'Delicious pizza',
      price: 15.50,
      image_url: 'pizza.jpg',
      date: '2025-01-15T00:00:00Z',
      user_id: 'user1',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    }

    rerender(
      <AddFoodEntryForm
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
        editEntry={editEntry}
      />
    )

    // FAB should be hidden when editing
    expect(screen.queryByLabelText('Add food entry')).not.toBeInTheDocument()

    // Simulate closing edit by setting editEntry to null
    rerender(
      <AddFoodEntryForm
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
        editEntry={null}
      />
    )

    // FAB should be visible again
    expect(screen.getByLabelText('Add food entry')).toBeInTheDocument()
  })
}) 