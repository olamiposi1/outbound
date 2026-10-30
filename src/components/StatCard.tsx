import React from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  caption: string;
  sparklineData?: number[];
  className?: string;
}

export function StatCard({
  label,
  value,
  caption,
  sparklineData = [10, 15, 12, 18, 20, 24, 28],
  className = '',
}: StatCardProps) {
  // Generate SVG path for a 1.5px sparkline in --primary with no fill
  const svgWidth = 96;
  const svgHeight = 36;
  const padding = 3;

  const pathD = React.useMemo(() => {
    if (!sparklineData || sparklineData.length < 2) return '';
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min === 0 ? 1 : max - min;

    const points = sparklineData.map((val, idx) => {
      const x = padding + (idx / (sparklineData.length - 1)) * (svgWidth - padding * 2);
      const y =
        svgHeight - padding - ((val - min) / range) * (svgHeight - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return `M ${points.join(' L ')}`;
  }, [sparklineData]);

  return (
    <div
      className={`bg-surface border border-border rounded-[12px] p-5 text-left flex flex-col justify-between gap-3 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[14px] font-medium text-ink-2 leading-none">{label}</span>
        {pathD && (
          <div className="w-[96px] h-[36px] shrink-0" aria-hidden="true">
            <svg
              width={svgWidth}
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="overflow-visible"
            >
              <path
                d={pathD}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[28px] font-semibold text-ink leading-tight tracking-tight tabular-nums">
          {value}
        </span>
        <span className="text-[12px] text-ink-3 leading-normal">{caption}</span>
      </div>
    </div>
  );
}
