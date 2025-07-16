'use client'

import React, { useState, useEffect } from 'react'
import { ChangelogDialog } from '@/components/ui/changelog-dialog'
import { usePathname } from 'next/navigation'
import { getUserInfo, type UserInfo } from '@/lib/user-info'

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

export function ChangelogProvider({ children }: { children: React.ReactNode }) {
  const [isChangelogOpen, setIsChangelogOpen] = useState(false)
  const [changelogData, setChangelogData] = useState<ChangelogData | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()



  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  console.log('ChangelogProvider: Component rendered', {
    pathname,
    isChecking,
    hasChangelog: !!changelogData,
    hasNewContent: changelogData?.has_new_content,
    isChangelogOpen
  })

  // Calling backend API endpoints directly for anonymous changelog tracking

  useEffect(() => {
    // Only run after we're on the client side
    if (!isClient) return
    
    console.log('ChangelogProvider: Checking conditions', {
      pathname,
      shouldCheck: pathname !== '/changelog',
      isClient
    })
    
    // Check for updates on all pages except changelog page
    if (pathname !== '/changelog') {
      console.log('ChangelogProvider: Starting anonymous changelog check')
      checkAnonymousChangelog()
    } else {
      console.log('ChangelogProvider: Skipping check - on changelog page')
      setIsChecking(false)
    }
  }, [pathname, isClient])

  useEffect(() => {
    // Show changelog automatically if there are updates and we're done checking
    console.log('ChangelogProvider: useEffect for showing popup', {
      hasChangelogData: !!changelogData,
      hasNewContent: changelogData?.has_new_content,
      isChecking,
      pathname,
      shouldShow: changelogData?.has_new_content && !isChecking && pathname !== '/changelog'
    })
    
    if (changelogData?.has_new_content && !isChecking && pathname !== '/changelog') {
      console.log('ChangelogProvider: Showing changelog popup')
      setIsChangelogOpen(true)
    }
  }, [changelogData, isChecking, pathname])

  // Close popup if user navigates to changelog page
  useEffect(() => {
    if (pathname === '/changelog' && isChangelogOpen) {
      setIsChangelogOpen(false)
      setChangelogData(null)
    }
  }, [pathname, isChangelogOpen])

  const checkAnonymousChangelog = async () => {
    try {
      setIsChecking(true)
      
      // Get user info (IP and User-Agent)
      const info = await getUserInfo()
      if (!info) {
        console.log('ChangelogProvider: Could not get user info, skipping changelog check')
        setIsChecking(false)
        return
      }
      
      setUserInfo(info)
      console.log('ChangelogProvider: Got user info, checking changelog status')
      
      // Log the API configuration
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      console.log('ChangelogProvider: API configuration:', {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        API_BASE_URL,
        isConfigured: !!process.env.NEXT_PUBLIC_API_URL
      })



      // First, check if user should see changelog
      const statusUrl = `${API_BASE_URL}/changelog/latest?ip_address=${encodeURIComponent(info.ip_address)}&userAgent=${encodeURIComponent(info.user_agent)}`
      
      console.log('ChangelogProvider: Calling status API:', statusUrl)
      
      const statusResponse = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (statusResponse.ok) {
        const changelogData = await statusResponse.json()
        console.log('ChangelogProvider: Changelog response:', changelogData)
        
        console.log('ChangelogProvider: Changelog check', {
          hasEntries: changelogData.entries && changelogData.entries.length > 0,
          willShow: changelogData.entries && changelogData.entries.length > 0
        })
        
        if (changelogData.entries && changelogData.entries.length > 0) {
          console.log('ChangelogProvider: Should show changelog, setting data')
          // Mark that we have new content to show
          setChangelogData({
            ...changelogData,
            has_new_content: true
          })
        } else {
          console.log('ChangelogProvider: Should not show changelog (no entries or already seen)')
          setChangelogData(null)
        }
      } else {
        console.error('ChangelogProvider: Failed to fetch changelog:', statusResponse.status)
        setChangelogData(null)
      }
          } catch (error) {
        console.error('ChangelogProvider: Failed to check anonymous changelog:', error)
        console.error('ChangelogProvider: Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          errorType: typeof error,
          errorKeys: error ? Object.keys(error) : [],
          fullError: error
        })
        
        // Check if it's a network/connectivity error
        const isNetworkError = error instanceof TypeError && error.message.includes('fetch')
        if (isNetworkError) {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
          console.error('ChangelogProvider: Network error detected - backend may not be running or accessible')
          console.error('ChangelogProvider: Please ensure your backend server is running at:', API_BASE_URL)
        }
        
        setChangelogData(null)
      } finally {
        setIsChecking(false)
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
      console.log('ChangelogProvider: Marking changelog as viewed')
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const viewedUrl = `${API_BASE_URL}/changelog/viewed`
      
      console.log('ChangelogProvider: Calling viewed API:', viewedUrl)
      
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
      
      if (response.ok) {
        console.log('ChangelogProvider: Successfully marked as viewed')
      } else {
        console.error('ChangelogProvider: Failed to mark as viewed:', response.status)
      }
    } catch (error) {
      console.error('ChangelogProvider: Failed to mark as viewed:', error)
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