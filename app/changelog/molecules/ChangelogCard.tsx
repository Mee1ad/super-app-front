'use client';

import React from 'react';
import { 
  Edit, 
  Eye, 
  Trash2, 
  Globe, 
  Lock, 
  AlertTriangle,
  Calendar,
  GitCommit,
  Tag
} from 'lucide-react';
import { ChangelogEntry, CHANGE_TYPE_CONFIG } from '../atoms/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ChangelogCardProps {
  entry: ChangelogEntry;
  onEdit: (entry: ChangelogEntry) => void;
  onPublish: (entryId: string) => void;
  onUnpublish: (entryId: string) => void;
  onDelete: (entryId: string) => void;
  onView: (entry: ChangelogEntry) => void;
  showActions?: boolean;
  className?: string;
}

export function ChangelogCard({
  entry,
  onEdit,
  onPublish,
  onUnpublish,
  onDelete,
  onView,
  showActions = true,
  className = '',
}: ChangelogCardProps) {
  const changeTypeConfig = CHANGE_TYPE_CONFIG[entry.change_type];
  const isPublished = entry.is_published;
  const isBreaking = entry.is_breaking;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCommitHash = (hash: string) => {
    return hash.substring(0, 8);
  };

  return (
    <Card className={`${className} ${!isPublished ? 'border-orange-200 bg-orange-50/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="outline" 
                className={`${changeTypeConfig.color} border`}
              >
                {changeTypeConfig.label}
              </Badge>
              
              {isBreaking && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Breaking
                </Badge>
              )}
              
              {!isPublished && (
                <Badge variant="secondary" className="text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  Draft
                </Badge>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {entry.title}
            </h3>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                <span>v{entry.version}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(entry.release_date)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <GitCommit className="w-4 h-4" />
                <span className="font-mono">{formatCommitHash(entry.commit_hash)}</span>
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-1 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(entry)}
                className="h-8 w-8 p-0"
                title="View details"
              >
                <Eye className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(entry)}
                className="h-8 w-8 p-0"
                title="Edit entry"
              >
                <Edit className="w-4 h-4" />
              </Button>
              
              {isPublished ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUnpublish(entry.id)}
                  className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
                  title="Unpublish entry"
                >
                  <Lock className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPublish(entry.id)}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                  title="Publish entry"
                >
                  <Globe className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(entry.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                title="Delete entry"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-700 leading-relaxed mb-3">
          {entry.description}
        </p>
        
        {entry.commit_message && (
          <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded border">
            <span className="font-medium">Commit:</span> {entry.commit_message}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 