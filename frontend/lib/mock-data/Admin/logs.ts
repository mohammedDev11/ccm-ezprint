// export type ActivityLogType = "Print Job" | "System" | "Device" | "Security";

// export type ActivityLogStatus = "Success" | "Failed" | "Warning" | "Info";

// export type ActivityLogItem = {
//   id: string;
//   time: string;
//   type: ActivityLogType;
//   title: string;
//   description: string;
//   user: string;
//   printer: string;
//   pages: number | null;
//   status: ActivityLogStatus;

//   documentName?: string;
//   deviceIp?: string;
//   queueName?: string;
//   serialNumber?: string;
//   location?: string;
//   resolutionNote?: string;
// };

// export type ActivityLogSortKey =
//   | "time"
//   | "type"
//   | "title"
//   | "user"
//   | "printer"
//   | "pages"
//   | "status";

// export const activityLogColumns: {
//   key: ActivityLogSortKey;
//   label: string;
//   sortable: boolean;
// }[] = [
//   { key: "time", label: "Time", sortable: true },
//   { key: "type", label: "Type", sortable: true },
//   { key: "title", label: "Event", sortable: true },
//   { key: "user", label: "User", sortable: true },
//   { key: "printer", label: "Printer", sortable: true },
//   { key: "pages", label: "Pages", sortable: true },
//   { key: "status", label: "Status", sortable: true },
// ];

// export const activityLogTypeOptions = [
//   { value: "all", label: "All Types" },
//   { value: "Print Job", label: "Print Job" },
//   { value: "System", label: "System" },
//   { value: "Device", label: "Device" },
//   { value: "Security", label: "Security" },
// ] as const;

// export const activityLogStatusOptions = [
//   { value: "all", label: "All Statuses" },
//   { value: "Success", label: "Success" },
//   { value: "Failed", label: "Failed" },
//   { value: "Warning", label: "Warning" },
//   { value: "Info", label: "Info" },
// ] as const;

// export type ActivityLogTypeFilter =
//   (typeof activityLogTypeOptions)[number]["value"];

// export type ActivityLogStatusFilter =
//   (typeof activityLogStatusOptions)[number]["value"];

