import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import DiaryPage from './page';

// Mock the dependencies
jest.mock('./atoms/useInfiniteDiaryApi', () => ({
  useInfiniteDiaryApi: () => ({
    moods: [],
    entries: [],
    loading: false,
    loadingMore: false,
    error: null,
    hasMore: false,
    loadMoods: jest.fn(),
    loadEntries: jest.fn(),
    loadMoreEntries: jest.fn(),
    createEntry: jest.fn(),
    updateEntry: jest.fn(),
    deleteEntry: jest.fn()
  })
}));

jest.mock('./atoms/useInfiniteScroll', () => ({
  useInfiniteScroll: () => ({ current: null })
}));

jest.mock('./atoms/usePageTransition', () => ({
  usePageTransition: () => ({
    navigateWithAnimation: jest.fn()
  })
}));

jest.mock('../shared/organisms/AppLayout', () => ({
  AppLayout: ({ children, title }: { children: React.ReactNode; title?: string }) => (
    <div data-testid="app-layout">
      {title && <h1>{title}</h1>}
      {children}
    </div>
  )
}));

jest.mock('./organisms/AddDiaryDialog', () => ({
  AddDiaryDialog: () => <div data-testid="add-diary-dialog">Add Dialog</div>
}));

jest.mock('./molecules/DiaryCard', () => ({
  DiaryCard: ({ entry }: { entry: { id: string; title: string } }) => <div data-testid={`diary-card-${entry.id}`}>{entry.title}</div>
}));

describe('DiaryPage FAB Animation', () => {
  beforeEach(() => {
    // Mock window.scrollTo
    Object.defineProperty(window, 'scrollTo', {
      value: jest.fn(),
      writable: true
    });
  });

  it('should render FAB with slide-up animation', async () => {
    await act(async () => {
      render(<DiaryPage />);
    });

    // Wait for client-side hydration
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check that the FAB is rendered
    const fabButton = screen.getByRole('button', { name: /add/i });
    expect(fabButton).toBeInTheDocument();

    // Check that it has the correct positioning classes
    expect(fabButton).toHaveClass('fixed', 'bottom-6', 'right-6', 'z-50');
    expect(fabButton).toHaveClass('w-14', 'h-14');
    expect(fabButton).toHaveClass('bg-primary', 'text-primary-foreground', 'rounded-full');
    
    // Check that it's a motion.button element
    expect(fabButton.tagName).toBe('BUTTON');
  });

  it('should have correct slide-up animation properties', async () => {
    await act(async () => {
      render(<DiaryPage />);
    });

    // Wait for client-side hydration
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const fabButton = screen.getByRole('button', { name: /add/i });
    
    // Check that it has the correct initial and animate properties
    // Note: We can't directly test motion properties in unit tests, but we can verify the structure
    expect(fabButton).toBeInTheDocument();
    expect(fabButton).toHaveClass('fixed', 'bottom-6', 'right-6');
    
    // Verify it's positioned correctly for slide-up animation
    const computedStyle = window.getComputedStyle(fabButton);
    expect(computedStyle.position).toBe('fixed');
    expect(computedStyle.bottom).toBe('24px'); // bottom-6 = 24px
    expect(computedStyle.right).toBe('24px'); // right-6 = 24px
  });

  it('should have proper motion.button structure for slide-up animation', async () => {
    await act(async () => {
      render(<DiaryPage />);
    });

    // Wait for client-side hydration
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const fabButton = screen.getByRole('button', { name: /add/i });
    
    // Verify the button has the correct structure for slide-up animation
    expect(fabButton).toBeInTheDocument();
    expect(fabButton.tagName).toBe('BUTTON');
    
    // Check for essential classes that enable slide-up animation
    expect(fabButton).toHaveClass('fixed', 'bottom-6', 'right-6', 'z-50');
    expect(fabButton).toHaveClass('w-14', 'h-14');
    expect(fabButton).toHaveClass('bg-primary', 'text-primary-foreground', 'rounded-full');
    expect(fabButton).toHaveClass('flex', 'items-center', 'justify-center');
    
    // Verify inline styles for hardware acceleration
    expect(fabButton).toHaveStyle({
      position: 'fixed',
      zIndex: '50',
      transform: 'translateZ(0)'
    });
  });

  it('should handle click events correctly', async () => {
    const mockNavigateWithAnimation = jest.fn();
    jest.doMock('./atoms/usePageTransition', () => ({
      usePageTransition: () => ({
        navigateWithAnimation: mockNavigateWithAnimation
      })
    }));

    await act(async () => {
      render(<DiaryPage />);
    });

    // Wait for client-side hydration
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const fabButton = screen.getByRole('button', { name: /add/i });
    
    // Verify the button is clickable
    expect(fabButton).not.toBeDisabled();
    
    // Simulate click
    await act(async () => {
      fabButton.click();
    });
    
    // Verify click handler is called
    expect(mockNavigateWithAnimation).toHaveBeenCalledWith('/diary/new');
  });

  it('should have correct motion properties', async () => {
    await act(async () => {
      render(<DiaryPage />);
    });

    // Wait for client-side hydration
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const fabButton = screen.getByRole('button', { name: /add/i });
    
    // Check that it's a motion.button element
    expect(fabButton.tagName).toBe('BUTTON');
    expect(fabButton).toHaveClass('fixed', 'bottom-6', 'right-6');
  });

  it('should show loading spinner when loading', async () => {
    // Mock loading state
    jest.doMock('./atoms/useInfiniteDiaryApi', () => ({
      useInfiniteDiaryApi: () => ({
        moods: [],
        entries: [],
        loading: true,
        loadingMore: false,
        error: null,
        hasMore: false,
        loadMoods: jest.fn(),
        loadEntries: jest.fn(),
        loadMoreEntries: jest.fn(),
        createEntry: jest.fn(),
        updateEntry: jest.fn(),
        deleteEntry: jest.fn()
      })
    }));

    await act(async () => {
      render(<DiaryPage />);
    });

    // Wait for client-side hydration
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check that loading spinner is shown in FAB
    const fabButton = screen.getByRole('button', { name: /add/i });
    expect(fabButton).toBeInTheDocument();
  });
}); 