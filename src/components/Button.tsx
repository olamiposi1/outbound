import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'default' | 'hero' | 'sm';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

/**
 * Helper to extract icon and label whether icon is provided via prop
 * or directly inside children (e.g. <Button><Icon /> Label</Button>).
 */
function extractIconAndLabel(
  children: React.ReactNode,
  propIcon?: React.ReactNode,
  propPosition: 'left' | 'right' = 'left'
) {
  if (propIcon) {
    return {
      icon: propIcon,
      position: propPosition,
      label: children,
    };
  }

  const array = React.Children.toArray(children);
  // Unwrap single Fragment if present (e.g. <><Icon /><span>Label</span></>)
  let flat = array;
  if (
    array.length === 1 &&
    React.isValidElement(array[0]) &&
    array[0].type === React.Fragment
  ) {
    flat = React.Children.toArray(
      (array[0] as React.ReactElement<{ children?: React.ReactNode }>).props.children
    );
  }

  // Look for an icon element (SVG or React icon component)
  const iconIndex = flat.findIndex((item) => React.isValidElement(item));
  if (iconIndex !== -1 && flat.length > 1) {
    const iconElement = flat[iconIndex];
    const remaining = flat.filter((_, i) => i !== iconIndex);
    return {
      icon: iconElement,
      position: iconIndex === 0 ? ('left' as const) : ('right' as const),
      label: remaining,
    };
  }

  return {
    icon: undefined,
    position: propPosition,
    label: children,
  };
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'default',
      isLoading = false,
      icon: propIcon,
      iconPosition: propPosition = 'left',
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const { icon, position, label } = extractIconAndLabel(
      children,
      propIcon,
      propPosition
    );

    const baseStyles =
      'inline-flex flex-row items-center justify-center font-medium rounded-[8px] transition-colors duration-150 ease select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 whitespace-nowrap';

    const sizeStyles =
      size === 'hero'
        ? 'h-[44px] px-5 text-[16px] gap-2'
        : size === 'sm'
        ? 'h-[30px] px-2.5 text-[12px] gap-[6px]'
        : 'h-[36px] px-3.5 text-[14px] gap-2';

    const variantStyles = {
      primary:
        'bg-primary text-white hover:bg-primary-hover active:bg-primary-hover border-0',
      secondary:
        'bg-surface text-ink border border-border hover:bg-surface-muted active:bg-surface-muted',
      ghost:
        'bg-transparent text-ink-2 hover:bg-surface-muted hover:text-ink active:bg-surface-muted border-0',
      danger: 'bg-danger text-white hover:opacity-90 active:opacity-90 border-0',
    }[variant];

    const disabledStyles =
      disabled || isLoading
        ? 'opacity-50 cursor-not-allowed pointer-events-none'
        : 'cursor-pointer';

    // 16px spinner, static under prefers-reduced-motion
    const spinner = (
      <svg
        className="w-4 h-4 shrink-0 animate-spin motion-reduce:animate-none text-current"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    );

    const renderedIcon = icon ? (
      <span className="w-4 h-4 shrink-0 inline-flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4 [&>svg]:shrink-0 [&>svg]:stroke-[1.5] [&>svg]:m-0">
        {icon}
      </span>
    ) : null;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${disabledStyles} ${className}`}
        {...props}
      >
        {isLoading ? (
          spinner
        ) : (
          position === 'left' && renderedIcon
        )}
        <span className="whitespace-nowrap inline-flex items-center">{label}</span>
        {!isLoading && position === 'right' && renderedIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
