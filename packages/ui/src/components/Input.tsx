import React from 'react';
import { cn } from '../../utils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  description?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, description, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <label className="text-sm font-medium">{label}</label>}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2 rounded border',
            'focus:outline-none focus:ring-2 focus:ring-primary/50',
            className
          )}
          {...props}
        />
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
