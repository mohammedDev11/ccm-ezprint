"use client";

import { FileOutput } from "lucide-react";

import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/dropdown/Dropdown";
import { cn } from "@/lib/cn";
import { TableExportFormat } from "@/lib/export";

type TableExportDropdownProps = {
  disabled?: boolean;
  onExport: (format: TableExportFormat) => void;
  className?: string;
};

export default function TableExportDropdown({
  disabled = false,
  onExport,
  className = "",
}: TableExportDropdownProps) {
  return (
    <Dropdown onValueChange={(value) => onExport(value as TableExportFormat)}>
      <DropdownTrigger
        className={cn(
          "h-14 min-w-[160px] px-6 text-base",
          disabled ? "pointer-events-none opacity-50" : "",
          className,
        )}
      >
        <span className="inline-flex items-center gap-2">
          <FileOutput className="h-4 w-4" />
          Export
        </span>
      </DropdownTrigger>

      <DropdownContent align="right" widthClassName="w-[220px]">
        <DropdownItem value="PDF" className="py-4 text-base">
          PDF
        </DropdownItem>
        <DropdownItem value="Excel" className="py-4 text-base">
          Excel
        </DropdownItem>
        <DropdownItem value="CSV" className="py-4 text-base">
          CSV
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  );
}
