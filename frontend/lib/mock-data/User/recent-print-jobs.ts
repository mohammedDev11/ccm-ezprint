import type { StatusTone } from "@/components/ui/badge/StatusBadge";

export type RecentPrintJobStatus = "Printed" | "Failed" | "Refunded";

export type RecentPrintJobSortKey =
  | "date"
  | "printerName"
  | "documentName"
  | "pages"
  | "cost"
  | "status";

export type RecentPrintJobItem = {
  id: string;
  date: string;
  dateOrder: number;
  printerName: string;
  documentName: string;
  pages: number;
  cost: number;
  status: RecentPrintJobStatus;
  attributes: string[];
  submittedFrom: string;
  printedAt: string;
  note?: string;
};

export const recentPrintJobsTableColumns: {
  key: RecentPrintJobSortKey;
  label: string;
  sortable: boolean;
}[] = [
  { key: "date", label: "Date", sortable: true },
  { key: "printerName", label: "Printer", sortable: true },
  { key: "documentName", label: "Document", sortable: true },
  { key: "pages", label: "Pages", sortable: true },
  { key: "cost", label: "Cost", sortable: true },
  { key: "status", label: "Status", sortable: true },
];

export const recentPrintJobsStatusMeta: Record<
  RecentPrintJobStatus,
  { label: string; tone: StatusTone }
> = {
  Printed: { label: "Printed", tone: "success" },
  Failed: { label: "Failed", tone: "danger" },
  Refunded: { label: "Refunded", tone: "inactive" },
};

export const recentPrintJobsFilterOptions = [
  { label: "All Jobs", value: "all" },
  { label: "Printed", value: "Printed" },
  { label: "Failed", value: "Failed" },
  { label: "Refunded", value: "Refunded" },
] as const;

export const recentPrintJobsData: RecentPrintJobItem[] = [
  {
    id: "job-001",
    date: "2024-03-20",
    dateOrder: 20240320,
    printerName: "Library-2F-HP",
    documentName: "thesis_final_v3.pdf",
    pages: 24,
    cost: 2.4,
    status: "Printed",
    attributes: ["PDF", "Black & White", "Duplex"],
    submittedFrom: "Web Print",
    printedAt: "Mar 20, 2024 · 10:22 AM",
  },
  {
    id: "job-002",
    date: "2024-03-19",
    dateOrder: 20240319,
    printerName: "Lab-3F-Canon",
    documentName: "slides_ch4.pptx",
    pages: 12,
    cost: 1.2,
    status: "Printed",
    attributes: ["PPTX", "Color", "Single-sided"],
    submittedFrom: "Windows Client",
    printedAt: "Mar 19, 2024 · 03:48 PM",
  },
  {
    id: "job-003",
    date: "2024-03-18",
    dateOrder: 20240318,
    printerName: "Library-1F-Xerox",
    documentName: "resume_2024.pdf",
    pages: 2,
    cost: 0.2,
    status: "Printed",
    attributes: ["PDF", "Black & White", "Single-sided"],
    submittedFrom: "Web Print",
    printedAt: "Mar 18, 2024 · 11:05 AM",
  },
  {
    id: "job-004",
    date: "2024-03-17",
    dateOrder: 20240317,
    printerName: "Lab-3F-Canon",
    documentName: "report_draft.docx",
    pages: 8,
    cost: 0.8,
    status: "Failed",
    attributes: ["DOCX", "Black & White", "Single-sided"],
    submittedFrom: "Windows Client",
    printedAt: "Mar 17, 2024 · 08:10 PM",
    note: "Printer ran out of paper during execution.",
  },
  {
    id: "job-005",
    date: "2024-03-17",
    dateOrder: 20240317,
    printerName: "Lab-3F-Canon",
    documentName: "report_draft.docx",
    pages: 8,
    cost: 0.8,
    status: "Refunded",
    attributes: ["DOCX", "Black & White", "Single-sided"],
    submittedFrom: "System Refund",
    printedAt: "Mar 17, 2024 · 08:24 PM",
    note: "Automatic refund issued after failed print job.",
  },
  {
    id: "job-006",
    date: "2024-03-15",
    dateOrder: 20240315,
    printerName: "Library-2F-HP",
    documentName: "assignment_1.pdf",
    pages: 6,
    cost: 0.6,
    status: "Printed",
    attributes: ["PDF", "Black & White", "Duplex"],
    submittedFrom: "Web Print",
    printedAt: "Mar 15, 2024 · 01:16 PM",
  },
];
