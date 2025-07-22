'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChangelogList } from './organisms/ChangelogList';
import { AdminDashboard } from './organisms/AdminDashboard';
import { useAuth } from '@/app/auth/atoms/useAuth';
import { PERMISSIONS } from '@/lib/permissions';
import { Toaster } from '@/components/ui/toaster';
import { RefreshCw, BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useProcessCommits } from './atoms/useChangelogApi';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '../shared/organisms/AppLayout';
import Link from 'next/link'

type StatusFilter = 'published' | 'drafts' | 'all';

function ChangelogContent() {
  const { isAuthenticated, user, loading, hasPermission } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showSummary, setShowSummary] = useState(false);
  const [processingCommits, setProcessingCommits] = useState(false);
  const [processingStartTime, setProcessingStartTime] = useState<number | null>(null);

  const {
    loading: processCommitsLoading,
    processCommits,
  } = useProcessCommits();

  // Get role information from backend
  const isAdmin = user?.role_name === 'admin' || user?.is_superuser;



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">
            Please log in to access the changelog system.
          </p>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Check if user has permission to view changelog
  if (!hasPermission(PERMISSIONS.CHANGELOG_VIEW)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don&apos;t have permission to access the changelog system.
          </p>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleProcessCommits = async () => {
    setProcessingCommits(true);
    setProcessingStartTime(Date.now());
    
    // Set up timeout warning for long operations
    const timeoutId = setTimeout(() => {
      if (processingCommits) {
        toast({
          title: "Still Processing",
          description: "This operation is taking longer than expected. Please wait...",
        });
      }
    }, 10000); // 10 seconds
    
    try {
      toast({
        title: "Processing Commits",
        description: "Analyzing git commits and generating changelog entries...",
      });
      
      const result = await processCommits();
      
      const duration = processingStartTime ? Math.round((Date.now() - processingStartTime) / 1000) : 0;
      
      if (result.created_count > 0) {
        toast({
          title: "Success!",
          description: `${result.created_count} new changelog entries created successfully in ${duration}s.`,
        });
      } else {
        toast({
          title: "Completed",
          description: `No new entries were created in ${duration}s`,
        });
      }
    } catch (error) {
      console.error('Process commits error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process commits",
        variant: "destructive",
      });
    } finally {
      clearTimeout(timeoutId);
      setProcessingCommits(false);
      setProcessingStartTime(null);
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Changelog</h1>
          <p className="text-gray-600 mt-1">Track and manage software changes</p>
        </div>
        
        <div className="flex items-center gap-3">
          {hasPermission(PERMISSIONS.CHANGELOG_CREATE) && (
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleProcessCommits}
              disabled={processCommitsLoading || processingCommits}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${processCommitsLoading || processingCommits ? 'animate-spin' : ''}`} />
              {processingCommits 
                ? `Processing... ${processingStartTime ? Math.round((Date.now() - processingStartTime) / 1000) : 0}s` 
                : 'Generate Changelog'
              }
            </Button>
          )}
          
          {isAdmin && (
            <Dialog open={showSummary} onOpenChange={setShowSummary}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Summary
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Changelog Summary</DialogTitle>
                </DialogHeader>
                <AdminDashboard />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm font-medium text-gray-700">Status:</span>
        <div className="flex items-center gap-1">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'published' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('published')}
          >
            Published
          </Button>
          {hasPermission(PERMISSIONS.CHANGELOG_VIEW_DRAFTS) && (
            <Button
              variant={statusFilter === 'drafts' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('drafts')}
            >
              Drafts
            </Button>
          )}
        </div>
      </div>

      {/* Changelog List */}
      <ChangelogList statusFilter={statusFilter} />
    </AppLayout>
  );
}

export default function ChangelogPage() {
  return (
    <>
      <ChangelogContent />
      <Toaster />
    </>
  );
} 