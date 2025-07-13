import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NewShopping } from './NewShopping';

describe('NewShopping', () => {
  const mockOnCreate = jest.fn();

  beforeEach(() => {
    mockOnCreate.mockClear();
  });

  it('renders form with correct inputs', () => {
    render(<NewShopping onCreate={mockOnCreate} />);
    
    expect(screen.getByPlaceholderText('Item title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('URL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Price')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Source (optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
  });

  it('calls onCreate with form data when submitted', () => {
    render(<NewShopping onCreate={mockOnCreate} />);
    
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
  });

  it('calls onCreate without source when source is empty', () => {
    render(<NewShopping onCreate={mockOnCreate} />);
    
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
  });

  it('does not call onCreate when required fields are empty', () => {
    render(<NewShopping onCreate={mockOnCreate} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }));
    
    expect(mockOnCreate).not.toHaveBeenCalled();
  });

  it('clears form after successful submission', () => {
    render(<NewShopping onCreate={mockOnCreate} />);
    
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
  });
}); 