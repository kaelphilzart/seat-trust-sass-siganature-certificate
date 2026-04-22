'use client';

import React from 'react';

interface LoaderProps {
  text?: string;
  color?: string; // optional, default primary
}

export default function Loader({
  text = 'Loading...',
  color = '#FF7F11',
}: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div
        className="w-16 h-16 border-4 border-t-transparent border-solid rounded-full animate-spin"
        style={{ borderColor: `${color} transparent transparent transparent` }}
      />
      <p className="text-lg font-medium" style={{ color }}>
        {text}
      </p>
    </div>
  );
}
