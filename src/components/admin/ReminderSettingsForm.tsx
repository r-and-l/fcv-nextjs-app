'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Field, Input, Select, Button } from '@/components/ui/form';
import { Team } from '@/types';

interface ReminderSettingsFormProps {
  team: Team;
  initData: string;
}

export function ReminderSettingsForm({ team, initData }: ReminderSettingsFormProps) {
  const [announceHours, setAnnounceHours] = useState<string>(
    String(team.game_announce_hours ?? 72)
  );
  const [reminderHours, setReminderHours] = useState<string>(
    team.default_reminder_hours === undefined || team.default_reminder_hours === null
      ? 'disabled'
      : String(team.default_reminder_hours)
  );
  const [text, setText] = useState<string>(
    team.default_reminder_text || 'Напоминание: скоро игра! Не забудьте записаться в приложении!'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initData) return;
    setIsSaving(true);

    const targetReminderHours = reminderHours === 'disabled' ? null : Number(reminderHours);

    try {
      const res = await fetch(`/api/teams/${team.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
        body: JSON.stringify({
          default_reminder_hours: targetReminderHours,
          default_reminder_text: text,
          game_announce_hours: Number(announceHours),
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert('Ошибка при сохранении настроек');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка сети');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-bold mb-4">⚙️ Настройки команды</h2>
      <form onSubmit={handleSave} className="space-y-4">

        {/* Анонс игры в чате */}
        <Field label="📣 Когда отправлять анонс игры в чат">
          <Select value={announceHours} onChange={(e) => setAnnounceHours(e.target.value)}>
            <option value="24">За 24 часа (1 сутки)</option>
            <option value="48">За 48 часов (2 суток)</option>
            <option value="72">За 72 часа (3 суток) — по умолчанию</option>
            <option value="96">За 96 часов (4 суток)</option>
            <option value="120">За 120 часов (5 суток)</option>
            <option value="168">За 168 часов (7 суток)</option>
          </Select>
          <p className="text-xs text-zinc-500 mt-1">
            Игра создаётся в приложении сразу. Сообщение в группу — за указанное время до игры.
          </p>
        </Field>

        {/* Напоминание */}
        <Field label="🔔 Когда отправлять напоминание">
          <Select value={reminderHours} onChange={(e) => setReminderHours(e.target.value)}>
            <option value="disabled">Выключено</option>
            <option value="1">За 1 час до игры</option>
            <option value="2">За 2 часа до игры</option>
            <option value="3">За 3 часа до игры</option>
            <option value="4">За 4 часа до игры</option>
            <option value="6">За 6 часов до игры</option>
            <option value="12">За 12 часов до игры</option>
            <option value="24">За 24 часа до игры (1 сутки)</option>
            <option value="48">За 48 часов до игры (2 суток)</option>
          </Select>
        </Field>

        <Field label="Текст напоминания">
          <Input
            placeholder="Введите текст напоминания"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            disabled={reminderHours === 'disabled'}
          />
        </Field>

        <Button type="submit" variant="success" disabled={isSaving}>
          {isSaving ? 'Сохранение...' : saved ? '✅ Сохранено!' : 'Сохранить настройки'}
        </Button>
        <p className="text-xs text-zinc-500 text-center">
          Применяется ко всем новым играм по расписанию.
        </p>
      </form>
    </Card>
  );
}
