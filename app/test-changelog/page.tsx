'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { getUserInfo, clearUserInfoCache } from '@/lib/user-info'

export default function TestChangelogPage() {
  const [userInfo, setUserInfo] = useState<{ ip_address: string; user_agent: string } | null>(null)
  const [statusResult, setStatusResult] = useState<Record<string, unknown> | null>(null)
  const [latestResult, setLatestResult] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)

  const testGetUserInfo = async () => {
    setLoading(true)
    try {
      const info = await getUserInfo()
      setUserInfo(info)
      console.log('User info:', info)
    } catch (error) {
      console.error('Error getting user info:', error)
    } finally {
      setLoading(false)
    }
  }

  const testStatus = async () => {
    if (!userInfo) {
      alert('Please get user info first')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `/api/changelog/status?ip_address=${encodeURIComponent(userInfo.ip_address)}&user_agent=${encodeURIComponent(userInfo.user_agent)}`
      )
      const data = await response.json()
      setStatusResult(data)
      console.log('Status result:', data)
    } catch (error) {
      console.error('Error testing status:', error)
    } finally {
      setLoading(false)
    }
  }

  const testLatest = async () => {
    if (!userInfo) {
      alert('Please get user info first')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `/api/changelog/latest?ip_address=${encodeURIComponent(userInfo.ip_address)}&user_agent=${encodeURIComponent(userInfo.user_agent)}&limit=5`
      )
      const data = await response.json()
      setLatestResult(data)
      console.log('Latest result:', data)
    } catch (error) {
      console.error('Error testing latest:', error)
    } finally {
      setLoading(false)
    }
  }

  const testViewed = async () => {
    if (!userInfo) {
      alert('Please get user info first')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/changelog/viewed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip_address: userInfo.ip_address,
          user_agent: userInfo.user_agent
        })
      })
      const data = await response.json()
      console.log('Viewed result:', data)
      alert('Marked as viewed successfully')
    } catch (error) {
      console.error('Error testing viewed:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearCache = () => {
    clearUserInfoCache()
    setUserInfo(null)
    setStatusResult(null)
    setLatestResult(null)
    console.log('Cache cleared')
  }

  const clearChangelogSeenStatus = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('changelog_seen_v1.2.0')
      alert('Changelog seen status cleared. Refresh the page to test the popup again.')
    }
  }

  const checkChangelogStatus = () => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('changelog_seen_v1.2.0') === 'true'
      alert(`Changelog seen status: ${seen ? 'SEEN' : 'NOT SEEN'}`)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Anonymous Changelog System Test</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Step 1: Get User Info</h2>
          <Button onClick={testGetUserInfo} disabled={loading}>
            {loading ? 'Loading...' : 'Get User Info'}
          </Button>
          {userInfo && (
            <div className="mt-4 p-4 bg-white rounded border">
              <h3 className="font-medium mb-2">User Info:</h3>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(userInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Step 2: Test API Endpoints</h2>
          <div className="space-y-4">
            <Button onClick={testStatus} disabled={!userInfo || loading}>
              {loading ? 'Loading...' : 'Test Status'}
            </Button>
            <Button onClick={testLatest} disabled={!userInfo || loading}>
              {loading ? 'Loading...' : 'Test Latest'}
            </Button>
            <Button onClick={testViewed} disabled={!userInfo || loading}>
              {loading ? 'Loading...' : 'Test Viewed'}
            </Button>
          </div>

          {statusResult && (
            <div className="mt-4 p-4 bg-white rounded border">
              <h3 className="font-medium mb-2">Status Result:</h3>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(statusResult, null, 2)}
              </pre>
            </div>
          )}

          {latestResult && (
            <div className="mt-4 p-4 bg-white rounded border">
              <h3 className="font-medium mb-2">Latest Result:</h3>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(latestResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Utilities</h2>
          <div className="space-y-4">
            <Button onClick={clearCache} variant="outline">
              Clear Cache
            </Button>
            <Button onClick={clearChangelogSeenStatus} variant="outline">
              Clear Changelog Seen Status
            </Button>
            <Button onClick={checkChangelogStatus} variant="outline">
              Check Changelog Status
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 