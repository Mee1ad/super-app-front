import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddNewItem } from './AddNewItem';

// Mock the hook
jest.mock('@/hooks/use-mobile-keyboard-focus', () => ({
  useMobileKeyboardFocusWithBackGesture: () => ({
    ref: { current: null },
    keyboardHeight: 0,
  }),
}));

describe('AddNewItem FAB Visibility', () => {
  const mockOnCreate = jest.fn();
  const mockOnUpdate = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('FAB Visibility States', () => {
    it('should show FAB when not editing and not showing input', () => {
      render(
        <AddNewItem 
          type="shopping" 
          onCreate={mockOnCreate}
          onUpdate={mockOnUpdate}
          onCancel={mockOnCancel}
          editItem={null}
        />
      );

      const fabButton = screen.getByRole('button', { name: /add shopping item/i });
      expect(fabButton).toBeInTheDocument();
    });

    it('should hide FAB when editing an item', () => {
      render(
        <AddNewItem 
          type="shopping" 
          onCreate={mockOnCreate}
          onUpdate={mockOnUpdate}
          onCancel={mockOnCancel}
          editItem={{
            id: '1',
            title: 'Test Item',
            url: 'https://example.com',
            price: '29.99',
            source: 'Store'
          }}
        />
      );

      // FAB should not be visible when editing
      expect(screen.queryByRole('button', { name: /add shopping item/i })).not.toBeInTheDocument();
    });

    it('should hide FAB when manually opening input form', () => {
      render(
        <AddNewItem 
          type="shopping" 
          onCreate={mockOnCreate}
          onUpdate={mockOnUpdate}
          onCancel={mockOnCancel}
          editItem={null}
        />
      );

      // Click FAB to open form
      const fabButton = screen.getByRole('button', { name: /add shopping item/i });
      fireEvent.click(fabButton);

      // FAB should be hidden when form is open
      expect(screen.queryByRole('button', { name: /add shopping item/i })).not.toBeInTheDocument();
    });
  });

  describe('Edit Flow', () => {
    it('should show form when editItem is provided', () => {
      render(
        <AddNewItem 
          type="shopping" 
          onCreate={mockOnCreate}
          onUpdate={mockOnUpdate}
          onCancel={mockOnCancel}
          editItem={{
            id: '1',
            title: 'Test Item',
            url: 'https://example.com',
            price: '29.99',
            source: 'Store'
          }}
        />
      );

      // Form should be visible with edit data
      expect(screen.getByDisplayValue('Test Item')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('29.99')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Store')).toBeInTheDocument();
    });

    it('should call onUpdate and hide form when saving edited item', async () => {
      render(
        <AddNewItem 
          type="shopping" 
          onCreate={mockOnCreate}
          onUpdate={mockOnUpdate}
          onCancel={mockOnCancel}
          editItem={{
            id: '1',
            title: 'Test Item',
            url: 'https://example.com',
            price: '29.99',
            source: 'Store'
          }}
        />
      );

      // Change the title
      const titleInput = screen.getByDisplayValue('Test Item');
      fireEvent.change(titleInput, { target: { value: 'Updated Item' } });

      // Click save button
      const saveButton = screen.getByRole('button', { name: /save item/i });
      fireEvent.click(saveButton);

      // Should call onUpdate with updated data
      expect(mockOnUpdate).toHaveBeenCalledWith(
        '1',
        'Updated Item',
        '', // description (empty string for shopping items)
        'https://example.com',
        '29.99',
        'Store'
      );

      // Form should be hidden after save
      await waitFor(() => {
        expect(screen.queryByDisplayValue('Updated Item')).not.toBeInTheDocument();
      });
    });

    it('should hide form when canceling edit', async () => {
      render(
        <AddNewItem 
          type="shopping" 
          onCreate={mockOnCreate}
          onUpdate={mockOnUpdate}
          onCancel={mockOnCancel}
          editItem={{
            id: '1',
            title: 'Test Item',
            url: 'https://example.com',
            price: '29.99',
            source: 'Store'
          }}
        />
      );

      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: /close form/i });
      fireEvent.click(cancelButton);

      // Form should be hidden after cancel
      await waitFor(() => {
        expect(screen.queryByDisplayValue('Test Item')).not.toBeInTheDocument();
      });

      // Should call onCancel when canceling edit
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should call onCancel and show FAB when canceling edited item', async () => {
      const { rerender } = render(
        <AddNewItem 
          type="shopping" 
          onCreate={mockOnCreate}
          onUpdate={mockOnUpdate}
          onCancel={mockOnCancel}
          editItem={{
            id: '1',
            title: 'Test Item',
            url: 'https://example.com',
            price: '29.99',
            source: 'Store'
          }}
        />
      );

      // Click close button
      const closeButton = screen.getByRole('button', { name: /close form/i });
      fireEvent.click(closeButton);

      // Should call onCancel
      expect(mockOnCancel).toHaveBeenCalled();

      // Simulate parent component clearing editItem
      rerender(
        <AddNewItem 
          type="shopping" 
          onCreate={mockOnCreate}
          onUpdate={mockOnUpdate}
          onCancel={mockOnCancel}
          editItem={null}
        />
      );

      // Wait for state updates
      await waitFor(() => {
        // FAB should be visible after canceling
        expect(screen.getByRole('button', { name: /add shopping item/i })).toBeInTheDocument();
      });
    });
  });

  describe('FAB Reappearance After Edit', () => {
    it('should show FAB again after editing and saving an item', async () => {
      const { rerender } = render(
        <AddNewItem 
          type="shopping" 
          onCreate={mockOnCreate}
          onUpdate={mockOnUpdate}
          onCancel={mockOnCancel}
          editItem={{
            id: '1',
            title: 'Test Item',
            url: 'https://example.com',
            price: '29.99',
            source: 'Store'
          }}
        />
      );

      // FAB should be hidden during edit
      expect(screen.queryByRole('button', { name: /add shopping item/i })).not.toBeInTheDocument();

      // Simulate edit completion by setting editItem to null
      rerender(
        <AddNewItem 
          type="shopping" 
          onCreate={mockOnCreate}
          onUpdate={mockOnUpdate}
          onCancel={mockOnCancel}
          editItem={null}
        />
      );

      // FAB should reappear after edit is complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add shopping item/i })).toBeInTheDocument();
      });
    });

    it('should show FAB again after editing and canceling an item', async () => {
      const { rerender } = render(
        <AddNewItem 
          type="shopping" 
          onCreate={mockOnCreate}
          onUpdate={mockOnUpdate}
          onCancel={mockOnCancel}
          editItem={{
            id: '1',
            title: 'Test Item',
            url: 'https://example.com',
            price: '29.99',
            source: 'Store'
          }}
        />
      );

      // FAB should be hidden during edit
      expect(screen.queryByRole('button', { name: /add shopping item/i })).not.toBeInTheDocument();

      // Simulate edit cancellation by setting editItem to null
      rerender(
        <AddNewItem 
          type="shopping" 
          onCreate={mockOnCreate}
          onUpdate={mockOnUpdate}
          onCancel={mockOnCancel}
          editItem={null}
        />
      );

      // FAB should reappear after edit is cancelled
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add shopping item/i })).toBeInTheDocument();
      });
    });
  });
}); 