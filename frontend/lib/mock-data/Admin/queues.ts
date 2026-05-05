// import type { StatusTone } from "@/components/ui/badge/StatusBadge";
// import {
//   RiDeleteBin6Line,
//   RiFileList3Line,
//   RiLock2Line,
//   RiPrinterLine,
//   RiShieldUserLine,
// } from "react-icons/ri";
// import type { IconType } from "react-icons";

// export type QueueStatus = "Active" | "Inactive" | "Disabled";
// export type QueueType =
//   | "Secure Release"
//   | "Department-based"
//   | "Faculty"
//   | "General";

// export type QueueSortKey =
//   | "name"
//   | "type"
//   | "assignedPrinters"
//   | "allowedGroups"
//   | "status"
//   | "pendingJobs"
//   | "retentionHours"
//   | "secureRelease";

// export type QueueModalTab =
//   | "basic-info"
//   | "printers"
//   | "access-rules"
//   | "release-settings"
//   | "retention";

// export type QueuePrinterOption = {
//   id: string;
//   name: string;
//   location: string;
// };

// export type QueueTableItem = {
//   id: string;
//   name: string;
//   description: string;
//   type: QueueType;
//   status: QueueStatus;

//   assignedPrinters: string[];
//   defaultPrinter: string;

//   allowedRoles: string[];
//   allowedGroups: string[];
//   allowedDepartments: string[];
//   restrictedUsers: string[];

//   pendingJobs: number;
//   retentionHours: number;

//   secureRelease: boolean;
//   manualReleaseRequired: boolean;
//   allowReleaseAllJobs: boolean;
//   requirePrinterAuthentication: boolean;
//   autoDeleteExpiredJobs: boolean;
// };

// export type QueueStatusMeta = {
//   label: QueueStatus;
//   tone: StatusTone;
// };

// export type QueueTypeMeta = {
//   label: QueueType;
//   className: string;
// };

// export type QueueColumn = {
//   key: QueueSortKey;
//   label: string;
//   sortable: boolean;
// };

// export type QueueTabOption = {
//   value: QueueModalTab;
//   label: string;
//   icon: IconType;
// };

// export const queueStatusMeta: Record<QueueStatus, QueueStatusMeta> = {
//   Active: { label: "Active", tone: "success" },
//   Inactive: { label: "Inactive", tone: "inactive" },
//   Disabled: { label: "Disabled", tone: "danger" },
// };

// export const queueTypeMeta: Record<QueueType, QueueTypeMeta> = {
//   "Secure Release": {
//     label: "Secure Release",
//     className: "bg-brand-100 text-brand-600",
//   },
//   "Department-based": {
//     label: "Department-based",
//     className: "bg-warning-50 text-warning-600",
//   },
//   Faculty: {
//     label: "Faculty",
//     className: "bg-[#efe7ff] text-[#7c3aed]",
//   },
//   General: {
//     label: "General",
//     className: "bg-[var(--surface-2)] text-[var(--paragraph)]",
//   },
// };

// export const queueTableColumns: QueueColumn[] = [
//   { key: "name", label: "Queue Name", sortable: true },
//   { key: "type", label: "Type", sortable: true },
//   { key: "assignedPrinters", label: "Assigned Printers", sortable: true },
//   { key: "allowedGroups", label: "Allowed Groups", sortable: true },
//   { key: "status", label: "Status", sortable: true },
//   { key: "pendingJobs", label: "Pending Jobs", sortable: true },
//   { key: "retentionHours", label: "Retention", sortable: true },
//   { key: "secureRelease", label: "Secure Release", sortable: true },
// ];

// export const queueModalTabs: QueueTabOption[] = [
//   { value: "basic-info", label: "Basic Info", icon: RiFileList3Line },
//   { value: "printers", label: "Printers", icon: RiPrinterLine },
//   { value: "access-rules", label: "Access Rules", icon: RiShieldUserLine },
//   {
//     value: "release-settings",
//     label: "Release Settings",
//     icon: RiLock2Line,
//   },
//   { value: "retention", label: "Retention", icon: RiDeleteBin6Line },
// ];

