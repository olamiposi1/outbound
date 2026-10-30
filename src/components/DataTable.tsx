import React, { useState } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  emptyMessage = 'No records found',
  className = '',
}: DataTableProps<T>) {
  const [internalSelected, setInternalSelected] = useState<string[]>(selectedIds);
  const activeSelected = onSelectionChange ? selectedIds : internalSelected;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSelected = e.target.checked ? data.map(keyExtractor) : [];
    if (onSelectionChange) {
      onSelectionChange(newSelected);
    } else {
      setInternalSelected(newSelected);
    }
  };

  const handleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const exists = activeSelected.includes(id);
    const updated = exists ? activeSelected.filter((i) => i !== id) : [...activeSelected, id];
    if (onSelectionChange) {
      onSelectionChange(updated);
    } else {
      setInternalSelected(updated);
    }
  };

  const isAllSelected = data.length > 0 && activeSelected.length === data.length;
  const isIndeterminate =
    activeSelected.length > 0 && activeSelected.length < data.length;

  return (
    <div
      className={`w-full rounded-[12px] border border-border bg-surface overflow-hidden flex flex-col text-left ${className}`}
    >
      <div className="overflow-x-auto w-full max-h-[500px]">
        <table className="w-full border-collapse text-[14px]">
          <thead className="sticky top-0 bg-surface z-10 border-b border-border">
            <tr className="h-[44px] text-[12px] text-ink-2 font-medium">
              {selectable && (
                <th className="w-10 px-4 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    aria-label="Select all rows"
                    className="w-4 h-4 rounded-[4px] border-border text-primary focus:ring-2 focus:ring-primary/40 focus:outline-none cursor-pointer accent-primary"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={`px-4 py-2 font-medium whitespace-nowrap ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="h-32 text-center text-ink-3 text-[14px]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const id = keyExtractor(row);
                const isSelected = activeSelected.includes(id);

                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`h-[44px] transition-colors duration-150 ease select-none ${
                      isSelected
                        ? 'bg-primary-soft'
                        : 'bg-surface hover:bg-surface-muted'
                    } ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {selectable && (
                      <td className="w-10 px-4" onClick={(e) => handleSelectRow(id, e)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          aria-label={`Select row ${idx + 1}`}
                          className="w-4 h-4 rounded-[4px] border-border text-primary focus:ring-2 focus:ring-primary/40 focus:outline-none cursor-pointer accent-primary"
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const value = (row as Record<string, unknown>)[col.key];
                      return (
                        <td
                          key={col.key}
                          className={`px-4 py-2 whitespace-nowrap text-ink ${
                            col.align === 'right'
                              ? 'text-right'
                              : col.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                          }`}
                        >
                          {col.render ? col.render(row, idx) : (value as React.ReactNode)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {data.length > 0 && (
        <div className="px-4 py-2.5 border-t border-border bg-surface text-[12px] text-ink-2 flex items-center justify-between">
          <span className="tabular-nums">
            Showing {data.length} total entries
          </span>
          {activeSelected.length > 0 && (
            <span className="text-primary font-medium tabular-nums">
              {activeSelected.length} row{activeSelected.length > 1 ? 's' : ''} selected
            </span>
          )}
        </div>
      )}
    </div>
  );
}
