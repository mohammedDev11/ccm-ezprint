"use client";

import React from "react";
import { FileOutput, Trash2 } from "lucide-react";

import type { TableExportFormat } from "@/lib/export";
import Button from "@/components/ui/button/Button";
import ExpandedButton from "@/components/ui/button/ExpandedButton";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/dropdown/Dropdown";

type SelectedRowsExportModalProps<T> = {
  title: string;
  description: string;
  rows: T[];
  emptyText: string;
  exportMethod: TableExportFormat;
  onExportMethodChange: (format: TableExportFormat) => void;
  onRemove: (id: string) => void;
  onCancel: () => void;
  onExport: () => void;
  getId: (row: T) => string;
  getTitle: (row: T) => React.ReactNode;
  getSubtitle: (row: T) => React.ReactNode;
  idPrefix: string;
  exportDisabled?: boolean;
};

const exportFormats: TableExportFormat[] = ["PDF", "Excel", "CSV"];

export default function SelectedRowsExportModal<T>({
  title,
  description,
  rows,
  emptyText,
  exportMethod,
  onExportMethodChange,
  onRemove,
  onCancel,
  onExport,
  getId,
  getTitle,
  getSubtitle,
  idPrefix,
  exportDisabled = false,
}: SelectedRowsExportModalProps<T>) {
  return (
    <div className="w-[min(92vw,760px)] space-y-5 pr-4">
      <div className="border-b pb-4" style={{ borderColor: "var(--border)" }}>
        <h3 className="title-md flex items-center gap-2">
          <FileOutput className="h-5 w-5 text-brand-500" />
          {title}
        </h3>
        <p className="paragraph mt-2">{description}</p>
        <p className="paragraph mt-2">
          Total selected:{" "}
          <span className="font-semibold">{rows.length}</span>
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div
          className="max-h-[320px] space-y-3 overflow-y-auto pr-2"
          style={{ scrollbarWidth: "thin" }}
        >
          {rows.length === 0 ? (
            <div
              className="rounded-2xl border p-5 text-sm"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
                color: "var(--muted)",
              }}
            >
              {emptyText}
            </div>
          ) : (
            rows.map((row) => {
              const rowId = getId(row);

              return (
                <div
                  key={rowId}
                  className="flex items-center justify-between gap-4 rounded-2xl border p-4"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                  }}
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[var(--title)]">
                      {getTitle(row)}
                    </p>
                    <p className="truncate text-sm text-[var(--muted)]">
                      {getSubtitle(row)}
                    </p>
                  </div>

                  <ExpandedButton
                    id={`remove-export-${idPrefix}-${rowId}`}
                    label="Remove"
                    icon={Trash2}
                    variant="danger"
                    onClick={() => onRemove(rowId)}
                  />
                </div>
              );
            })
          )}
        </div>

        <div
          className="rounded-2xl border p-4"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Export Method
          </p>

          <Dropdown
            value={exportMethod}
            onValueChange={(value) =>
              onExportMethodChange(value as TableExportFormat)
            }
            fullWidth
          >
            <DropdownTrigger className="h-12 w-full">
              {exportMethod}
            </DropdownTrigger>

            <DropdownContent widthClassName="w-full">
              {exportFormats.map((format) => (
                <DropdownItem key={format} value={format}>
                  {format}
                </DropdownItem>
              ))}
            </DropdownContent>
          </Dropdown>

          <p className="mt-4 text-sm text-[var(--muted)]">
            Selected format:{" "}
            <span className="font-semibold text-[var(--title)]">
              {exportMethod}
            </span>
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={onExport}
          className="px-8"
          disabled={exportDisabled || rows.length === 0}
        >
          Export
        </Button>
      </div>
    </div>
  );
}
