"use client";

import { FileCode2, FileOutput, FileSpreadsheet } from "lucide-react";

import { cn } from "@/lib/cn";
import { TableExportFormat } from "@/lib/export";

type ReportExportButtonProps = {
  format: TableExportFormat;
  onClick?: () => void;
  className?: string;
};

const exportMeta: Record<
  TableExportFormat,
  { label: string; className: string; Icon: typeof FileOutput }
> = {
  PDF: {
    label: "PDF",
    className: "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-transparent hover:bg-[var(--color-brand-500)] hover:text-white",
    Icon: FileOutput,
  },
  Excel: {
    label: "Excel",
    className: "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-transparent hover:bg-[var(--color-brand-500)] hover:text-white",
    Icon: FileSpreadsheet,
  },
  CSV: {
    label: "CSV",
    className: "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-transparent hover:bg-[var(--color-brand-500)] hover:text-white",
    Icon: FileCode2,
  },
};

export default function ReportExportButton({
  format,
  onClick,
  className = "",
}: ReportExportButtonProps) {
  const meta = exportMeta[format];
  const Icon = meta.Icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group inline-flex items-center overflow-hidden rounded-md p-2 shadow-sm transition-all duration-500 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)]",
        meta.className,
        className,
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center">
        <Icon size={20} />
      </div>

      <span className="max-w-0 overflow-hidden whitespace-nowrap pr-0 text-sm font-semibold transition-all duration-500 group-hover:max-w-[120px] group-hover:pr-3">
        {meta.label}
      </span>
    </button>
  );
}
