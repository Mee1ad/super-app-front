'use client';
import { Edit, Trash2, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { TaskItemProps } from "../atoms/TaskItem";
import { ShoppingItemProps } from "../atoms/ShoppingItem";

interface MobileItemRowProps {
  item: TaskItemProps | ShoppingItemProps;
  type: "task" | "shopping";
  onUpdate: (item: TaskItemProps | ShoppingItemProps) => void;
  onDelete: (id: string) => void;
  onToggle?: (id: string) => void;
  isLast?: boolean;
}

export function MobileItemRow({ 
  item, 
  type, 
  onUpdate, 
  onDelete, 
  onToggle,
  isLast = false 
}: MobileItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editDescription, setEditDescription] = useState(
    type === "task" ? (item as TaskItemProps).description || "" : ""
  );
  const [editUrl, setEditUrl] = useState(
    type === "shopping" ? (item as ShoppingItemProps).url || "" : ""
  );
  const [editPrice, setEditPrice] = useState(
    type === "shopping" ? (item as ShoppingItemProps).price || "" : ""
  );

  const handleSave = () => {
    setIsEditing(false);
    if (type === "task") {
      onUpdate({
        ...item,
        title: editTitle,
        description: editDescription,
      } as TaskItemProps);
    } else {
      onUpdate({
        ...item,
        title: editTitle,
        url: editUrl,
        price: editPrice,
      } as ShoppingItemProps);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(item.title);
      if (type === "task") {
        setEditDescription((item as TaskItemProps).description || "");
      } else {
        setEditUrl((item as ShoppingItemProps).url || "");
        setEditPrice((item as ShoppingItemProps).price || "");
      }
    }
  };

  const handleToggle = () => {
    if (onToggle) {
      onToggle(item.id);
    } else {
      // For shopping items without onToggle, update directly
      if (type === "shopping") {
        const shoppingItem = item as ShoppingItemProps;
        onUpdate({
          ...shoppingItem,
          checked: !shoppingItem.checked,
        });
      }
    }
  };

  const getItemIcon = () => {
    return type === "task" ? "📝" : "🛍️";
  };

  const isChecked = type === "task" 
    ? (item as TaskItemProps).checked 
    : (item as ShoppingItemProps).checked;

  return (
    <>
      <div className="flex items-center justify-between py-4 px-0 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={handleToggle}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              isChecked 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            {isChecked && <Check className="w-3 h-3" />}
          </button>
          
          <span className="text-lg">{getItemIcon()}</span>
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <Input 
                  className="text-base font-medium border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent" 
                  value={editTitle} 
                  onChange={e => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyPress}
                  autoFocus
                />
                {type === "task" && (
                  <Input 
                    className="text-sm text-gray-500 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent" 
                    placeholder="Description (optional)"
                    value={editDescription} 
                    onChange={e => setEditDescription(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                )}
                {type === "shopping" && (
                  <div className="space-y-1">
                    <Input 
                      className="text-sm text-gray-500 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent" 
                      placeholder="URL (optional)"
                      value={editUrl} 
                      onChange={e => setEditUrl(e.target.value)}
                      onKeyDown={handleKeyPress}
                    />
                    <Input 
                      className="text-sm text-gray-500 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent" 
                      placeholder="Price (optional)"
                      value={editPrice} 
                      onChange={e => setEditPrice(e.target.value)}
                      onKeyDown={handleKeyPress}
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-6 px-2" 
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-500 hover:text-gray-700 h-6 px-2" 
                    onClick={() => {
                      setIsEditing(false);
                      setEditTitle(item.title);
                      if (type === "task") {
                        setEditDescription((item as TaskItemProps).description || "");
                      } else {
                        setEditUrl((item as ShoppingItemProps).url || "");
                        setEditPrice((item as ShoppingItemProps).price || "");
                      }
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <h3 className={`text-base font-medium truncate ${isChecked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {item.title}
                </h3>
                {type === "task" && (item as TaskItemProps).description && (
                  <p className={`text-sm truncate ${isChecked ? 'line-through text-gray-400' : 'text-gray-500'}`}>
                    {(item as TaskItemProps).description}
                  </p>
                )}
                {type === "shopping" && (
                  <div className="flex flex-col gap-1">
                    {(item as ShoppingItemProps).url && (
                      <div className="flex items-center gap-1">
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                        <a 
                          href={(item as ShoppingItemProps).url.startsWith('http') ? (item as ShoppingItemProps).url : `https://${(item as ShoppingItemProps).url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-sm truncate ${isChecked ? 'line-through text-gray-400' : 'text-blue-600 hover:underline'}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {(item as ShoppingItemProps).url}
                        </a>
                      </div>
                    )}
                    {(item as ShoppingItemProps).price && (
                      <p className={`text-sm ${isChecked ? 'line-through text-gray-400' : 'text-gray-500'}`}>
                        ${(item as ShoppingItemProps).price}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {!isEditing && (
          <div className="flex items-center gap-2">
            <Edit 
              data-testid="edit-item-icon"
              className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" 
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }} 
            />
            <Trash2 
              data-testid="delete-item-icon"
              className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-600 transition-colors" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }} 
            />
          </div>
        )}
      </div>
      {!isLast && <div className="border-b border-gray-200" />}
    </>
  );
} 