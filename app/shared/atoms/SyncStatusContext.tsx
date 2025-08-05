'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSharedSSE } from '../ReplicacheProviders'

interface SyncStatusState {
  status: 'synced' | 'syncing' | 'disconnected'
  lastSuccessfulSync: Date | null
  lastFailedSync: Date | null
  pendingOperations: number
  failedOperations: number
}

interface SyncStatusContextValue {
  syncStatus: SyncStatusState
  reportSyncSuccess: () => void
  reportSyncFailure: () => void
  reportOperationStart: () => void
  reportOperationComplete: () => void
  reportOperationFailure: () => void
}

const SyncStatusContext = createContext<SyncStatusContextValue | null>(null)

export function SyncStatusProvider({ children }: { children: ReactNode }) {
  const [syncStatus, setSyncStatus] = useState<SyncStatusState>({
    status: 'disconnected',
    lastSuccessfulSync: null,
    lastFailedSync: null,
    pendingOperations: 0,
    failedOperations: 0
  })

  const sharedSSE = useSharedSSE()

  // Monitor SSE connection
  useEffect(() => {
    const isConnected = sharedSSE.isConnected()
    
    if (!isConnected && syncStatus.status !== 'disconnected') {
      setSyncStatus(prev => ({
        ...prev,
        status: 'disconnected'
      }))
    }

    const cleanup = sharedSSE.addListener((event) => {
      if (event === 'sync') {
        setSyncStatus(prev => ({
          ...prev,
          status: 'syncing'
        }))
      } else if (event === 'connected') {
        setSyncStatus(prev => ({
          ...prev,
          status: 'synced',
          lastSuccessfulSync: new Date()
        }))
      } else if (event === 'disconnected') {
        setSyncStatus(prev => ({
          ...prev,
          status: 'disconnected'
        }))
      }
    })

    return cleanup
  }, [sharedSSE, syncStatus.status])

  // Monitor sync status based on recent activity
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const thirtySecondsAgo = new Date(now.getTime() - 30000)
      const fiveMinutesAgo = new Date(now.getTime() - 300000)

      // If we have recent failures and no recent successes, show disconnected
      if (syncStatus.lastFailedSync && 
          syncStatus.lastFailedSync > thirtySecondsAgo &&
          (!syncStatus.lastSuccessfulSync || syncStatus.lastSuccessfulSync < fiveMinutesAgo)) {
        setSyncStatus(prev => ({
          ...prev,
          status: 'disconnected'
        }))
      }
      
      // If we have pending operations for too long, show disconnected
      if (syncStatus.pendingOperations > 0 && 
          syncStatus.lastSuccessfulSync && 
          syncStatus.lastSuccessfulSync < thirtySecondsAgo) {
        setSyncStatus(prev => ({
          ...prev,
          status: 'disconnected'
        }))
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [syncStatus.lastSuccessfulSync, syncStatus.lastFailedSync, syncStatus.pendingOperations])

  const reportSyncSuccess = () => {
    setSyncStatus(prev => ({
      ...prev,
      status: 'synced',
      lastSuccessfulSync: new Date(),
      failedOperations: 0 // Reset failure count on success
    }))
  }

  const reportSyncFailure = () => {
    setSyncStatus(prev => ({
      ...prev,
      status: 'disconnected',
      lastFailedSync: new Date(),
      failedOperations: prev.failedOperations + 1
    }))
  }

  const reportOperationStart = () => {
    setSyncStatus(prev => ({
      ...prev,
      status: 'syncing',
      pendingOperations: prev.pendingOperations + 1
    }))
  }

  const reportOperationComplete = () => {
    setSyncStatus(prev => ({
      ...prev,
      status: 'synced',
      pendingOperations: Math.max(0, prev.pendingOperations - 1),
      lastSuccessfulSync: new Date()
    }))
  }

  const reportOperationFailure = () => {
    setSyncStatus(prev => ({
      ...prev,
      status: 'disconnected',
      pendingOperations: Math.max(0, prev.pendingOperations - 1),
      lastFailedSync: new Date(),
      failedOperations: prev.failedOperations + 1
    }))
  }

  const contextValue: SyncStatusContextValue = {
    syncStatus,
    reportSyncSuccess,
    reportSyncFailure,
    reportOperationStart,
    reportOperationComplete,
    reportOperationFailure
  }

  return (
    <SyncStatusContext.Provider value={contextValue}>
      {children}
    </SyncStatusContext.Provider>
  )
}

export function useSyncStatus() {
  const context = useContext(SyncStatusContext)
  if (!context) {
    throw new Error('useSyncStatus must be used within a SyncStatusProvider')
  }
  return context
} 