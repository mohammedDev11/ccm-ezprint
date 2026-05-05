"use client";

import React from "react";
import { Printer, SlidersHorizontal, Trash2 } from "lucide-react";
//import MainButton from "@/app/Mohammed/components/MainButton";
import Button from "@/components/ui/button/Button";
import { cn } from "@/lib/cn";
import type { PrinterItem, PrinterStatus } from "@/lib/mock-data/Admin/printers";

type PrinterCardProps = {
  printer: PrinterItem;
  columns?: 2 | 3;
  onClick?: () => void;
  onConfigure?: (printer: PrinterItem) => void;
  onDelete?: (printer: PrinterItem) => void;
};

const statusStyles: Record<PrinterStatus, React.CSSProperties> = {
  Online: {
    borderColor: "color-mix(in srgb, var(--color-support-500) 24%, transparent)",
    background: "color-mix(in srgb, var(--color-support-500) 12%, var(--surface))",
    color: "color-mix(in srgb, var(--color-support-700) 76%, var(--title))",
  },
  Offline: {
    borderColor: "var(--border)",
    background: "color-mix(in srgb, var(--surface-3) 44%, var(--surface))",
    color: "var(--muted)",
  },
  "Low Toner": {
    borderColor: "color-mix(in srgb, var(--color-warning-500) 24%, transparent)",
    background: "color-mix(in srgb, var(--color-warning-500) 12%, var(--surface))",
    color: "color-mix(in srgb, var(--color-warning-600) 78%, var(--title))",
  },
  "Paper Jam": {
    borderColor: "color-mix(in srgb, var(--color-brand-600) 24%, transparent)",
    background: "color-mix(in srgb, var(--color-brand-500) 13%, var(--surface))",
    color: "color-mix(in srgb, var(--color-brand-700) 76%, var(--title))",
  },
};

const formatCompactNumber = (value: number) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${value}`;
};

const InfoStat = ({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) => {
  return (
    <div
      className="flex min-h-[88px] flex-col items-center justify-center rounded-2xl px-4 py-4 text-center"
      style={{ background: "var(--surface-2)" }}
    >
      <span className="text-2xl font-bold text-[var(--foreground)]">
        {value}
      </span>
      <span
        className="mt-1 text-xs font-semibold uppercase tracking-[0.16em]"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </span>
    </div>
  );
};

const PrinterCard = ({
  printer,
  columns = 2,
  onClick,
  onConfigure,
  onDelete,
}: PrinterCardProps) => {
  const compactCapabilities = columns === 3 ? 3 : 4;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        "card rounded-[28px] p-7 transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-lg"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: "var(--surface-2)" }}
          >
            <Printer className="h-7 w-7 text-brand-500" />
          </div>

          <div className="min-w-0">
            <h3 className="break-words text-2xl font-bold text-[var(--foreground)]">
              {printer.name}
            </h3>
            <p className="mt-1 break-words text-lg text-[var(--muted)]">
              {printer.location}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)] transition hover:border-[rgba(239,68,68,0.28)] hover:bg-[rgba(239,68,68,0.08)] hover:text-[color-mix(in_srgb,rgb(185,28,28)_72%,var(--foreground))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(239,68,68,0.14)]"
          aria-label={`Delete ${printer.name}`}
          title="Delete printer"
          onClick={(event) => {
            event.stopPropagation();
            onDelete?.(printer);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <span
          className="inline-flex items-center rounded-full border px-4 py-2 text-base font-semibold"
          style={statusStyles[printer.status]}
        >
          {printer.status}
        </span>

        {printer.capabilities
          .slice(0, compactCapabilities)
          .map((capability) => (
            <span
              key={capability}
              className="inline-flex items-center rounded-full border px-4 py-2 text-base font-medium"
              style={{
                borderColor: "var(--border)",
                color: "var(--paragraph)",
              }}
            >
              {capability}
            </span>
          ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <InfoStat
          value={formatCompactNumber(printer.totalPagesPrinted)}
          label="Pages"
        />
        <InfoStat value={printer.totalJobsSubmitted} label="Jobs" />
        <InfoStat value={printer.costPerPage.toFixed(2)} label="SAR/PG" />
      </div>

      <div className="mt-6">
        {/*<MainButton
          label="Configure"
          icon={<SlidersHorizontal className="h-5 w-5" />}
          className="w-full rounded-md bg-brand-500"
          onClick={() => onConfigure?.(printer)}
        />
        */}
        {/* Replaced MainButton with the new Button component*/}
        <Button
          variant="primary"
          iconLeft={<SlidersHorizontal className="h-5 w-5" />}
          className="w-full"
          onClick={(event) => {
            event.stopPropagation();
            onConfigure?.(printer);
          }}
        >
          Configure
        </Button>
      </div>
    </div>
  );
};

export default PrinterCard;
