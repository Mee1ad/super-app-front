import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import TodoPage from './page';

// Mock the dependencies
jest.mock('./atoms/useTodoApi', () => ({
  useTodoApi: () => ({
    lists: [
      {
        id: '1',
        title: 'My Tasks',
        type: 'task',
        variant: 'default',
        tasks: []
      },
      {
        id: '2',
        title: 'Shopping List',
        type: 'shopping',
        variant: 'default',
        items: []
      }
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
  })
}));

jest.mock('./atoms/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

jest.mock('./atoms/LoadingSpinner', () => ({
  LoadingSpinner: () => <div>Loading...</div>
}));

jest.mock('../shared/organisms/AppLayout', () => ({
  AppLayout: ({ children, title }: { children: React.ReactNode; title?: string }) => (
    <div data-testid="app-layout">
      {title && <h1>{title}</h1>}
      {children}
    </div>
  )
}));

jest.mock('../shared/organisms/ListPageLayout', () => ({
  ListPageLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="list-page-layout">{children}</div>
  )
}));

jest.mock('./molecules/AddNewList', () => ({
  AddNewList: ({ onCreate }: { onCreate: (type: string, title?: string) => void }) => (
    <button onClick={() => onCreate('task', 'Test List')} data-testid="add-new-list">
      Add List
    </button>
  )
}));

jest.mock('./organisms/MobileListView', () => ({
  MobileListView: ({ lists }: { lists: { id: string; title: string }[] }) => (
    <div data-testid="mobile-view">
      {lists.map(list => (
        <div key={list.id} data-testid={`mobile-list-${list.id}`}>
          {list.title}
        </div>
      ))}
    </div>
  )
}));

jest.mock('./organisms/TaskList', () => ({
  TaskList: ({ title }: { title: string }) => (
    <div data-testid="task-list">{title}</div>
  )
}));

jest.mock('./organisms/ShoppingList', () => ({
  ShoppingList: ({ title }: { title: string }) => (
    <div data-testid="shopping-list">{title}</div>
  )
}));

describe('TodoPage', () => {
  beforeEach(() => {
    // Mock document properties
    Object.defineProperty(document, 'body', {
      value: {
        style: {
          overflow: ''
        }
      },
      writable: true
    });
    
    Object.defineProperty(document, 'documentElement', {
      value: {
        style: {
          overflow: ''
        }
      },
      writable: true
    });
  });

  it('should hide scrollbars on mount', async () => {
    await act(async () => {
      render(<TodoPage />);
    });

    // Wait for client-side hydration
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check that overflow is hidden on both body and html
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overflow).toBe('hidden');
  });

  it('should restore scrollbars on unmount', async () => {
    const { unmount } = render(<TodoPage />);

    // Wait for client-side hydration
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Verify overflow is hidden
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overflow).toBe('hidden');

    // Unmount component
    unmount();

    // Check that overflow is restored
    expect(document.body.style.overflow).toBe('');
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('should render todo lists correctly', async () => {
    await act(async () => {
      render(<TodoPage />);
    });

    // Wait for client-side hydration
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check that lists are rendered
    expect(screen.getByTestId('mobile-list-1')).toHaveTextContent('My Tasks');
    expect(screen.getByTestId('mobile-list-2')).toHaveTextContent('Shopping List');
    
    // Check that FAB is rendered
    expect(screen.getByTestId('add-new-list')).toBeInTheDocument();
  });

  it('should show loading spinner initially', () => {
    // Mock loading state
    jest.doMock('./atoms/useTodoApi', () => ({
      useTodoApi: () => ({
        lists: [],
        loading: true,
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
      })
    }));

    render(<TodoPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
}); 