// export const queuePrinterOptions: QueuePrinterOption[] = [
//   { id: "printer-1", name: "HP LaserJet 401", location: "Building 22, Lab 1" },
//   { id: "printer-2", name: "Canon C5535i", location: "Building 22, Lab 2" },
//   { id: "printer-3", name: "Canon C3530i", location: "Library, Floor 1" },
//   {
//     id: "printer-4",
//     name: "HP LaserJet 402",
//     location: "Building 23, Floor 2",
//   },
//   { id: "printer-5", name: "Xerox 7855", location: "Engineering Hall, Room 4" },
//   {
//     id: "printer-6",
//     name: "Ricoh MP 5002",
//     location: "Admin Building, Floor 1",
//   },
// ];

// export const queueRoleOptions = [
//   "Faculty",
//   "Admin",
//   "Student",
//   "Researcher",
//   "HR",
//   "Staff",
// ];

// export const queueGroupOptions = [
//   "Faculty Group",
//   "Engineering Group",
//   "Student Group",
//   "Admin Group",
//   "HR Group",
//   "CS Research Group",
//   "Library Visitors",
// ];

// export const queueDepartmentOptions = [
//   "Computer Science",
//   "Engineering",
//   "Administration",
//   "Business",
//   "Library",
// ];

// export const queueRestrictedUserSuggestions = [
//   "user@example.com",
//   "temp.user@kfupm.edu.sa",
//   "lab.assistant@kfupm.edu.sa",
// ];

// export const queueFormDefaults: QueueTableItem = {
//   id: "",
//   name: "",
//   description: "",
//   type: "Secure Release",
//   status: "Active",

//   assignedPrinters: [],
//   defaultPrinter: "",

//   allowedRoles: [],
//   allowedGroups: [],
//   allowedDepartments: [],
//   restrictedUsers: [],

//   pendingJobs: 0,
//   retentionHours: 24,

//   secureRelease: true,
//   manualReleaseRequired: false,
//   allowReleaseAllJobs: true,
//   requirePrinterAuthentication: true,
//   autoDeleteExpiredJobs: false,
// };

