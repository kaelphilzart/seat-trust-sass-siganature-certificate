'use client';

import React, { useState, useEffect } from 'react';
import { IUpdateOrganizationUser } from '@/types/organization-user';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface EditOrganizationUserFormProps {
    data?: Partial<IUpdateOrganizationUser>;
    onChange?: (data: Partial<IUpdateOrganizationUser>) => void;
}

export default function EditOrganizationUserForm({
    data,
    onChange
}: EditOrganizationUserFormProps) {

    const [form, setForm] = useState<Partial<IUpdateOrganizationUser>>(data ?? {});

    /* ===== SYNC KE PARENT ===== */

    useEffect(() => {
        onChange?.(form);
    }, [form]);

    const handleChange = <K extends keyof IUpdateOrganizationUser>(
        field: K,
        value: IUpdateOrganizationUser[K] | undefined
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* Email */}
            <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <Input
                    type="email"
                    value={form.email ?? ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="Email"
                />
            </div>

            {/* Password */}
            <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <Input
                    type="password"
                    value={form.password ?? ''}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Kosongkan jika tidak ingin mengubah"
                />
            </div>

            {/* Role */}
            <div>
                <label className="mb-1 block text-sm font-medium">Role</label>
                <Select
                    value={form.role ?? ""}
                    onValueChange={(value) => handleChange("role", value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Role" />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="REPRESENTATIVE">Representative</SelectItem>
                    </SelectContent>
                </Select>
            </div>

        </div>
    );
}