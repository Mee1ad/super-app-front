import { renderHook, act, waitFor } from '@testing-library/react';
import { useTodoApi } from './useTodoApi';
import { 
  listsApi, 
  tasksApi, 
  itemsApi, 
  searchApi, 
  getListsWithItems 
} from './api';

// Mock the auth hook
jest.mock('@/app/auth/atoms/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock the mock data API
jest.mock('./mock-data', () => ({
  mockApi: {
    getListsWithItems: jest.fn(),
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
    toggleItem: jest.fn(),
    reorderItems: jest.fn(),
    search: jest.fn(),
  },
}));

// Mock the API modules
jest.mock('./api', () => ({
  listsApi: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  tasksApi: {
    getByList: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    toggle: jest.fn(),
    reorder: jest.fn(),
  },
  itemsApi: {
    getByList: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    toggle: jest.fn(),
    reorder: jest.fn(),
  },
  searchApi: {
    search: jest.fn(),
  },
  getListsWithItems: jest.fn(),
}));

// Mock the error handler
jest.mock('@/lib/error-handler', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn(),
}));

const mockListsApi = listsApi as jest.Mocked<typeof listsApi>;
const mockTasksApi = tasksApi as jest.Mocked<typeof tasksApi>;
const mockItemsApi = itemsApi as jest.Mocked<typeof itemsApi>;
const mockSearchApi = searchApi as jest.Mocked<typeof searchApi>;
const mockGetListsWithItems = getListsWithItems as jest.MockedFunction<typeof getListsWithItems>;

// Import mocked modules
import { useAuth } from '@/app/auth/atoms/useAuth';
import { mockApi } from './mock-data';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockMockApi = mockApi as jest.Mocked<typeof mockApi>;

const mockAuthContext = {
  isAuthenticated: true,
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
  getGoogleAuthUrl: jest.fn(),
  loginWithGoogle: jest.fn(),
  logout: jest.fn(),
  handleOAuthCallback: jest.fn(),
  hasPermission: jest.fn(() => true),
  hasRole: jest.fn(() => true)
}

const mockUnauthenticatedContext = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
  getGoogleAuthUrl: jest.fn(),
  loginWithGoogle: jest.fn(),
  logout: jest.fn(),
  handleOAuthCallback: jest.fn(),
  hasPermission: jest.fn(() => false),
  hasRole: jest.fn(() => false)
}