// export const activityLogsData: ActivityLogItem[] = [
//   {
//     id: "log-001",
//     time: "Mar 17, 06:49 PM",
//     type: "Print Job",
//     title: "Document Printed",
//     description: "Thesis_Final.pdf",
//     user: "202300112",
//     printer: "HP LaserJet - Library",
//     pages: 45,
//     status: "Success",
//     documentName: "Thesis_Final.pdf",
//     deviceIp: "10.10.40.10",
//     queueName: "library-room-233",
//     serialNumber: "HP-LIB-001",
//     location: "Library, Room 233",
//     resolutionNote: "Job completed successfully.",
//   },
//   {
//     id: "log-002",
//     time: "Mar 17, 06:49 PM",
//     type: "Print Job",
//     title: "Print Failed",
//     description: "Report.docx - Paper jam occurred",
//     user: "a.almalki",
//     printer: "Canon - Room 201",
//     pages: 0,
//     status: "Failed",
//     documentName: "Report.docx",
//     deviceIp: "10.10.22.52",
//     queueName: "canon-room-201",
//     serialNumber: "CAN-201-002",
//     location: "Building 22, Room 201",
//     resolutionNote: "Paper jam detected before print completion.",
//   },
//   {
//     id: "log-003",
//     time: "Mar 17, 06:49 PM",
//     type: "System",
//     title: "User Login",
//     description: "Admin logged into the system",
//     user: "admin",
//     printer: "—",
//     pages: null,
//     status: "Info",
//     deviceIp: "10.10.10.5",
//     queueName: "—",
//     serialNumber: "—",
//     location: "Admin Console",
//     resolutionNote: "Authentication succeeded.",
//   },
//   {
//     id: "log-004",
//     time: "Mar 17, 06:49 PM",
//     type: "Print Job",
//     title: "Document Printed",
//     description: "Assignment_3.pdf",
//     user: "202300245",
//     printer: "Epson - Main Hall",
//     pages: 12,
//     status: "Success",
//     documentName: "Assignment_3.pdf",
//     deviceIp: "10.10.50.17",
//     queueName: "mainhall-epson",
//     serialNumber: "EPS-MH-003",
//     location: "Main Hall",
//     resolutionNote: "Printed in grayscale.",
//   },
//   {
//     id: "log-005",
//     time: "Mar 17, 06:49 PM",
//     type: "Device",
//     title: "Printer Offline",
//     description: "Canon - Room 201 went offline",
//     user: "—",
//     printer: "Canon - Room 201",
//     pages: null,
//     status: "Warning",
//     deviceIp: "10.10.22.52",
//     queueName: "canon-room-201",
//     serialNumber: "CAN-201-002",
//     location: "Building 22, Room 201",
//     resolutionNote: "Connection lost with device.",
//   },
//   {
//     id: "log-006",
//     time: "Mar 17, 06:49 PM",
//     type: "Print Job",
//     title: "Document Printed",
//     description: "Lab_Report.pdf",
//     user: "a.alshammari",
//     printer: "HP LaserJet - Library",
//     pages: 8,
//     status: "Success",
//     documentName: "Lab_Report.pdf",
//     deviceIp: "10.10.40.10",
//     queueName: "library-room-233",
//     serialNumber: "HP-LIB-001",
//     location: "Library, Room 233",
//     resolutionNote: "Printed successfully.",
//   },
//   {
//     id: "log-007",
//     time: "Mar 17, 06:49 PM",
//     type: "Device",
//     title: "Low Toner Alert",
//     description: "HP LaserJet - Library toner below 10%",
//     user: "—",
//     printer: "HP LaserJet - Library",
//     pages: null,
//     status: "Warning",
//     deviceIp: "10.10.40.10",
//     queueName: "library-room-233",
//     serialNumber: "HP-LIB-001",
//     location: "Library, Room 233",
//     resolutionNote: "Toner replacement recommended soon.",
//   },
//   {
//     id: "log-008",
//     time: "Mar 17, 06:49 PM",
//     type: "Print Job",
//     title: "Print Failed",
//     description: "Project.pptx - Connection lost",
//     user: "202301876",
//     printer: "Epson - Main Hall",
//     pages: 0,
//     status: "Failed",
//     documentName: "Project.pptx",
//     deviceIp: "10.10.50.17",
//     queueName: "mainhall-epson",
//     serialNumber: "EPS-MH-003",
//     location: "Main Hall",
//     resolutionNote: "Printer connection dropped during job dispatch.",
//   },
//   {
//     id: "log-009",
//     time: "Mar 17, 06:52 PM",
//     type: "Security",
//     title: "Unauthorized Access Attempt",
//     description: "Invalid release PIN entered 3 times",
//     user: "unknown",
//     printer: "Ricoh - Room 403",
//     pages: null,
//     status: "Info",
//     deviceIp: "10.10.24.61",
//     queueName: "ricoh-room-403",
//     serialNumber: "RIC-403-004",
//     location: "Building 24, Room 403",
//     resolutionNote: "Attempt blocked and logged.",
//   },
//   {
//     id: "log-010",
//     time: "Mar 17, 07:01 PM",
//     type: "System",
//     title: "Balance Updated",
//     description: "Quota manager added 15 SAR credit",
//     user: "quota.manager",
//     printer: "—",
//     pages: null,
//     status: "Info",
//     deviceIp: "10.10.10.8",
//     queueName: "—",
//     serialNumber: "—",
//     location: "Admin Console",
//     resolutionNote: "Balance adjustment recorded.",
//   },
//   {
//     id: "log-011",
//     time: "Mar 17, 07:03 PM",
//     type: "Device",
//     title: "Paper Refilled",
//     description: "Paper tray refilled to 100%",
//     user: "tech.staff",
//     printer: "Canon - Room 201",
//     pages: null,
//     status: "Success",
//     deviceIp: "10.10.22.52",
//     queueName: "canon-room-201",
//     serialNumber: "CAN-201-002",
//     location: "Building 22, Room 201",
//     resolutionNote: "Device restored to normal operation.",
//   },
//   {
//     id: "log-012",
//     time: "Mar 17, 07:05 PM",
//     type: "Print Job",
//     title: "Refund Issued",
//     description: "Failed job refunded automatically",
//     user: "202301876",
//     printer: "Epson - Main Hall",
//     pages: 0,
//     status: "Success",
//     documentName: "Project.pptx",
//     deviceIp: "10.10.50.17",
//     queueName: "mainhall-epson",
//     serialNumber: "EPS-MH-003",
//     location: "Main Hall",
//     resolutionNote: "User credited after failed job.",
//   },
// ];

