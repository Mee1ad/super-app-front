import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddNewList } from './AddNewList';

// Mock the mobile keyboard focus hook
jest.mock('@/hooks/use-mobile-keyboard-focus', () => ({
  useMobileKeyboardFocusWithBackGesture: () => ({
    ref: { current: null },
    keyboardHeight: 0
  })
}));

describe('AddNewList', () => {
  const mockOnCreate = jest.fn();

  beforeEach(() => {
    mockOnCreate.mockClear();
  });

  it('renders add new list button', () => {
    render(<AddNewList onCreate={mockOnCreate} />);
    
    expect(screen.getByLabelText('Add new list')).toBeInTheDocument();
  });

  it('opens options when button is clicked', () => {
    render(<AddNewList onCreate={mockOnCreate} />);
    
    const button = screen.getByLabelText('Add new list');
    fireEvent.click(button);
    
    expect(screen.getByText('Task List')).toBeInTheDocument();
    expect(screen.getByText('Shopping List')).toBeInTheDocument();
  });

  it('opens keyboard form when Task List is selected', () => {
    render(<AddNewList onCreate={mockOnCreate} />);
    
    const button = screen.getByLabelText('Add new list');
    fireEvent.click(button);
    
    fireEvent.click(screen.getByText('Task List'));
    
    expect(screen.getByPlaceholderText('Enter task list name...')).toBeInTheDocument();
  });

  it('opens keyboard form when Shopping List is selected', () => {
    render(<AddNewList onCreate={mockOnCreate} />);
    
    const button = screen.getByLabelText('Add new list');
    fireEvent.click(button);
    
    fireEvent.click(screen.getByText('Shopping List'));
    
    expect(screen.getByPlaceholderText('Enter shopping list name...')).toBeInTheDocument();
  });

  it('calls onCreate when form is submitted', () => {
    render(<AddNewList onCreate={mockOnCreate} />);
    
    const button = screen.getByLabelText('Add new list');
    fireEvent.click(button);
    
    fireEvent.click(screen.getByText('Task List'));
    
    const input = screen.getByPlaceholderText('Enter task list name...');
    fireEvent.change(input, { target: { value: 'My Task List' } });
    
    const submitButton = screen.getByLabelText('Submit form');
    fireEvent.click(submitButton);
    
    expect(mockOnCreate).toHaveBeenCalledWith('task', 'My Task List');
  });

  it('closes form when cancel button is clicked', () => {
    render(<AddNewList onCreate={mockOnCreate} />);
    
    const button = screen.getByLabelText('Add new list');
    fireEvent.click(button);
    
    fireEvent.click(screen.getByText('Task List'));
    
    expect(screen.getByPlaceholderText('Enter task list name...')).toBeInTheDocument();
    
    const cancelButton = screen.getByLabelText('Close form');
    fireEvent.click(cancelButton);
    
    expect(screen.queryByPlaceholderText('Enter task list name...')).not.toBeInTheDocument();
  });

  it('toggles options when button is clicked twice', () => {
    render(<AddNewList onCreate={mockOnCreate} />);
    
    const button = screen.getByLabelText('Add new list');
    
    // First click opens options
    fireEvent.click(button);
    expect(screen.getByText('Task List')).toBeInTheDocument();
    
    // Second click closes options
    fireEvent.click(button);
    expect(screen.queryByText('Task List')).not.toBeInTheDocument();
  });
}); 