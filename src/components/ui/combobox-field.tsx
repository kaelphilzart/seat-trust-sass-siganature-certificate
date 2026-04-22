'use client';

import * as React from 'react';
import { ChevronsUpDown, Check } from 'lucide-react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ComboboxFieldProps<T> {
  value?: string;
  items: T[];
  getValue: (item: T) => string;
  getLabel: (item: T) => string;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function ComboboxField<T>({
  value,
  items,
  getValue,
  getLabel,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  disabled,
  onChange,
}: ComboboxFieldProps<T>) {
  const selectedItem = items.find((item) => getValue(item) === value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* ⬇️ FIELD LOOK (BUKAN BUTTON) */}
        <div
          className={cn(
            'border-input bg-background relative flex h-10 w-full items-center rounded-md border px-3 text-sm',
            disabled
              ? 'cursor-not-allowed opacity-50'
              : 'hover:border-primary cursor-text'
          )}
        >
          <input
            readOnly
            disabled={disabled}
            className="placeholder:text-muted-foreground w-full cursor-text bg-transparent outline-none"
            value={selectedItem ? getLabel(selectedItem) : ''}
            placeholder={placeholder}
          />
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="p-0"
        align="start"
        sideOffset={4}
        style={{
          width: 'var(--radix-popover-trigger-width)',
        }}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>Data tidak ditemukan</CommandEmpty>

          <CommandGroup>
            <CommandList className="max-h-60">
              {items.map((item) => {
                const itemValue = getValue(item);
                return (
                  <CommandItem
                    key={itemValue}
                    value={getLabel(item)}
                    onSelect={() => onChange(itemValue)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === itemValue ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {getLabel(item)}
                  </CommandItem>
                );
              })}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
