'use client';

import { useState } from 'react';

interface AddLineupFormProps {
  onAdd: (name: string) => Promise<void>;
}

export function AddLineupForm({ onAdd }: AddLineupFormProps) {
  const [name, setName] = useState('');

  const handleAdd = async () => {
    if (name.trim()) {
      await onAdd(name.trim());
      setName('');
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Новая команда..."
        className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
      <button
        onClick={handleAdd}
        disabled={!name.trim()}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 rounded-xl transition-colors font-medium text-sm"
      >
        Добавить
      </button>
    </div>
  );
}
