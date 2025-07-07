import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorDemo } from './error-demo';
import * as errorHandlerModule from '@/lib/error-handler';

// Mock the error handler module
jest.mock('@/lib/error-handler');
const mockErrorHandler = errorHandlerModule as jest.Mocked<typeof errorHandlerModule>;

describe('ErrorDemo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders error demo card with title and description', () => {
    render(<ErrorDemo />);
    
    expect(screen.getByText(/error handling demo/i)).toBeInTheDocument();
    expect(screen.getByText(/test the animated error handling system/i)).toBeInTheDocument();
  });

  it('renders all test buttons', () => {
    render(<ErrorDemo />);
    
    expect(screen.getByRole('button', { name: /test errors/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /test success/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /test warning/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /test info/i })).toBeInTheDocument();
  });

  it('shows error toasts when test errors button is clicked', () => {
    render(<ErrorDemo />);
    
    const testErrorsButton = screen.getByRole('button', { name: /test errors/i });
    fireEvent.click(testErrorsButton);
    
    expect(mockErrorHandler.showErrorToast).toHaveBeenCalledWith({
      status: 422,
      message: "title: Field required\ndescription: String should have at least 3 characters"
    });
  });

  it('shows success toast when test success button is clicked', () => {
    render(<ErrorDemo />);
    
    const testSuccessButton = screen.getByRole('button', { name: /test success/i });
    fireEvent.click(testSuccessButton);
    
    expect(mockErrorHandler.showSuccessToast).toHaveBeenCalledWith(
      "Operation Successful",
      "Your action was completed successfully"
    );
  });

  it('shows warning toast when test warning button is clicked', () => {
    render(<ErrorDemo />);
    
    const testWarningButton = screen.getByRole('button', { name: /test warning/i });
    fireEvent.click(testWarningButton);
    
    expect(mockErrorHandler.showWarningToast).toHaveBeenCalledWith(
      "Warning",
      "This action might have unexpected consequences"
    );
  });

  it('shows info toast when test info button is clicked', () => {
    render(<ErrorDemo />);
    
    const testInfoButton = screen.getByRole('button', { name: /test info/i });
    fireEvent.click(testInfoButton);
    
    expect(mockErrorHandler.showInfoToast).toHaveBeenCalledWith(
      "Information",
      "Here's some helpful information for you"
    );
  });

  it('displays helpful information about toast types', () => {
    render(<ErrorDemo />);
    
    expect(screen.getByText(/error toasts show validation errors, server errors, etc./i)).toBeInTheDocument();
    expect(screen.getByText(/success toasts confirm successful operations/i)).toBeInTheDocument();
    expect(screen.getByText(/warning toasts show important notices/i)).toBeInTheDocument();
    expect(screen.getByText(/info toasts provide helpful information/i)).toBeInTheDocument();
  });

  it('schedules multiple error toasts with delays', () => {
    jest.useFakeTimers();
    render(<ErrorDemo />);
    
    const testErrorsButton = screen.getByRole('button', { name: /test errors/i });
    fireEvent.click(testErrorsButton);
    
    // First error should be called immediately
    expect(mockErrorHandler.showErrorToast).toHaveBeenCalledWith({
      status: 422,
      message: "title: Field required\ndescription: String should have at least 3 characters"
    });
    
    // Fast forward 1 second
    jest.advanceTimersByTime(1000);
    expect(mockErrorHandler.showErrorToast).toHaveBeenCalledWith({
      status: 404,
      message: "List not found"
    });
    
    // Fast forward another second
    jest.advanceTimersByTime(1000);
    expect(mockErrorHandler.showErrorToast).toHaveBeenCalledWith({
      status: 500,
      message: "Internal server error"
    });
    
    jest.useRealTimers();
  });
}); 