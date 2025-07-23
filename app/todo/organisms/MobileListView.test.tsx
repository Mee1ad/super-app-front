import React from 'react';
import { render, screen } from '@testing-library/react';
import { MobileListView } from './MobileListView';

const mockLists = [
  {
    id: 'list-1',
    title: 'Task List 1',
    type: 'task' as const,
    tasks: [{ id: 'task-1' }, { id: 'task-2' }],
  },
  {
    id: 'list-2',
    title: 'Shopping List 1',
    type: 'shopping' as const,
    items: [{ id: 'item-1' }, { id: 'item-2' }, { id: 'item-3' }],
  },
];

const mockProps = {
  lists: mockLists,
  onUpdateTitle: jest.fn(),
  onDelete: jest.fn(),
  onListClick: jest.fn(),
};

describe('MobileListView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all lists', () => {
    render(<MobileListView {...mockProps} />);
    
    expect(screen.getByText('Task List 1')).toBeInTheDocument();
    expect(screen.getByText('Shopping List 1')).toBeInTheDocument();
  });

  it('displays correct item counts', () => {
    render(<MobileListView {...mockProps} />);
    
    expect(screen.getByText('2 Tasks')).toBeInTheDocument();
    expect(screen.getByText('3 Items')).toBeInTheDocument();
  });

  it('displays correct icons for each list type', () => {
    render(<MobileListView {...mockProps} />);
    
    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('🛒')).toBeInTheDocument();
  });

  it('renders with full width', () => {
    render(<MobileListView {...mockProps} />);
    
    const container = document.querySelector('.w-full');
    expect(container).toBeInTheDocument();
  });

  it('passes correct props to ListRow components', () => {
    render(<MobileListView {...mockProps} />);
    
    // Check that the first list (not last) has a separator
    const separators = document.querySelectorAll('.border-b');
    expect(separators.length).toBe(1); // Only the first list should have a separator
  });

  it('handles empty lists array', () => {
    render(<MobileListView {...mockProps} lists={[]} />);
    
    // Should render without errors
    expect(screen.queryByText('Task List 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Shopping List 1')).not.toBeInTheDocument();
  });

  it('handles lists with no items', () => {
    const emptyLists = [
      {
        id: 'empty-task',
        title: 'Empty Task List',
        type: 'task' as const,
        tasks: [],
      },
      {
        id: 'empty-shopping',
        title: 'Empty Shopping List',
        type: 'shopping' as const,
        items: [],
      },
    ];

    render(<MobileListView {...mockProps} lists={emptyLists} />);
    
    expect(screen.getByText('0 Tasks')).toBeInTheDocument();
    expect(screen.getByText('0 Items')).toBeInTheDocument();
  });
}); 