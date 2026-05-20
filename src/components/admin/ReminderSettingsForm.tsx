'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Field, Input, Select, Button } from '@/components/ui/form';

interface TeamType {
  id: string;
  default_reminder_hours: number | null;
  default_reminder_text: string | null;
}

interface ReminderSettingsFormProps {
  team: TeamType;
  initData: string;
}

export function ReminderSettingsForm({ team, initData }: ReminderSettingsFormProps) {
  const [hours, setHours] = useState<string>(
    team.default_reminder_hours === null ? 'disabled' : String(team.default_reminder_hours)
  );
  const [text, setText] = useState<string>(
    team.default_reminder_text || 'Напоминание: скоро игра! Не забудьте записаться в приложении!'
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initData) return;
    setIsSaving(true);

    const targetHours = hours === 'disabled' ? null : Number(hours);

    try {
      const res = await fetch(`/api/teams/${team.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
        body: JSON.stringify({
          default_reminder_hours: targetHours,
          default_reminder_text: text,
        }),
      });

      if (res.ok) {
        alert('Настройки напоминаний сохранены!');
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
      <h2 className="text-lg font-bold mb-4">🔔 Напоминания об игре</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <Field label="Когда отправлять напоминание">
          <Select value={hours} onChange={(e) => setHours(e.target.value)}>
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
            disabled={hours === 'disabled'}
          />
        </Field>

        <Button type="submit" variant="success" disabled={isSaving}>
          {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
        <p className="text-xs text-zinc-500 text-center">
          Эти настройки будут применяться по умолчанию для всех новых создаваемых игр.
        </p>
      </form>
    </Card>
  );
}
