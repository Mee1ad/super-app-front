'use client';

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, ExternalLink } from "lucide-react";

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

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(title);
    setEditUrl(url);
    setEditPrice(price);
    setEditSource(source || "");
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
    <Card className="relative">
      <CardContent className="px-3">
        {isEditing ? (
          <div className="space-y-3">
            <Input 
              className="text-lg font-semibold border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
              value={editTitle} 
              onChange={e => setEditTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Item title"
              autoFocus
            />
            <Input 
              className="text-sm border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
              value={editUrl} 
              onChange={e => setEditUrl(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="URL"
            />
            <div className="flex gap-2">
              <Input 
                className="text-sm border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1" 
                value={editPrice} 
                onChange={e => setEditPrice(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Price"
              />
              <Input 
                className="text-sm border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1" 
                value={editSource} 
                onChange={e => setEditSource(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Source (optional)"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-green-600 hover:text-green-700 hover:bg-green-50" 
                onClick={handleSave}
              >
                Save
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 hover:text-gray-700" 
                onClick={handleCancel}
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
                  <div className="flex items-center gap-2">
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={`font-semibold text-lg text-blue-600 hover:underline leading-tight ${checked ? 'line-through text-gray-500' : ''}`}
                    >
                      {title}
                    </a>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-3">
                    <span className={checked ? 'line-through' : ''}>Price: {price}</span>
                    {source && <span className={checked ? 'line-through' : ''}>Source: {source}</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-2">
                <Edit 
                  className="w-4 h-4 text-blue-600 cursor-pointer hover:text-blue-800 transition-colors" 
                  onClick={() => setIsEditing(true)} 
                />
                <Trash2 
                  className="w-4 h-4 text-red-500 cursor-pointer hover:text-red-700 transition-colors" 
                  onClick={() => onDelete?.(id)} 
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