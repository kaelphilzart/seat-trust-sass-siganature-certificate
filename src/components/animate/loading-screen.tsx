'use client';
import React from 'react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/60 dark:bg-dark/60 backdrop-blur-sm z-50">
      <div
        className="w-14 h-14 border-4 rounded-full animate-spin"
        style={{
          borderColor: 'var(--color-border)',
          borderTopColor: 'var(--color-primary)',
        }}
      />
    </div>
  );
}
