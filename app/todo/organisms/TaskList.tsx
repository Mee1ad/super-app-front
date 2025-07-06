'use client';
import { useState } from "react";
import { TaskItem, TaskItemProps } from "../atoms/TaskItem";
import { NewTask } from "../molecules/NewTask";
import { Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      setEditTitle(title);
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
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over?.id);

      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      onTaskReorder?.(id, newTasks);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <Input 
                className="text-xl font-bold border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                value={editTitle} 
                onChange={e => setEditTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                autoFocus
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
                onClick={handleSaveTitle}
              >
                Save
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 hover:text-gray-700" 
                onClick={() => { setIsEditing(false); setEditTitle(title); }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <CardTitle className="text-xl font-bold">{title}</CardTitle>
              <div className="flex gap-2">
                <Edit 
                  className="w-4 h-4 text-blue-600 cursor-pointer hover:text-blue-800 transition-colors" 
                  onClick={() => setIsEditing(true)} 
                />
                <Trash2 
                  className="w-4 h-4 text-red-500 cursor-pointer hover:text-red-700 transition-colors" 
                  onClick={() => onDelete?.(id)} 
                />
              </div>
            </>
          )}
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
                onTaskUpdate?.({ id: Date.now().toString(), title, description, checked: false, variant });
                setShowAdd(false);
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
} 