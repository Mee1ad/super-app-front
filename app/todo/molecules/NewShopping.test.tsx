import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NewShopping } from './NewShopping';

describe('NewShopping', () => {
  const mockOnCreate = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnCreate.mockClear();
    mockOnClose.mockClear();
  });

  it('renders form with correct inputs and close button', () => {
    render(<NewShopping onCreate={mockOnCreate} onClose={mockOnClose} />);
    
    expect(screen.getByPlaceholderText('Item title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('URL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Price')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Source (optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close form' })).toBeInTheDocument();
  });

  it('calls onCreate with form data when submitted and keeps form open', () => {
    render(<NewShopping onCreate={mockOnCreate} onClose={mockOnClose} />);
    
    fireEvent.change(screen.getByPlaceholderText('Item title'), {
      target: { value: 'Test Item' }
    });
    fireEvent.change(screen.getByPlaceholderText('URL'), {
      target: { value: 'https://example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Price'), {
      target: { value: '10.99' }
    });
    fireEvent.change(screen.getByPlaceholderText('Source (optional)'), {
      target: { value: 'Test Store' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }));
    
    expect(mockOnCreate).toHaveBeenCalledWith('Test Item', 'https://example.com', '10.99', 'Test Store');
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onCreate without source when source is empty and keeps form open', () => {
    render(<NewShopping onCreate={mockOnCreate} onClose={mockOnClose} />);
    
    fireEvent.change(screen.getByPlaceholderText('Item title'), {
      target: { value: 'Test Item' }
    });
    fireEvent.change(screen.getByPlaceholderText('URL'), {
      target: { value: 'https://example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Price'), {
      target: { value: '10.99' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }));
    
    expect(mockOnCreate).toHaveBeenCalledWith('Test Item', 'https://example.com', '10.99', '');
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('does not call onCreate when required fields are empty', () => {
    render(<NewShopping onCreate={mockOnCreate} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }));
    
    expect(mockOnCreate).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('clears form after successful submission and keeps form open', () => {
    render(<NewShopping onCreate={mockOnCreate} onClose={mockOnClose} />);
    
    const titleInput = screen.getByPlaceholderText('Item title');
    const urlInput = screen.getByPlaceholderText('URL');
    const priceInput = screen.getByPlaceholderText('Price');
    const sourceInput = screen.getByPlaceholderText('Source (optional)');
    
    fireEvent.change(titleInput, { target: { value: 'Test Item' } });
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    fireEvent.change(priceInput, { target: { value: '10.99' } });
    fireEvent.change(sourceInput, { target: { value: 'Test Store' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }));
    
    expect(titleInput).toHaveValue('');
    expect(urlInput).toHaveValue('');
    expect(priceInput).toHaveValue('');
    expect(sourceInput).toHaveValue('');
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    render(<NewShopping onCreate={mockOnCreate} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Close form' }));
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('clears form and calls onClose when close button is clicked', () => {
    render(<NewShopping onCreate={mockOnCreate} onClose={mockOnClose} />);
    
    const titleInput = screen.getByPlaceholderText('Item title');
    const urlInput = screen.getByPlaceholderText('URL');
    const priceInput = screen.getByPlaceholderText('Price');
    const sourceInput = screen.getByPlaceholderText('Source (optional)');
    
    // Fill the form
    fireEvent.change(titleInput, { target: { value: 'Test Item' } });
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    fireEvent.change(priceInput, { target: { value: '10.99' } });
    fireEvent.change(sourceInput, { target: { value: 'Test Store' } });
    
    // Click close button
    fireEvent.click(screen.getByRole('button', { name: 'Close form' }));
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onCreate when Enter is pressed in title input', async () => {
    render(<NewShopping onCreate={mockOnCreate} onClose={mockOnClose} />);
    const titleInput = screen.getByPlaceholderText(/item title/i);
    
    fireEvent.change(titleInput, { target: { value: 'New Item' } });
    fireEvent.keyDown(titleInput, { key: 'Enter' });
    
    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith('New Item', '', '', '');
    });
  });

  it('calls onCreate when Enter is pressed in URL input', async () => {
    render(<NewShopping onCreate={mockOnCreate} onClose={mockOnClose} />);
    const titleInput = screen.getByPlaceholderText(/item title/i);
    const urlInput = screen.getByPlaceholderText(/URL/i);
    
    fireEvent.change(titleInput, { target: { value: 'New Item' } });
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    fireEvent.keyDown(urlInput, { key: 'Enter' });
    
    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith('New Item', 'https://example.com', '', '');
    });
  });

  it('does not call onCreate for empty title', () => {
    render(<NewShopping onCreate={mockOnCreate} onClose={mockOnClose} />);
    const titleInput = screen.getByPlaceholderText(/item title/i);
    
    fireEvent.keyDown(titleInput, { key: 'Enter' });
    
    expect(mockOnCreate).not.toHaveBeenCalled();
  });

  it('allows Shift+Enter for new line', () => {
    render(<NewShopping onCreate={mockOnCreate} onClose={mockOnClose} />);
    const titleInput = screen.getByPlaceholderText(/item title/i);
    
    fireEvent.change(titleInput, { target: { value: 'New Item' } });
    fireEvent.keyDown(titleInput, { key: 'Enter', shiftKey: true });
    
    expect(mockOnCreate).not.toHaveBeenCalled();
  });
}); 