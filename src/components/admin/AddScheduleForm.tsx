'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Field, Input, Select, Button } from '@/components/ui/form';
import { DAYS_OF_WEEK } from '@/lib/constants';

interface AddScheduleFormProps {
  onAdd: (day: number, time: string, location: string, duration?: number) => Promise<void>;
}

export function AddScheduleForm({ onAdd }: AddScheduleFormProps) {
  const [day, setDay] = useState(1);
  const [time, setTime] = useState('19:00');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('60');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    await onAdd(day, time, location, Number(duration));
    setLocation('');
    setIsAdding(false);
  };

  return (
    <Card>
      <h2 className="text-lg font-bold mb-4">Добавить тренировку</h2>
      <form onSubmit={handleAdd} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="День недели">
            <Select value={day} onChange={(e) => setDay(Number(e.target.value))}>
              {DAYS_OF_WEEK.map((d, i) => (
                <option key={i} value={i}>
                  {d}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Время">
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Локация (опционально)">
            <Input
              placeholder="Стадион, адрес или ссылка"
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

        <Button type="submit" disabled={isAdding}>
          {isAdding ? 'Добавление...' : 'Добавить в расписание'}
        </Button>
        <p className="text-xs text-zinc-500 text-center">
          Игры по этому расписанию будут автоматически создаваться ботом за 7 дней до начала.
        </p>
      </form>
    </Card>
  );
}
