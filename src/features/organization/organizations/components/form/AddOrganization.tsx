'use client';

import React, { useState, useEffect } from 'react';
import { ICreateOrganization } from '@/types/organization';
import { ICreateSubscription } from '@/types/subscription';
import { useGetAllPlan } from '@/hooks/plans';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AddOrganizationFormProps {
    formData?: Partial<ICreateOrganization>;
    subscriptionData?: Partial<ICreateSubscription>;
    onChange?: (
        org: Partial<ICreateOrganization>,
        sub: Partial<ICreateSubscription>
    ) => void;
}

const STORAGE_KEY = 'add_organization_form';

export default function AddOrganizationForm({ formData, subscriptionData, onChange }: AddOrganizationFormProps) {
    const [form, setForm] = useState<Partial<ICreateOrganization>>(formData ?? {});
    const [formSubscription, setFormSubscription] = useState<Partial<ICreateSubscription>>(subscriptionData ?? {});
    const { plans } = useGetAllPlan();

    /* ===== SAVE DRAFT ===== */
    useEffect(() => {
        onChange?.(form, formSubscription);
    }, [form, formSubscription]);

    const handleChange = <K extends keyof ICreateOrganization>(
        field: K,
        value: ICreateOrganization[K] | undefined
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleChangeSubscription = <K extends keyof ICreateSubscription>(
        field: K,
        value: ICreateSubscription[K] | undefined
    ) => {
        setFormSubscription((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Organization Name */}
            <div>
                <label className="mb-1 block text-sm font-medium">Organization Name</label>
                <Input
                    type="text"
                    value={form.name ?? ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Organization Name"
                />
            </div>

            {/* Display Name */}
            <div>
                <label className="mb-1 block text-sm font-medium">Slug</label>
                <Input
                    type="text"
                    value={form.slug ?? ''}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="Slug"
                />
            </div>

            {/* Plan */}
            <div>
                <label className="mb-1 block text-sm font-medium">Plan</label>

                <Select
                    value={formSubscription.plan_id ?? ""}
                    onValueChange={(value) => handleChangeSubscription("plan_id", value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Plan" />
                    </SelectTrigger>

                    <SelectContent>
                        {plans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id ?? ''}>
                                {plan.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* start date */}
            <div>
                <label className="mb-1 block text-sm font-medium">Start Date</label>
                <Input
                    type="date"
                    value={formSubscription.start_date ? new Date(formSubscription.start_date).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleChangeSubscription('start_date', e.target.value ? new Date(e.target.value) : undefined)}
                    placeholder="Start Date"
                />
            </div>

            {/* end date */}
            <div>
                <label className="mb-1 block text-sm font-medium">End Date</label>
                <Input
                    type="date"
                    value={formSubscription.end_date ? new Date(formSubscription.end_date).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleChangeSubscription('end_date', e.target.value ? new Date(e.target.value) : undefined)}
                    placeholder="End Date"
                />
            </div>

        </div>
    );
}