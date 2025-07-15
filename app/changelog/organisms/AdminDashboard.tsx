'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  FileText, 
  Eye, 
  EyeOff, 
  GitBranch, 
  Users, 
  Settings,
  RefreshCw,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useChangelogEntries, useProcessCommits, useAvailableVersions, useCurrentVersion } from '../atoms/useChangelogApi';
import { useAuth } from '@/app/auth/atoms/useAuth';
import { PERMISSIONS } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface AdminDashboardProps {
  className?: string;
}

export function AdminDashboard({ className = '' }: AdminDashboardProps) {
  const { toast } = useToast();
  const { user, hasPermission } = useAuth();
  
  // Get role information from backend
  const isAdmin = user?.role_name === 'admin' || user?.is_superuser;
  
  // State
  const [processingCommits, setProcessingCommits] = useState(false);
  const [processingStartTime, setProcessingStartTime] = useState<number | null>(null);

  // API hooks
  const {
    data: changelogData,
    loading: changelogLoading,
    refetch: refetchChangelog,
  } = useChangelogEntries({ 
    per_page: 1000,
    include_drafts: true 
  }); // Get all for stats including drafts

  const {
    data: versionsData,
    loading: versionsLoading,
  } = useAvailableVersions();

  const {
    data: currentVersionData,
    loading: currentVersionLoading,
  } = useCurrentVersion();

  const {
    data: processCommitsData,
    loading: processCommitsLoading,
    processCommits,
  } = useProcessCommits();

  // Auto-refresh data when component mounts
  useEffect(() => {
    refetchChangelog();
  }, []); // Empty dependency array means this runs once when component mounts

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!changelogData?.entries) return null;

    const entries = changelogData.entries;
    const published = entries.filter(e => e.is_published);
    const drafts = entries.filter(e => !e.is_published);
    const breaking = entries.filter(e => e.is_breaking);

    const changesByType = entries.reduce((acc, entry) => {
      acc[entry.change_type] = (acc[entry.change_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: entries.length,
      published: published.length,
      drafts: drafts.length,
      breaking: breaking.length,
      changesByType,
    };
  }, [changelogData]);

  // Handlers
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
      
      // Only fetch new data if items were actually created
      if (result.created_count > 0) {
        toast({
          title: "Success!",
          description: `${result.created_count} new changelog entries created successfully in ${duration}s. Fetching updated list...`,
        });
        
        // Fetch the updated changelog list from the API
        await refetchChangelog();
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



  // Calculate processing duration for display
  const processingDuration = processingStartTime && processingCommits 
    ? Math.round((Date.now() - processingStartTime) / 1000) 
    : 0;

  // Loading state
  if (changelogLoading || versionsLoading || currentVersionLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage changelog and system settings
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {hasPermission(PERMISSIONS.CHANGELOG_CREATE) && (
            <Button
              onClick={handleProcessCommits}
              disabled={processCommitsLoading || processingCommits}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${processCommitsLoading || processingCommits ? 'animate-spin' : ''}`} />
              {processingCommits 
                ? `Processing... ${processingDuration > 0 ? `(${processingDuration}s)` : ''}` 
                : 'Generate Changelog'
              }
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              All changelog entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.published || 0}</div>
            <p className="text-xs text-muted-foreground">
              Public entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.drafts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pending publication
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Breaking Changes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.breaking || 0}</div>
            <p className="text-xs text-muted-foreground">
              Breaking changes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Info and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              System Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Version:</span>
              <Badge variant="outline">
                v{currentVersionData?.version || 'Unknown'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Versions:</span>
              <span className="font-medium">{versionsData?.total_versions || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">User Role:</span>
              <Badge variant="secondary">
                {isAdmin ? 'Admin' : 'User'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Permissions:</span>
              <span className="font-medium">{isAdmin ? 'All' : 'Limited'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {changelogData?.entries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">{entry.title}</div>
                      <div className="text-sm text-gray-600">
                        {entry.change_type} • v{entry.version}
                      </div>
                    </div>
                  </div>
                  <Badge variant={entry.is_published ? "default" : "secondary"}>
                    {entry.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 