// export type PrintJobStatus = "Queued";

// export type PrintReleaseItem = {
//   id: string;
//   jobId: string;
//   userName: string;
//   userEmail: string;
//   documentName: string;
//   printerName: string;
//   pages: number;
//   options: string[];
//   status: PrintJobStatus;
//   submittedAt: string;
// };

// export type PrintReleaseSortKey =
//   | "jobId"
//   | "userName"
//   | "documentName"
//   | "printerName"
//   | "status";

// export const printReleaseData: PrintReleaseItem[] = [
//   {
//     id: "job-0042",
//     jobId: "JOB-0042",
//     userName: "Sara Mahmoud",
//     userEmail: "sara@uni.edu.sa",
//     documentName: "Research_Paper.docx",
//     printerName: "Canon C5535i",
//     pages: 30,
//     options: ["Color", "x3"],
//     status: "Queued",
//     submittedAt: "2026-03-16 09:35",
//   },
//   {
//     id: "job-0043",
//     jobId: "JOB-0043",
//     userName: "Khalid Nasser",
//     userEmail: "khalid@uni.edu.sa",
//     documentName: "Assignment_2.pdf",
//     printerName: "HP LaserJet 402",
//     pages: 5,
//     options: [],
//     status: "Queued",
//     submittedAt: "2026-03-16 10:01",
//   },
//   {
//     id: "job-0044",
//     jobId: "JOB-0044",
//     userName: "Noura Al-Harbi",
//     userEmail: "noura@uni.edu.sa",
//     documentName: "Lab_Report_Final.pdf",
//     printerName: "Canon C3530i",
//     pages: 36,
//     options: ["Color", "Duplex", "x2"],
//     status: "Queued",
//     submittedAt: "2026-03-16 10:22",
//   },
//   {
//     id: "job-0045",
//     jobId: "JOB-0045",
//     userName: "Omar Saleh",
//     userEmail: "omar@uni.edu.sa",
//     documentName: "Presentation_Slides.pptx",
//     printerName: "Xerox 7855",
//     pages: 32,
//     options: ["Color"],
//     status: "Queued",
//     submittedAt: "2026-03-16 10:47",
//   },
// ];

// export const printReleaseColumns: {
//   key: PrintReleaseSortKey;
//   label: string;
//   sortable: boolean;
// }[] = [
//   { key: "jobId", label: "Job ID", sortable: true },
//   { key: "userName", label: "User", sortable: true },
//   { key: "documentName", label: "Document", sortable: true },
//   { key: "printerName", label: "Printer", sortable: true },
//   { key: "status", label: "Status", sortable: true },
// ];

// ========new========
export type PrintJobStatus = "Queued";

export type PrintReleaseItem = {
  id: string;
  jobId: string;
  userName: string;
  userEmail: string;
  documentName: string;
  printerName: string;
  pages: number;
  options: string[];
  status: PrintJobStatus;
  submittedAt: string;
};

export type PrintReleaseSortKey =
  | "jobId"
  | "userName"
  | "documentName"
  | "printerName"
  | "status";

export const printReleaseData: PrintReleaseItem[] = [
  {
    id: "job-0042",
    jobId: "JOB-0042",
    userName: "Sara Mahmoud",
    userEmail: "sara@uni.edu.sa",
    documentName: "Research_Paper.docx",
    printerName: "Canon C5535i",
    pages: 30,
    options: ["Color", "x3"],
    status: "Queued",
    submittedAt: "2026-03-16 09:35",
  },
  {
    id: "job-0043",
    jobId: "JOB-0043",
    userName: "Khalid Nasser",
    userEmail: "khalid@uni.edu.sa",
    documentName: "Assignment_2.pdf",
    printerName: "HP LaserJet 402",
    pages: 5,
    options: [],
    status: "Queued",
    submittedAt: "2026-03-16 10:01",
  },
  {
    id: "job-0044",
    jobId: "JOB-0044",
    userName: "Noura Al-Harbi",
    userEmail: "noura@uni.edu.sa",
    documentName: "Lab_Report_Final.pdf",
    printerName: "Canon C3530i",
    pages: 36,
    options: ["Color", "Duplex", "x2"],
    status: "Queued",
    submittedAt: "2026-03-16 10:22",
  },
  {
    id: "job-0045",
    jobId: "JOB-0045",
    userName: "Omar Saleh",
    userEmail: "omar@uni.edu.sa",
    documentName: "Presentation_Slides.pptx",
    printerName: "Xerox 7855",
    pages: 32,
    options: ["Color"],
    status: "Queued",
    submittedAt: "2026-03-16 10:47",
  },
];

export const printReleaseColumns: {
  key: PrintReleaseSortKey;
  label: string;
  sortable: boolean;
}[] = [
  { key: "jobId", label: "Job ID", sortable: true },
  { key: "userName", label: "User", sortable: true },
  { key: "documentName", label: "Document", sortable: true },
  { key: "printerName", label: "Printer", sortable: true },
  { key: "status", label: "Status", sortable: true },
];

export const printReleasePrinterOptions: string[] = [
  "Canon C5535i",
  "HP LaserJet 402",
  "Canon C3530i",
  "Xerox 7855",
  "Secure Release Queue",
  "Faculty Queue",
];

export const printReleaseStatusOptions: PrintJobStatus[] = ["Queued"];

export const printReleaseStatusSortOrder: Record<PrintJobStatus, number> = {
  Queued: 1,
};
