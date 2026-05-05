"use client";

import Button from "@/components/ui/button/Button";
import { PrinterStatus } from "@/lib/mock-data/Admin/dashboard/dashboard";

type PrinterStatusFilterProps = {
  selectedStatuses: PrinterStatus[];
  onToggleStatus: (status: PrinterStatus) => void;
  onClear: () => void;
  onClose: () => void;
};

const statuses: PrinterStatus[] = [
  "Active",
  "Offline",
  "Paper Jam",
  "Low Toner",
];

const PrinterStatusFilter = ({
  selectedStatuses,
  onToggleStatus,
  onClear,
  onClose,
}: PrinterStatusFilterProps) => {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="title-md">Filter Printers</h3>
        <p className="paragraph mt-1">
          Choose which printer statuses you want to display.
        </p>
      </div>

      <div className="space-y-3">
        {statuses.map((status) => {
          const checked = selectedStatuses.includes(status);

          return (
            <label
              key={status}
              className="flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: "var(--paragraph)" }}
              >
                {status}
              </span>

              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleStatus(status)}
                className="h-4 w-4 accent-[var(--color-brand-500)]"
              />
            </label>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        {/*<button onClick={onClear} className="btn-secondary">
          Clear
        </button>

        <button onClick={onClose} className="btn-primary">
          Apply
        </button>*/}

        <Button
          variant="outline"
          onClick={onClear}
        >
          Clear
        </Button>

        <Button
          variant="primary"
          onClick={onClose}
        >
          Apply
        </Button>
      </div>
    </div>
  );
};

export default PrinterStatusFilter;
