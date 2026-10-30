import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  inputSize?: 'default' | 'hero';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      prefixIcon,
      suffixIcon,
      inputSize = 'default',
      disabled,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const hasError = Boolean(errorMessage);

    const heightClass = inputSize === 'hero' ? 'h-[44px] text-[16px]' : 'h-[36px] text-[14px]';

    const borderClass = hasError
      ? 'border-danger focus:border-danger focus:ring-danger/30'
      : 'border-border hover:border-border-strong focus:border-primary focus:ring-primary/40';

    const disabledClass = disabled
      ? 'bg-surface-muted text-ink-3 cursor-not-allowed border-border'
      : 'bg-surface text-ink';

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-[14px] font-medium text-ink">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {prefixIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-ink-3">
              {prefixIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`w-full rounded-[8px] border ${borderClass} ${disabledClass} ${heightClass} px-3 transition-colors duration-150 ease placeholder:text-ink-3 focus:outline-none focus:ring-2 ${
              prefixIcon ? 'pl-9' : ''
            } ${suffixIcon ? 'pr-9' : ''} ${className}`}
            {...props}
          />
          {suffixIcon && (
            <div className="absolute right-3 flex items-center pointer-events-none text-ink-3">
              {suffixIcon}
            </div>
          )}
        </div>
        {errorMessage ? (
          <p className="text-[12px] text-danger leading-none">{errorMessage}</p>
        ) : helperText ? (
          <p className="text-[12px] text-ink-3 leading-none">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
