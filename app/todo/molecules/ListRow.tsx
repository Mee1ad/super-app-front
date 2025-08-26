'use client';
import { useState } from 'react';
import { Edit, Trash2, Move } from 'lucide-react';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

import { ClickableListItem } from '@/components/ui/clickable-item';
import { EditList } from './EditList';

interface ListRowProps {
  id: string;
  title: string;
  type: "task" | "shopping";
  itemCount: number;
  onUpdateTitle?: (id: string, title: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
  isLast?: boolean;
}

export function ListRow({ 
  id, 
  title, 
  type, 
  itemCount, 
  onUpdateTitle, 
  onDelete, 
  onClick,
 
}: ListRowProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveTitle = (newTitle: string) => {
    onUpdateTitle?.(id, newTitle);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete?.(id);
  };

  const handleReorder = () => {
    // TODO: Implement reorder functionality
    console.log('Reorder list:', id);
  };

  const getTypeIcon = () => {
    return type === "task" ? "📋" : "🛒";
  };

  const getTypeLabel = () => {
    return type === "task" ? "Tasks" : "Items";
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <ClickableListItem onClick={() => onClick?.(id)}>
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex-shrink-0 text-2xl">{getTypeIcon()}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate">{title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{itemCount} {getTypeLabel()}</p>
              </div>
            </div>
          </ClickableListItem>
        </ContextMenuTrigger>
        
        <ContextMenuContent>
          <ContextMenuItem onClick={handleEdit}>
            <Edit data-testid="edit-icon" className="w-4 h-4 mr-2" />
            Edit
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleReorder}>
            <Move className="w-4 h-4 mr-2" />
            Reorder
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleDelete} variant="destructive">
            <Trash2 data-testid="delete-icon" className="w-4 h-4 mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Edit List Keyboard Form */}
      <EditList
        currentTitle={title}
        onSave={handleSaveTitle}
        onCancel={handleCancelEdit}
        isOpen={isEditing}
      />
    </>
  );
} 