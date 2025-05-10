import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  className
}: ButtonProps) => (
  <button
    onClick={onClick}
    className={clsx(
      'px-4 py-2 rounded-md transition-colors',
      {
        'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
        'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'secondary'
      },
      className
    )}
  >
    {children}
  </button>
);
