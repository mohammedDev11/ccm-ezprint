// import type { ReactNode } from "react";
// import type { StatusTone } from "@/components/ui/badge/StatusBadge";

// export type SharedAccountStatus = "Active" | "Suspended" | "Inactive";

// export type SharedAccountItem = {
//   id: string;
//   name: string;
//   department: string;
//   quota: number;
//   pagesUsedPercent: number;
//   status: SharedAccountStatus;
// };

// export type SharedAccountSortKey =
//   | "name"
//   | "department"
//   | "quota"
//   | "pagesUsedPercent"
//   | "status";

// export type SharedAccountFilterValue =
//   | "all"
//   | "active"
//   | "suspended"
//   | "inactive"
//   | "high-usage";

// export type SharedAccountBulkStatusAction = "Active" | "Inactive" | "Suspended";

// export type SharedAccountStatusMeta = {
//   label: string;
//   tone: StatusTone;
// };

// export const sharedAccountsTableColumns: {
//   key: SharedAccountSortKey;
//   label: string;
//   sortable: boolean;
// }[] = [
//   { key: "name", label: "Name", sortable: true },
//   { key: "department", label: "Department", sortable: true },
//   { key: "quota", label: "Quota", sortable: true },
//   { key: "pagesUsedPercent", label: "Pages Used", sortable: true },
//   { key: "status", label: "Status", sortable: true },
// ];

// export const sharedAccountStatusSortOrder: Record<SharedAccountStatus, number> =
//   {
//     Active: 0,
//     Suspended: 1,
//     Inactive: 2,
//   };

// export const sharedAccountFilterOptions: {
//   value: SharedAccountFilterValue;
//   label: string;
// }[] = [
//   { value: "all", label: "All Accounts" },
//   { value: "active", label: "Active" },
//   { value: "suspended", label: "Suspended" },
//   { value: "inactive", label: "Inactive" },
//   { value: "high-usage", label: "High Usage" },
// ];

// export const sharedAccountStatusMeta: Record<
//   SharedAccountStatus,
//   SharedAccountStatusMeta
// > = {
//   Active: {
//     label: "Active",
//     tone: "success",
//   },
//   Suspended: {
//     label: "Suspended",
//     tone: "danger",
//   },
//   Inactive: {
//     label: "Inactive",
//     tone: "inactive",
//   },
// };

// export const sharedAccountsData: SharedAccountItem[] = [
//   {
//     id: "acc-001",
//     name: "Faculty of Engineering",
//     department: "Engineering",
//     quota: 5000,
//     pagesUsedPercent: 76,
//     status: "Active",
//   },
//   {
//     id: "acc-002",
//     name: "Faculty of CS",
//     department: "Computer Science",
//     quota: 4000,
//     pagesUsedPercent: 99,
//     status: "Active",
//   },
//   {
//     id: "acc-003",
//     name: "Library Services",
//     department: "Administration",
//     quota: 10000,
//     pagesUsedPercent: 41,
//     status: "Active",
//   },
//   {
//     id: "acc-004",
//     name: "Student Affairs",
//     department: "Administration",
//     quota: 2000,
//     pagesUsedPercent: 99,
//     status: "Suspended",
//   },
//   {
//     id: "acc-005",
//     name: "Faculty of Business",
//     department: "Business",
//     quota: 3000,
//     pagesUsedPercent: 30,
//     status: "Active",
//   },
//   {
//     id: "acc-006",
//     name: "Research Center",
//     department: "Research",
//     quota: 1500,
//     pagesUsedPercent: 0,
//     status: "Inactive",
//   },
// ];

// //============Transactions==================

// export type TransactionType =
//   | "Top-up"
//   | "Print Charge"
//   | "Refund"
//   | "Adjustment";

// export type TransactionReviewStatus = "Pending" | "Reviewed";

// export type TransactionItem = {
//   id: string;
//   time: string;
//   user: string;
//   type: TransactionType;
//   description: string;
//   amount: number;
//   quotaAfter: number;
//   reviewStatus: TransactionReviewStatus;
// };

// export type TransactionSortKey =
//   | "time"
//   | "user"
//   | "type"
//   | "description"
//   | "amount"
//   | "quotaAfter"
//   | "reviewStatus";

// export type TransactionFilterValue =
//   | "all"
//   | "top-up"
//   | "print-charge"
//   | "refund"
//   | "adjustment"
//   | "reviewed"
//   | "pending"
//   | "positive"
//   | "negative";

