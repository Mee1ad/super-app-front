import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NewTask } from './NewTask';

describe('NewTask', () => {
  const mockOnCreate = jest.fn();

  beforeEach(() => {
    mockOnCreate.mockClear();
  });

  it('renders task form with inputs', () => {
    render(<NewTask onCreate={mockOnCreate} />);
    const titleInput = screen.getByPlaceholderText(/task title/i);
    const descriptionInput = screen.getByPlaceholderText(/description/i);
    const submitButton = screen.getByRole('button', { name: /add task/i });
    
    expect(titleInput).toBeInTheDocument();
    expect(descriptionInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('calls onCreate when form is submitted', async () => {
    render(<NewTask onCreate={mockOnCreate} />);
    const titleInput = screen.getByPlaceholderText(/task title/i);
    const descriptionInput = screen.getByPlaceholderText(/description/i);
    const submitButton = screen.getByRole('button', { name: /add task/i });
    
    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Task description' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith('New Task', 'Task description');
    });
  });

  it('calls onCreate when Enter is pressed in title input', async () => {
    render(<NewTask onCreate={mockOnCreate} />);
    const titleInput = screen.getByPlaceholderText(/task title/i);
    
    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    fireEvent.keyDown(titleInput, { key: 'Enter' });
    
    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith('New Task', undefined);
    });
  });

  it('does not call onCreate for empty title', () => {
    render(<NewTask onCreate={mockOnCreate} />);
    const submitButton = screen.getByRole('button', { name: /add task/i });
    
    fireEvent.click(submitButton);
    
    expect(mockOnCreate).not.toHaveBeenCalled();
  });

  it('clears form after successful submission', async () => {
    render(<NewTask onCreate={mockOnCreate} />);
    const titleInput = screen.getByPlaceholderText(/task title/i);
    const descriptionInput = screen.getByPlaceholderText(/description/i);
    const submitButton = screen.getByRole('button', { name: /add task/i });
    
    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Task description' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(titleInput).toHaveValue('');
      expect(descriptionInput).toHaveValue('');
    });
  });

  it('allows Shift+Enter for new line in description', () => {
    render(<NewTask onCreate={mockOnCreate} />);
    const descriptionInput = screen.getByPlaceholderText(/description/i);
    
    fireEvent.keyDown(descriptionInput, { key: 'Enter', shiftKey: true });
    
    expect(mockOnCreate).not.toHaveBeenCalled();
  });
}); 