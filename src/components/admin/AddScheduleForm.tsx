'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Field, Input, Select, Button } from '@/components/ui/form';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { MapModal } from '@/components/common/MapModal';

interface AddScheduleFormProps {
  onAdd: (day: number, time: string, location: string, duration?: number, latitude?: number, longitude?: number) => Promise<void>;
}

export function AddScheduleForm({ onAdd }: AddScheduleFormProps) {
  const [day, setDay] = useState(1);
  const [time, setTime] = useState('19:00');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('60');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    await onAdd(day, time, location, Number(duration), latitude, longitude);
    setLocation('');
    setLatitude(undefined);
    setLongitude(undefined);
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
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Стадион, адрес или ссылка"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setIsMapOpen(true)}
                className="px-3 bg-zinc-105 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm transition-all active:scale-[0.98] border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center h-10 w-12 cursor-pointer"
                title="Указать на карте"
              >
                🗺️
              </button>
            </div>
            {latitude !== undefined && longitude !== undefined && (
              <div className="mt-1 flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 px-2 py-1 rounded-lg text-[10px] font-medium">
                <span>📍 Координаты установлены</span>
                <button
                  type="button"
                  onClick={() => {
                    setLatitude(undefined);
                    setLongitude(undefined);
                  }}
                  className="text-emerald-600 dark:text-emerald-450 hover:text-red-500 font-bold ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
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
      <MapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        mode="select"
        initialLat={latitude}
        initialLng={longitude}
        onSave={(lat, lng) => {
          setLatitude(lat);
          setLongitude(lng);
        }}
        title="Выбрать место тренировки"
      />
    </Card>
  );
}
