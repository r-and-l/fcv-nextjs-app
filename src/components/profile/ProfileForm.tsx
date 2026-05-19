'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Field, Input, Select, Button } from '@/components/ui/form';
import { POSITIONS } from '@/lib/constants';

interface ProfileFormProps {
  profile: {
    first_name?: string | null;
    last_name?: string | null;
    position?: string | null;
    phone?: string | null;
  } | null;
  onSave: (data: {
    first_name: string;
    last_name: string;
    position: string;
    phone: string;
  }) => Promise<void>;
}

export function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPosition(profile.position || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({ first_name: firstName, last_name: lastName, position, phone });
    setIsSaving(false);
    alert('Профиль сохранен!');
  };

  return (
    <Card>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Имя">
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </Field>
          <Field label="Фамилия">
            <Input
              value={lastName}
              placeholder="опционально"
              onChange={(e) => setLastName(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Позиция на поле">
          <Select value={position} onChange={(e) => setPosition(e.target.value)}>
            <option value="">Не выбрано</option>
            {POSITIONS.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Телефон">
          <Input
            type="tel"
            placeholder="+7 (___) ___-__-__"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>

        <Button type="submit" disabled={isSaving} className="mt-4">
          {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>
      </form>
    </Card>
  );
}