// export type TransactionBulkAction =
//   | "mark-reviewed"
//   | "export-selected"
//   | "add-note";

// export type TransactionTypeMeta = {
//   label: string;
//   tone: StatusTone;
// };

// export type TransactionReviewMeta = {
//   label: string;
//   tone: StatusTone;
// };

// export const transactionTableColumns: {
//   key: TransactionSortKey;
//   label: string;
//   sortable: boolean;
// }[] = [
//   { key: "time", label: "Time", sortable: true },
//   { key: "user", label: "User", sortable: true },
//   { key: "type", label: "Type", sortable: true },
//   { key: "description", label: "Description", sortable: true },
//   { key: "amount", label: "Amount", sortable: true },
//   { key: "quotaAfter", label: "Quota After", sortable: true },
//   { key: "reviewStatus", label: "Review", sortable: true },
// ];

// export const transactionTypeSortOrder: Record<TransactionType, number> = {
//   "Top-up": 0,
//   "Print Charge": 1,
//   Refund: 2,
//   Adjustment: 3,
// };

// export const transactionReviewSortOrder: Record<
//   TransactionReviewStatus,
//   number
// > = {
//   Pending: 0,
//   Reviewed: 1,
// };

// export const transactionFilterOptions: {
//   value: TransactionFilterValue;
//   label: string;
// }[] = [
//   { value: "all", label: "All Types" },
//   { value: "top-up", label: "Top-up" },
//   { value: "print-charge", label: "Print Charge" },
//   { value: "refund", label: "Refund" },
//   { value: "adjustment", label: "Adjustment" },
//   { value: "reviewed", label: "Reviewed" },
//   { value: "pending", label: "Pending Review" },
//   { value: "positive", label: "Positive Amount" },
//   { value: "negative", label: "Negative Amount" },
// ];

// export const transactionBulkActionOptions: {
//   value: TransactionBulkAction;
//   label: string;
// }[] = [
//   { value: "mark-reviewed", label: "Mark as Reviewed" },
//   { value: "export-selected", label: "Export Selected" },
//   { value: "add-note", label: "Add Internal Note" },
// ];

// export const transactionTypeMeta: Record<TransactionType, TransactionTypeMeta> =
//   {
//     "Top-up": {
//       label: "Top-up",
//       tone: "success",
//     },
//     "Print Charge": {
//       label: "Print Charge",
//       tone: "danger",
//     },
//     Refund: {
//       label: "Refund",
//       tone: "inactive",
//     },
//     Adjustment: {
//       label: "Adjustment",
//       tone: "warning",
//     },
//   };

// export const transactionReviewMeta: Record<
//   TransactionReviewStatus,
//   TransactionReviewMeta
// > = {
//   Pending: {
//     label: "Pending",
//     tone: "warning",
//   },
//   Reviewed: {
//     label: "Reviewed",
//     tone: "success",
//   },
// };

