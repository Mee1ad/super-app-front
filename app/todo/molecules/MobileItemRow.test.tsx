import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileItemRow } from './MobileItemRow';

const mockTaskItem = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Test Description',
  checked: false,
  variant: 'default' as const,
};

const mockShoppingItem = {
  id: 'item-1',
  title: 'Test Item',
  url: 'https://example.com',
  price: '29.99',
  source: 'Amazon',
  checked: false,
  variant: 'default' as const,
};

const mockProps = {
  onUpdate: jest.fn(),
  onDelete: jest.fn(),
  onToggle: jest.fn(),
};

describe('MobileItemRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Task Items', () => {
    it('renders task information correctly', () => {
      render(<MobileItemRow item={mockTaskItem} type="task" {...mockProps} />);
      
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('📝')).toBeInTheDocument();
    });

    it('shows checked state for tasks', () => {
      const checkedTask = { ...mockTaskItem, checked: true };
      render(<MobileItemRow item={checkedTask} type="task" {...mockProps} />);
      
      const checkbox = screen.getByRole('button');
      expect(checkbox).toHaveClass('bg-blue-600');
    });

    it('calls onToggle when checkbox is clicked', () => {
      render(<MobileItemRow item={mockTaskItem} type="task" {...mockProps} />);
      
      const checkbox = screen.getByRole('button');
      fireEvent.click(checkbox);
      
      expect(mockProps.onToggle).toHaveBeenCalledWith('task-1');
    });

    it('enters edit mode when edit icon is clicked', () => {
      render(<MobileItemRow item={mockTaskItem} type="task" {...mockProps} />);
      
      const editButton = screen.getByTestId('edit-item-icon');
      fireEvent.click(editButton);
      
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('saves task when save button is clicked', () => {
      render(<MobileItemRow item={mockTaskItem} type="task" {...mockProps} />);
      
      // Enter edit mode
      fireEvent.click(screen.getByTestId('edit-item-icon'));
      
      // Change title
      const titleInput = screen.getByDisplayValue('Test Task');
      fireEvent.change(titleInput, { target: { value: 'Updated Task' } });
      
      // Save
      fireEvent.click(screen.getByText('Save'));
      
      expect(mockProps.onUpdate).toHaveBeenCalledWith({
        ...mockTaskItem,
        title: 'Updated Task',
        description: 'Test Description',
      });
    });
  });

  describe('Shopping Items', () => {
    it('renders shopping item information correctly', () => {
      render(<MobileItemRow item={mockShoppingItem} type="shopping" {...mockProps} />);
      
      expect(screen.getByText('Test Item')).toBeInTheDocument();
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
      expect(screen.getByText('$29.99')).toBeInTheDocument();
      expect(screen.getByText('🛍️')).toBeInTheDocument();
    });

    it('shows checked state for shopping items', () => {
      const checkedItem = { ...mockShoppingItem, checked: true };
      render(<MobileItemRow item={checkedItem} type="shopping" {...mockProps} />);
      
      const checkbox = screen.getByRole('button');
      expect(checkbox).toHaveClass('bg-blue-600');
    });

    it('toggles shopping item when checkbox is clicked', () => {
      const { onUpdate, onDelete } = mockProps;
      render(<MobileItemRow item={mockShoppingItem} type="shopping" onUpdate={onUpdate} onDelete={onDelete} />);
      
      const checkbox = screen.getByRole('button');
      fireEvent.click(checkbox);
      
      expect(mockProps.onUpdate).toHaveBeenCalledWith({
        ...mockShoppingItem,
        checked: true,
      });
    });

    it('calls onToggle when provided and checkbox is clicked', () => {
      const mockOnToggle = jest.fn();
      render(<MobileItemRow item={mockShoppingItem} type="shopping" {...mockProps} onToggle={mockOnToggle} />);
      
      const checkbox = screen.getByRole('button');
      fireEvent.click(checkbox);
      
      expect(mockOnToggle).toHaveBeenCalledWith('item-1');
    });

    it('enters edit mode for shopping items', () => {
      render(<MobileItemRow item={mockShoppingItem} type="shopping" {...mockProps} />);
      
      const editButton = screen.getByTestId('edit-item-icon');
      fireEvent.click(editButton);
      
      expect(screen.getByDisplayValue('Test Item')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('29.99')).toBeInTheDocument();
    });

    it('saves shopping item when save button is clicked', () => {
      render(<MobileItemRow item={mockShoppingItem} type="shopping" {...mockProps} />);
      
      // Enter edit mode
      fireEvent.click(screen.getByTestId('edit-item-icon'));
      
      // Change title
      const titleInput = screen.getByDisplayValue('Test Item');
      fireEvent.change(titleInput, { target: { value: 'Updated Item' } });
      
      // Save
      fireEvent.click(screen.getByText('Save'));
      
      expect(mockProps.onUpdate).toHaveBeenCalledWith({
        ...mockShoppingItem,
        title: 'Updated Item',
        url: 'https://example.com',
        price: '29.99',
      });
    });
  });

  describe('Common functionality', () => {
    it('calls onDelete when delete icon is clicked', () => {
      render(<MobileItemRow item={mockTaskItem} type="task" {...mockProps} />);
      
      const deleteButton = screen.getByTestId('delete-item-icon');
      fireEvent.click(deleteButton);
      
      expect(mockProps.onDelete).toHaveBeenCalledWith('task-1');
    });

    it('shows separator when not last item', () => {
      render(<MobileItemRow item={mockTaskItem} type="task" {...mockProps} isLast={false} />);
      
      const separator = document.querySelector('.border-b');
      expect(separator).toBeInTheDocument();
    });

    it('does not show separator when is last item', () => {
      render(<MobileItemRow item={mockTaskItem} type="task" {...mockProps} isLast={true} />);
      
      const separator = document.querySelector('.border-b');
      expect(separator).not.toBeInTheDocument();
    });

    it('saves when Enter key is pressed', () => {
      render(<MobileItemRow item={mockTaskItem} type="task" {...mockProps} />);
      
      // Enter edit mode
      fireEvent.click(screen.getByTestId('edit-item-icon'));
      
      // Change title and press Enter
      const input = screen.getByDisplayValue('Test Task');
      fireEvent.change(input, { target: { value: 'Updated Task' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(mockProps.onUpdate).toHaveBeenCalled();
    });

    it('cancels when Escape key is pressed', () => {
      render(<MobileItemRow item={mockTaskItem} type="task" {...mockProps} />);
      
      // Enter edit mode
      fireEvent.click(screen.getByTestId('edit-item-icon'));
      
      // Change title and press Escape
      const input = screen.getByDisplayValue('Test Task');
      fireEvent.change(input, { target: { value: 'Updated Task' } });
      fireEvent.keyDown(input, { key: 'Escape' });
      
      // Should show original title
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(mockProps.onUpdate).not.toHaveBeenCalled();
    });
  });
}); 