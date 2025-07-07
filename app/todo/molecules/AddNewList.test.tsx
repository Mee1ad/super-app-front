import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddNewList } from './AddNewList';

// Polyfill ResizeObserver for cmdk
beforeAll(() => {
  global.ResizeObserver =
    global.ResizeObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = function () {};
  }
});

describe('AddNewList', () => {
  const mockOnCreate = jest.fn();

  beforeEach(() => {
    mockOnCreate.mockClear();
  });

  it('renders add new list button', () => {
    render(<AddNewList onCreate={mockOnCreate} />);
    
    expect(screen.getByText('Add a new list')).toBeInTheDocument();
  });

  it('opens dropdown when button is clicked', () => {
    render(<AddNewList onCreate={mockOnCreate} />);
    
    const button = screen.getByText('Add a new list').closest('button');
    fireEvent.click(button!);
    
    expect(screen.getByPlaceholderText('Search list type...')).toBeInTheDocument();
    expect(screen.getByText('Task List')).toBeInTheDocument();
    expect(screen.getByText('Shopping List')).toBeInTheDocument();
  });

  it('calls onCreate with "task" when Task List is selected', () => {
    render(<AddNewList onCreate={mockOnCreate} />);
    
    const button = screen.getByText('Add a new list').closest('button');
    fireEvent.click(button!);
    
    fireEvent.click(screen.getByText('Task List'));
    
    expect(mockOnCreate).toHaveBeenCalledWith('task');
  });

  it('calls onCreate with "shopping" when Shopping List is selected', () => {
    render(<AddNewList onCreate={mockOnCreate} />);
    
    const button = screen.getByText('Add a new list').closest('button');
    fireEvent.click(button!);
    
    fireEvent.click(screen.getByText('Shopping List'));
    
    expect(mockOnCreate).toHaveBeenCalledWith('shopping');
  });

  it('closes dropdown after selection', () => {
    render(<AddNewList onCreate={mockOnCreate} />);
    
    const button = screen.getByText('Add a new list').closest('button');
    fireEvent.click(button!);
    
    expect(screen.getByPlaceholderText('Search list type...')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Task List'));
    
    expect(screen.queryByPlaceholderText('Search list type...')).not.toBeInTheDocument();
  });

  it('toggles dropdown when button is clicked twice', () => {
    render(<AddNewList onCreate={mockOnCreate} />);
    
    const button = screen.getByText('Add a new list').closest('button');
    
    // First click opens dropdown
    fireEvent.click(button!);
    expect(screen.getByPlaceholderText('Search list type...')).toBeInTheDocument();
    
    // Second click closes dropdown
    fireEvent.click(button!);
    expect(screen.queryByPlaceholderText('Search list type...')).not.toBeInTheDocument();
  });
}); 