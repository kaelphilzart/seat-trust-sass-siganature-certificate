'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { Button, buttonVariants, type ButtonProps } from '../ui/button';
import { Loader2 } from 'lucide-react'; // spinner icon, bisa diganti

interface LoaderButtonProps extends ButtonProps {
  loadingText?: string;
  children: React.ReactNode;
}

const LoaderButton = React.forwardRef<HTMLButtonElement, LoaderButtonProps>(
  ({ children, loadingText = 'Loading...', disabled, onClick, ...props }, ref) => {
    const [isLoading, setIsLoading] = React.useState(false);

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (onClick) {
        setIsLoading(true);
        try {
          await onClick(e); // tunggu async action selesai
        } finally {
          setIsLoading(false);
        }
      }
    };

    return (
      <Button
        {...props}
        disabled={disabled || isLoading}
        ref={ref}
        onClick={handleClick}
        className={cn(props.className, 'flex items-center justify-center gap-2')}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {loadingText}
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);

LoaderButton.displayName = 'LoaderButton';
export { LoaderButton };