// =============NEW================
// logs.ts

export type ActivityLogType = "Print Job" | "System" | "Device" | "Security";

export type ActivityLogStatus = "Success" | "Failed" | "Warning" | "Info";

export type ActivityLogItem = {
  id: string;
  time: string;
  type: ActivityLogType;
  title: string;
  description: string;
  user: string;
  printer: string;
  pages: number | null;
  status: ActivityLogStatus;

  documentName?: string;
  deviceIp?: string;
  queueName?: string;
  serialNumber?: string;
  location?: string;
  resolutionNote?: string;
};

export type ActivityLogSortKey =
  | "time"
  | "type"
  | "title"
  | "user"
  | "printer"
  | "pages"
  | "status";

export const activityLogColumns: {
  key: ActivityLogSortKey;
  label: string;
  sortable: boolean;
}[] = [
  { key: "time", label: "Time", sortable: true },
  { key: "type", label: "Type", sortable: true },
  { key: "title", label: "Event", sortable: true },
  { key: "user", label: "User", sortable: true },
  { key: "printer", label: "Printer", sortable: true },
  { key: "pages", label: "Pages", sortable: true },
  { key: "status", label: "Status", sortable: true },
];

export const activityLogTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "Print Job", label: "Print Job" },
  { value: "System", label: "System" },
  { value: "Device", label: "Device" },
  { value: "Security", label: "Security" },
] as const;

export const activityLogStatusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "Success", label: "Success" },
  { value: "Failed", label: "Failed" },
  { value: "Warning", label: "Warning" },
  { value: "Info", label: "Info" },
] as const;

export type ActivityLogTypeFilter =
  (typeof activityLogTypeOptions)[number]["value"];

export type ActivityLogStatusFilter =
  (typeof activityLogStatusOptions)[number]["value"];

export const activityLogStatusSortOrder: Record<ActivityLogStatus, number> = {
  Success: 1,
  Info: 2,
  Warning: 3,
  Failed: 4,
};

