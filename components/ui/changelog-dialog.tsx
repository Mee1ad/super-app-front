'use client'

import React, { useState, useEffect } from 'react'
import { X, Calendar, Tag } from 'lucide-react'
import { Button } from './button'

interface ChangelogEntry {
  id: string
  version: string
  release_date: string
  title: string
  description: string
  change_type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security'
  is_published: boolean
  commit_message?: string
}

interface ChangelogDialogProps {
  isOpen: boolean
  onClose: () => void
  changelogData?: {
    entries: ChangelogEntry[]
    total: number
    latest_version: string
    user_version: string
    has_new_content: boolean
  } | null
}

const typeConfig = {
  added: { color: 'bg-green-100 text-green-800', label: 'Added' },
  changed: { color: 'bg-blue-100 text-blue-800', label: 'Changed' },
  deprecated: { color: 'bg-yellow-100 text-yellow-800', label: 'Deprecated' },
  removed: { color: 'bg-red-100 text-red-800', label: 'Removed' },
  fixed: { color: 'bg-purple-100 text-purple-800', label: 'Fixed' },
  security: { color: 'bg-orange-100 text-orange-800', label: 'Security' }
}

export function ChangelogDialog({ isOpen, onClose, changelogData }: ChangelogDialogProps) {
  const [showOlder, setShowOlder] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowOlder(false)
    }
  }, [isOpen])



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
                What&apos;s New
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

          {!changelogData ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading changelog...</span>
            </div>
          ) : changelogData.entries && changelogData.entries.length > 0 ? (
            <div className="space-y-6">
              {/* Always show the latest entry */}
              <div key={changelogData.entries[0].id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-gray-900">
                      v{changelogData.entries[0].version}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig[changelogData.entries[0].change_type].color}`}>
                      {typeConfig[changelogData.entries[0].change_type].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {formatDate(changelogData.entries[0].release_date)}
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">
                  {changelogData.entries[0].title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {changelogData.entries[0].description}
                </p>
                {changelogData.entries[0].commit_message && (
                  <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded border">
                    <span className="font-medium">Commit:</span> {changelogData.entries[0].commit_message}
                  </div>
                )}
              </div>
              {/* Show button for older updates if more than one entry */}
              {changelogData.entries.length > 1 && !showOlder && (
                <div className="flex justify-center pt-2">
                  <Button variant="outline" onClick={() => setShowOlder(true)}>
                    Older Updates
                  </Button>
                </div>
              )}
              {/* Show older updates if requested */}
              {showOlder && changelogData.entries.length > 1 && (
                <div className="space-y-6 pt-2">
                  {changelogData.entries.slice(1).map((entry) => (
                    <div key={entry.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold text-gray-900">
                            v{entry.version}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig[entry.change_type].color}`}>
                            {typeConfig[entry.change_type].label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {formatDate(entry.release_date)}
                        </div>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        {entry.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {entry.description}
                      </p>
                      {entry.commit_message && (
                        <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded border">
                          <span className="font-medium">Commit:</span> {entry.commit_message}
                        </div>
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
                You&apos;re up to date with the latest version!
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