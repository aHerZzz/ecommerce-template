import React from 'react';
import clsx from 'clsx';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold focus-visible:outline-none focus-visible:ring transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed';

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90 dark:bg-primary-dark dark:text-gray-900',
  secondary:
    'bg-surface text-primary border border-gray-200 hover:border-accent dark:bg-surface-dark dark:text-text-dark dark:border-gray-700 dark:hover:border-accent-dark',
  ghost: 'bg-transparent text-primary hover:bg-gray-100 dark:text-text-dark dark:hover:bg-gray-800',
  danger:
    'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-400 dark:bg-red-500 dark:hover:bg-red-400',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)} {...props}>
      {children}
    </button>
  );
}