// export const queuesData: QueueTableItem[] = [
//   {
//     id: "queue-1",
//     name: "Faculty Secure Queue",
//     description: "Secure release queue for faculty members",
//     type: "Secure Release",
//     status: "Active",
//     assignedPrinters: ["HP LaserJet 401", "Canon C5535i"],
//     defaultPrinter: "HP LaserJet 401",
//     allowedRoles: ["Faculty", "Admin"],
//     allowedGroups: ["Faculty Group"],
//     allowedDepartments: ["Computer Science", "Engineering"],
//     restrictedUsers: [],
//     pendingJobs: 7,
//     retentionHours: 24,
//     secureRelease: true,
//     manualReleaseRequired: false,
//     allowReleaseAllJobs: true,
//     requirePrinterAuthentication: true,
//     autoDeleteExpiredJobs: false,
//   },
//   {
//     id: "queue-2",
//     name: "Engineering Department Queue",
//     description: "Daily printing queue for engineering students",
//     type: "Department-based",
//     status: "Active",
//     assignedPrinters: ["HP LaserJet 402", "Xerox 7855"],
//     defaultPrinter: "HP LaserJet 402",
//     allowedRoles: ["Student"],
//     allowedGroups: ["Engineering Group"],
//     allowedDepartments: ["Engineering"],
//     restrictedUsers: [],
//     pendingJobs: 14,
//     retentionHours: 12,
//     secureRelease: false,
//     manualReleaseRequired: false,
//     allowReleaseAllJobs: false,
//     requirePrinterAuthentication: false,
//     autoDeleteExpiredJobs: true,
//   },
//   {
//     id: "queue-3",
//     name: "Library General Queue",
//     description: "Open queue for public library devices",
//     type: "General",
//     status: "Active",
//     assignedPrinters: ["Canon C3530i"],
//     defaultPrinter: "Canon C3530i",
//     allowedRoles: ["Student", "Faculty"],
//     allowedGroups: ["Library Visitors"],
//     allowedDepartments: [],
//     restrictedUsers: [],
//     pendingJobs: 3,
//     retentionHours: 6,
//     secureRelease: false,
//     manualReleaseRequired: false,
//     allowReleaseAllJobs: false,
//     requirePrinterAuthentication: false,
//     autoDeleteExpiredJobs: true,
//   },
//   {
//     id: "queue-4",
//     name: "Admin & Staff Queue",
//     description: "Internal queue for administrative operations",
//     type: "Faculty",
//     status: "Active",
//     assignedPrinters: ["HP LaserJet 401"],
//     defaultPrinter: "HP LaserJet 401",
//     allowedRoles: ["Admin", "HR"],
//     allowedGroups: ["Admin Group", "HR Group"],
//     allowedDepartments: ["Administration"],
//     restrictedUsers: [],
//     pendingJobs: 2,
//     retentionHours: 48,
//     secureRelease: true,
//     manualReleaseRequired: false,
//     allowReleaseAllJobs: true,
//     requirePrinterAuthentication: true,
//     autoDeleteExpiredJobs: false,
//   },
//   {
//     id: "queue-5",
//     name: "CS Research Queue",
//     description: "Restricted queue for research lab printing",
//     type: "Department-based",
//     status: "Disabled",
//     assignedPrinters: ["Xerox 7855", "Canon C5535i"],
//     defaultPrinter: "Xerox 7855",
//     allowedRoles: ["Researcher"],
//     allowedGroups: ["CS Research Group"],
//     allowedDepartments: ["Computer Science"],
//     restrictedUsers: ["temp.user@kfupm.edu.sa"],
//     pendingJobs: 0,
//     retentionHours: 72,
//     secureRelease: true,
//     manualReleaseRequired: true,
//     allowReleaseAllJobs: false,
//     requirePrinterAuthentication: true,
//     autoDeleteExpiredJobs: true,
//   },
//   {
//     id: "queue-6",
//     name: "Student Secure Queue",
//     description: "Secure queue for student shared areas",
//     type: "Secure Release",
//     status: "Inactive",
//     assignedPrinters: ["Ricoh MP 5002", "Canon C3530i"],
//     defaultPrinter: "Ricoh MP 5002",
//     allowedRoles: ["Student"],
//     allowedGroups: ["Student Group"],
//     allowedDepartments: ["Business", "Engineering"],
//     restrictedUsers: [],
//     pendingJobs: 5,
//     retentionHours: 24,
//     secureRelease: true,
//     manualReleaseRequired: false,
//     allowReleaseAllJobs: true,
//     requirePrinterAuthentication: true,
//     autoDeleteExpiredJobs: false,
//   },
// ];

// ======new=======
import type { StatusTone } from "@/components/ui/badge/StatusBadge";
import {
  RiDeleteBin6Line,
  RiFileList3Line,
  RiPrinterLine,
  RiShieldUserLine,
} from "react-icons/ri";
import type { IconType } from "react-icons";

export type QueueStatus = "Active" | "Inactive" | "Disabled";
export type QueueType = "Secure Release" | "Faculty";

export type QueueSortKey =
  | "name"
  | "type"
  | "assignedPrinters"
  | "allowedGroups"
  | "status"
  | "pendingJobs"
  | "retentionHours"
  | "secureRelease";

export type QueueModalTab =
  | "basic-info"
  | "printers"
  | "access-rules"
  | "retention";

export type QueuePrinterOption = {
  id: string;
  name: string;
  location: string;
};

export type QueueTableItem = {
  id: string;
  name: string;
  description: string;
  type: QueueType;
  status: QueueStatus;

  assignedPrinters: string[];
  defaultPrinter: string;

  allowedRoles: string[];
  allowedGroups: string[];
  allowedDepartments: string[];
  restrictedUsers: string[];

  pendingJobs: number;
  retentionHours: number;

  secureRelease: boolean;
  manualReleaseRequired: boolean;
  allowReleaseAllJobs: boolean;
  requirePrinterAuthentication: boolean;
  autoDeleteExpiredJobs: boolean;
};

