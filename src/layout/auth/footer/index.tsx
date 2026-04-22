// components/layout/Footer.tsx
'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface FooterProps {
  version?: string;
  className?: string;
}

export default function Footer({ version = 'v1.0.0', className }: FooterProps) {
  return (
    <footer
      className={cn(
        'w-full border-t border-gray-200 dark:border-gray-700 bg-background dark:bg-dark py-4 px-6 text-left text-sm text-gray-600 dark:text-gray-300 flex justify-between items-center',
        className
      )}
    >
      <div>© {new Date().getFullYear()} Your Company. All rights reserved.</div>
      <div className="text-gray-500 dark:text-gray-400">Version: {version}</div>
    </footer>
  );
}
