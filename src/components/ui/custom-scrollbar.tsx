import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CustomScrollbarProps {
  children: ReactNode;
  className?: string;
  maxHeight?: string;
}

export const CustomScrollbar = ({ children, className, maxHeight }: CustomScrollbarProps) => {
  return (
    <div
      className={cn(
        'custom-scrollbar overflow-y-auto overflow-x-hidden',
        className
      )}
      style={{ maxHeight }}
    >
      {children}
    </div>
  );
};
