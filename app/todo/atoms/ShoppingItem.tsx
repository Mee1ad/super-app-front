'use client';

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2 } from "lucide-react";

export type ShoppingItemProps = {
  id: string;
  title: string;
  url: string;
  price: string;
  source?: string;
  variant?: "default" | "outlined" | "filled";
  checked?: boolean;
  onUpdate?: (id: string, title: string, url: string, price: string, source?: string) => void;
  onDelete?: (id: string) => void;
  onToggle?: (id: string, checked: boolean) => void;
  dragHandleProps?: {
    attributes: any;
    listeners: any;
  };
};

export function ShoppingItem({ id, title, url, price, source, variant = "default", checked = false, onUpdate, onDelete, onToggle, dragHandleProps }: ShoppingItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editUrl, setEditUrl] = useState(url);
  const [editPrice, setEditPrice] = useState(price);
  const [editSource, setEditSource] = useState(source || "");

  const handleSave = () => {
    setIsEditing(false);
    onUpdate?.(id, editTitle, editUrl, editPrice, editSource);
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
          <input className="text-sm mb-1" value={editUrl} onChange={e => setEditUrl(e.target.value)} placeholder="URL" />
          <input className="text-sm mb-1" value={editPrice} onChange={e => setEditPrice(e.target.value)} placeholder="Price" />
          <input className="text-sm mb-1" value={editSource} onChange={e => setEditSource(e.target.value)} placeholder="Source" />
          <div className="flex gap-2 mt-2">
            <button className="text-green-600" onClick={handleSave}>Save</button>
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
              <a href={url} target="_blank" rel="noopener noreferrer" className={`font-semibold text-lg text-blue-600 hover:underline ${checked ? 'line-through text-gray-500' : ''}`}>{title}</a>
            </div>
            <div className="flex gap-2">
              <Edit className="w-4 h-4 text-blue-600 cursor-pointer hover:text-blue-800" onClick={() => setIsEditing(true)} />
              <Trash2 className="w-4 h-4 text-red-500 cursor-pointer hover:text-red-700" onClick={() => onDelete?.(id)} />
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-1 select-none">
            <span>Price: {price}</span>
            {source && <span>Source: {source}</span>}
          </div>
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