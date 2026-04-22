'use client';

import * as React from 'react';
import { IconSearch } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Input } from './input';

interface InputSearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export function InputSearch({
  placeholder,
  value,
  onChange,
  className,
  ...props
}: InputSearchProps) {
  return (
    <div className={cn('relative w-full max-w-sm', className)}>
      {/* Icon */}
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-400">
        <IconSearch className="h-4 w-4" />
      </span>

      {/* Input */}
      <Input
        type="text"
        variant="gray"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
        className={cn(
          'w-full rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground px-10 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring',
          className
        )}
      />
    </div>
  );
}
