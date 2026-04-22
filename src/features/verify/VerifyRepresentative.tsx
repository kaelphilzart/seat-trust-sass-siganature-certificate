'use client';

import { Button } from '@/components/ui/button';
import { IconShieldCheck, IconArrowLeft } from '@tabler/icons-react';
import { useGetOneRepresentative } from '@/hooks/representative';
import ErrorFallback from '@/components/fallback/ErrorFallback';
import Loader from '@/components/fallback/Loader';
import { paths } from '@/routes/paths';
import Link from 'next/link';

export interface Props {
  repsentativeId: string;
  onBack?: () => void;
}

export default function VerifyRepresentative({
  repsentativeId,
  onBack,
}: Props) {
  const { representative, representativeLoading, representativeError } =
    useGetOneRepresentative(repsentativeId);

  if (representativeLoading) return <Loader />;
  if (representativeError) return <ErrorFallback />;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            <IconArrowLeft size={16} />
            Back
          </Button>
        )}

        <div className="text-xs text-gray-400 dark:text-gray-500">
          Digital Signature Verification
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {/* HERO STATUS */}
        <div className="flex flex-col items-center justify-center text-center py-10 px-6 border-b dark:border-gray-800">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <IconShieldCheck size={30} className="text-green-600" />
          </div>

          <div className="mt-3 text-green-600 font-semibold text-lg">
            Signature Verified
          </div>

          <div className="text-xs text-gray-400 dark:text-gray-500">
            This document is authentic and verified via Seal Trust network
          </div>
        </div>

        {/* IDENTITY SECTION */}
        <div className="p-6 space-y-4">
          <div className="bg-linear-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border dark:border-gray-800 rounded-xl p-5">
            <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">
              DIGITAL IDENTITY
            </div>

            <div className="text-xl font-bold text-gray-900 dark:text-white uppercase">
              {representative?.name || '-'}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 capitalize">
              {representative?.title || '-'}
            </div>
          </div>

          {/* INFO BOX */}
          <div className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            This document has been digitally signed and verified using system
            authentication. Any modification after signing is prevented by Seal
            Trust verification layer.
          </div>

          {/* FOOTER */}
          <div className="text-[11px] text-gray-400 dark:text-gray-500 text-center space-y-1">
            <div>
              Verified by system authentication • Immutable verification layer
            </div>

            <div className="text-[10px] font-medium tracking-wide text-gray-500 dark:text-gray-400">
              Powered by{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                Seal Trust
              </span>
            </div>
          </div>

          {/* ACTION */}
          <div className="flex justify-end pt-2">
            <Link href={paths.universal.home}>
              <Button disabled={representativeLoading}>Continue</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
