'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/custom/table/data-table';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { useAlert } from '@/components/alert/alert-dialog-global';
import { InputSearch } from '@/components/ui/input-search';
import { formatIDR } from '@/utils/format';
import ErrorFallback from '@/components/fallback/ErrorFallback';
import Loader from '@/components/fallback/Loader';


import { useGetAllPlan, deletePlan } from '@/hooks/plans';
import { IPlan } from '@/types/plan';
import { paths } from '@/routes/paths';
import { encodeId } from '@/utils/encode';


export default function AdminSection() {
    const router = useRouter();
    const alert = useAlert();
    const { plans, plansLoading, plansError } = useGetAllPlan();
    const [search, setSearch] = useState('');
    //=====================HANDLE=========================//
    const handleDelete = async (id: string, name: string) => {
        await alert.confirmAsync(`Yakin ingin menghapus "${name}"?`, async () => {
            return await deletePlan(id);
        });
    };

    //=====================================================================

    const tableData = useMemo(() => {
        let data = plans;
        const q = search.trim().toLowerCase();
        if (q) {
            data = data.filter((f) => `${f.name}`.toLowerCase().includes(q));
        }
        return data;
    }, [plans, search]);

    const columns = useMemo<ColumnDef<IPlan>[]>(() => [
        { header: 'No', cell: ({ row }) => row.index + 1 },
        { header: 'Plan Name', accessorKey: 'name' },
        { header: 'Price', accessorKey: 'price', cell: ({ getValue }) => formatIDR(getValue<number>()) },
        {
            header: 'Aksi', id: 'actions', cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row.original.id?? '', row.original.name?? '');
                        }}>
                            <IconTrash className='h-4 w-4' />
                        </Button>
                    </div>
                );
            }
        }
    ], []);
    if (plansLoading) return <div className="p-4 text-center"><Loader /></div>;
    if (plansError) return <div className="p-4 text-center text-red-500"><ErrorFallback /></div>;

    return (
        <div>
            <h2 className="mb-4 text-lg font-semibold">Daftar Plans</h2>
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="w-full max-w-[320px]">
                    <InputSearch placeholder="plan name..." value={search}
                        onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                    <Link href={paths.subscription.plan.create}>
                        <Button size="sm" variant="secondary">
                            <IconPlus className="h-4 w-4" /> Tambah Plans
                        </Button>
                    </Link>
                </div>
            </div>
            <DataTable columns={columns} data={tableData} filterField="feature_key" isRemovePagination={false}
                rowProps={row => ({
                    onClick: () => router.push(`plan/${encodeId(row.original.id)}`),
                    className: 'cursor-pointer transition-colors hover:bg-black/[0.02] active:bg-black/[0.03]',
                })}
            />
        </div>
    );
}