'use client'

import React, { useState, useEffect } from 'react'
import { X, ExternalLink, Calendar, Tag } from 'lucide-react'
import { Button } from './button'

interface ChangelogEntry {
  id: string
  version: string
  date: string
  title: string
  description: string
  type: 'feature' | 'improvement' | 'bugfix' | 'breaking'
  link?: string
}

interface ChangelogDialogProps {
  isOpen: boolean
  onClose: () => void
}

// Mock data - replace with API call later
const mockChangelogData: ChangelogEntry[] = [
  {
    id: '1',
    version: '1.2.0',
    date: '2024-01-15',
    title: 'New Habit Tracker Feature',
    description: 'Introducing a comprehensive habit tracking system with progress visualization and streak counting.',
    type: 'feature'
  },
  {
    id: '2',
    version: '1.2.0',
    date: '2024-01-15',
    title: 'Enhanced Feedback System',
    description: 'Added image upload support and improved rating system for better user feedback collection.',
    type: 'improvement'
  },
  {
    id: '3',
    version: '1.1.5',
    date: '2024-01-10',
    title: 'Fixed Diary Image Upload',
    description: 'Resolved issue where images weren\'t displaying correctly in diary entries.',
    type: 'bugfix'
  },
  {
    id: '4',
    version: '1.1.0',
    date: '2024-01-05',
    title: 'UI Design System Update',
    description: 'Updated to use shadcn components throughout the application for better consistency.',
    type: 'improvement'
  }
]

const typeConfig = {
  feature: { color: 'bg-green-100 text-green-800', label: 'Feature' },
  improvement: { color: 'bg-blue-100 text-blue-800', label: 'Improvement' },
  bugfix: { color: 'bg-red-100 text-red-800', label: 'Bug Fix' },
  breaking: { color: 'bg-orange-100 text-orange-800', label: 'Breaking' }
}

export function ChangelogDialog({ isOpen, onClose }: ChangelogDialogProps) {
  const [changelogData, setChangelogData] = useState<ChangelogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showOlder, setShowOlder] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchChangelogData()
      setShowOlder(false)
    }
  }, [isOpen])

  const fetchChangelogData = async () => {
    setIsLoading(true)
    
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock API response - replace with actual API call
      const response = mockChangelogData
      
      if (response && response.length > 0) {
        setChangelogData(response)
      }
    } catch (error) {
      console.error('Failed to fetch changelog:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                What's New
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Latest updates and improvements
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading changelog...</span>
            </div>
          ) : changelogData.length > 0 ? (
            <div className="space-y-6">
              {/* Always show the latest entry */}
              <div key={changelogData[0].id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-gray-900">
                      v{changelogData[0].version}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig[changelogData[0].type].color}`}>
                      {typeConfig[changelogData[0].type].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {formatDate(changelogData[0].date)}
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">
                  {changelogData[0].title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {changelogData[0].description}
                </p>
                {changelogData[0].link && (
                  <a
                    href={changelogData[0].link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Learn more
                  </a>
                )}
              </div>
              {/* Show button for older updates if more than one entry */}
              {changelogData.length > 1 && !showOlder && (
                <div className="flex justify-center pt-2">
                  <Button variant="outline" onClick={() => setShowOlder(true)}>
                    Older Updates
                  </Button>
                </div>
              )}
              {/* Show older updates if requested */}
              {showOlder && changelogData.length > 1 && (
                <div className="space-y-6 pt-2">
                  {changelogData.slice(1).map((entry) => (
                    <div key={entry.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold text-gray-900">
                            v{entry.version}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig[entry.type].color}`}>
                            {typeConfig[entry.type].label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {formatDate(entry.date)}
                        </div>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        {entry.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {entry.description}
                      </p>
                      {entry.link && (
                        <a
                          href={entry.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Learn more
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No updates available
              </h3>
              <p className="text-gray-600">
                You're up to date with the latest version!
              </p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 