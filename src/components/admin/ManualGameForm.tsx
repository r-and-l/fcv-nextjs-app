'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Field, Input, Select, Button } from '@/components/ui/form';

interface ManualGameFormProps {
  teamId: string;
  initData: string;
}

export function ManualGameForm({ teamId, initData }: ManualGameFormProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('60');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initData) return;
    setIsCreating(true);

    try {
      const res = await fetch('/api/games/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
        body: JSON.stringify({
          teamId,
          date,
          time,
          location,
          description,
          duration: Number(duration),
        }),
      });

      if (res.ok) {
        alert('Игра успешно создана!');
        setDate('');
        setLocation('');
        setDescription('');
        setDuration('60');
      } else {
        alert('Ошибка при создании игры');
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-bold mb-4">Создать разовую игру</h2>
      <form onSubmit={handleCreate} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Дата">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </Field>
          <Field label="Время">
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Локация">
            <Input
              placeholder="Где играем?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </Field>
          <Field label="Длительность">
            <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="60">60 минут (1 ч)</option>
              <option value="90">90 минут (1.5 ч)</option>
              <option value="120">120 минут (2 ч)</option>
              <option value="150">150 минут (2.5 ч)</option>
              <option value="180">180 минут (3 ч)</option>
            </Select>
          </Field>
        </div>

        <Field label="Описание">
          <Input
            placeholder="Товарищеский матч, турнир и т.д."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <Button type="submit" variant="success" disabled={isCreating}>
          {isCreating ? 'Создание...' : 'Создать игру сейчас'}
        </Button>
        <p className="text-xs text-zinc-500 text-center">
          Игра создастся сразу, в группу отправится сообщение.
        </p>
      </form>
    </Card>
  );
}
