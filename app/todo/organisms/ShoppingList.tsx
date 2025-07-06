'use client';
import { useState } from "react";
import { ShoppingItem, ShoppingItemProps } from "../atoms/ShoppingItem";
import { NewShopping } from "../molecules/NewShopping";
import { Edit, Trash2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableShoppingItemProps {
  item: ShoppingItemProps;
  checked: boolean;
  onUpdate: (id: string, title: string, url: string, price: string, source?: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, checked: boolean) => void;
}

function SortableShoppingItem({ item, checked, onUpdate, onDelete, onToggle }: SortableShoppingItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="group"
    >
      <ShoppingItem
        {...item}
        checked={checked}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onToggle={onToggle}
        dragHandleProps={{ attributes, listeners }}
      />
    </div>
  );
}

export type ShoppingListProps = {
  id: string;
  title: string;
  items: ShoppingItemProps[];
  variant?: "default" | "outlined" | "filled";
  onUpdateTitle?: (id: string, title: string) => void;
  onDelete?: (id: string) => void;
  onItemUpdate?: (item: ShoppingItemProps) => void;
  onItemDelete?: (itemId: string) => void;
  onItemReorder?: (listId: string, newItems: ShoppingItemProps[]) => void;
};

export function ShoppingList({ id, title, items, variant = "default", onUpdateTitle, onDelete, onItemUpdate, onItemDelete, onItemReorder }: ShoppingListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [showAdd, setShowAdd] = useState(false);

  const handleSaveTitle = () => {
    setIsEditing(false);
    onUpdateTitle?.(id, editTitle);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(title); // Reset to original title
    }
  };

  const handleToggle = (itemId: string, checked: boolean) => {
    // Update the item in the main state with the new checked status
    const item = items.find(i => i.id === itemId);
    if (item) {
      onItemUpdate?.({ ...item, checked });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      onItemReorder?.(id, newItems);
    }
  };

  const base = "p-4 border rounded mb-6 transition-colors";
  const variants = {
    default: "bg-white border-gray-200",
    outlined: "bg-transparent",
    filled: "",
  };

  return (
    <section className={`${base} ${variants[variant]}`}> 
      <div className="flex justify-between items-center mb-4">
        {isEditing ? (
          <>
            <input 
              className="font-bold text-xl mr-2" 
              value={editTitle} 
              onChange={e => setEditTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              autoFocus
            />
            <button className="text-green-600 mr-2" onClick={handleSaveTitle}>Save</button>
            <button className="text-gray-500" onClick={() => { setIsEditing(false); setEditTitle(title); }}>Cancel</button>
          </>
        ) : (
          <>
            <span className="font-bold text-xl">{title}</span>
            <div className="flex gap-2">
              <Edit className="w-4 h-4 text-blue-600 cursor-pointer hover:text-blue-800" onClick={() => setIsEditing(true)} />
              <Trash2 className="w-4 h-4 text-red-500 cursor-pointer hover:text-red-700" onClick={() => onDelete?.(id)} />
            </div>
          </>
        )}
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {items.map(item => (
              <SortableShoppingItem
                key={item.id}
                item={item}
                checked={item.checked ?? false}
                onToggle={handleToggle}
                onUpdate={(iid, t, u, p, s) => onItemUpdate?.({ ...item, id: iid, title: t, url: u, price: p, source: s })}
                onDelete={(itemId) => onItemDelete?.(itemId)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="mt-4 text-center">
        {!showAdd ? (
          <button className="text-green-600" onClick={() => setShowAdd(true)}>+ Add Item</button>
        ) : (
          <NewShopping
            onCreate={(title, url, price, source) => {
              onItemUpdate?.({ id: Date.now().toString(), title, url, price, source, variant });
              setShowAdd(false);
            }}
          />
        )}
      </div>
    </section>
  );
} 