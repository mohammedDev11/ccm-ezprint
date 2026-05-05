"use client";

import React from "react";
import { Check, ChevronDown, ChevronUp, Search } from "lucide-react";
import FloatingInput from "@/components/ui/input/FloatingInput";

type TableProps = {
  children: React.ReactNode;
  className?: string;
};

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className={`card overflow-hidden rounded-[28px] ${className}`}>
      {children}
    </div>
  );
}

type TableTopProps = {
  children: React.ReactNode;
  className?: string;
};

export function TableTop({ children, className = "" }: TableTopProps) {
  return (
    <div
      className={`flex flex-col items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-5 lg:flex-row lg:items-center ${className}`}
    >
      {children}
    </div>
  );
}

type TableTitleBlockProps = {
  title: string;
  description?: string;
};

export function TableTitleBlock({ title, description }: TableTitleBlockProps) {
  return (
    <div>
      <h2 className="title-md">{title}</h2>
      {description ? <p className="paragraph mt-1">{description}</p> : null}
    </div>
  );
}

type TableControlsProps = {
  children: React.ReactNode;
  className?: string;
};

export function TableControls({
  children,
  className = "",
}: TableControlsProps) {
  return (
    <div
      className={`flex w-full flex-col gap-3 md:w-auto md:flex-row md:flex-wrap md:items-center md:justify-end ${className}`}
    >
      {children}
    </div>
  );
}

type TableSearchProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
  wrapperClassName?: string;
};

export function TableSearch({
  value,
  onChange,
  label = "Search",
  id = "table-search",
  wrapperClassName = "w-full md:w-[360px]",
}: TableSearchProps) {
  return (
    <div className={wrapperClassName}>
      <FloatingInput
        id={id}
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        icon={<Search className="h-5 w-5" />}
        wrapperClassName="h-14"
      />
    </div>
  );
}

type TableMainProps = {
  children: React.ReactNode;
  className?: string;
};

export function TableMain({ children, className = "" }: TableMainProps) {
  return <div className={`overflow-x-auto ${className}`}>{children}</div>;
}

type TableGridProps = {
  children: React.ReactNode;
  minWidthClassName?: string;
};

export function TableGrid({
  children,
  minWidthClassName = "min-w-[1100px]",
}: TableGridProps) {
  return <div className={`w-full ${minWidthClassName}`}>{children}</div>;
}

type TableHeaderProps = {
  children: React.ReactNode;
  columnsClassName: string;
};

export function TableHeader({ children, columnsClassName }: TableHeaderProps) {
  return (
    <div
      className={`grid border-b border-[var(--border)] px-6 py-5 ${columnsClassName}`}
    >
      {children}
    </div>
  );
}

type SortDir = "asc" | "desc";

type TableHeaderCellProps = {
  label: string;
  sortable?: boolean;
  active?: boolean;
  direction?: SortDir;
  onClick?: () => void;
  className?: string;
};

export function TableHeaderCell({
  label,
  sortable = false,
  active = false,
  direction = "asc",
  onClick,
  className = "",
}: TableHeaderCellProps) {
  const content = (
    <div className="flex items-center gap-2">
      <span>{label}</span>

      {sortable ? (
        active ? (
          direction === "asc" ? (
            <ChevronUp className="h-4 w-4 text-brand-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-brand-500" />
          )
        ) : (
          <ChevronDown className="text-muted h-4 w-4" />
        )
      ) : null}
    </div>
  );

  if (!sortable) {
    return (
      <div
        className={`text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-xs ${className}`}
        style={{ color: "var(--muted)" }}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left text-[11px] font-semibold uppercase tracking-[0.18em] transition sm:text-xs ${className}`}
      style={{ color: "var(--muted)" }}
    >
      {content}
    </button>
  );
}

type TableBodyProps = {
  children: React.ReactNode;
};

export function TableBody({ children }: TableBodyProps) {
  return <div>{children}</div>;
}

// type TableCellProps = {
//   children: React.ReactNode;
//   className?: string;
// };
type TableCellProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

export function TableCell({ children, className = "" }: TableCellProps) {
  return <div className={`flex min-w-0 items-center ${className}`}>{children}</div>;
}

type TableEmptyStateProps = {
  text?: string;
};

export function TableEmptyState({
  text = "No results found",
}: TableEmptyStateProps) {
  return (
    <div
      className="px-6 py-12 text-center text-sm"
      style={{ color: "var(--muted)" }}
    >
      {text}
    </div>
  );
}

type TableCheckboxProps = {
  checked: boolean;
  onToggle: () => void;
};

export function TableCheckbox({ checked, onToggle }: TableCheckboxProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 border-[3px] transition ${
        checked ? "border-brand-500" : "border-[var(--border)]"
      }`}
      style={{
        background: checked ? "rgba(55, 125, 255, 0.08)" : "transparent",
      }}
      aria-pressed={checked}
      aria-label={checked ? "Deselect row" : "Select row"}
    >
      {checked ? (
        <Check className="h-4 w-4 text-brand-500" strokeWidth={2.8} />
      ) : null}
    </button>
  );
}
