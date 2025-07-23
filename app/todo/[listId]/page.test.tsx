import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoListDetailPage from './page';

// Mock the dependencies
jest.mock('../atoms/useTodoApi', () => ({
  useTodoApi: () => ({
    lists: [
      {
        id: 'list-1',
        title: 'Task List 1',
        type: 'task',
        tasks: [{ 
          id: 'task-1', 
          title: 'Task 1',
          description: 'Description 1',
          checked: false,
          variant: 'default'
        }],
        variant: 'default',
      },
      {
        id: 'list-2',
        title: 'Shopping List 1',
        type: 'shopping',
        items: [{ 
          id: 'item-1', 
          title: 'Item 1',
          url: 'https://example.com',
          price: '29.99',
          source: 'Amazon',
          checked: false,
          variant: 'default'
        }],
        variant: 'default',
      },
    ],
    loading: false,
    createList: jest.fn(),
    updateList: jest.fn(),
    deleteList: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    toggleTask: jest.fn(),
    reorderTasks: jest.fn(),
    createItem: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
    reorderItems: jest.fn(),
  }),
}));

jest.mock('../atoms/adapters', () => ({
  taskResponseToTaskItemProps: (task: any) => task,
  shoppingItemResponseToShoppingItemProps: (item: any) => item,
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

jest.mock('next/navigation', () => ({
  useParams: () => ({ listId: 'list-1' }),
  useRouter: () => ({
    push: jest.fn(),
  }),
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