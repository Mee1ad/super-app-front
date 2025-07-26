'use client';
import { useState } from "react";
import { TaskItem, TaskItemProps } from "../atoms/TaskItem";
import { NewTask } from "../molecules/NewTask";
import { Edit, Trash2, Plus, MoreHorizontal, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { motion } from "framer-motion";
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

interface SortableTaskItemProps {
  task: TaskItemProps;
  onUpdate: (id: string, title: string, description?: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, checked: boolean) => void;
}

function SortableTaskItem({ task, onUpdate, onDelete, onToggle }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

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
      <TaskItem
        {...task}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onToggle={onToggle}
        dragHandleProps={{ attributes, listeners }}
      />
    </div>
  );
}

export type TaskListProps = {
  id: string;
  title: string;
  tasks: TaskItemProps[];
  variant?: "default" | "outlined" | "filled";
  onUpdateTitle?: (id: string, title: string) => void;
  onDelete?: (id: string) => void;
  onTaskUpdate?: (task: TaskItemProps) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskToggle?: (taskId: string, checked: boolean) => void;
  onTaskReorder?: (listId: string, newTasks: TaskItemProps[]) => void;
};

export function TaskList({ id, title, tasks, variant = "default", onUpdateTitle, onDelete, onTaskUpdate, onTaskDelete, onTaskToggle, onTaskReorder }: TaskListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over?.id);

      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      onTaskReorder?.(id, newTasks);
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
            <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {tasks.map(task => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    onUpdate={(tid, t, d) => onTaskUpdate?.({ ...task, id: tid, title: t, description: d })}
                    onDelete={(taskId) => onTaskDelete?.(taskId)}
                    onToggle={(taskId, checked) => onTaskToggle?.(taskId, checked)}
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
                Add Task
              </Button>
            ) : (
              <NewTask
                onCreate={(title, description) => {
                  onTaskUpdate?.({ id: '', title, description, checked: false, variant });
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