describe('useTodoApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to authenticated user
    mockUseAuth.mockReturnValue(mockAuthContext);
  });

  describe('authentication scenarios', () => {
    it('should use real API when authenticated', async () => {
      mockUseAuth.mockReturnValue(mockAuthContext);

      const mockLists = [
        {
          id: '1',
          type: 'task' as const,
          title: 'Task List',
          variant: 'default' as const,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          tasks: []
        }
      ];

      mockGetListsWithItems.mockResolvedValue(mockLists);

      const { result } = renderHook(() => useTodoApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.lists).toEqual(mockLists);
      expect(mockGetListsWithItems).toHaveBeenCalledTimes(1);
      expect(mockMockApi.getListsWithItems).not.toHaveBeenCalled();
    });

    it('should use mock API when not authenticated', async () => {
      mockUseAuth.mockReturnValue(mockUnauthenticatedContext);

      const mockLists = [
        {
          id: 'demo-list-1',
          type: 'task' as const,
          title: 'My Tasks',
          variant: 'default' as const,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          tasks: []
        }
      ];

      mockMockApi.getListsWithItems.mockResolvedValue(mockLists);

      const { result } = renderHook(() => useTodoApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.lists).toEqual(mockLists);
      expect(mockMockApi.getListsWithItems).toHaveBeenCalledTimes(1);
      expect(mockGetListsWithItems).not.toHaveBeenCalled();
    });
  });

  describe('initialization', () => {
    it('should load lists on mount', async () => {
      const mockLists = [
        {
          id: '1',
          type: 'task' as const,
          title: 'Task List',
          variant: 'default' as const,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          tasks: [
            {
              id: '1',
              list_id: '1',
              title: 'Task 1',
              description: 'Description 1',
              checked: false,
              variant: 'default' as const,
              position: 0,
              created_at: '2023-01-01T00:00:00Z',
              updated_at: '2023-01-01T00:00:00Z',
            }
          ]
        }
      ];

      mockGetListsWithItems.mockResolvedValue(mockLists);

      const { result } = renderHook(() => useTodoApi());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.lists).toEqual(mockLists);
      expect(mockGetListsWithItems).toHaveBeenCalledTimes(1);
    });

    it('should handle loading error', async () => {
      mockGetListsWithItems.mockRejectedValue(new Error('Failed to load'));

      const { result } = renderHook(() => useTodoApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.lists).toEqual([]);
    });
  });

  describe('list operations', () => {
    it('should create a new list when authenticated', async () => {
      const mockList = {
        id: '1',
        type: 'task' as const,
        title: 'New List',
        variant: 'default' as const,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockGetListsWithItems.mockResolvedValue([]);
      mockListsApi.create.mockResolvedValue(mockList);
      mockGetListsWithItems.mockResolvedValue([mockList]);

      const { result } = renderHook(() => useTodoApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createList('task', 'New List', 'default');
      });

      expect(mockListsApi.create).toHaveBeenCalledWith({
        type: 'task',
        title: 'New List',
        variant: 'default',
      });
      expect(mockGetListsWithItems).toHaveBeenCalledTimes(2);
      expect(mockMockApi.createList).not.toHaveBeenCalled();
    });

    it('should create a new list when not authenticated', async () => {
      mockUseAuth.mockReturnValue(mockUnauthenticatedContext);

      const mockList = {
        id: 'demo-list-3',
        type: 'task' as const,
        title: 'New List',
        variant: 'default' as const,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockMockApi.getListsWithItems.mockResolvedValue([]);
      mockMockApi.createList.mockResolvedValue(mockList);
      mockMockApi.getListsWithItems.mockResolvedValue([mockList]);

      const { result } = renderHook(() => useTodoApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createList('task', 'New List', 'default');
      });

      expect(mockMockApi.createList).toHaveBeenCalledWith({
        type: 'task',
        title: 'New List',
        variant: 'default',
      });
      expect(mockMockApi.getListsWithItems).toHaveBeenCalledTimes(2);
      expect(mockListsApi.create).not.toHaveBeenCalled();
    });

    it('should update a list', async () => {
      const mockList = {
        id: '1',
        type: 'task' as const,
        title: 'Updated List',
        variant: 'outlined' as const,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockGetListsWithItems.mockResolvedValue([mockList]);
      mockListsApi.update.mockResolvedValue(mockList);

      const { result } = renderHook(() => useTodoApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateList('1', { title: 'Updated List', variant: 'outlined' });
      });

      expect(mockListsApi.update).toHaveBeenCalledWith('1', {
        title: 'Updated List',
        variant: 'outlined',
      });
    });

    it('should delete a list', async () => {
      mockGetListsWithItems.mockResolvedValue([]);
      mockListsApi.delete.mockResolvedValue('List deleted successfully');

      const { result } = renderHook(() => useTodoApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteList('1');
      });

      expect(mockListsApi.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('task operations', () => {
    it('should create a new task', async () => {
      const mockTask = {
        id: '1',
        list_id: 'list1',
        title: 'New Task',
        description: 'New Description',
        checked: false,
        variant: 'default' as const,
        position: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockGetListsWithItems.mockResolvedValue([]);
      mockTasksApi.create.mockResolvedValue(mockTask);

      const { result } = renderHook(() => useTodoApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createTask('list1', {
          title: 'New Task',
          description: 'New Description',
          checked: false,
          variant: 'default',
          position: 0,
        });
      });

      expect(mockTasksApi.create).toHaveBeenCalledWith('list1', {
        title: 'New Task',
        description: 'New Description',
        checked: false,
        variant: 'default',
        position: 0,
      });
    });

    it('should update a task', async () => {
      const mockTask = {
        id: '1',
        list_id: 'list1',
        title: 'Updated Task',
        description: 'Updated Description',
        checked: true,
        variant: 'outlined' as const,
        position: 1,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockGetListsWithItems.mockResolvedValue([]);
      mockTasksApi.update.mockResolvedValue(mockTask);

      const { result } = renderHook(() => useTodoApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateTask('list1', '1', {
          list_id: 'list1',
          title: 'Updated Task',
          description: 'Updated Description',
          checked: true,
          variant: 'outlined',
          position: 1,
        });
      });

      expect(mockTasksApi.update).toHaveBeenCalledWith('list1', '1', {
        list_id: 'list1',
        title: 'Updated Task',
        description: 'Updated Description',
        checked: true,
        variant: 'outlined',
        position: 1,
      });
    });

    it('should delete a task', async () => {
      mockGetListsWithItems.mockResolvedValue([]);
      mockTasksApi.delete.mockResolvedValue('Task deleted successfully');

      const { result } = renderHook(() => useTodoApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteTask('list1', '1');
      });

      expect(mockTasksApi.delete).toHaveBeenCalledWith('list1', '1');
    });

    it('should toggle a task', async () => {
      const mockTask = {
        id: '1',
        list_id: 'list1',
        title: 'Task',
        description: 'Description',
        checked: true,
        variant: 'default' as const,
        position: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockGetListsWithItems.mockResolvedValue([]);
      mockTasksApi.toggle.mockResolvedValue(mockTask);

      const { result } = renderHook(() => useTodoApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleTask('list1', '1');
      });

      expect(mockTasksApi.toggle).toHaveBeenCalledWith('list1', '1');
    });

    it('should reorder tasks', async () => {
      mockGetListsWithItems.mockResolvedValue([]);
      mockTasksApi.reorder.mockResolvedValue('Tasks reordered successfully');

      const { result } = renderHook(() => useTodoApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.reorderTasks('list1', ['1', '2', '3']);
      });

      expect(mockTasksApi.reorder).toHaveBeenCalledWith('list1', ['1', '2', '3']);
    });
  });

  describe('shopping item operations', () => {
    it('should create a new shopping item', async () => {
      const mockItem = {
        id: '1',
        list_id: 'list1',
        title: 'New Item',
        url: 'https://example.com',
        price: '$20.00',
        source: 'Amazon',
        checked: false,
        variant: 'default' as const,
        position: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockGetListsWithItems.mockResolvedValue([]);
      mockItemsApi.create.mockResolvedValue(mockItem);

      const { result } = renderHook(() => useTodoApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createItem('list1', {
          title: 'New Item',
          url: 'https://example.com',
          price: '$20.00',
          source: 'Amazon',
          checked: false,
          variant: 'default',
          position: 0,
        });
      });

      expect(mockItemsApi.create).toHaveBeenCalledWith('list1', {
        title: 'New Item',
        url: 'https://example.com',
        price: '$20.00',
        source: 'Amazon',
        checked: false,
        variant: 'default',
        position: 0,
      });
    });

    it('should update a shopping item', async () => {
      const mockItem = {
        id: '1',
        list_id: 'list1',
        title: 'Updated Item',
        url: 'https://updated.com',
        price: '$30.00',
        source: 'eBay',
        checked: true,
        variant: 'outlined' as const,
        position: 1,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockGetListsWithItems.mockResolvedValue([]);
      mockItemsApi.update.mockResolvedValue(mockItem);

      const { result } = renderHook(() => useTodoApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateItem('list1', '1', {
          list_id: 'list1',
          title: 'Updated Item',
          url: 'https://updated.com',
          price: '$30.00',
          source: 'eBay',
          checked: true,
          variant: 'outlined',
          position: 1,
        });
      });

      expect(mockItemsApi.update).toHaveBeenCalledWith('list1', '1', {
        list_id: 'list1',
        title: 'Updated Item',
        url: 'https://updated.com',
        price: '$30.00',
        source: 'eBay',
        checked: true,
        variant: 'outlined',
        position: 1,
      });
    });

    it('should delete a shopping item', async () => {
      mockGetListsWithItems.mockResolvedValue([]);
      mockItemsApi.delete.mockResolvedValue('Item deleted successfully');

      const { result } = renderHook(() => useTodoApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteItem('list1', '1');
      });

      expect(mockItemsApi.delete).toHaveBeenCalledWith('list1', '1');
    });

    it('should toggle a shopping item', async () => {
      const mockItem = {
        id: '1',
        list_id: 'list1',
        title: 'Item',
        url: 'https://example.com',
        price: '$10.00',
        source: 'Amazon',
        checked: true,
        variant: 'default' as const,
        position: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockGetListsWithItems.mockResolvedValue([]);
      mockItemsApi.toggle.mockResolvedValue(mockItem);

      const { result } = renderHook(() => useTodoApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleItem('list1', '1');
      });

      expect(mockItemsApi.toggle).toHaveBeenCalledWith('list1', '1');
    });

    it('should reorder shopping items', async () => {
      mockGetListsWithItems.mockResolvedValue([]);
      mockItemsApi.reorder.mockResolvedValue('Items reordered successfully');

      const { result } = renderHook(() => useTodoApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.reorderItems('list1', ['1', '2', '3']);
      });

      expect(mockItemsApi.reorder).toHaveBeenCalledWith('list1', ['1', '2', '3']);
    });
  });

  describe('search', () => {
    it('should search across all content', async () => {
      const mockSearchResponse = {
        lists: [],
        tasks: [],
        shopping_items: [],
      };

      mockGetListsWithItems.mockResolvedValue([]);
      mockSearchApi.search.mockResolvedValue(mockSearchResponse);

      const { result } = renderHook(() => useTodoApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        const searchResult = await result.current.search('test');
        expect(searchResult).toEqual(mockSearchResponse);
      });

      expect(mockSearchApi.search).toHaveBeenCalledWith('test');
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      const { showErrorToast } = jest.requireMock('@/lib/error-handler');
      
      mockGetListsWithItems.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useTodoApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(showErrorToast).toHaveBeenCalledWith('Failed to load lists');
    });
  });
}); 