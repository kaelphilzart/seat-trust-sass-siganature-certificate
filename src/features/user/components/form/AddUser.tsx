'use client';

import React, { useState, useEffect } from 'react';
import { ICreateUser } from '@/types/user';
import { Input } from '@/components/ui/input';

interface AddUserFormProps {
  formData?: Partial<ICreateUser>;
  onChange?: (data: Partial<ICreateUser>) => void;
}

const STORAGE_KEY = 'add_user_form';

export default function AddUserForm({ formData, onChange }: AddUserFormProps) {
  const [form, setForm] = useState<Partial<ICreateUser>>(formData ?? {});

  /* ===== SAVE DRAFT ===== */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    onChange?.(form);
  }, [form, onChange]);

  const handleChange = <K extends keyof ICreateUser>(
    field: K,
    value: ICreateUser[K] | undefined
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <Input
          type='email'
          value={form.email ?? ''}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="@gmail.com"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Password</label>
        <Input
          type='password'
          value={form.password ?? ''}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder="B 1234 ABC"
        />
      </div>
    </div>
  );
}
