export type PendingReleaseSortKey =
  | "documentName"
  | "printerName"
  | "pages"
  | "cost"
  | "submittedAt"
  | "readinessPercent"
  | "releaseCode";

export type PendingReleaseJob = {
  id: string;
  documentName: string;
  printerName: string;
  pages: number;
  cost: number;
  submittedAt: string;
  submittedMinutesAgo: number;
  clientSource: string;
  fileType: string;
  printMode: string;
  estimatedReady: string;
  readinessPercent: number;
  releaseCode: string;
  releaseCodeExpiry?: string | null;
};

export const pendingReleaseQuota = 24.5;

export const pendingReleaseTableColumns: {
  key: PendingReleaseSortKey;
  label: string;
  sortable: boolean;
}[] = [
  { key: "documentName", label: "Document", sortable: true },
  { key: "printerName", label: "Printer", sortable: true },
  { key: "pages", label: "Pages", sortable: true },
  { key: "cost", label: "Cost", sortable: true },
  { key: "releaseCode", label: "Release Code", sortable: true },
  { key: "readinessPercent", label: "Ready", sortable: true },
  { key: "submittedAt", label: "Submitted", sortable: true },
];

export const pendingReleaseJobs: PendingReleaseJob[] = [
  {
    id: "job-001",
    documentName: "thesis_final_v3.pdf",
    printerName: "Library-2F-HP",
    pages: 24,
    cost: 2.4,
    submittedAt: "2 min ago",
    submittedMinutesAgo: 2,
    clientSource: "Web Print",
    fileType: "PDF",
    printMode: "Black & White · Duplex",
    estimatedReady: "Ready now",
    readinessPercent: 100,
    releaseCode: "482913",
  },
  {
    id: "job-002",
    documentName: "lecture_notes_ch5.docx",
    printerName: "Lab-3F-Canon",
    pages: 8,
    cost: 0.8,
    submittedAt: "15 min ago",
    submittedMinutesAgo: 15,
    clientSource: "Windows Client",
    fileType: "DOCX",
    printMode: "Black & White · Single-sided",
    estimatedReady: "Ready now",
    readinessPercent: 100,
    releaseCode: "719204",
  },
  {
    id: "job-003",
    documentName: "assignment_math.pdf",
    printerName: "Library-2F-HP",
    pages: 4,
    cost: 0.4,
    submittedAt: "1 hr ago",
    submittedMinutesAgo: 60,
    clientSource: "Web Print",
    fileType: "PDF",
    printMode: "Color · Single-sided",
    estimatedReady: "Syncing to printer",
    readinessPercent: 82,
    releaseCode: "305881",
  },
];
