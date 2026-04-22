'use client';

import React from 'react';
import { IconAlertCircle } from '@tabler/icons-react';

interface ErrorFallbackProps {
  message?: string;
  iconSize?: number;
}

export default function ErrorFallback({
  message = 'Terjadi kesalahan.',
  iconSize = 80,
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
      <IconAlertCircle
        size={iconSize}
        className="text-red-500 dark:text-red-400"
      />
      <p className="text-xl font-semibold">{message}</p>
      <p className="text-sm text-muted-foreground">
        Silakan coba lagi nanti atau hubungi admin jika masalah berlanjut.
      </p>
    </div>
  );
}
