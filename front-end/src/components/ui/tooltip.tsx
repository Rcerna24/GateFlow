import React, { useState } from 'react';

interface TooltipContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextType | undefined>(undefined);

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      {children}
    </TooltipContext.Provider>
  );
};

export const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      {children}
    </TooltipContext.Provider>
  );
};

export const TooltipTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className = '', onClick, asChild, children, ...props }, ref) => {
  const context = React.useContext(TooltipContext);

  return (
    <button
      ref={ref}
      className={className}
      onMouseEnter={() => context?.setOpen(true)}
      onMouseLeave={() => context?.setOpen(false)}
      onClick={(e) => {
        context?.setOpen(!context?.open);
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
});
TooltipTrigger.displayName = 'TooltipTrigger';

export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { side?: 'top' | 'bottom' | 'left' | 'right' }
>(({ className = '', side = 'top', ...props }, ref) => {
  const context = React.useContext(TooltipContext);

  if (!context?.open) return null;

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  return (
    <div
      ref={ref}
      className={`absolute z-50 px-2 py-1 text-sm text-white bg-slate-900 rounded-md whitespace-nowrap pointer-events-none ${positionClasses[side]} ${className}`}
      {...props}
    />
  );
});
TooltipContent.displayName = 'TooltipContent';