export const activityLogsData: ActivityLogItem[] = [
  {
    id: "log-001",
    time: "Mar 17, 06:49 PM",
    type: "Print Job",
    title: "Document Printed",
    description: "Thesis_Final.pdf",
    user: "202300112",
    printer: "HP LaserJet - Library",
    pages: 45,
    status: "Success",
    documentName: "Thesis_Final.pdf",
    deviceIp: "10.10.40.10",
    queueName: "library-room-233",
    serialNumber: "HP-LIB-001",
    location: "Library, Room 233",
    resolutionNote: "Job completed successfully.",
  },
  {
    id: "log-002",
    time: "Mar 17, 06:49 PM",
    type: "Print Job",
    title: "Print Failed",
    description: "Report.docx - Paper jam occurred",
    user: "a.almalki",
    printer: "Canon - Room 201",
    pages: 0,
    status: "Failed",
    documentName: "Report.docx",
    deviceIp: "10.10.22.52",
    queueName: "canon-room-201",
    serialNumber: "CAN-201-002",
    location: "Building 22, Room 201",
    resolutionNote: "Paper jam detected before print completion.",
  },
  {
    id: "log-003",
    time: "Mar 17, 06:49 PM",
    type: "System",
    title: "User Login",
    description: "Admin logged into the system",
    user: "admin",
    printer: "—",
    pages: null,
    status: "Info",
    deviceIp: "10.10.10.5",
    queueName: "—",
    serialNumber: "—",
    location: "Admin Console",
    resolutionNote: "Authentication succeeded.",
  },
  {
    id: "log-004",
    time: "Mar 17, 06:49 PM",
    type: "Print Job",
    title: "Document Printed",
    description: "Assignment_3.pdf",
    user: "202300245",
    printer: "Epson - Main Hall",
    pages: 12,
    status: "Success",
    documentName: "Assignment_3.pdf",
    deviceIp: "10.10.50.17",
    queueName: "mainhall-epson",
    serialNumber: "EPS-MH-003",
    location: "Main Hall",
    resolutionNote: "Printed in grayscale.",
  },
  {
    id: "log-005",
    time: "Mar 17, 06:49 PM",
    type: "Device",
    title: "Printer Offline",
    description: "Canon - Room 201 went offline",
    user: "—",
    printer: "Canon - Room 201",
    pages: null,
    status: "Warning",
    deviceIp: "10.10.22.52",
    queueName: "canon-room-201",
    serialNumber: "CAN-201-002",
    location: "Building 22, Room 201",
    resolutionNote: "Connection lost with device.",
  },
  {
    id: "log-006",
    time: "Mar 17, 06:49 PM",
    type: "Print Job",
    title: "Document Printed",
    description: "Lab_Report.pdf",
    user: "a.alshammari",
    printer: "HP LaserJet - Library",
    pages: 8,
    status: "Success",
    documentName: "Lab_Report.pdf",
    deviceIp: "10.10.40.10",
    queueName: "library-room-233",
    serialNumber: "HP-LIB-001",
    location: "Library, Room 233",
    resolutionNote: "Printed successfully.",
  },
  {
    id: "log-007",
    time: "Mar 17, 06:49 PM",
    type: "Device",
    title: "Low Toner Alert",
    description: "HP LaserJet - Library toner below 10%",
    user: "—",
    printer: "HP LaserJet - Library",
    pages: null,
    status: "Warning",
    deviceIp: "10.10.40.10",
    queueName: "library-room-233",
    serialNumber: "HP-LIB-001",
    location: "Library, Room 233",
    resolutionNote: "Toner replacement recommended soon.",
  },
  {
    id: "log-008",
    time: "Mar 17, 06:49 PM",
    type: "Print Job",
    title: "Print Failed",
    description: "Project.pptx - Connection lost",
    user: "202301876",
    printer: "Epson - Main Hall",
    pages: 0,
    status: "Failed",
    documentName: "Project.pptx",
    deviceIp: "10.10.50.17",
    queueName: "mainhall-epson",
    serialNumber: "EPS-MH-003",
    location: "Main Hall",
    resolutionNote: "Printer connection dropped during job dispatch.",
  },
  {
    id: "log-009",
    time: "Mar 17, 06:52 PM",
    type: "Security",
    title: "Unauthorized Access Attempt",
    description: "Invalid release PIN entered 3 times",
    user: "unknown",
    printer: "Ricoh - Room 403",
    pages: null,
    status: "Info",
    deviceIp: "10.10.24.61",
    queueName: "ricoh-room-403",
    serialNumber: "RIC-403-004",
    location: "Building 24, Room 403",
    resolutionNote: "Attempt blocked and logged.",
  },
  {
    id: "log-010",
    time: "Mar 17, 07:01 PM",
    type: "System",
    title: "Balance Updated",
    description: "Quota manager added 15 SAR credit",
    user: "quota.manager",
    printer: "—",
    pages: null,
    status: "Info",
    deviceIp: "10.10.10.8",
    queueName: "—",
    serialNumber: "—",
    location: "Admin Console",
    resolutionNote: "Balance adjustment recorded.",
  },
  {
    id: "log-011",
    time: "Mar 17, 07:03 PM",
    type: "Device",
    title: "Paper Refilled",
    description: "Paper tray refilled to 100%",
    user: "tech.staff",
    printer: "Canon - Room 201",
    pages: null,
    status: "Success",
    deviceIp: "10.10.22.52",
    queueName: "canon-room-201",
    serialNumber: "CAN-201-002",
    location: "Building 22, Room 201",
    resolutionNote: "Device restored to normal operation.",
  },
  {
    id: "log-012",
    time: "Mar 17, 07:05 PM",
    type: "Print Job",
    title: "Refund Issued",
    description: "Failed job refunded automatically",
    user: "202301876",
    printer: "Epson - Main Hall",
    pages: 0,
    status: "Success",
    documentName: "Project.pptx",
    deviceIp: "10.10.50.17",
    queueName: "mainhall-epson",
    serialNumber: "EPS-MH-003",
    location: "Main Hall",
    resolutionNote: "User credited after failed job.",
  },
];
