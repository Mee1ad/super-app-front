"use client";
import { useRef, useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useReplicacheTodos } from "../shared/ReplicacheTodosContext";

function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
}

export default function ReplicacheTodoPage() {
  const hasMounted = useHasMounted();
  const { todos, rep } = useReplicacheTodos();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // CRUD operations
  const addTodo = async () => {
    if (!input.trim()) return;
    const id = `todo/${Date.now()}`;
    await rep.mutate.addTodo({ id, text: input });
    setInput("");
    inputRef.current?.focus();
  };
  const updateTodo = async (id: string, text: string) => {
    await rep.mutate.updateTodo({ id, text });
  };
  const deleteTodo = async (id: string) => {
    await rep.mutate.deleteTodo({ id });
  };

  if (!hasMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-2">Replicache Todo Test</h1>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            className="flex-1 border rounded h-12 px-3"
            placeholder="Add a todo..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTodo()}
            aria-label="Add a todo"
          />
          <button
            className="bg-primary text-white rounded h-12 w-12 flex items-center justify-center shadow hover:scale-105 transition"
            onClick={addTodo}
            aria-label="Add todo"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
        <ul className="flex flex-col gap-2">
          {todos.map(todo => (
            <li key={todo.id} className="flex items-center gap-2 group">
              <input
                className="flex-1 border rounded h-10 px-2 bg-transparent"
                value={todo.text}
                onChange={e => updateTodo(todo.id, e.target.value)}
                aria-label="Edit todo"
              />
              <button
                className="text-red-500 hover:text-red-700 p-2"
                onClick={() => deleteTodo(todo.id)}
                aria-label="Delete todo"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* FAB */}
      <button
        className="fixed bottom-6 right-6 bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:scale-110 transition"
        onClick={() => inputRef.current?.focus()}
        aria-label="Focus input"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}