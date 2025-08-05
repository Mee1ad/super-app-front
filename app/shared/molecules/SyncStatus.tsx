'use client'

import React from 'react'
import { CheckCircle, Loader2, WifiOff } from 'lucide-react'
import { useSyncStatus } from '../atoms/SyncStatusContext'

interface SyncStatusProps {
  className?: string
}

export function SyncStatus({ className = '' }: SyncStatusProps) {
  const { syncStatus } = useSyncStatus()
  const { status } = syncStatus

  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          text: 'Synced'
        }
      case 'syncing':
        return {
          icon: Loader2,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          text: 'Syncing'
        }
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          text: 'Disconnected'
        }
    }
  }

  const config = getStatusConfig()
  const IconComponent = config.icon

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.bgColor} ${config.color} ${className}`}>
      <IconComponent 
        className={`w-4 h-4 ${status === 'syncing' ? 'animate-spin' : ''}`}
        data-testid={status === 'syncing' ? 'loader-2' : status === 'synced' ? 'check-circle' : 'wifi-off'}
      />
      <span>{config.text}</span>
    </div>
  )
} 