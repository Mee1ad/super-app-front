'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { ChangeType, CHANGE_TYPE_CONFIG } from '../atoms/types';
import type { ChangelogFilters } from '../atoms/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/app/auth/atoms/useAuth';
import { PERMISSIONS } from '@/lib/permissions';

interface ChangelogFiltersProps {
  filters: ChangelogFilters;
  onFiltersChange: (filters: ChangelogFilters) => void;
  versions?: Array<{ version: string; release_date: string }>;
  className?: string;
}

export function ChangelogFilters({
  filters,
  onFiltersChange,
  versions = [],
  className = '',
}: ChangelogFiltersProps) {
  const { user } = useAuth();
  
  // Use the centralized permission system
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = <K extends keyof ChangelogFilters>(key: K, value: ChangelogFilters[K]) => {
    const newFilters = { ...filters };
    
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    // Reset to first page when filters change
    newFilters.page = 1;
    
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange({ page: 1 });
    setSearchTerm('');
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    key !== 'page' && key !== 'per_page' && filters[key as keyof ChangelogFilters]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filter Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search changelog entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              {Object.keys(filters).filter(key => 
                key !== 'page' && key !== 'per_page' && filters[key as keyof ChangelogFilters]
              ).length}
            </Badge>
          )}
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-1 text-gray-500"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          {/* Version Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Version</label>
            <Select
              value={filters.version || ''}
              onValueChange={(value) => handleFilterChange('version', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All versions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All versions</SelectItem>
                {versions.map((version) => (
                  <SelectItem key={version.version} value={version.version}>
                    v{version.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Change Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Change Type</label>
            <Select
              value={filters.change_type || ''}
              onValueChange={(value) => handleFilterChange('change_type', value as ChangeType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                {Object.entries(CHANGE_TYPE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Draft Status Filter */}
          {hasPermission(PERMISSIONS.CHANGELOG_VIEW_DRAFTS) && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select
                value={filters.include_drafts ? 'all' : 'published'}
                onValueChange={(value) => handleFilterChange('include_drafts', value === 'all')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published only</SelectItem>
                  <SelectItem value="all">All entries</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Items Per Page */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Items per page</label>
            <Select
              value={filters.per_page?.toString() || '20'}
              onValueChange={(value) => handleFilterChange('per_page', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">Active filters:</span>
          
          {filters.version && (
            <Badge variant="outline" className="text-xs">
              Version: v{filters.version}
              <button
                onClick={() => handleFilterChange('version', '')}
                className="ml-1 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filters.change_type && (
            <Badge variant="outline" className="text-xs">
              Type: {CHANGE_TYPE_CONFIG[filters.change_type].label}
              <button
                onClick={() => handleFilterChange('change_type', undefined)}
                className="ml-1 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filters.include_drafts && (
            <Badge variant="outline" className="text-xs">
              Include drafts
              <button
                onClick={() => handleFilterChange('include_drafts', false)}
                className="ml-1 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
} 