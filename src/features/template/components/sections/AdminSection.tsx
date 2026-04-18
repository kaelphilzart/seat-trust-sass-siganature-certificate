'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { IconPlus } from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { InputSearch } from '@/components/ui/input-search';
import ErrorFallback from '@/components/fallback/ErrorFallback';
import Loader from '@/components/fallback/Loader';
import { Button } from '@/components/ui/button';
import { useGetAllTemplate } from '@/hooks/template';
import Link from 'next/link';
import { paths } from '@/routes/paths';
import { encodeId } from '@/utils/encode';

export default function AdminSection() {
    const router = useRouter();
    const { data: session } = useSession();

    const organizationId = session?.user?.organization_id;

    const { templates, templatesError, templatesLoading } =
        useGetAllTemplate(organizationId);

    const [search, setSearch] = useState('');

    /* ================= FILTER ================= */
    const filteredTemplates = useMemo(() => {
        let data = templates || [];

        const q = search.trim().toLowerCase();
        if (q) {
            data = data.filter((t) =>
                t.name?.toLowerCase().includes(q)
            );
        }

        return data;
    }, [templates, search]);

    /* ================= LOADING ================= */
    if (templatesLoading)
        return (
            <div className="p-4 text-center">
                <Loader />
            </div>
        );

    if (templatesError)
        return (
            <div className="p-4 text-center text-red-500">
                <ErrorFallback />
            </div>
        );

    /* ================= UI ================= */
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center">Daftar Template</h2>

            {/* SEARCH */}
            <div className="flex items-center justify-between gap-3">
                {/* LEFT - SEARCH */}
                <div className="w-full max-w-[320px]">
                    <InputSearch
                        placeholder="Cari template..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* RIGHT - BUTTON */}
                <Link href={paths.template.create}>
                    <Button size="sm" variant="secondary">
                        <IconPlus className="h-4 w-4 mr-1" />
                        Tambah Template
                    </Button>
                </Link>
            </div>
            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((item) => (
                    <Link
                        key={item.id}
                        href={`${paths.template.base}/${encodeId(item.id)}`}
                        className="block"
                    >
                        <Card className="cursor-pointer overflow-hidden transition hover:shadow-lg hover:-translate-y-1 bg-card text-card-foreground border border-border">

                            {/* IMAGE PREVIEW */}
                            <div className="relative w-full h-[180px] bg-muted">
                                {item.file_path ? (
                                    <Image
                                        src={item.file_path}
                                        alt={item.name ?? ''}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                                        No Preview
                                    </div>
                                )}
                            </div>

                            {/* CONTENT */}
                            <div className="p-3 space-y-1">
                                <h3 className="font-medium text-sm truncate text-foreground">
                                    {item.name}
                                </h3>

                                <p className="text-xs text-muted-foreground">
                                    Klik untuk lihat detail
                                </p>
                            </div>

                        </Card>
                    </Link>
                ))}

                {/* EMPTY STATE */}
                {!filteredTemplates.length && (
                    <div className="col-span-2 text-center text-sm text-gray-500">
                        Template tidak ditemukan
                    </div>
                )}
            </div>
        </div>
    );
}