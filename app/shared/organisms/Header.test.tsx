import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  it('renders title correctly', () => {
    render(<Header title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onMenuClick when menu button is clicked', () => {
    const mockOnMenuClick = jest.fn();
    render(<Header title="Test Title" onMenuClick={mockOnMenuClick} />);
    
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    
    expect(mockOnMenuClick).toHaveBeenCalledTimes(1);
  });

  it('renders without onMenuClick prop', () => {
    render(<Header title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    render(<Header title="Test Title" />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('sticky', 'top-0', 'z-40', 'bg-white', 'dark:bg-gray-900');
  });
}); 