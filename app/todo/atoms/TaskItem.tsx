'use client';

import { useState, useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";

export type TaskItemProps = {
  id: string;
  title: string;
  description?: string;
  checked?: boolean;
  variant?: "default" | "outlined" | "filled";
  onUpdate?: (id: string, title: string, description?: string) => void;
  onDelete?: (id: string) => void;
  onToggle?: (id: string, checked: boolean) => void;
  dragHandleProps?: {
    attributes?: React.HTMLAttributes<HTMLDivElement>;
    listeners?: React.HTMLAttributes<HTMLDivElement>;
  };
};

export function TaskItem({ id, title, description, checked = false, onUpdate, onDelete, onToggle, dragHandleProps }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDesc, setEditDesc] = useState(description || "");
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus title input on mobile when entering edit mode
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      // Small delay to ensure the input is fully rendered
      const timer = setTimeout(() => {
        titleInputRef.current?.focus()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [isEditing])

  const handleSave = () => {
    setIsEditing(false);
    onUpdate?.(id, editTitle, editDesc);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(title);
    setEditDesc(description || "");
  };

  const handleToggle = (checked: boolean) => {
    onToggle?.(id, checked);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Card className="relative hover:bg-muted/50 active:bg-muted/30 active:scale-[0.98] transition-all duration-150 ease-out">
      <CardContent className="px-3">
        {isEditing ? (
          <div className="space-y-3">
            <Input 
              className="text-lg font-semibold border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
              value={editTitle} 
              onChange={e => setEditTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Task title"
              autoFocus
              ref={titleInputRef}
            />
            <Textarea 
              className="text-sm border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none" 
              value={editDesc} 
              onChange={e => setEditDesc(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Task description (optional)"
              rows={2}
            />
            <div className="flex gap-2 pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSave();
                }}
              >
                Save
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 hover:text-gray-700" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCancel();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Checkbox 
                  checked={checked} 
                  onCheckedChange={handleToggle}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-lg leading-tight ${checked ? 'line-through text-gray-500' : ''}`}>
                    {title}
                  </h3>
                  {description && (
                    <p className={`text-sm text-gray-600 mt-3 leading-relaxed ${checked ? 'line-through' : ''}`} style={{ whiteSpace: 'pre-wrap' }}>
                      {description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-2">
                <Edit 
                  className="w-4 h-4 text-blue-600 cursor-pointer hover:text-blue-800 transition-colors" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsEditing(true);
                  }} 
                />
                <Trash2 
                  className="w-4 h-4 text-red-500 cursor-pointer hover:text-red-700 transition-colors" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete?.(id);
                  }} 
                />
              </div>
            </div>
          </div>
        )}
        {dragHandleProps && (
          <div
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{ pointerEvents: 'none' }}
            {...dragHandleProps.attributes}
            {...dragHandleProps.listeners}
          />
        )}
      </CardContent>
    </Card>
  );
} 