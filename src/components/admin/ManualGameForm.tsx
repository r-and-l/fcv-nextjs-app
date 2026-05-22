'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Field, Input, Select, Button } from '@/components/ui/form';
import { MapModal } from '@/components/common/MapModal';
import { useRecentLocations } from '@/hooks/useRecentLocations';

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
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { locations: recentLocations, mutateLocations } = useRecentLocations(teamId);

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
          latitude,
          longitude,
        }),
      });

      if (res.ok) {
        alert('Игра успешно создана!');
        setDate('');
        setLocation('');
        setDescription('');
        setDuration('60');
        setLatitude(undefined);
        setLongitude(undefined);
        if (mutateLocations) {
          mutateLocations();
        }
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
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Где играем?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setIsMapOpen(true)}
                className="px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm transition-all active:scale-[0.98] border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center h-10 w-12 cursor-pointer"
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

            {recentLocations && recentLocations.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Недавние места:
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto py-0.5">
                  {recentLocations.map((loc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setLocation(loc.location);
                        if (loc.latitude !== null && loc.longitude !== null) {
                          setLatitude(loc.latitude);
                          setLongitude(loc.longitude);
                        } else {
                          setLatitude(undefined);
                          setLongitude(undefined);
                        }
                      }}
                      className="px-2 py-0.5 bg-zinc-150 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-750 dark:text-zinc-300 rounded-lg text-[11px] transition-all active:scale-95 border border-zinc-200/50 dark:border-zinc-800 text-left truncate max-w-[150px] cursor-pointer flex items-center gap-1"
                      title={loc.location}
                    >
                      <span>📍</span>
                      <span className="truncate">{loc.location}</span>
                    </button>
                  ))}
                </div>
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
      <MapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        mode="select"
        initialLat={latitude}
        initialLng={longitude}
        onSave={(lat, lng, addr) => {
          setLatitude(lat);
          setLongitude(lng);
          if (addr) {
            setLocation(addr);
          }
        }}
        title="Выбрать место игры"
      />
    </Card>
  );
}