// export const transactionsData: TransactionItem[] = [
//   {
//     id: "txn-0001",
//     time: "Mar 17, 07:07 PM",
//     user: "202300112",
//     type: "Top-up",
//     description: "Online top-up",
//     amount: 50.0,
//     quotaAfter: 50.0,
//     reviewStatus: "Reviewed",
//   },
//   {
//     id: "txn-0002",
//     time: "Mar 17, 07:10 PM",
//     user: "202300112",
//     type: "Print Charge",
//     description: "Thesis_Final.pdf – 45 pages",
//     amount: -4.5,
//     quotaAfter: 45.5,
//     reviewStatus: "Reviewed",
//   },
//   {
//     id: "txn-0003",
//     time: "Mar 17, 07:12 PM",
//     user: "a.almalki",
//     type: "Top-up",
//     description: "Cash top-up at counter",
//     amount: 20.0,
//     quotaAfter: 20.0,
//     reviewStatus: "Reviewed",
//   },
//   {
//     id: "txn-0004",
//     time: "Mar 17, 07:15 PM",
//     user: "a.almalki",
//     type: "Print Charge",
//     description: "Report.docx – 8 pages",
//     amount: -0.8,
//     quotaAfter: 19.2,
//     reviewStatus: "Reviewed",
//   },
//   {
//     id: "txn-0005",
//     time: "Mar 17, 07:18 PM",
//     user: "a.almalki",
//     type: "Refund",
//     description: "Refund for failed print job",
//     amount: 0.8,
//     quotaAfter: 20.0,
//     reviewStatus: "Pending",
//   },
//   {
//     id: "txn-0006",
//     time: "Mar 17, 07:21 PM",
//     user: "202300245",
//     type: "Top-up",
//     description: "Scholarship credit applied",
//     amount: 100.0,
//     quotaAfter: 100.0,
//     reviewStatus: "Reviewed",
//   },
//   {
//     id: "txn-0007",
//     time: "Mar 17, 07:24 PM",
//     user: "202300245",
//     type: "Print Charge",
//     description: "Assignment_3.pdf – 12 pages",
//     amount: -1.2,
//     quotaAfter: 98.8,
//     reviewStatus: "Reviewed",
//   },
//   {
//     id: "txn-0008",
//     time: "Mar 17, 07:28 PM",
//     user: "a.alshammari",
//     type: "Adjustment",
//     description: "Admin manual adjustment",
//     amount: -10.0,
//     quotaAfter: 35.0,
//     reviewStatus: "Pending",
//   },
//   {
//     id: "txn-0009",
//     time: "Mar 17, 07:32 PM",
//     user: "202301876",
//     type: "Top-up",
//     description: "Online top-up",
//     amount: 30.0,
//     quotaAfter: 30.0,
//     reviewStatus: "Reviewed",
//   },
//   {
//     id: "txn-0010",
//     time: "Mar 17, 07:35 PM",
//     user: "202301876",
//     type: "Print Charge",
//     description: "CV_Draft.docx – 3 pages",
//     amount: -0.3,
//     quotaAfter: 29.7,
//     reviewStatus: "Reviewed",
//   },
//   {
//     id: "txn-0011",
//     time: "Mar 17, 07:40 PM",
//     user: "202300981",
//     type: "Top-up",
//     description: "Cash top-up at counter",
//     amount: 25.0,
//     quotaAfter: 25.0,
//     reviewStatus: "Reviewed",
//   },
//   {
//     id: "txn-0012",
//     time: "Mar 17, 07:44 PM",
//     user: "202300981",
//     type: "Print Charge",
//     description: "Lab_Report.pdf – 25 pages",
//     amount: -2.5,
//     quotaAfter: 22.5,
//     reviewStatus: "Pending",
//   },
// ];

// ===========NEW===================
// export type SharedAccountStatus = "Active" | "Needs Review" | "Archived";

// export type SharedLinkedAccountStatus = "Active" | "Inactive" | "Suspended";

// export type SharedAccountLinkedItem = {
//   id: string;
//   username: string;
//   identifier: string;
//   department: string;
//   role: string;
//   status: SharedLinkedAccountStatus;
//   balance: number;
//   pages: number;
//   jobs: number;
//   lastActivity: string;
//   isPrimary: boolean;
// };

// export type SharedAccountLogItem = {
//   id: string;
//   title: string;
//   description: string;
//   by: string;
//   date: string;
// };

// export type SharedAccountItem = {
//   id: string;
//   personName: string;
//   identifier: string;
//   primaryAccount: string;
//   linkedCount: number;
//   linkedRoles: string[];
//   department: string;
//   status: SharedAccountStatus;
//   lastActivity: string;
//   createdBy: string;
//   createdAt: string;
//   updatedAt: string;
//   notes: string;
//   linkedAccounts: SharedAccountLinkedItem[];
//   logs: SharedAccountLogItem[];
// };

// export type SharedAccountSortKey =
//   | "personName"
//   | "primaryAccount"
//   | "linkedCount"
//   | "linkedRoles"
//   | "department"
//   | "status"
//   | "lastActivity";

// export const sharedAccountsTableColumns: {
//   key: SharedAccountSortKey;
//   label: string;
//   sortable: boolean;
// }[] = [
//   { key: "personName", label: "Person Name", sortable: true },
//   { key: "primaryAccount", label: "Primary Account", sortable: true },
//   { key: "linkedCount", label: "Linked Accounts", sortable: true },
//   { key: "linkedRoles", label: "Linked Roles", sortable: false },
//   { key: "department", label: "Department", sortable: true },
//   { key: "status", label: "Status", sortable: true },
//   { key: "lastActivity", label: "Last Activity", sortable: true },
// ];

// export const sharedAccountStatusSortOrder: Record<SharedAccountStatus, number> =
//   {
//     Active: 1,
//     "Needs Review": 2,
//     Archived: 3,
//   };

