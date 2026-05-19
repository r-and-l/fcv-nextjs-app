'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Field, Input, Select, Button } from '@/components/ui/form';
import { DAYS_OF_WEEK } from '@/lib/constants';

interface AddScheduleFormProps {
  onAdd: (day: number, time: string, location: string) => Promise<void>;
}

export function AddScheduleForm({ onAdd }: AddScheduleFormProps) {
  const [day, setDay] = useState(1);
  const [time, setTime] = useState('19:00');
  const [location, setLocation] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    await onAdd(day, time, location);
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

        <Field label="Локация (опционально)">
          <Input
            placeholder="Стадион, адрес или ссылка"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Field>

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
