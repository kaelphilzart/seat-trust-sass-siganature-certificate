'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ICreatePlan } from '@/types/plan';
import { formatIDR, parseIDR } from '@/utils/format';
import { Checkbox } from '@/components/ui/checkbox';
import { paths } from '@/routes/paths';
import { useGetAllFeatures } from '@/hooks/features';
import { createPlan } from '@/hooks/plans';
import { useAlert } from '@/components/alert/alert-dialog-global';


export default function CreatePage() {
    const router = useRouter();
    const alert = useAlert();
    const [plan, setPlan] = useState<ICreatePlan>({ name: '', price: 0 });
    const [featureValues, setFeatureValues] = useState<Record<string, any>>({});

    const { features, featuresLoading, featuresError } = useGetAllFeatures();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPlan((prev) => ({
            ...prev,
            [name]: name === 'price' ? Number(value) : value,
        }));
    };

    const handleFeatureChange = (id: string, value: any) => {
        setFeatureValues((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await alert.confirmAsync('Yakin ingin menambahkan plan ini?', async () => {
                const planCreated = await createPlan(plan, featureValues);

                if (planCreated) {
                    alert.success('Plan berhasil dibuat!');
                    router.push(`${paths.subscription.plan.root}`);
                    return { success: true };
                } else {
                    alert.error('Gagal membuat plan');
                    return { success: false, message: 'Gagal membuat plan' };
                }
            });
        } catch (err: any) {
            alert.error(err?.message || 'Terjadi kesalahan saat submit plan');
        }
    };

    if (featuresLoading) return <div className="p-4 text-center">Loading...</div>;
    if (featuresError) return <div className="p-4 text-center text-red-500">Error loading features</div>;

    return (
        <div className="p-4 mx-auto">
            <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="mb-4"
            >
                ← Kembali
            </Button>
            <Card>
                <h1 className="text-2xl font-semibold">Buat Plan Baru</h1>
                {/* Form */}
                <form onSubmit={handleSubmit} className="">
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {/* Name */}
                        <div className="flex flex-col">
                            <Label htmlFor="name">Nama Plan</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Masukkan nama plan"
                                value={plan.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Price */}
                        <div className="flex flex-col">
                            <Label htmlFor="price">Harga</Label>
                            <Input
                                inputMode="numeric"
                                value={formatIDR(plan.price)}
                                onChange={(e) => setPlan((prev) => ({ ...prev, price: parseIDR(e.target.value) }))}
                                placeholder="Rp 0"
                            />
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-center mt-4 mb-4">Fitur - Fitur</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {features?.map((f: any) => (
                            <div key={f.id} className="flex flex-col">
                                {f.feature_type === 'boolean' ? (
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Checkbox
                                            id={`feature-${f.id}`}
                                            onCheckedChange={(val: boolean) => handleFeatureChange(f.id, val)}
                                        />
                                        <Label htmlFor={`feature-${f.id}`}>{f.display_name}</Label>
                                    </div>
                                ) : (
                                    <>
                                        <Label htmlFor={`feature-${f.id}`}>{f.display_name}</Label>
                                        <Input
                                            id={`feature-${f.id}`}
                                            type={f.feature_type === 'number' ? 'number' : 'text'}
                                            placeholder={f.feature_type === 'number' ? 'Masukkan limit' : ''}
                                            value={featureValues[f.id] || ''}
                                            onChange={(e) =>
                                                handleFeatureChange(
                                                    f.id,
                                                    f.feature_type === 'number'
                                                        ? Number(e.target.value)
                                                        : e.target.value
                                                )
                                            }
                                        />
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Submit */}
                    <div className="pt-4 md:col-span-2 text-end">
                        <Button type="submit">
                            <IconPlus className="h-4 w-4 mr-2" />
                            Buat Plan</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}