// export const sharedAccountsData: SharedAccountItem[] = [
//   {
//     id: "shared-1",
//     personName: "Dr. Sarah Alqahtani",
//     identifier: "KFUPM-20451",
//     primaryAccount: "s.alqahtani.faculty",
//     linkedCount: 3,
//     linkedRoles: ["Faculty", "Research", "Committee"],
//     department: "Computer Science",
//     status: "Active",
//     lastActivity: "2026-04-10 09:42 AM",
//     createdBy: "Admin - Mohammed",
//     createdAt: "2026-03-28 10:15 AM",
//     updatedAt: "2026-04-10 09:42 AM",
//     notes:
//       "Faculty member with multiple institutional accounts linked under one shared identity.",
//     linkedAccounts: [
//       {
//         id: "linked-1-1",
//         username: "s.alqahtani.faculty",
//         identifier: "KFUPM-20451",
//         department: "Computer Science",
//         role: "Faculty",
//         status: "Active",
//         balance: 145.5,
//         pages: 1240,
//         jobs: 86,
//         lastActivity: "2026-04-10 09:42 AM",
//         isPrimary: true,
//       },
//       {
//         id: "linked-1-2",
//         username: "s.alqahtani.research",
//         identifier: "RSCH-20451",
//         department: "Research Center",
//         role: "Research",
//         status: "Active",
//         balance: 90,
//         pages: 540,
//         jobs: 41,
//         lastActivity: "2026-04-09 01:18 PM",
//         isPrimary: false,
//       },
//       {
//         id: "linked-1-3",
//         username: "s.alqahtani.committee",
//         identifier: "CMT-20451",
//         department: "Academic Affairs",
//         role: "Committee",
//         status: "Inactive",
//         balance: 25,
//         pages: 120,
//         jobs: 9,
//         lastActivity: "2026-04-04 11:05 AM",
//         isPrimary: false,
//       },
//     ],
//     logs: [
//       {
//         id: "log-1-1",
//         title: "Shared Group Created",
//         description:
//           "Administrator created the shared account grouping after identity review.",
//         by: "Mohammed Alshammasi",
//         date: "2026-03-28 10:15 AM",
//       },
//       {
//         id: "log-1-2",
//         title: "Linked Account Added",
//         description: "Research account linked to the existing faculty profile.",
//         by: "Ali Aloryd",
//         date: "2026-04-02 02:40 PM",
//       },
//       {
//         id: "log-1-3",
//         title: "Primary Account Updated",
//         description:
//           "Faculty account confirmed as the primary account for reporting.",
//         by: "Mohammed Alshammasi",
//         date: "2026-04-07 12:20 PM",
//       },
//     ],
//   },
//   {
//     id: "shared-2",
//     personName: "Ahmed Almutairi",
//     identifier: "KFUPM-19873",
//     primaryAccount: "ahmad.it",
//     linkedCount: 2,
//     linkedRoles: ["IT", "Instructor"],
//     department: "Information Technology",
//     status: "Needs Review",
//     lastActivity: "2026-04-09 04:15 PM",
//     createdBy: "Admin - Ali",
//     createdAt: "2026-04-01 08:30 AM",
//     updatedAt: "2026-04-09 04:15 PM",
//     notes:
//       "Possible duplicate real-world identity across IT and teaching accounts. Review requested.",
//     linkedAccounts: [
//       {
//         id: "linked-2-1",
//         username: "ahmad.it",
//         identifier: "IT-19873",
//         department: "Information Technology",
//         role: "IT",
//         status: "Active",
//         balance: 210,
//         pages: 680,
//         jobs: 39,
//         lastActivity: "2026-04-09 04:15 PM",
//         isPrimary: true,
//       },
//       {
//         id: "linked-2-2",
//         username: "a.almutairi.instructor",
//         identifier: "FAC-19873",
//         department: "Software Engineering",
//         role: "Instructor",
//         status: "Suspended",
//         balance: 0,
//         pages: 155,
//         jobs: 11,
//         lastActivity: "2026-04-03 09:11 AM",
//         isPrimary: false,
//       },
//     ],
//     logs: [
//       {
//         id: "log-2-1",
//         title: "Review Flagged",
//         description:
//           "System flagged overlapping name and ID usage across two accounts.",
//         by: "System",
//         date: "2026-04-01 08:30 AM",
//       },
//       {
//         id: "log-2-2",
//         title: "Manual Verification Requested",
//         description:
//           "Administrator requested identity validation before final merge approval.",
//         by: "Ali Alhashem",
//         date: "2026-04-09 04:15 PM",
//       },
//     ],
//   },
//   {
//     id: "shared-3",
//     personName: "Lina Alharbi",
//     identifier: "KFUPM-22309",
//     primaryAccount: "lina.staff",
//     linkedCount: 2,
//     linkedRoles: ["Staff", "Lab Supervisor"],
//     department: "CCM Administration",
//     status: "Archived",
//     lastActivity: "2026-03-30 10:02 AM",
//     createdBy: "Admin - Mohammed",
//     createdAt: "2026-03-14 11:00 AM",
//     updatedAt: "2026-03-30 10:02 AM",
//     notes:
//       "Archived after department restructuring and deactivation of duplicate operational account.",
//     linkedAccounts: [
//       {
//         id: "linked-3-1",
//         username: "lina.staff",
//         identifier: "STF-22309",
//         department: "CCM Administration",
//         role: "Staff",
//         status: "Active",
//         balance: 42,
//         pages: 300,
//         jobs: 18,
//         lastActivity: "2026-03-30 10:02 AM",
//         isPrimary: true,
//       },
//       {
//         id: "linked-3-2",
//         username: "l.alharbi.lab",
//         identifier: "LAB-22309",
//         department: "Computer Lab",
//         role: "Lab Supervisor",
//         status: "Inactive",
//         balance: 10,
//         pages: 80,
//         jobs: 5,
//         lastActivity: "2026-03-22 03:50 PM",
//         isPrimary: false,
//       },
//     ],
//     logs: [
//       {
//         id: "log-3-1",
//         title: "Archive Group",
//         description:
//           "Shared group archived after duplicate role account was retired.",
//         by: "Mohammed Alshammasi",
//         date: "2026-03-30 10:02 AM",
//       },
//     ],
//   },
// ];
// ===========NEW=================
import type { StatusTone } from "@/components/ui/badge/StatusBadge";

