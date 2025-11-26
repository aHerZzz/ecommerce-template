import React from 'react';
import clsx from 'clsx';

type CardProps = {
  as?: keyof JSX.IntrinsicElements;
  title?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  ariaLabel?: string;
};

export function Card({ as: Component = 'section', title, children, className, footer, ariaLabel }: CardProps) {
  return (
    <Component
      className={clsx(
        'rounded-xl border border-gray-200 bg-surface p-4 shadow-sm dark:border-gray-700 dark:bg-surface-dark',
        className
      )}
      aria-label={ariaLabel}
    >
      {title && <h2 className="mb-3 text-lg font-semibold text-primary dark:text-text-dark">{title}</h2>}
      <div className="flex flex-col gap-3">{children}</div>
      {footer && <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">{footer}</div>}
    </Component>
  );
}
