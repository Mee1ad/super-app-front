'use client';
import { useState } from "react";
import { ShoppingItem, ShoppingItemProps } from "../atoms/ShoppingItem";
import { NewShopping } from "../molecules/NewShopping";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { EditList } from "../molecules/EditList";
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
  onToggle: (id: string, checked: boolean) => void;
  onUpdate: (id: string, title: string, url?: string, price?: string, source?: string) => void;
  onDelete: (id: string) => void;
}

function SortableShoppingItem({ item, checked, onToggle, onUpdate, onDelete }: SortableShoppingItemProps) {
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
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
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

export function ShoppingList({ id, title, items, variant = "default", onUpdateTitle, onItemUpdate, onItemDelete, onItemReorder }: ShoppingListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const handleSaveTitle = (newTitle: string) => {
    onUpdateTitle?.(id, newTitle);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };



  const handleToggle = (itemId: string, checked: boolean) => {
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

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
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
                    onUpdate={(iid, t, u, p, s) => onItemUpdate?.({ ...item, id: iid, title: t, url: u || '', price: p || '', source: s || '' })}
                    onDelete={(itemId) => onItemDelete?.(itemId)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <div className="mt-6 text-center">
            {!showAdd ? (
              <Button 
                variant="ghost" 
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
                onClick={() => setShowAdd(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            ) : (
              <NewShopping
                onCreate={(title, url, price, source) => {
                  onItemUpdate?.({ id: '', title, url, price, source, variant });
                }}
                onClose={() => setShowAdd(false)}
              />
            )}
          </div>
        </CardContent>
      </Card>

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