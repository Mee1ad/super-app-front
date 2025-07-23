import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListRow } from './ListRow';

const mockProps = {
  id: 'test-id',
  title: 'Test List',
  type: 'task' as const,
  itemCount: 5,
  onUpdateTitle: jest.fn(),
  onDelete: jest.fn(),
  onClick: jest.fn(),
};

describe('ListRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders list information correctly', () => {
    render(<ListRow {...mockProps} />);
    
    expect(screen.getByText('Test List')).toBeInTheDocument();
    expect(screen.getByText('5 Tasks')).toBeInTheDocument();
    expect(screen.getByText('📋')).toBeInTheDocument();
  });

  it('renders shopping list with correct icon and label', () => {
    render(<ListRow {...mockProps} type="shopping" itemCount={3} />);
    
    expect(screen.getByText('3 Items')).toBeInTheDocument();
    expect(screen.getByText('🛒')).toBeInTheDocument();
  });

  it('calls onClick when row is clicked', () => {
    render(<ListRow {...mockProps} />);
    
    fireEvent.click(screen.getByText('Test List'));
    expect(mockProps.onClick).toHaveBeenCalledWith('test-id');
  });

  it('enters edit mode when edit icon is clicked', () => {
    render(<ListRow {...mockProps} />);
    
    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    
    expect(screen.getByDisplayValue('Test List')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onDelete when delete icon is clicked', () => {
    render(<ListRow {...mockProps} />);
    
    const deleteIcon = screen.getByTestId('delete-icon');
    fireEvent.click(deleteIcon);
    
    expect(mockProps.onDelete).toHaveBeenCalledWith('test-id');
  });

  it('saves title when save button is clicked', () => {
    render(<ListRow {...mockProps} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByTestId('edit-icon'));
    
    // Change title
    const input = screen.getByDisplayValue('Test List');
    fireEvent.change(input, { target: { value: 'Updated Title' } });
    
    // Save
    fireEvent.click(screen.getByText('Save'));
    
    expect(mockProps.onUpdateTitle).toHaveBeenCalledWith('test-id', 'Updated Title');
  });

  it('cancels edit when cancel button is clicked', () => {
    render(<ListRow {...mockProps} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByTestId('edit-icon'));
    
    // Change title
    const input = screen.getByDisplayValue('Test List');
    fireEvent.change(input, { target: { value: 'Updated Title' } });
    
    // Cancel
    fireEvent.click(screen.getByText('Cancel'));
    
    // Should show original title
    expect(screen.getByText('Test List')).toBeInTheDocument();
    expect(mockProps.onUpdateTitle).not.toHaveBeenCalled();
  });

  it('saves title when Enter key is pressed', () => {
    render(<ListRow {...mockProps} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByTestId('edit-icon'));
    
    // Change title and press Enter
    const input = screen.getByDisplayValue('Test List');
    fireEvent.change(input, { target: { value: 'Updated Title' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(mockProps.onUpdateTitle).toHaveBeenCalledWith('test-id', 'Updated Title');
  });

  it('cancels edit when Escape key is pressed', () => {
    render(<ListRow {...mockProps} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByTestId('edit-icon'));
    
    // Change title and press Escape
    const input = screen.getByDisplayValue('Test List');
    fireEvent.change(input, { target: { value: 'Updated Title' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    
    expect(mockProps.onUpdateTitle).not.toHaveBeenCalled();
  });

  it('shows separator when not last item', () => {
    render(<ListRow {...mockProps} isLast={false} />);
    
    // Should have a border separator
    const separator = document.querySelector('.border-b');
    expect(separator).toBeInTheDocument();
  });

  it('does not show separator when is last item', () => {
    render(<ListRow {...mockProps} isLast={true} />);
    
    // Should not have a border separator
    const separator = document.querySelector('.border-b');
    expect(separator).not.toBeInTheDocument();
  });
}); 