import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { SyncStatus } from './SyncStatus'
import { useSyncStatus } from '../atoms/SyncStatusContext'

// Mock the useSyncStatus hook
jest.mock('../atoms/SyncStatusContext', () => ({
  useSyncStatus: jest.fn()
}))

const mockUseSyncStatus = useSyncStatus as jest.MockedFunction<typeof useSyncStatus>

describe('SyncStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with disconnected status by default', () => {
    mockUseSyncStatus.mockReturnValue({
      syncStatus: {
        status: 'disconnected',
        lastSuccessfulSync: null,
        lastFailedSync: null,
        pendingOperations: 0,
        failedOperations: 0
      },
      reportSyncSuccess: jest.fn(),
      reportSyncFailure: jest.fn(),
      reportOperationStart: jest.fn(),
      reportOperationComplete: jest.fn(),
      reportOperationFailure: jest.fn()
    })
    
    render(<SyncStatus />)
    
    expect(screen.getByText('Disconnected')).toBeInTheDocument()
    expect(screen.getByTestId('wifi-off')).toBeInTheDocument()
  })

  it('renders with synced status when connected', () => {
    mockUseSyncStatus.mockReturnValue({
      syncStatus: {
        status: 'synced',
        lastSuccessfulSync: new Date(),
        lastFailedSync: null,
        pendingOperations: 0,
        failedOperations: 0
      },
      reportSyncSuccess: jest.fn(),
      reportSyncFailure: jest.fn(),
      reportOperationStart: jest.fn(),
      reportOperationComplete: jest.fn(),
      reportOperationFailure: jest.fn()
    })
    
    render(<SyncStatus />)
    
    expect(screen.getByText('Synced')).toBeInTheDocument()
    expect(screen.getByTestId('check-circle')).toBeInTheDocument()
  })

  it('shows syncing status when syncing', () => {
    mockUseSyncStatus.mockReturnValue({
      syncStatus: {
        status: 'syncing',
        lastSuccessfulSync: new Date(),
        lastFailedSync: null,
        pendingOperations: 1,
        failedOperations: 0
      },
      reportSyncSuccess: jest.fn(),
      reportSyncFailure: jest.fn(),
      reportOperationStart: jest.fn(),
      reportOperationComplete: jest.fn(),
      reportOperationFailure: jest.fn()
    })
    
    render(<SyncStatus />)
    
    expect(screen.getByText('Syncing')).toBeInTheDocument()
    expect(screen.getByTestId('loader-2')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    mockUseSyncStatus.mockReturnValue({
      syncStatus: {
        status: 'disconnected',
        lastSuccessfulSync: null,
        lastFailedSync: null,
        pendingOperations: 0,
        failedOperations: 0
      },
      reportSyncSuccess: jest.fn(),
      reportSyncFailure: jest.fn(),
      reportOperationStart: jest.fn(),
      reportOperationComplete: jest.fn(),
      reportOperationFailure: jest.fn()
    })
    
    render(<SyncStatus className="custom-class" />)
    
    const container = screen.getByText('Disconnected').closest('div')
    expect(container).toHaveClass('custom-class')
  })

  it('shows spinning animation during syncing', () => {
    mockUseSyncStatus.mockReturnValue({
      syncStatus: {
        status: 'syncing',
        lastSuccessfulSync: new Date(),
        lastFailedSync: null,
        pendingOperations: 1,
        failedOperations: 0
      },
      reportSyncSuccess: jest.fn(),
      reportSyncFailure: jest.fn(),
      reportOperationStart: jest.fn(),
      reportOperationComplete: jest.fn(),
      reportOperationFailure: jest.fn()
    })
    
    render(<SyncStatus />)
    
    const loader = screen.getByTestId('loader-2')
    expect(loader).toHaveClass('animate-spin')
  })

  it('handles null/undefined props gracefully', () => {
    mockUseSyncStatus.mockReturnValue({
      syncStatus: {
        status: 'disconnected',
        lastSuccessfulSync: null,
        lastFailedSync: null,
        pendingOperations: 0,
        failedOperations: 0
      },
      reportSyncSuccess: jest.fn(),
      reportSyncFailure: jest.fn(),
      reportOperationStart: jest.fn(),
      reportOperationComplete: jest.fn(),
      reportOperationFailure: jest.fn()
    })
    
    render(<SyncStatus className={undefined} />)
    
    expect(screen.getByText('Disconnected')).toBeInTheDocument()
  })

  it('renders with proper accessibility attributes', () => {
    mockUseSyncStatus.mockReturnValue({
      syncStatus: {
        status: 'synced',
        lastSuccessfulSync: new Date(),
        lastFailedSync: null,
        pendingOperations: 0,
        failedOperations: 0
      },
      reportSyncSuccess: jest.fn(),
      reportSyncFailure: jest.fn(),
      reportOperationStart: jest.fn(),
      reportOperationComplete: jest.fn(),
      reportOperationFailure: jest.fn()
    })
    
    render(<SyncStatus />)
    
    const statusText = screen.getByText('Synced')
    expect(statusText).toBeInTheDocument()
    
    // Check that the component has proper semantic structure
    const container = statusText.closest('div')
    expect(container).toHaveClass('flex', 'items-center', 'gap-2')
  })
}) 