'use client';

import { useState } from "react";

export type NewShoppingProps = {
  onCreate: (title: string, url: string, price: string, source?: string) => void;
};

export function NewShopping({ onCreate }: NewShoppingProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [source, setSource] = useState("");

  return (
    <form
      className="flex flex-col gap-2 mb-4"
      onSubmit={e => {
        e.preventDefault();
        if (title && url && price) {
          onCreate(title, url, price, source);
          setTitle("");
          setUrl("");
          setPrice("");
          setSource("");
        }
      }}
    >
      <input
        className="border rounded px-3 py-2"
        placeholder="Item title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <input
        className="border rounded px-3 py-2"
        placeholder="URL"
        value={url}
        onChange={e => setUrl(e.target.value)}
        required
      />
      <input
        className="border rounded px-3 py-2"
        placeholder="Price"
        value={price}
        onChange={e => setPrice(e.target.value)}
        required
      />
      <input
        className="border rounded px-3 py-2"
        placeholder="Source (optional)"
        value={source}
        onChange={e => setSource(e.target.value)}
      />
      <button className="bg-green-600 text-white px-4 py-2 rounded mt-2" type="submit">
        Add Item
      </button>
    </form>
  );
} 