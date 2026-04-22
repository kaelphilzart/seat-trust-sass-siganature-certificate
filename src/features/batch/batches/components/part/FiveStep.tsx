'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { IconX, IconArrowLeft } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useGetAllRepresentatives } from '@/hooks/representative';
import { ComboboxField } from '@/components/ui/combobox-field';
import { useGetAllBatchRepresentatives } from '@/hooks/batch-representative';
import Modal from '@/components/ui/modal-form';
import { ICreateRepresentative } from '@/types/representative';
import { useAlert } from '@/components/alert/alert-dialog-global';

import { createRepresentative } from '@/hooks/representative';
import AddRepresentativeForm from '@/features/subscription/representative/components/forms/AddRepresentative';

import { IRepresentative } from '@/types/representative';
import { IBatchRepresentative } from '@/types/batch-representative';

type Step5Payload = {
  ids: string[];
  isDirty: boolean;
};

type Props = {
  onBack: () => void;
  onFinish: (data: Step5Payload) => void;
  batchId: string;
};

type RepresentativeItem =
  | IRepresentative
  | {
      id: '__add_representative__';
      name: string;
      title: string;
    };

export default function FiveStep({ onFinish, onBack, batchId }: Props) {
  const alert = useAlert();
  const { data: session } = useSession();

  const organizationId = session?.user?.organization_id;

  //============================================================
  const [addFormData, setAddFormData] = useState<ICreateRepresentative | null>(
    null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { representatives, representativesLoading } =
    useGetAllRepresentatives();
  const { batchRepresentatives } = useGetAllBatchRepresentatives(batchId);

  // =========================
  // STATE
  // =========================
  const [selectedRepresentatives, setSelectedRepresentatives] = useState<
    string[]
  >([]);
  const itemsWithAction = useMemo<RepresentativeItem[]>(
    () => [
      ...(representatives || []),
      {
        id: '__add_representative__',
        name: '+ Add Representative',
        title: '',
      },
    ],
    [representatives]
  );
  // =========================
  // INIT FROM SERVER (LIKE STEP 4)
  // =========================
  useEffect(() => {
    if (!batchRepresentatives) return;

    const ids = batchRepresentatives
      .map((item: IBatchRepresentative) => item.representative?.id)
      .filter((id): id is string => Boolean(id));

    setSelectedRepresentatives(ids);
  }, [batchRepresentatives]);

  //=====================HANDLE ADD=========================//
  const handleAddSubmit = async () => {
    if (!addFormData?.name || !addFormData?.title)
      return alert.error('Name dan Title wajib diisi!');
    await alert.confirmAsync(
      'Yakin ingin menambahkan representative ini?',
      async () => {
        const payload: ICreateRepresentative = {
          ...addFormData,
          organization_id: organizationId!,
        };
        const res = await createRepresentative(payload);
        return res
          ? { success: true }
          : { success: false, message: 'Tidak ada response dari server.' };
      }
    );
    // kalau sukses, reset form
    setAddFormData(null);
    setIsAddModalOpen(false);
    localStorage.removeItem('add_representative_form');
  };
  // =========================
  // HANDLE SELECT
  // =========================
  const handleSelect = (value: string) => {
    setSelectedRepresentatives((prev) => {
      if (prev.includes(value)) return prev;
      return [...prev, value];
    });
  };

  const handleRemove = (id: string) => {
    setSelectedRepresentatives((prev) => prev.filter((item) => item !== id));
  };

  // =========================
  // COMPUTED SELECTED DATA (ORDER STABLE)
  // =========================
  const selectedData = useMemo(() => {
    if (!representatives) return [];

    return selectedRepresentatives
      .map((id) => representatives.find((r) => r.id === id))
      .filter((rep): rep is IRepresentative => Boolean(rep));
  }, [selectedRepresentatives, representatives]);

  const isValid = selectedRepresentatives.length > 0;

  // =========================
  // 🔥 DIRTY CHECK (AUTO, NO BUG)
  // =========================
  const dbIds = useMemo(() => {
    return (batchRepresentatives || [])
      .map((i: IBatchRepresentative) => i.representative?.id)
      .filter((id): id is string => Boolean(id))
      .sort();
  }, [batchRepresentatives]);

  const currentIds = useMemo(() => {
    return [...selectedRepresentatives].sort();
  }, [selectedRepresentatives]);

  const isDirty = useMemo(() => {
    if (!batchRepresentatives) return false;

    if (dbIds.length !== currentIds.length) return true;

    return !dbIds.every((id, i) => id === currentIds[i]);
  }, [dbIds, currentIds, batchRepresentatives]);

  // =========================
  // UI
  // =========================
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-1">
        <Button variant="ghost" onClick={onBack}>
          <IconArrowLeft size={16} />
          Kembali
        </Button>

        <Button
          disabled={!isValid}
          className={!isValid ? 'opacity-50 cursor-not-allowed' : ''}
          onClick={() =>
            onFinish({
              ids: selectedRepresentatives,
              isDirty,
            })
          }
        >
          {isDirty ? 'Save & Next' : 'Next'}
        </Button>
      </div>

      {/* TITLE */}
      <div className="mb-4">
        <div className="text-sm text-black/60">
          Step 5 — Assign Representative in Batch
        </div>

        <div className="text-xs text-gray-400 mt-1">
          Pilih representative yang akan digunakan untuk kebutuhan seperti QR
          Code atau legalitas pada sertifikat.
        </div>
      </div>

      {/* CONTENT */}
      <div className="bg-gray-50 p-6 rounded shadow space-y-4 text-center">
        <ComboboxField<RepresentativeItem>
          items={itemsWithAction}
          getValue={(item) => item.id}
          getLabel={(item) =>
            item.id === '__add_representative__'
              ? item.name
              : `${item.name} - ${item.title}`
          }
          placeholder="Pilih representative"
          onChange={(value) => {
            // 🔥 TRIGGER MODAL
            if (value === '__add_representative__') {
              setIsAddModalOpen(true); //
              return;
            }

            handleSelect(value);
          }}
          disabled={representativesLoading}
        />

        {/* LIST */}
        <div className="flex flex-col gap-2 mt-4">
          {selectedData.length === 0 && (
            <div className="text-sm text-gray-400">
              Belum ada representative dipilih
            </div>
          )}

          {selectedData.map((rep) => (
            <div
              key={rep.id}
              className="flex items-center justify-between bg-white border rounded px-3 py-2"
            >
              <div className="flex flex-col text-left">
                <span className="font-medium">Name : {rep.name}</span>
                <span className="text-xs text-gray-400">{rep.title}</span>
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleRemove(rep.id)}
              >
                <IconX size={16} />
              </Button>
            </div>
          ))}
        </div>
      </div>
      <Modal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        title="Tambah Representative"
      >
        <AddRepresentativeForm
          formData={addFormData ?? undefined}
          onChange={(data) =>
            setAddFormData((prev) =>
              JSON.stringify(prev) !== JSON.stringify(data)
                ? (data as ICreateRepresentative)
                : prev
            )
          }
        />
      </Modal>
    </div>
  );
}
