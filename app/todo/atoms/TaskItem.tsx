'use client';

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
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
    attributes: any;
    listeners: any;
  };
};

export function TaskItem({ id, title, description, checked = false, variant = "default", onUpdate, onDelete, onToggle, dragHandleProps }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDesc, setEditDesc] = useState(description || "");

  const handleSave = () => {
    setIsEditing(false);
    onUpdate?.(id, editTitle, editDesc);
  };

  const handleToggle = (checked: boolean) => {
    onToggle?.(id, checked);
  };

  const base = "p-4 flex flex-col gap-2 border rounded transition-colors";
  const variants = {
    default: "bg-white border-gray-200",
    outlined: "bg-transparent",
    filled: "",
  };

  return (
    <div className={`${base} ${variants[variant]} relative`}> 
      {isEditing ? (
        <>
          <input className="font-semibold text-lg mb-1" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
          <textarea className="text-sm" value={editDesc} onChange={e => setEditDesc(e.target.value)} />
          <div className="flex gap-2 mt-2">
            <button className="text-blue-600" onClick={handleSave}>Save</button>
            <button className="text-gray-500" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center select-none">
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={checked} 
                onCheckedChange={handleToggle}
              />
              <span className={`font-semibold text-lg ${checked ? 'line-through text-gray-500' : ''}`}>{title}</span>
            </div>
            <div className="flex gap-2">
              <Edit className="w-4 h-4 text-blue-600 cursor-pointer hover:text-blue-800" onClick={() => setIsEditing(true)} />
              <Trash2 className="w-4 h-4 text-red-500 cursor-pointer hover:text-red-700" onClick={() => onDelete?.(id)} />
            </div>
          </div>
          {description && <p className={`text-sm text-gray-600 mt-1 ml-7 select-none ${checked ? 'line-through' : ''}`}>{description}</p>}
        </>
      )}
      {dragHandleProps && (
        <div
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          style={{ pointerEvents: 'none' }}
          {...dragHandleProps.attributes}
          {...dragHandleProps.listeners}
        />
      )}
    </div>
  );
} 