// ============================
// Shared Accounts
// ============================

export type SharedAccountStatus = "Active" | "Needs Review" | "Archived";

export type SharedLinkedAccountStatus = "Active" | "Inactive" | "Suspended";

export type SharedAccountLinkedItem = {
  id: string;
  username: string;
  identifier: string;
  department: string;
  role: string;
  status: SharedLinkedAccountStatus;
  balance: number;
  pages: number;
  jobs: number;
  lastActivity: string;
  isPrimary: boolean;
};

export type SharedAccountLogItem = {
  id: string;
  title: string;
  description: string;
  by: string;
  date: string;
};

export type SharedAccountItem = {
  id: string;
  personName: string;
  identifier: string;
  primaryAccount: string;
  linkedCount: number;
  linkedRoles: string[];
  department: string;
  status: SharedAccountStatus;
  lastActivity: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  linkedAccounts: SharedAccountLinkedItem[];
  logs: SharedAccountLogItem[];
};

export type SharedAccountSortKey =
  | "personName"
  | "primaryAccount"
  | "linkedCount"
  | "linkedRoles"
  | "department"
  | "status"
  | "lastActivity";

export type SharedAccountFilterValue =
  | "all"
  | "active"
  | "needs-review"
  | "archived"
  | "multi-role"
  | "high-link-count";

export type SharedAccountBulkStatusAction =
  | "Active"
  | "Needs Review"
  | "Archived";

export type SharedAccountStatusMeta = {
  label: string;
  tone: StatusTone;
};

export const sharedAccountsTableColumns: {
  key: SharedAccountSortKey;
  label: string;
  sortable: boolean;
}[] = [
  { key: "personName", label: "Person Name", sortable: true },
  { key: "primaryAccount", label: "Primary Account", sortable: true },
  { key: "linkedCount", label: "Linked Accounts", sortable: true },
  { key: "linkedRoles", label: "Linked Roles", sortable: false },
  { key: "department", label: "Department", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "lastActivity", label: "Last Activity", sortable: true },
];

export const sharedAccountStatusSortOrder: Record<SharedAccountStatus, number> =
  {
    Active: 0,
    "Needs Review": 1,
    Archived: 2,
  };

export const sharedAccountFilterOptions: {
  value: SharedAccountFilterValue;
  label: string;
}[] = [
  { value: "all", label: "All Shared Accounts" },
  { value: "active", label: "Active" },
  { value: "needs-review", label: "Needs Review" },
  { value: "archived", label: "Archived" },
  { value: "multi-role", label: "Multiple Roles" },
  { value: "high-link-count", label: "3+ Linked Accounts" },
];

