'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '../atoms/useAuth'
import { LogOut, User, Settings, Shield } from 'lucide-react'
import { getRoleDisplayName } from '@/lib/permissions'

export function UserMenu() {
  const { user, logout, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Debug logging
  console.log('UserMenu render:', { isAuthenticated, user })

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (!isAuthenticated || !user) {
    return null
  }

  // Get role information from backend
  const isAdmin = user?.role_name === 'admin' || user?.is_superuser;
  const role = getRoleDisplayName(user?.role_name || 'viewer');
  const roleColor = isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors min-w-[80px] justify-center"
      >
        {/* Only show user initial or name, no image */}
        <span className="text-sm font-medium truncate">
          {user.username || user.email || 'User'}
        </span>
        {isAdmin && (
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          {/* Menu - open upwards */}
          <div className="absolute right-0 bottom-12 mb-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 animate-fade-in-up">
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{user.username || user.email || 'User'}</p>
                  <Badge className={`text-xs ${roleColor}`}>
                    {role}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">{user.email}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Shield className="w-3 h-3" />
                  <span>{isAdmin ? 'Full Access' : 'Limited Access'}</span>
                </div>
              </div>
            </div>
            <div className="p-2">
              <button
                onClick={() => {
                  setIsOpen(false)
                  // Add settings navigation here
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={() => {
                  setIsOpen(false)
                  // Add settings navigation here
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 