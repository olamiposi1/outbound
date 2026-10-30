import React from 'react';

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warm' | 'danger';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  withDot?: boolean;
  children: React.ReactNode;
}

export function Badge({
  variant = 'neutral',
  withDot = false,
  className = '',
  children,
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    neutral: {
      container: 'bg-surface-muted text-ink-2 border border-border',
      dot: 'bg-ink-3',
    },
    primary: {
      container: 'bg-primary-soft text-primary',
      dot: 'bg-primary',
    },
    success: {
      container: 'bg-success-soft text-success',
      dot: 'bg-success',
    },
    warm: {
      container: 'bg-warm-soft text-warm',
      dot: 'bg-warm',
    },
    danger: {
      container: 'bg-danger-soft text-danger',
      dot: 'bg-danger',
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[999px] text-[12px] font-medium leading-normal select-none tabular-nums ${currentVariant.container} ${className}`}
      {...props}
    >
      {withDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentVariant.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
}