export type QueueStatusMeta = {
  label: QueueStatus;
  tone: StatusTone;
};

export type QueueTypeMeta = {
  label: QueueType;
  className: string;
};

export type QueueColumn = {
  key: QueueSortKey;
  label: string;
  sortable: boolean;
};

export type QueueTabOption = {
  value: QueueModalTab;
  label: string;
  icon: IconType;
};

export const queueStatusMeta: Record<QueueStatus, QueueStatusMeta> = {
  Active: { label: "Active", tone: "success" },
  Inactive: { label: "Inactive", tone: "inactive" },
  Disabled: { label: "Disabled", tone: "danger" },
};

export const queueTypeMeta: Record<QueueType, QueueTypeMeta> = {
  "Secure Release": {
    label: "Secure Release",
    className:
      "border border-[var(--border)] bg-[var(--surface-2)] text-[var(--paragraph)]",
  },
  Faculty: {
    label: "Faculty",
    className:
      "border border-[var(--border)] bg-[var(--surface-2)] text-[var(--paragraph)]",
  },
};

export const queueTableColumns: QueueColumn[] = [
  { key: "name", label: "Queue Name", sortable: true },
  { key: "type", label: "Type", sortable: true },
  { key: "assignedPrinters", label: "Assigned Printers", sortable: true },
  { key: "allowedGroups", label: "Allowed Groups", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "pendingJobs", label: "Pending Jobs", sortable: true },
  { key: "retentionHours", label: "Retention", sortable: true },
  { key: "secureRelease", label: "Secure Release", sortable: true },
];

export const queueModalTabs: QueueTabOption[] = [
  { value: "basic-info", label: "Basic Info", icon: RiFileList3Line },
  { value: "printers", label: "Printers", icon: RiPrinterLine },
  { value: "access-rules", label: "Access Rules", icon: RiShieldUserLine },
  { value: "retention", label: "Retention", icon: RiDeleteBin6Line },
];

export const queuePrinterOptions: QueuePrinterOption[] = [
  { id: "printer-1", name: "HP LaserJet 401", location: "Building 22, Lab 1" },
  { id: "printer-2", name: "Canon C5535i", location: "Building 22, Lab 2" },
  { id: "printer-3", name: "Canon C3530i", location: "Library, Floor 1" },
  {
    id: "printer-4",
    name: "HP LaserJet 402",
    location: "Building 23, Floor 2",
  },
  {
    id: "printer-5",
    name: "Xerox 7855",
    location: "Engineering Hall, Room 4",
  },
  {
    id: "printer-6",
    name: "Ricoh MP 5002",
    location: "Admin Building, Floor 1",
  },
];

export const queueRoleOptions = [
  "Faculty",
  "Admin",
  "Student",
  "Researcher",
  "HR",
  "Staff",
];

export const queueGroupOptions = [
  "Faculty Group",
  "Engineering Group",
  "Student Group",
  "Admin Group",
  "HR Group",
  "CS Research Group",
  "Library Visitors",
];

export const queueDepartmentOptions = [
  "Computer Science",
  "Engineering",
  "Administration",
  "Business",
  "Library",
];

export const queueRestrictedUserSuggestions = [
  "user@example.com",
  "temp.user@kfupm.edu.sa",
  "lab.assistant@kfupm.edu.sa",
];

export const queueFormDefaults: QueueTableItem = {
  id: "",
  name: "",
  description: "",
  type: "Secure Release",
  status: "Active",

  assignedPrinters: [],
  defaultPrinter: "",

  allowedRoles: [],
  allowedGroups: [],
  allowedDepartments: [],
  restrictedUsers: [],

  pendingJobs: 0,
  retentionHours: 24,

  secureRelease: true,
  manualReleaseRequired: false,
  allowReleaseAllJobs: true,
  requirePrinterAuthentication: true,
  autoDeleteExpiredJobs: true,
};

