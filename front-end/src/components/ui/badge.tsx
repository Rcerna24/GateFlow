import React from 'react';

export const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'outline' | 'secondary';
  }
>(({ className = '', variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'border-transparent bg-slate-900 text-white hover:bg-slate-800',
    outline: 'border border-slate-200 text-slate-950',
    secondary: 'border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200',
  };

  return (
    <div
      ref={ref}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${variants[variant]} ${className}`}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';
