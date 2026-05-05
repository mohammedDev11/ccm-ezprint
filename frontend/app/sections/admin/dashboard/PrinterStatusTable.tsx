"use client";

import {
  PrinterItem,
  PrinterStatus,
  SortDir,
  SortField,
  allPrinterStatuses,
  printerStatusClasses,
  printerTableColumns,
  printersData,
} from "@/lib/mock-data/Admin/dashboard/dashboard";
import FloatingInput from "@/components/ui/input/FloatingInput";
import Modal from "@/components/ui/modal/Modal";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  MapPin,
  Printer,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
import PrinterStatusFilter from "./components/PrinterStatusFilter";
import Button from "@/components/ui/button/Button";

type StatusBadgeProps = {
  status: PrinterStatus;
};

function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={printerStatusClasses[status]}>{status}</span>;
}

type SortIconProps = {
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
};

function SortIcon({ field, sortField, sortDir }: SortIconProps) {
  if (sortField !== field) {
    return <ChevronDown className="text-muted h-3 w-3" />;
  }

  return sortDir === "asc" ? (
    <ChevronUp className="h-3 w-3 text-brand-500" />
  ) : (
    <ChevronDown className="h-3 w-3 text-brand-500" />
  );
}

const PrinterStatusTable = () => {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("printer_name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] =
    useState<PrinterStatus[]>(allPrinterStatuses);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleToggleStatus = (status: PrinterStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status]
    );
  };

  const handleClearFilters = () => {
    setSelectedStatuses(allPrinterStatuses);
  };

  const filtered = useMemo(() => {
    return [...printersData]
      .filter((printer: PrinterItem) => {
        const term = search.toLowerCase();

        const matchesSearch =
          printer.printer_name.toLowerCase().includes(term) ||
          printer.location.toLowerCase().includes(term);

        const matchesStatus = selectedStatuses.includes(printer.status);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDir === "asc" ? aVal - bVal : bVal - aVal;
        }

        return sortDir === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
  }, [search, sortField, sortDir, selectedStatuses]);

  return (
    <>
      <div className="card overflow-hidden rounded-[28px]">
        <div className="flex flex-col items-start justify-between gap-3 border-b border-[var(--border)] px-6 py-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="title-md">Printer Status</h2>
            <p className="paragraph mt-1">{filtered.length} printers found</p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="w-full sm:w-72">
              <FloatingInput
                id="search-printers"
                label="Search printers"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                wrapperClassName="h-14"
              />
            </div>

            {/*<button
              onClick={() => setIsFilterOpen(true)}
              className="btn-secondary h-12 px-4"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filter
            </button>*/}

            <Button
              variant="outline"
              iconLeft={<SlidersHorizontal className="h-4 w-4" />}
              className="h-12 px-4"
              onClick={() => setIsFilterOpen(true)}
            >
              Filter
            </Button> 
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr style={{ background: "var(--surface-2)" }}>
                {printerTableColumns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="select-none px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider transition-colors"
                    style={{ color: "var(--muted)" }}
                  >
                    <div className="flex cursor-pointer items-center gap-1.5">
                      {col.label}
                      <SortIcon
                        field={col.key}
                        sortField={sortField}
                        sortDir={sortDir}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-sm"
                    style={{ color: "var(--muted)" }}
                  >
                    No printers found
                  </td>
                </tr>
              ) : (
                filtered.map((printer) => (
                  <tr
                    key={printer.id}
                    className="border-t border-[var(--border)] transition-colors hover:bg-brand-50/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-xl"
                          style={{ background: "var(--surface-2)" }}
                        >
                          <Printer className="text-muted h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-[var(--title)]">
                          {printer.printer_name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="text-muted h-4 w-4" />
                        <span className="paragraph">{printer.location}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={printer.status} />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="text-muted h-4 w-4" />
                        <span className="text-sm font-semibold text-[var(--title)]">
                          {printer.pages_today}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="text-muted h-4 w-4" />
                        <span className="paragraph">
                          {printer.last_activity}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <PrinterStatusFilter
          selectedStatuses={selectedStatuses}
          onToggleStatus={handleToggleStatus}
          onClear={handleClearFilters}
          onClose={() => setIsFilterOpen(false)}
        />
      </Modal>
    </>
  );
};

export default PrinterStatusTable;
