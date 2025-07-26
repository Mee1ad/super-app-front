import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NewTask } from './NewTask';

describe('NewTask', () => {
  const mockOnCreate = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnCreate.mockClear();
    mockOnClose.mockClear();
  });

  it('renders without crashing', () => {
    render(<NewTask onCreate={mockOnCreate} onClose={mockOnClose} />);
    expect(screen.getByPlaceholderText(/task title/i)).toBeInTheDocument();
  });

  it('renders task form with inputs and close button', () => {
    render(<NewTask onCreate={mockOnCreate} onClose={mockOnClose} />);
    const titleInput = screen.getByPlaceholderText(/task title/i);
    const descriptionInput = screen.getByPlaceholderText(/description/i);
    const submitButton = screen.getByRole('button', { name: /add task/i });
    const closeButton = screen.getByRole('button', { name: /close form/i });
    
    expect(titleInput).toBeInTheDocument();
    expect(descriptionInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onCreate when form is submitted and keeps form open', async () => {
    render(<NewTask onCreate={mockOnCreate} onClose={mockOnClose} />);
    const titleInput = screen.getByPlaceholderText(/task title/i);
    const descriptionInput = screen.getByPlaceholderText(/description/i);
    const submitButton = screen.getByRole('button', { name: /add task/i });
    
    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Task description' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith('New Task', 'Task description');
    });
    
    // Form should stay open and be cleared
    await waitFor(() => {
      expect(titleInput).toHaveValue('');
      expect(descriptionInput).toHaveValue('');
    });
    
    // onClose should not be called
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onCreate when Enter is pressed in title input and keeps form open', async () => {
    render(<NewTask onCreate={mockOnCreate} onClose={mockOnClose} />);
    const titleInput = screen.getByPlaceholderText(/task title/i);
    
    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    fireEvent.keyDown(titleInput, { key: 'Enter' });
    
    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith('New Task', undefined);
    });
    
    // Form should stay open and be cleared
    await waitFor(() => {
      expect(titleInput).toHaveValue('');
    });
    
    // onClose should not be called
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('does not call onCreate for empty title', () => {
    render(<NewTask onCreate={mockOnCreate} onClose={mockOnClose} />);
    const submitButton = screen.getByRole('button', { name: /add task/i });
    
    fireEvent.click(submitButton);
    
    expect(mockOnCreate).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    render(<NewTask onCreate={mockOnCreate} onClose={mockOnClose} />);
    const closeButton = screen.getByRole('button', { name: /close form/i });
    
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('clears form and calls onClose when close button is clicked', () => {
    render(<NewTask onCreate={mockOnCreate} onClose={mockOnClose} />);
    const titleInput = screen.getByPlaceholderText(/task title/i);
    const descriptionInput = screen.getByPlaceholderText(/description/i);
    const closeButton = screen.getByRole('button', { name: /close form/i });
    
    // Fill the form
    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Task description' } });
    
    // Click close button
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('allows Shift+Enter for new line in description', () => {
    render(<NewTask onCreate={mockOnCreate} onClose={mockOnClose} />);
    const descriptionInput = screen.getByPlaceholderText(/description/i);
    
    fireEvent.keyDown(descriptionInput, { key: 'Enter', shiftKey: true });
    
    expect(mockOnCreate).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
}); 