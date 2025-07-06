"use client";
import { useState } from "react";
import { ListTodo, ShoppingCart } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from "@/components/ui/command";

export type AddNewListProps = {
  onCreate: (type: "task" | "shopping") => void;
};

export function AddNewList({ onCreate }: AddNewListProps) {
  const [open, setOpen] = useState(false);

  const options = [
    { value: "task", label: "Task List", icon: ListTodo },
    { value: "shopping", label: "Shopping List", icon: ShoppingCart },
  ];

  const handleSelect = (value: string) => {
    onCreate(value as "task" | "shopping");
    setOpen(false);
  };

  return (
    <div className="mb-6 flex justify-end">
      <div className="min-w-[150px]">
        <button
          type="button"
          className="flex items-center gap-2 border rounded px-3 py-2 bg-white hover:bg-gray-50 w-full justify-between"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-gray-500">
            Add a new list
          </span>
          <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        {open && (
          <div className="absolute z-10 mt-1 w-[150px] right-0">
            <Command shouldFilter={false} className="bg-white border rounded shadow-lg">
              <CommandInput placeholder="Search list type..." autoFocus />
              <CommandList>
                <CommandEmpty>No list type found.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => {
                    const Icon = option.icon;
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => handleSelect(option.value)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
      </div>
    </div>
  );
} 