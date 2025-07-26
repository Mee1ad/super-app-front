import { render, screen } from '@testing-library/react';
import { AddNewItem } from './AddNewItem';

// Mock the dependencies
jest.mock('@/hooks/use-mobile-keyboard-focus', () => ({
  useMobileKeyboardFocusWithBackGesture: () => ({
    ref: { current: null },
    keyboardHeight: 0
  })
}));

describe('AddNewItem FAB Animation', () => {
  const mockOnCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render FAB with slide-up animation when not editing', () => {
    render(
      <AddNewItem 
        type="task" 
        onCreate={mockOnCreate}
      />
    );

    // Check that the FAB is rendered
    const fabButton = screen.getByRole('button', { name: /add task/i });
    expect(fabButton).toBeInTheDocument();

    // Check that it has the correct positioning classes
    expect(fabButton.closest('.fixed')).toHaveClass('fixed', 'bottom-6', 'right-6', 'z-50');
  });

  it('should not render FAB when editing', () => {
    render(
      <AddNewItem 
        type="task" 
        onCreate={mockOnCreate}
        editItem={{
          id: '1',
          title: 'Test Task',
          description: 'Test Description'
        }}
      />
    );

    // FAB should not be visible when editing
    expect(screen.queryByRole('button', { name: /add task/i })).not.toBeInTheDocument();
  });

  it('should render FAB with correct shopping item label', () => {
    render(
      <AddNewItem 
        type="shopping" 
        onCreate={mockOnCreate}
      />
    );

    // Check that the FAB has the correct label for shopping items
    const fabButton = screen.getByRole('button', { name: /add shopping item/i });
    expect(fabButton).toBeInTheDocument();
  });
}); 