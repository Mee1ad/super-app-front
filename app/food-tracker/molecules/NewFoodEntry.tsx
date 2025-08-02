'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileKeyboardFocusWithBackGesture } from '@/hooks/use-mobile-keyboard-focus';
import type { MealType, FoodEntryCreate } from '../atoms/types';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export type NewFoodEntryProps = {
  onCreate: (entry: FoodEntryCreate) => void;
  onClose?: () => void;
  initial?: Partial<FoodEntryCreate>;
};

export function NewFoodEntry({ onCreate, onClose, initial }: NewFoodEntryProps) {
  const [name, setName] = useState(initial?.name || '');
  const [price, setPrice] = useState(initial?.price?.toString() || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [date, setDate] = useState(initial?.date || new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(initial?.time || new Date().toTimeString().slice(0, 5));
  const [mealType, setMealType] = useState<MealType>(initial?.mealType || 'breakfast');

  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, []);

  const { ref: nameInputRef, keyboardHeight } = useMobileKeyboardFocusWithBackGesture(
    true,
    () => { if (window.innerWidth <= 768) handleClose(); },
    () => { if (window.innerWidth <= 768) handleClose(); }
  );

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      price: price ? Number(price) : undefined,
      description: description.trim() || undefined,
      date,
      time,
      mealType,
    });
    setName('');
    setPrice('');
    setDescription('');
    setDate(new Date().toISOString().slice(0, 10));
    setTime(new Date().toTimeString().slice(0, 5));
    setMealType('breakfast');
    setTimeout(() => { nameInputRef.current?.focus(); }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClose = () => {
    setName('');
    setPrice('');
    setDescription('');
    setDate(new Date().toISOString().slice(0, 10));
    setTime(new Date().toTimeString().slice(0, 5));
    setMealType('breakfast');
    onClose?.();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[9998]" onClick={handleClose} />
      <div className="fixed inset-0 z-[9999] flex items-end" onClick={handleClose}>
        <div
          className="w-full bg-white rounded-t-xl p-6 animate-in slide-in-from-bottom-2 duration-300 shadow-lg"
          onClick={e => e.stopPropagation()}
          style={{
            transform: keyboardHeight > 0 ? `translateY(-${keyboardHeight}px)` : 'none',
            transition: 'transform 0.3s ease-out',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Food name..."
                className="w-full text-base border-none outline-none bg-transparent"
                autoFocus
                ref={nameInputRef}
                required
              />
            </div>
            <div className="relative flex gap-2">
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="Price (optional)"
                className="w-1/2 text-base border-none outline-none bg-transparent"
                min="0"
                inputMode="decimal"
              />
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-1/2 text-base border-none outline-none bg-transparent"
              />
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-1/2 text-base border-none outline-none bg-transparent"
              />
            </div>
            <div className="relative flex gap-2 items-center">
              <select
                value={mealType}
                onChange={e => setMealType(e.target.value as MealType)}
                className="text-base border-none outline-none bg-transparent"
              >
                {MEAL_TYPES.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && e.shiftKey) return;
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Description (optional)"
                className="w-full text-base border-none outline-none bg-transparent resize-none"
                rows={2}
              />
            </div>
            <div className="absolute bottom-6 right-6 flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="p-3 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-colors shadow-lg"
                aria-label="Close form"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className={cn(
                  'p-3 rounded-full transition-colors shadow-lg',
                  name.trim()
                    ? 'bg-primary hover:bg-primary/90 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                )}
                aria-label="Submit form"
              >
                <Check className="w-6 h-6" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}