export const sharedAccountStatusMeta: Record<
  SharedAccountStatus,
  SharedAccountStatusMeta
> = {
  Active: {
    label: "Active",
    tone: "success",
  },
  "Needs Review": {
    label: "Needs Review",
    tone: "warning",
  },
  Archived: {
    label: "Archived",
    tone: "inactive",
  },
};

export const sharedAccountsData: SharedAccountItem[] = [
  {
    id: "shared-1",
    personName: "Dr. Sarah Alqahtani",
    identifier: "KFUPM-20451",
    primaryAccount: "s.alqahtani.faculty",
    linkedCount: 3,
    linkedRoles: ["Faculty", "Research", "Committee"],
    department: "Computer Science",
    status: "Active",
    lastActivity: "2026-04-10 09:42 AM",
    createdBy: "Admin - Mohammed",
    createdAt: "2026-03-28 10:15 AM",
    updatedAt: "2026-04-10 09:42 AM",
    notes:
      "Faculty member with multiple institutional accounts linked under one shared identity.",
    linkedAccounts: [
      {
        id: "linked-1-1",
        username: "s.alqahtani.faculty",
        identifier: "KFUPM-20451",
        department: "Computer Science",
        role: "Faculty",
        status: "Active",
        balance: 145.5,
        pages: 1240,
        jobs: 86,
        lastActivity: "2026-04-10 09:42 AM",
        isPrimary: true,
      },
      {
        id: "linked-1-2",
        username: "s.alqahtani.research",
        identifier: "RSCH-20451",
        department: "Research Center",
        role: "Research",
        status: "Active",
        balance: 90,
        pages: 540,
        jobs: 41,
        lastActivity: "2026-04-09 01:18 PM",
        isPrimary: false,
      },
      {
        id: "linked-1-3",
        username: "s.alqahtani.committee",
        identifier: "CMT-20451",
        department: "Academic Affairs",
        role: "Committee",
        status: "Inactive",
        balance: 25,
        pages: 120,
        jobs: 9,
        lastActivity: "2026-04-04 11:05 AM",
        isPrimary: false,
      },
    ],
    logs: [
      {
        id: "log-1-1",
        title: "Shared Group Created",
        description:
          "Administrator created the shared account grouping after identity review.",
        by: "Mohammed Alshammasi",
        date: "2026-03-28 10:15 AM",
      },
      {
        id: "log-1-2",
        title: "Linked Account Added",
        description: "Research account linked to the existing faculty profile.",
        by: "Ali Aloryd",
        date: "2026-04-02 02:40 PM",
      },
      {
        id: "log-1-3",
        title: "Primary Account Updated",
        description:
          "Faculty account confirmed as the primary account for reporting.",
        by: "Mohammed Alshammasi",
        date: "2026-04-07 12:20 PM",
      },
    ],
  },
  {
    id: "shared-2",
    personName: "Ahmed Almutairi",
    identifier: "KFUPM-19873",
    primaryAccount: "ahmad.it",
    linkedCount: 2,
    linkedRoles: ["IT", "Instructor"],
    department: "Information Technology",
    status: "Needs Review",
    lastActivity: "2026-04-09 04:15 PM",
    createdBy: "Admin - Ali",
    createdAt: "2026-04-01 08:30 AM",
    updatedAt: "2026-04-09 04:15 PM",
    notes:
      "Possible duplicate real-world identity across IT and teaching accounts. Review requested.",
    linkedAccounts: [
      {
        id: "linked-2-1",
        username: "ahmad.it",
        identifier: "IT-19873",
        department: "Information Technology",
        role: "IT",
        status: "Active",
        balance: 210,
        pages: 680,
        jobs: 39,
        lastActivity: "2026-04-09 04:15 PM",
        isPrimary: true,
      },
      {
        id: "linked-2-2",
        username: "a.almutairi.instructor",
        identifier: "FAC-19873",
        department: "Software Engineering",
        role: "Instructor",
        status: "Suspended",
        balance: 0,
        pages: 155,
        jobs: 11,
        lastActivity: "2026-04-03 09:11 AM",
        isPrimary: false,
      },
    ],
    logs: [
      {
        id: "log-2-1",
        title: "Review Flagged",
        description:
          "System flagged overlapping name and ID usage across two accounts.",
        by: "System",
        date: "2026-04-01 08:30 AM",
      },
      {
        id: "log-2-2",
        title: "Manual Verification Requested",
        description:
          "Administrator requested identity validation before final merge approval.",
        by: "Ali Alhashem",
        date: "2026-04-09 04:15 PM",
      },
    ],
  },
  {
    id: "shared-3",
    personName: "Lina Alharbi",
    identifier: "KFUPM-22309",
    primaryAccount: "lina.staff",
    linkedCount: 2,
    linkedRoles: ["Staff", "Lab Supervisor"],
    department: "CCM Administration",
    status: "Archived",
    lastActivity: "2026-03-30 10:02 AM",
    createdBy: "Admin - Mohammed",
    createdAt: "2026-03-14 11:00 AM",
    updatedAt: "2026-03-30 10:02 AM",
    notes:
      "Archived after department restructuring and deactivation of duplicate operational account.",
    linkedAccounts: [
      {
        id: "linked-3-1",
        username: "lina.staff",
        identifier: "STF-22309",
        department: "CCM Administration",
        role: "Staff",
        status: "Active",
        balance: 42,
        pages: 300,
        jobs: 18,
        lastActivity: "2026-03-30 10:02 AM",
        isPrimary: true,
      },
      {
        id: "linked-3-2",
        username: "l.alharbi.lab",
        identifier: "LAB-22309",
        department: "Computer Lab",
        role: "Lab Supervisor",
        status: "Inactive",
        balance: 10,
        pages: 80,
        jobs: 5,
        lastActivity: "2026-03-22 03:50 PM",
        isPrimary: false,
      },
    ],
    logs: [
      {
        id: "log-3-1",
        title: "Archive Group",
        description:
          "Shared group archived after duplicate role account was retired.",
        by: "Mohammed Alshammasi",
        date: "2026-03-30 10:02 AM",
      },
    ],
  },
];

