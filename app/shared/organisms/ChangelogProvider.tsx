'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getUserInfo } from '@/lib/user-info'
import { ChangelogDialog } from '@/components/ui/changelog-dialog'

interface ChangelogEntry {
  id: string;
  version: string;
  release_date: string;
  title: string;
  description: string;
  change_type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
  is_published: boolean;
  commit_message?: string;
}

interface ChangelogData {
  entries: ChangelogEntry[];
  total: number;
  latest_version: string;
  user_version: string;
  has_new_content: boolean;
}

interface UserInfo {
  ip_address: string;
  user_agent: string;
}

export function ChangelogProvider({ children }: { children: React.ReactNode }) {
  const [isChangelogOpen, setIsChangelogOpen] = useState(false)
  const [changelogData, setChangelogData] = useState<ChangelogData | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Close changelog when navigating to changelog page
  useEffect(() => {
    if (pathname === '/changelog' && isChangelogOpen) {
      setIsChangelogOpen(false)
      setChangelogData(null)
    }
  }, [pathname, isChangelogOpen])

  // Check for changelog updates
  useEffect(() => {
    // Only run after we're on the client side
    if (!isClient) return
    
    // Check for updates on all pages except changelog page
    if (pathname !== '/changelog') {
      checkAnonymousChangelog()
    }
  }, [pathname, isClient])

  // Show changelog when we have data
  useEffect(() => {
    if (changelogData && changelogData.has_new_content && !isChangelogOpen) {
      setIsChangelogOpen(true)
    }
  }, [changelogData, isChangelogOpen])

  const checkAnonymousChangelog = async () => {
    try {
      // Get user info (IP and User-Agent)
      const info = await getUserInfo()
      if (!info) {
        return
      }
      
      setUserInfo(info)
      
      // Log the API configuration
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      
      // First, check if user should see changelog
      const statusUrl = `${API_BASE_URL}/api/v1/changelog/latest?ip_address=${encodeURIComponent(info.ip_address)}&userAgent=${encodeURIComponent(info.user_agent)}`
      
      const statusResponse = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (statusResponse.ok) {
        const changelogData = await statusResponse.json()
        
        if (changelogData.entries && changelogData.entries.length > 0) {
          // Mark that we have new content to show
          setChangelogData({
            ...changelogData,
            has_new_content: true
          })
        } else {
          setChangelogData(null)
        }
      } else {
        setChangelogData(null)
      }
    } catch {
      // Silently handle network errors - backend may not be running
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('ChangelogProvider: Backend not available, skipping changelog check')
      }
      setChangelogData(null)
    }
  }

  const handleClose = () => {
    setIsChangelogOpen(false)
    setChangelogData(null)
    
    // Mark as viewed when user closes the dialog
    if (userInfo) {
      markAsViewed()
    }
  }

  const markAsViewed = async () => {
    if (!userInfo) return
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const viewedUrl = `${API_BASE_URL}/api/v1/changelog/viewed`
      
      const response = await fetch(viewedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip_address: userInfo.ip_address,
          userAgent: userInfo.user_agent
        })
      })
      
      if (!response.ok) {
        // Silently handle errors
        console.log('ChangelogProvider: Failed to mark as viewed')
      }
    } catch {
      // Silently handle network errors
      console.log('ChangelogProvider: Network error marking as viewed')
    }
  }

  return (
    <>
      {children}
      <ChangelogDialog 
        isOpen={isChangelogOpen} 
        onClose={handleClose}
        changelogData={changelogData}
      />
    </>
  )
} 