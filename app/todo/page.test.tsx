import React from 'react';
import { render, screen } from '@testing-library/react';
import TodoPage from './page';

// Mock the dependencies
jest.mock('./atoms/useTodoApi', () => ({
  useTodoApi: () => ({
    lists: [
      {
        id: 'list-1',
        title: 'Task List 1',
        type: 'task',
        tasks: [{ 
          id: 'task-1', 
          title: 'Task 1',
          description: '',
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
          url: '',
          price: '',
          source: '',
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

jest.mock('./atoms/adapters', () => ({
  taskResponseToTaskItemProps: (task: any) => task,
  shoppingItemResponseToShoppingItemProps: (item: any) => item,
  taskItemPropsToTaskCreate: jest.fn(),
  shoppingItemPropsToShoppingItemCreate: jest.fn(),
}));

jest.mock('./atoms/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('./atoms/LoadingSpinner', () => ({
  LoadingSpinner: () => <div>Loading...</div>,
}));

jest.mock('../shared/organisms/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('TodoPage', () => {
  it('renders mobile view and desktop view', () => {
    render(<TodoPage />);
    
    // Should show both mobile and desktop views (responsive design)
    expect(screen.getAllByText('Task List 1')).toHaveLength(2); // One in mobile, one in desktop
    expect(screen.getAllByText('Shopping List 1')).toHaveLength(2); // One in mobile, one in desktop
    expect(screen.getByText('1 Tasks')).toBeInTheDocument();
    expect(screen.getByText('1 Items')).toBeInTheDocument();
  });

  it('renders search box and add new list button', () => {
    render(<TodoPage />);
    
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByText(/add a new list/i)).toBeInTheDocument();
  });
}); 