// ============================
// Transactions
// ============================

export type TransactionType =
  | "Top-up"
  | "Print Charge"
  | "Refund"
  | "Adjustment";

export type TransactionReviewStatus = "Pending" | "Reviewed";

export type TransactionItem = {
  id: string;
  time: string;
  user: string;
  type: TransactionType;
  description: string;
  amount: number;
  quotaAfter: number;
  reviewStatus: TransactionReviewStatus;
};

export type TransactionSortKey =
  | "time"
  | "user"
  | "type"
  | "description"
  | "amount"
  | "quotaAfter"
  | "reviewStatus";

export type TransactionFilterValue =
  | "all"
  | "top-up"
  | "print-charge"
  | "refund"
  | "adjustment"
  | "reviewed"
  | "pending"
  | "positive"
  | "negative";

export type TransactionBulkAction =
  | "mark-reviewed"
  | "export-selected"
  | "add-note";

export type TransactionTypeMeta = {
  label: string;
  tone: StatusTone;
};

export type TransactionReviewMeta = {
  label: string;
  tone: StatusTone;
};

export const transactionTableColumns: {
  key: TransactionSortKey;
  label: string;
  sortable: boolean;
}[] = [
  { key: "time", label: "Time", sortable: true },
  { key: "user", label: "User", sortable: true },
  { key: "type", label: "Type", sortable: true },
  { key: "description", label: "Description", sortable: true },
  { key: "amount", label: "Amount", sortable: true },
  { key: "quotaAfter", label: "Quota After", sortable: true },
  { key: "reviewStatus", label: "Review", sortable: true },
];

export const transactionTypeSortOrder: Record<TransactionType, number> = {
  "Top-up": 0,
  "Print Charge": 1,
  Refund: 2,
  Adjustment: 3,
};

export const transactionReviewSortOrder: Record<
  TransactionReviewStatus,
  number
> = {
  Pending: 0,
  Reviewed: 1,
};

export const transactionFilterOptions: {
  value: TransactionFilterValue;
  label: string;
}[] = [
  { value: "all", label: "All Types" },
  { value: "top-up", label: "Top-up" },
  { value: "print-charge", label: "Print Charge" },
  { value: "refund", label: "Refund" },
  { value: "adjustment", label: "Adjustment" },
  { value: "reviewed", label: "Reviewed" },
  { value: "pending", label: "Pending Review" },
  { value: "positive", label: "Positive Amount" },
  { value: "negative", label: "Negative Amount" },
];

