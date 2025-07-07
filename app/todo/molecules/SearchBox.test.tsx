import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchBox } from './SearchBox';

describe('SearchBox', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it('renders search input with placeholder', () => {
    render(<SearchBox onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText(/search in lists/i);
    expect(input).toBeInTheDocument();
  });

  it('calls onSearch when user types (debounced)', () => {
    jest.useFakeTimers();
    render(<SearchBox onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText(/search in lists/i);
    
    fireEvent.change(input, { target: { value: 'test query' } });
    // Should not be called immediately
    expect(mockOnSearch).not.toHaveBeenCalled();
    jest.advanceTimersByTime(300);
    expect(mockOnSearch).toHaveBeenCalledWith('test query');
    jest.useRealTimers();
  });

  it('debounces search input', () => {
    jest.useFakeTimers();
    render(<SearchBox onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText(/search in lists/i);
    
    fireEvent.change(input, { target: { value: 't' } });
    fireEvent.change(input, { target: { value: 'te' } });
    fireEvent.change(input, { target: { value: 'tes' } });
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Should not be called immediately
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    // Fast forward timers
    jest.runAllTimers();
    
    // Should be called with final value
    expect(mockOnSearch).toHaveBeenCalledWith('test');
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    
    jest.useRealTimers();
  });

  it('clears search when input is empty (debounced)', () => {
    jest.useFakeTimers();
    render(<SearchBox onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText(/search in lists/i);
    
    fireEvent.change(input, { target: { value: 'test' } });
    jest.advanceTimersByTime(300);
    fireEvent.change(input, { target: { value: '' } });
    jest.advanceTimersByTime(300);
    expect(mockOnSearch).toHaveBeenCalledWith('');
    jest.useRealTimers();
  });
}); 