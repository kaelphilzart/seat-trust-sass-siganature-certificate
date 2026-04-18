'use client';

import React, { useState, useEffect } from 'react';
import { IUpdateFeature } from '@/types/feature';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


interface EditFeatureFormProps {
    formData?: IUpdateFeature;
    onChange?: (data: IUpdateFeature) => void;
}

export default function EditFeatureForm({ formData, onChange }: EditFeatureFormProps) {
    const [form, setForm] = useState<IUpdateFeature>({
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

    const handleChange = <K extends keyof IUpdateFeature>(field: K, value: IUpdateFeature[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* Feature Key */}
            <div>
                <label className="mb-1 block text-sm font-medium">Feature Key</label>
                <Input
                    type="text"
                    value={form.feature_key ?? ''}
                    onChange={(e) => handleChange('feature_key', e.target.value)}
                    placeholder="max_users"
                />
            </div>

            {/* Display Name */}
            <div>
                <label className="mb-1 block text-sm font-medium">Display Name</label>
                <Input
                    type="text"
                    value={form.display_name ?? ''}
                    onChange={(e) => handleChange('display_name', e.target.value)}
                    placeholder="Maximum Users"
                />
            </div>

            {/* Feature Type */}
            <div>
                <label className="mb-1 block text-sm font-medium">Feature Type</label>

                <Select
                    value={form.feature_type ?? ''}
                    onValueChange={(value) => handleChange('feature_type', value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select feature type" />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                </Select>

                <p className="mt-1 text-xs text-muted-foreground">
                    Tipe ini menentukan jenis value yang digunakan pada plan feature.
                    Contoh: <b>boolean</b> untuk ON/OFF fitur, <b>number</b> untuk limit seperti jumlah user.
                </p>
            </div>

            {/* Category */}
            <div>
                <label className="mb-1 block text-sm font-medium">Category</label>
                <Input
                    type="text"
                    value={form.category ?? ''}
                    onChange={(e) => handleChange('category', e.target.value)}
                    placeholder="limits / access / integration"
                />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Description</label>
                <Textarea
                    value={form.description ?? ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Explain what this feature controls..."
                />
            </div>

        </div>
    );
}
