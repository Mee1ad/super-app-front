import React from 'react';
import { render, screen } from '@testing-library/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import TodoListDetailPage from './page';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock the dependencies
jest.mock('../atoms/ReplicacheTodoContext', () => ({
  useReplicacheTodo: () => ({
    lists: [
      {
        id: '1',
        title: 'My Tasks',
        type: 'task',
        variant: 'default',
      }
    ],
    tasks: [],
    items: [],
    rep: {
      mutate: {
        createTask: jest.fn(),
        updateTask: jest.fn(),
        deleteTask: jest.fn(),
        createItem: jest.fn(),
        updateItem: jest.fn(),
        deleteItem: jest.fn(),
        reorderTasks: jest.fn(),
        reorderItems: jest.fn(),
      }
    },
    mutateWithPoke: jest.fn(),
  })
}));

jest.mock('../atoms/adapters', () => ({
  taskResponseToTaskItemProps: (task: unknown) => task,
  shoppingItemResponseToShoppingItemProps: (item: unknown) => item,
  taskItemPropsToTaskCreate: jest.fn(),
  shoppingItemPropsToShoppingItemCreate: jest.fn(),
}));

jest.mock('../atoms/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('../atoms/LoadingSpinner', () => ({
  LoadingSpinner: () => <div>Loading...</div>,
}));

jest.mock('../../shared/organisms/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('TodoListDetailPage', () => {
  it('renders task list detail page', () => {
    render(<TodoListDetailPage />);
    
    expect(screen.getByText('Task List 1')).toBeInTheDocument();
    expect(screen.getByText('Task List')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
  });

  it('shows back button', () => {
    render(<TodoListDetailPage />);
    
    // The back button is an icon-only button, so we check for the arrow icon
    const backButton = document.querySelector('svg[class*="arrow-left"]');
    expect(backButton).toBeInTheDocument();
  });

  it('shows add item button', () => {
    render(<TodoListDetailPage />);
    
    expect(screen.getByText(/add task/i)).toBeInTheDocument();
  });

  it('shows mobile view', () => {
    render(<TodoListDetailPage />);
    
    // Should show mobile view (no card styling)
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('📝')).toBeInTheDocument();
  });

  it('shows desktop placeholder', () => {
    render(<TodoListDetailPage />);
    
    expect(screen.getByText('Desktop view not implemented for detail page')).toBeInTheDocument();
  });
}); 