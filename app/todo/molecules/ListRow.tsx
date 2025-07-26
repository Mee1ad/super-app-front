'use client';
import { Edit, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

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
  isLast = false 
}: ListRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  const handleSaveTitle = () => {
    setIsEditing(false);
    onUpdateTitle?.(id, editTitle);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(title);
    }
  };

  const getTypeIcon = () => {
    return type === "task" ? "📋" : "🛒";
  };

  const getTypeLabel = () => {
    return type === "task" ? "Tasks" : "Items";
  };

  return (
    <>
      <div 
        className="flex items-center justify-between py-4 px-0 cursor-pointer hover:bg-gray-50 active:bg-muted/30 active:scale-[0.98] transition-all duration-150 ease-out"
        onClick={() => onClick?.(id)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-lg">{getTypeIcon()}</span>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input 
                  className="text-base font-medium border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent" 
                  value={editTitle} 
                  onChange={e => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyPress}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-6 px-2" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveTitle();
                  }}
                >
                  Save
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-gray-700 h-6 px-2" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(false);
                    setEditTitle(title);
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex flex-col">
                <h3 className="text-base font-medium text-gray-900 truncate">{title}</h3>
                <p className="text-sm text-gray-500">{itemCount} {getTypeLabel()}</p>
              </div>
            )}
          </div>
        </div>
        
        {!isEditing && (
          <div className="flex items-center gap-2">
            <Edit 
              data-testid="edit-icon"
              className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" 
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }} 
            />
            <Trash2 
              data-testid="delete-icon"
              className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-600 transition-colors" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(id);
              }} 
            />
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>
      {!isLast && <div className="border-b border-gray-200" />}
    </>
  );
} 