import React from 'react';

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  boxed?: boolean;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  secondaryAction,
  boxed = true,
  className = '',
}: EmptyStateProps) {
  const containerStyles = boxed
    ? 'rounded-[12px] border border-border bg-surface p-8'
    : 'py-8';

  return (
    <div className={`w-full text-left flex flex-col items-start gap-4 ${containerStyles} ${className}`}>
      <div className="flex flex-col gap-1.5 max-w-xl">
        <h4 className="text-[20px] font-semibold text-ink leading-tight tracking-tight">
          {title}
        </h4>
        <p className="text-[14px] text-ink-2 leading-relaxed">
          {description}
        </p>
      </div>

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 pt-2">
          {action && (
            <button
              onClick={action.onClick}
              className="h-[36px] px-3.5 text-[14px] font-medium rounded-[8px] bg-primary text-white hover:bg-primary-hover active:bg-primary-hover transition-colors duration-150 ease focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="h-[36px] px-3.5 text-[14px] font-medium rounded-[8px] bg-surface text-ink border border-border hover:bg-surface-muted active:bg-surface-muted transition-colors duration-150 ease focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
