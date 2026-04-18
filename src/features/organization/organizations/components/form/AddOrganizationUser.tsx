'use client';

import React, { useState, useEffect } from 'react';
import { ICreateOrganizationUser } from '@/types/organization-user';
import { ICreateUser } from '@/types/user';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AddOrganizationUserFormProps {
    organizationUserData?: Partial<ICreateOrganizationUser>;
    userData?: Partial<ICreateUser>;
    onChange?: (
        ou: Partial<ICreateOrganizationUser>,
        u: Partial<ICreateUser>
    ) => void;
}

const STORAGE_KEY = 'add_organization_form';

export default function AddOrganizationUserForm({ organizationUserData, userData, onChange }: AddOrganizationUserFormProps) {
    const [form, setForm] = useState<Partial<ICreateOrganizationUser>>(organizationUserData ?? {});
    const [formUser, setFormUser] = useState<Partial<ICreateUser>>(userData ?? {});
    /* ===== SAVE DRAFT ===== */
    useEffect(() => {
        onChange?.(form, formUser);
    }, [form, formUser]);

    const handleChange = <K extends keyof ICreateOrganizationUser>(
        field: K,
        value: ICreateOrganizationUser[K] | undefined
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleChangeUser = <K extends keyof ICreateUser>(
        field: K,
        value: ICreateUser[K] | undefined
    ) => {
        setFormUser((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Organization Name */}
            <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <Input
                    type="email"
                    value={formUser.email ?? ''}
                    onChange={(e) => handleChangeUser('email', e.target.value)}
                    placeholder="Email"
                />
            </div>

            {/* Password */}
            <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <Input
                    type="password"
                    value={formUser.password ?? ''}
                    onChange={(e) => handleChangeUser('password', e.target.value)}
                    placeholder="Password"
                />
            </div>

            {/* role */}
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