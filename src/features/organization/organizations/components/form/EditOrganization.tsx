'use client';

import { useState } from 'react';
import { IUpdateOrganization } from '@/types/organization';
import { IUpdateSubscription } from '@/types/subscription';
import { useGetAllPlan } from '@/hooks/plans';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditOrganizationFormProps {
  organizationData?: IUpdateOrganization;
  subscriptionData?: IUpdateSubscription;
  onChange?: (org: IUpdateOrganization, sub: IUpdateSubscription) => void;
}

export default function EditOrganizationForm({
  organizationData,
  subscriptionData,
  onChange,
}: EditOrganizationFormProps) {
  const { plans } = useGetAllPlan();

  const [formOrg, setFormOrg] = useState<IUpdateOrganization>(() => ({
    ...(organizationData ?? {}),
  }));

  const [formSub, setFormSub] = useState<IUpdateSubscription>(() => ({
    ...(subscriptionData ?? {}),
  }));

  const handleChangeOrg = <K extends keyof IUpdateOrganization>(
    field: K,
    value: IUpdateOrganization[K]
  ) => {
    const updatedOrg = {
      ...formOrg,
      [field]: value,
    };

    setFormOrg(updatedOrg);

    onChange?.(
      { ...updatedOrg, id: organizationData?.id },
      { ...formSub, id: subscriptionData?.id }
    );
  };

  const handleChangeSub = <K extends keyof IUpdateSubscription>(
    field: K,
    value: IUpdateSubscription[K]
  ) => {
    const updatedSub = {
      ...formSub,
      [field]: value,
    };

    setFormSub(updatedSub);

    onChange?.(
      { ...formOrg, id: organizationData?.id },
      { ...updatedSub, id: subscriptionData?.id }
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Organization Name */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Organization Name
        </label>
        <Input
          type="text"
          value={formOrg.name ?? ''}
          onChange={(e) => handleChangeOrg('name', e.target.value)}
          placeholder="Organization Name"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="mb-1 block text-sm font-medium">Slug</label>
        <Input
          type="text"
          value={formOrg.slug ?? ''}
          onChange={(e) => handleChangeOrg('slug', e.target.value)}
          placeholder="Slug"
        />
      </div>

      {/* Plan */}
      <div>
        <label className="mb-1 block text-sm font-medium">Plan</label>

        <Select
          value={formSub.plan_id ?? ''}
          onValueChange={(value) => handleChangeSub('plan_id', value)}
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

      {/* Start Date */}
      <div>
        <label className="mb-1 block text-sm font-medium">Start Date</label>

        <Input
          type="date"
          value={
            formSub.start_date
              ? new Date(formSub.start_date).toISOString().split('T')[0]
              : ''
          }
          onChange={(e) =>
            handleChangeSub(
              'start_date',
              e.target.value ? new Date(e.target.value) : undefined
            )
          }
        />
      </div>

      {/* End Date */}
      <div>
        <label className="mb-1 block text-sm font-medium">End Date</label>

        <Input
          type="date"
          value={
            formSub.end_date
              ? new Date(formSub.end_date).toISOString().split('T')[0]
              : ''
          }
          onChange={(e) =>
            handleChangeSub(
              'end_date',
              e.target.value ? new Date(e.target.value) : undefined
            )
          }
        />
      </div>
    </div>
  );
}
