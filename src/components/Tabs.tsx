import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pills';
  className?: string;
}

export function Tabs({
  tabs,
  activeId,
  onChange,
  variant = 'underline',
  className = '',
}: TabsProps) {
  if (variant === 'pills') {
    return (
      <div
        className={`flex items-center gap-1 p-1 bg-surface-muted rounded-[8px] border border-border ${className}`}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-[14px] font-medium rounded-[6px] transition-colors duration-150 ease whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                tab.disabled
                  ? 'opacity-40 cursor-not-allowed text-ink-3'
                  : isActive
                  ? 'bg-surface text-ink border border-border/80 shadow-none'
                  : 'text-ink-2 hover:text-ink hover:bg-surface/50 cursor-pointer'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[12px] px-1.5 py-0.2 rounded-[999px] tabular-nums ${
                    isActive ? 'bg-primary-soft text-primary' : 'bg-border/60 text-ink-3'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`border-b border-border w-full flex items-center gap-6 ${className}`} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={`group relative pb-3 pt-1 text-[14px] font-medium flex items-center gap-2 transition-colors duration-150 ease whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-[2px] ${
              tab.disabled
                ? 'opacity-40 cursor-not-allowed text-ink-3'
                : isActive
                ? 'text-primary cursor-default'
                : 'text-ink-2 hover:text-ink cursor-pointer'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[12px] px-1.5 py-0.5 rounded-[999px] tabular-nums leading-none ${
                  isActive
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'bg-surface-muted text-ink-3 group-hover:text-ink-2'
                }`}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
