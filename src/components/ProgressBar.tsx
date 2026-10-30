import React from 'react';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  label?: string;
  helper?: string;
  showValue?: boolean;
  variant?: 'primary' | 'success' | 'warm' | 'danger';
  size?: 'sm' | 'md';
}

export function ProgressBar({
  value,
  label,
  helper,
  showValue = false,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const variantStyles = {
    primary: 'bg-primary',
    success: 'bg-success',
    warm: 'bg-warm',
    danger: 'bg-danger',
  }[variant];

  const heightClass = size === 'sm' ? 'h-1' : 'h-2';

  return (
    <div className={`w-full flex flex-col gap-1.5 text-left ${className}`} {...props}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-[12px] leading-tight text-ink-2">
          {label && <span className="font-medium text-ink">{label}</span>}
          {showValue && <span className="tabular-nums font-medium text-ink">{clampedValue}%</span>}
        </div>
      )}
      <div
        className={`w-full bg-surface-muted border border-border/50 rounded-[999px] overflow-hidden ${heightClass}`}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`${heightClass} rounded-[999px] ${variantStyles} transition-all duration-150 ease`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {helper && <p className="text-[12px] text-ink-3 leading-none">{helper}</p>}
    </div>
  );
}