export const queuesData: QueueTableItem[] = [
  {
    id: "queue-1",
    name: "Faculty Secure Queue",
    description: "Secure release queue for faculty members",
    type: "Secure Release",
    status: "Active",
    assignedPrinters: ["HP LaserJet 401", "Canon C5535i"],
    defaultPrinter: "HP LaserJet 401",
    allowedRoles: ["Faculty", "Admin"],
    allowedGroups: ["Faculty Group"],
    allowedDepartments: ["Computer Science", "Engineering"],
    restrictedUsers: [],
    pendingJobs: 7,
    retentionHours: 24,
    secureRelease: true,
    manualReleaseRequired: false,
    allowReleaseAllJobs: true,
    requirePrinterAuthentication: true,
    autoDeleteExpiredJobs: true,
  },
  {
    id: "queue-2",
    name: "Engineering Department Queue",
    description: "Daily printing queue for engineering students",
    type: "Faculty",
    status: "Active",
    assignedPrinters: ["HP LaserJet 402", "Xerox 7855"],
    defaultPrinter: "HP LaserJet 402",
    allowedRoles: ["Student"],
    allowedGroups: ["Engineering Group"],
    allowedDepartments: ["Engineering"],
    restrictedUsers: [],
    pendingJobs: 14,
    retentionHours: 12,
    secureRelease: false,
    manualReleaseRequired: false,
    allowReleaseAllJobs: false,
    requirePrinterAuthentication: false,
    autoDeleteExpiredJobs: true,
  },
  {
    id: "queue-3",
    name: "Library General Queue",
    description: "Open queue for public library devices",
    type: "Faculty",
    status: "Active",
    assignedPrinters: ["Canon C3530i"],
    defaultPrinter: "Canon C3530i",
    allowedRoles: ["Student", "Faculty"],
    allowedGroups: ["Library Visitors"],
    allowedDepartments: [],
    restrictedUsers: [],
    pendingJobs: 3,
    retentionHours: 6,
    secureRelease: false,
    manualReleaseRequired: false,
    allowReleaseAllJobs: false,
    requirePrinterAuthentication: false,
    autoDeleteExpiredJobs: true,
  },
  {
    id: "queue-4",
    name: "Admin & Staff Queue",
    description: "Internal queue for administrative operations",
    type: "Faculty",
    status: "Active",
    assignedPrinters: ["HP LaserJet 401"],
    defaultPrinter: "HP LaserJet 401",
    allowedRoles: ["Admin", "HR"],
    allowedGroups: ["Admin Group", "HR Group"],
    allowedDepartments: ["Administration"],
    restrictedUsers: [],
    pendingJobs: 2,
    retentionHours: 48,
    secureRelease: true,
    manualReleaseRequired: false,
    allowReleaseAllJobs: true,
    requirePrinterAuthentication: true,
    autoDeleteExpiredJobs: true,
  },
  {
    id: "queue-5",
    name: "CS Research Queue",
    description: "Restricted queue for research lab printing",
    type: "Secure Release",
    status: "Disabled",
    assignedPrinters: ["Xerox 7855", "Canon C5535i"],
    defaultPrinter: "Xerox 7855",
    allowedRoles: ["Researcher"],
    allowedGroups: ["CS Research Group"],
    allowedDepartments: ["Computer Science"],
    restrictedUsers: ["temp.user@kfupm.edu.sa"],
    pendingJobs: 0,
    retentionHours: 72,
    secureRelease: true,
    manualReleaseRequired: true,
    allowReleaseAllJobs: false,
    requirePrinterAuthentication: true,
    autoDeleteExpiredJobs: true,
  },
  {
    id: "queue-6",
    name: "Student Secure Queue",
    description: "Secure queue for student shared areas",
    type: "Secure Release",
    status: "Inactive",
    assignedPrinters: ["Ricoh MP 5002", "Canon C3530i"],
    defaultPrinter: "Ricoh MP 5002",
    allowedRoles: ["Student"],
    allowedGroups: ["Student Group"],
    allowedDepartments: ["Business", "Engineering"],
    restrictedUsers: [],
    pendingJobs: 5,
    retentionHours: 24,
    secureRelease: true,
    manualReleaseRequired: false,
    allowReleaseAllJobs: true,
    requirePrinterAuthentication: true,
    autoDeleteExpiredJobs: true,
  },
];
