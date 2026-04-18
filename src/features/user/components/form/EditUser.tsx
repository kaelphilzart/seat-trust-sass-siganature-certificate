'use client';

import React, { useState, useEffect } from 'react';
import { IUpdateUser } from '@/types/user';
import { Input } from '@/components/ui/input';


interface EditUserFormProps {
    formData?: IUpdateUser;
    onChange?: (data: IUpdateUser) => void;
}

export default function EditUserForm({ formData, onChange }: EditUserFormProps) {
    const [form, setForm] = useState<IUpdateUser>({
        ...formData,
    });

    /* ===== SYNC DATA (EDIT MODE) ===== */
    useEffect(() => {
        if (formData) {
            setForm((prev) => ({
                ...prev,
                ...formData,
            }));
        }
    }, [formData]);

    /* ===== EMIT CHANGE ===== */
    useEffect(() => {
        if (!formData?.id) return;
        onChange?.({ ...form, id: formData.id });
    }, [form, onChange, formData?.id]);

    const handleChange = <K extends keyof IUpdateUser>(field: K, value: IUpdateUser[K]) => {
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
                <label className="mb-1 block text-sm font-medium">New Password</label>
                <Input
                    type="password"
                    value={form.password ?? ''}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="password"
                />
            </div>
        </div>
    );
}
