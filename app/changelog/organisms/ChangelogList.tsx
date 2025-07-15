'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText } from 'lucide-react';
import { ChangelogCard } from '../molecules/ChangelogCard';
import { Pagination } from '../molecules/Pagination';
import { useChangelogEntries, useChangelogMutations } from '../atoms/useChangelogApi';
import { useAuth } from '@/app/auth/atoms/useAuth';
import type { ChangelogFilters as ChangelogFiltersType, ChangelogEntry } from '../atoms/types';
import { PERMISSIONS } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ChangelogListProps {
  className?: string;
  statusFilter?: 'published' | 'drafts' | 'all';
}

export function ChangelogList({ className = '', statusFilter = 'all' }: ChangelogListProps) {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  
  // State
  const [filters, setFilters] = useState<ChangelogFiltersType>({
    page: 1,
    per_page: 20,
    status: statusFilter,
  });



  // API hooks
  const {
    data: changelogData,
    loading: changelogLoading,
    refetch: refetchChangelog,
  } = useChangelogEntries(filters);



  const {
    loading: mutationsLoading,
    publishChangelog,
    unpublishChangelog,
    deleteChangelogEntry,
  } = useChangelogMutations();

  // Effects
  // Update filters when statusFilter changes
  useEffect(() => {
    console.log('Status filter changed to:', statusFilter);
    setFilters(prev => ({ ...prev, status: statusFilter }));
  }, [statusFilter]);

  // Initial data fetch and refetch when filters change
  useEffect(() => {
    console.log('Filters changed, refetching with:', filters);
    refetchChangelog();
  }, [filters]);

  // Handlers
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handlePublish = async (entryId: string) => {
    try {
      await publishChangelog({ entry_id: entryId });
      toast({
        title: "Success",
        description: "Changelog entry published successfully",
      });
      refetchChangelog();
    } catch {
      // Error is handled by the mutation hook
    }
  };

  const handleUnpublish = async (entryId: string) => {
    try {
      await unpublishChangelog({ entry_id: entryId });
      toast({
        title: "Success",
        description: "Changelog entry unpublished successfully",
      });
      refetchChangelog();
    } catch {
      // Error is handled by the mutation hook
    }
  };

  const handleDelete = async (entryId: string) => {
    if (confirm('Are you sure you want to delete this changelog entry? This action cannot be undone.')) {
      try {
        await deleteChangelogEntry(entryId);
        toast({
          title: "Success",
          description: "Changelog entry deleted successfully",
        });
        refetchChangelog();
      } catch {
        // Error is handled by the mutation hook
      }
    }
  };

  const handleEdit = (entry: ChangelogEntry) => {
    // TODO: Implement edit functionality
    console.log('Edit entry:', entry);
  };

  const handleView = (entry: ChangelogEntry) => {
    // TODO: Implement view functionality
    console.log('View entry:', entry);
  };



  // Remove the full-page loading state. Instead, show a skeleton or spinner in the list area.

  // Empty state (only if not loading)
  if (!changelogLoading && (!changelogData?.entries.length)) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Changelog Entries</h3>
          <p className="text-gray-600 mb-4">
            No changelog entries have been created yet.
          </p>
          {hasPermission(PERMISSIONS.CHANGELOG_CREATE) && (
            <Button variant="outline">
              Create First Entry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Changelog Entries */}
      <div className="space-y-4">
        {changelogLoading ? (
          // Show skeleton cards with minimal height to prevent scrollbar issues
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {/* Badge skeleton */}
                      <div className="h-5 w-14 bg-gray-200 rounded-full"></div>
                      {/* Optional badge skeleton */}
                      <div className="h-4 w-10 bg-gray-200 rounded-full"></div>
                    </div>
                    
                    {/* Title skeleton */}
                    <div className="h-5 bg-gray-200 rounded mb-1 w-3/4"></div>
                    
                    {/* Metadata skeleton */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 w-10 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 w-12 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons skeleton */}
                  <div className="flex items-center gap-1 ml-4">
                    {Array.from({ length: 4 }).map((_, btnIndex) => (
                      <div key={btnIndex} className="w-7 h-7 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Description skeleton */}
                <div className="space-y-1 mb-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          changelogData?.entries.map((entry) => (
            <ChangelogCard
              key={entry.id}
              entry={entry}
              onEdit={handleEdit}
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
              onDelete={handleDelete}
              onView={handleView}
              showActions={hasPermission(PERMISSIONS.CHANGELOG_VIEW)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {changelogData && changelogData.entries.length > 0 && (
        <Pagination
          currentPage={changelogData.page}
          totalPages={Math.ceil(changelogData.total / changelogData.per_page)}
          totalItems={changelogData.total}
          itemsPerPage={changelogData.per_page}
          onPageChange={handlePageChange}
        />
      )}

      {/* Loading overlay for mutations only (not for filter changes) */}
      {mutationsLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
} 