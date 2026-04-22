'use client';
import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/custom/table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import {
  IPlanFeatureValue,
  IUpdatePlanFeatureValue,
  ICreatePlanFeatureValue,
} from '@/types/plan-feature-value';
import { IUpdatePlan, IPlan } from '@/types/plan';
import { useGetOnePlan, editPlan } from '@/hooks/plans';
import {
  useGetAllPlanFeatureValue,
  editPlanFeatureValue,
  deletePlanFeatureValue,
  createPlanFeatureValueByParam,
} from '@/hooks/plan-feature-value';
import { formatIDR } from '@/utils/format';
import { IconPencil, IconTrash, IconPlus } from '@tabler/icons-react';
import { useAlert } from '@/components/alert/alert-dialog-global';
import Modal from '@/components/ui/modal-form';
import ErrorFallback from '@/components/fallback/ErrorFallback';
import Loader from '@/components/fallback/Loader';

import UpdatePlanForm from '../form/UpdatePlan';
import UpdatePlanFeatureValueForm from '../form/UpdateValue';
import AddFeatureValueForm from '../form/AddFeatureValue';

export interface Props {
  PlanId: string;
}

export default function PlanDynamic({ PlanId }: Props) {
  const router = useRouter();
  const alert = useAlert();
  const { planOne, planOneLoading, planOneError } = useGetOnePlan(PlanId);
  const {
    planFeatureValues,
    planFeatureValuesLoading,
    planFeatureValuesError,
  } = useGetAllPlanFeatureValue(PlanId);
  const [search] = useState('');
  const [isEditPlanFeatureModalOpen, setIsEditPlanFeatureModalOpen] =
    useState(false);
  const [editFormPlanFeature, setEditFormPlanFeature] =
    useState<IUpdatePlanFeatureValue | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] =
    useState<ICreatePlanFeatureValue | null>(null);

  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [editFormPlan, setEditFormPlan] = useState<IUpdatePlan | null>(null);
  const [initialData, setInitialData] =
    useState<IUpdatePlanFeatureValue | null>(null);

  const getChangedFields = <T extends object>(newData: T, oldData: T) => {
    const changed: Partial<T> = {};
    for (const key in newData)
      if (newData[key] !== oldData[key]) changed[key] = newData[key];
    return changed;
  };

  const cleanPayload = (obj: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(obj).filter(
        ([, v]) => v !== '' && v !== null && v !== undefined
      )
    );

  //=====================================================================

  const tableData = useMemo(() => {
    let data = planFeatureValues;
    const q = search.trim().toLowerCase();
    if (q) {
      data = data.filter((f) => `${f.feature}`.toLowerCase().includes(q));
    }
    return data;
  }, [planFeatureValues, search]);

  //=====================HANDLE=========================//
  //PLAN
  const handleEditPlan = async () => {
    if (!editFormPlan?.name) return alert.error('Plan name wajib diisi!');
    if (!initialData) return alert.error('Data awal tidak tersedia.');
    await alert.confirmAsync(
      'Yakin ingin menyimpan perubahan plan ini?',
      async () => {
        const changedOnly = getChangedFields(editFormPlan, initialData);
        const payload: Partial<IUpdatePlan> = cleanPayload(changedOnly);
        if (Object.keys(payload).length === 0) {
          alert.info('Tidak ada perubahan data.');
          return { success: false, message: 'Tidak ada perubahan' };
        }
        const res = await editPlan(editFormPlan.id!, payload);
        return {
          success: !!res,
          message: res ? 'Plan berhasil diperbarui!' : 'Gagal update plan',
        };
      }
    );
    setEditFormPlan(null);
    setInitialData(null);
    setIsEditPlanModalOpen(false);
  };

  const handleOpenEditPlan = (p: IPlan) => {
    const mapped: IUpdatePlan = { id: p.id, name: p.name, price: p.price };
    setEditFormPlan(mapped);
    setInitialData(mapped);
    setIsEditPlanModalOpen(true);
  };

  //PLAN FEATURE
  //-------------------------------------
  const handleAddSubmit = async () => {
    if (!addFormData?.feature_id || !addFormData?.value)
      return alert.error('value wajib diisi!');
    await alert.confirmAsync('Yakin ingin menambahkan fitur ini?', async () => {
      const payload: ICreatePlanFeatureValue = { ...addFormData };
      const res = await createPlanFeatureValueByParam(PlanId, payload);
      return res
        ? { success: true }
        : { success: false, message: 'Tidak ada response dari server.' };
    });
    // kalau sukses, reset form
    setAddFormData(null);
    setIsAddModalOpen(false);
    localStorage.removeItem('add_user_form');
  };

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      await alert.confirmAsync(`Yakin ingin menghapus "${name}"?`, async () => {
        return await deletePlanFeatureValue(id);
      });
    },
    [alert]
  );

  const handleEditPlanFeature = async () => {
    if (!editFormPlanFeature?.feature?.display_name)
      return alert.error('Feature name wajib diisi!');
    if (!initialData) return alert.error('Data awal tidak tersedia.');
    await alert.confirmAsync(
      'Yakin ingin menyimpan perubahan feature ini?',
      async () => {
        const changedOnly = getChangedFields(editFormPlanFeature, initialData);
        const payload: Partial<IUpdatePlanFeatureValue> =
          cleanPayload(changedOnly);
        if (Object.keys(payload).length === 0) {
          alert.info('Tidak ada perubahan data.');
          return { success: false, message: 'Tidak ada perubahan' };
        }
        const res = await editPlanFeatureValue(
          editFormPlanFeature.id!,
          payload
        );
        // ubah return editPlanFeatureValue jadi object {success, message}
        return {
          success: !!res,
          message: res
            ? 'Feature berhasil diperbarui!'
            : 'Gagal update feature',
        };
      }
    );
    setEditFormPlanFeature(null);
    setInitialData(null);
    setIsEditPlanFeatureModalOpen(false);
  };
  const handleOpenEditPlanFeature = useCallback((pfv: IPlanFeatureValue) => {
    const mapped: IUpdatePlanFeatureValue = {
      id: pfv.id,
      feature: pfv.feature,
      value: String(pfv.value),
    };
    setEditFormPlanFeature(mapped);
    setInitialData(mapped);
    setIsEditPlanFeatureModalOpen(true);
  }, []);

  const columns = useMemo<ColumnDef<IPlanFeatureValue>[]>(
    () => [
      { header: 'No', cell: ({ row }) => row.index + 1 },
      { header: 'Fitur ', accessorKey: 'feature.display_name' },
      { header: 'Status', accessorKey: 'value' },
      {
        header: 'Aksi',
        id: 'actions',
        cell: ({ row }) => {
          return (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditPlanFeature(row.original);
                }}
              >
                <IconPencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(
                    row.original.id,
                    row.original.feature?.display_name ?? 'Feature'
                  );
                }}
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [handleOpenEditPlanFeature, handleDelete]
  );

  if (planOneLoading || planFeatureValuesLoading)
    return (
      <div className="p-4 text-center">
        <Loader />
      </div>
    );
  if (planOneError || planFeatureValuesError)
    return (
      <div className="p-4 text-center text-red-500">
        <ErrorFallback />
      </div>
    );

  return (
    <div className="p-4 space-y-6">
      {/* Header Plan */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.back()}
        className="mb-4"
      >
        ← Kembali
      </Button>
      <Card className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-semibold">{planOne?.name}</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Harga: {formatIDR(planOne?.price)}
          </p>
        </div>
        <div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              handleOpenEditPlan(planOne!);
            }}
          >
            <IconPencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsAddModalOpen(true)}
            className="ml-2"
          >
            <IconPlus className="h-4 w-4" /> Tambah Fitur
          </Button>
        </div>
      </Card>

      {/* Feature Values Table */}
      <Card>
        <h3 className="text-xl font-semibold mb-4">Feature Values</h3>
        <DataTable
          columns={columns}
          data={tableData}
          filterField="feature_key"
          isRemovePagination={false}
        />
      </Card>
      <Modal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        title="Tambah Fitur Value"
      >
        <AddFeatureValueForm
          formData={addFormData ?? undefined}
          onChange={(data) =>
            setAddFormData((prev) =>
              JSON.stringify(prev) !== JSON.stringify(data)
                ? (data as ICreatePlanFeatureValue)
                : prev
            )
          }
        />
      </Modal>
      <Modal
        open={isEditPlanModalOpen}
        onClose={() => setIsEditPlanModalOpen(false)}
        onSubmit={handleEditPlan}
        title="Edit Plan"
      >
        {editFormPlan && (
          <UpdatePlanForm
            key={editFormPlan.id}
            formData={editFormPlan}
            onChange={(data: IUpdatePlan) =>
              setEditFormPlan((prev) =>
                JSON.stringify(prev) !== JSON.stringify(data) ? data : prev
              )
            }
          />
        )}
      </Modal>
      <Modal
        open={isEditPlanFeatureModalOpen}
        onClose={() => setIsEditPlanFeatureModalOpen(false)}
        onSubmit={handleEditPlanFeature}
        title="Edit Feature Value"
      >
        {editFormPlanFeature && (
          <UpdatePlanFeatureValueForm
            key={editFormPlanFeature.id}
            formData={editFormPlanFeature}
            onChange={(data: IUpdatePlanFeatureValue) =>
              setEditFormPlanFeature((prev) =>
                JSON.stringify(prev) !== JSON.stringify(data) ? data : prev
              )
            }
          />
        )}
      </Modal>
    </div>
  );
}