export const transactionBulkActionOptions: {
  value: TransactionBulkAction;
  label: string;
}[] = [
  { value: "mark-reviewed", label: "Mark as Reviewed" },
  { value: "export-selected", label: "Export Selected" },
  { value: "add-note", label: "Add Internal Note" },
];

export const transactionTypeMeta: Record<TransactionType, TransactionTypeMeta> =
  {
    "Top-up": {
      label: "Top-up",
      tone: "success",
    },
    "Print Charge": {
      label: "Print Charge",
      tone: "danger",
    },
    Refund: {
      label: "Refund",
      tone: "inactive",
    },
    Adjustment: {
      label: "Adjustment",
      tone: "warning",
    },
  };

export const transactionReviewMeta: Record<
  TransactionReviewStatus,
  TransactionReviewMeta
> = {
  Pending: {
    label: "Pending",
    tone: "warning",
  },
  Reviewed: {
    label: "Reviewed",
    tone: "success",
  },
};

export const transactionsData: TransactionItem[] = [
  {
    id: "txn-0001",
    time: "Mar 17, 07:07 PM",
    user: "202300112",
    type: "Top-up",
    description: "Online top-up",
    amount: 50.0,
    quotaAfter: 50.0,
    reviewStatus: "Reviewed",
  },
  {
    id: "txn-0002",
    time: "Mar 17, 07:10 PM",
    user: "202300112",
    type: "Print Charge",
    description: "Thesis_Final.pdf – 45 pages",
    amount: -4.5,
    quotaAfter: 45.5,
    reviewStatus: "Reviewed",
  },
  {
    id: "txn-0003",
    time: "Mar 17, 07:12 PM",
    user: "a.almalki",
    type: "Top-up",
    description: "Cash top-up at counter",
    amount: 20.0,
    quotaAfter: 20.0,
    reviewStatus: "Reviewed",
  },
  {
    id: "txn-0004",
    time: "Mar 17, 07:15 PM",
    user: "a.almalki",
    type: "Print Charge",
    description: "Report.docx – 8 pages",
    amount: -0.8,
    quotaAfter: 19.2,
    reviewStatus: "Reviewed",
  },
  {
    id: "txn-0005",
    time: "Mar 17, 07:18 PM",
    user: "a.almalki",
    type: "Refund",
    description: "Refund for failed print job",
    amount: 0.8,
    quotaAfter: 20.0,
    reviewStatus: "Pending",
  },
  {
    id: "txn-0006",
    time: "Mar 17, 07:21 PM",
    user: "202300245",
    type: "Top-up",
    description: "Scholarship credit applied",
    amount: 100.0,
    quotaAfter: 100.0,
    reviewStatus: "Reviewed",
  },
  {
    id: "txn-0007",
    time: "Mar 17, 07:24 PM",
    user: "202300245",
    type: "Print Charge",
    description: "Assignment_3.pdf – 12 pages",
    amount: -1.2,
    quotaAfter: 98.8,
    reviewStatus: "Reviewed",
  },
  {
    id: "txn-0008",
    time: "Mar 17, 07:28 PM",
    user: "a.alshammari",
    type: "Adjustment",
    description: "Admin manual adjustment",
    amount: -10.0,
    quotaAfter: 35.0,
    reviewStatus: "Pending",
  },
  {
    id: "txn-0009",
    time: "Mar 17, 07:32 PM",
    user: "202301876",
    type: "Top-up",
    description: "Online top-up",
    amount: 30.0,
    quotaAfter: 30.0,
    reviewStatus: "Reviewed",
  },
  {
    id: "txn-0010",
    time: "Mar 17, 07:35 PM",
    user: "202301876",
    type: "Print Charge",
    description: "CV_Draft.docx – 3 pages",
    amount: -0.3,
    quotaAfter: 29.7,
    reviewStatus: "Reviewed",
  },
  {
    id: "txn-0011",
    time: "Mar 17, 07:40 PM",
    user: "202300981",
    type: "Top-up",
    description: "Cash top-up at counter",
    amount: 25.0,
    quotaAfter: 25.0,
    reviewStatus: "Reviewed",
  },
  {
    id: "txn-0012",
    time: "Mar 17, 07:44 PM",
    user: "202300981",
    type: "Print Charge",
    description: "Lab_Report.pdf – 25 pages",
    amount: -2.5,
    quotaAfter: 22.5,
    reviewStatus: "Pending",
  },
];
