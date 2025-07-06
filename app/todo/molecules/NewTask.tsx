'use client';

import { useState } from "react";

export type NewTaskProps = {
  onCreate: (title: string, description?: string) => void;
};

export function NewTask({ onCreate }: NewTaskProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title.trim(), description.trim() || undefined);
      setTitle("");
      setDescription("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (title.trim()) {
        onCreate(title.trim(), description.trim() || undefined);
        setTitle("");
        setDescription("");
      }
    }
  };

  return (
    <form
      className="flex flex-col gap-2 mb-4"
      onSubmit={handleSubmit}
    >
      <input
        className="border rounded px-3 py-2"
        placeholder="Task title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        required
      />
      <textarea
        className="border rounded px-3 py-2"
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && e.shiftKey) {
            // Allow Shift+Enter for new line in description
            return;
          }
          if (e.key === 'Enter') {
            e.preventDefault();
            if (title.trim()) {
              onCreate(title.trim(), description.trim() || undefined);
              setTitle("");
              setDescription("");
            }
          }
        }}
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded mt-2" type="submit">
        Add Task
      </button>
    </form>
  );
} 