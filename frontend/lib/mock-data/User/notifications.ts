export type UserNotificationSeverity =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "critical";

export type UserNotificationStatus =
  | "unread"
  | "read"
  | "resolved"
  | "archived";

export type UserNotificationType =
  | "print-job"
  | "balance"
  | "redeem-card"
  | "printer"
  | "system"
  | "account";

export type UserNotificationSource =
  | "web-print"
  | "jobs-pending-release"
  | "recent-print-jobs"
  | "transaction-history"
  | "redeem-card"
  | "printer-device"
  | "system";

export type UserNotificationActionValue =
  | "mark-selected-read"
  | "mark-selected-unread"
  | "archive-selected"
  | "delete-selected"
  | "clear-read";

export type UserNotificationSortKey =
  | "title"
  | "type"
  | "source"
  | "severity"
  | "date"
  | "status";

export type UserNotificationItem = {
  id: string;
  title: string;
  message: string;
  type: UserNotificationType;
  source: UserNotificationSource;
  severity: UserNotificationSeverity;
  status: UserNotificationStatus;
  createdAt: string;
  createdAtLabel: string;
  relatedEntity?: {
    kind: "job" | "printer" | "transaction" | "redeem" | "account";
    id: string;
    label: string;
  };
  canMarkAsRead: boolean;
  canMarkAsUnread: boolean;
  canArchive: boolean;
  canDelete: boolean;
};

export const userNotificationColumns = [
  { key: "title", label: "Title", sortable: true },
  { key: "type", label: "Type", sortable: true },
  { key: "source", label: "Source", sortable: true },
  { key: "severity", label: "Severity", sortable: true },
  { key: "date", label: "Date", sortable: true },
  { key: "status", label: "Status", sortable: true },
] as const;

export const userNotificationTypeOptions = [
  { label: "All Types", value: "all" },
  { label: "Print Job", value: "print-job" },
  { label: "Balance", value: "balance" },
  { label: "Redeem Card", value: "redeem-card" },
  { label: "Printer", value: "printer" },
  { label: "System", value: "system" },
  { label: "Account", value: "account" },
] as const;

export const userNotificationSeverityOptions = [
  { label: "All Severities", value: "all" },
  { label: "Info", value: "info" },
  { label: "Success", value: "success" },
  { label: "Warning", value: "warning" },
  { label: "Error", value: "error" },
  { label: "Critical", value: "critical" },
] as const;

export const userNotificationStatusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Read", value: "read" },
  { label: "Resolved", value: "resolved" },
  { label: "Archived", value: "archived" },
] as const;

export const userNotificationSourceOptions = [
  { label: "All Sources", value: "all" },
  { label: "Web Print", value: "web-print" },
  { label: "Jobs Pending Release", value: "jobs-pending-release" },
  { label: "Recent Print Jobs", value: "recent-print-jobs" },
  { label: "Transaction History", value: "transaction-history" },
  { label: "Redeem Card", value: "redeem-card" },
  { label: "Printer Device", value: "printer-device" },
  { label: "System", value: "system" },
] as const;

export const userNotificationActionOptions = [
  { label: "Mark selected as read", value: "mark-selected-read" },
  { label: "Mark selected as unread", value: "mark-selected-unread" },
  { label: "Archive selected", value: "archive-selected" },
  { label: "Delete selected", value: "delete-selected" },
  { label: "Clear all read", value: "clear-read" },
] as const;

export const userNotificationData: UserNotificationItem[] = [
  {
    id: "notif-001",
    title: "Print job released successfully",
    message:
      "Your document “SE_Final_Report.pdf” was released and printed successfully.",
    type: "print-job",
    source: "jobs-pending-release",
    severity: "success",
    status: "unread",
    createdAt: "2026-03-27T08:33:00",
    createdAtLabel: "Mar 27, 08:33 AM",
    relatedEntity: {
      kind: "job",
      id: "JOB-24031",
      label: "SE_Final_Report.pdf",
    },
    canMarkAsRead: true,
    canMarkAsUnread: false,
    canArchive: true,
    canDelete: true,
  },
  {
    id: "notif-002",
    title: "Insufficient balance for print release",
    message:
      "You do not have enough balance to release “AI_Assignment_2.pdf”. Please recharge and try again.",
    type: "balance",
    source: "jobs-pending-release",
    severity: "warning",
    status: "unread",
    createdAt: "2026-03-27T08:12:00",
    createdAtLabel: "Mar 27, 08:12 AM",
    relatedEntity: {
      kind: "job",
      id: "JOB-24018",
      label: "AI_Assignment_2.pdf",
    },
    canMarkAsRead: true,
    canMarkAsUnread: false,
    canArchive: true,
    canDelete: true,
  },
  {
    id: "notif-003",
    title: "Print job failed",
    message:
      "Your job “Database_Project.docx” could not be completed due to a printer-side error.",
    type: "print-job",
    source: "recent-print-jobs",
    severity: "error",
    status: "unread",
    createdAt: "2026-03-27T07:55:00",
    createdAtLabel: "Mar 27, 07:55 AM",
    relatedEntity: {
      kind: "job",
      id: "JOB-24002",
      label: "Database_Project.docx",
    },
    canMarkAsRead: true,
    canMarkAsUnread: false,
    canArchive: true,
    canDelete: true,
  },
  {
    id: "notif-004",
    title: "Redeem code applied successfully",
    message:
      "Your recharge code was accepted and 25.00 SAR was added to your account balance.",
    type: "redeem-card",
    source: "redeem-card",
    severity: "success",
    status: "read",
    createdAt: "2026-03-26T09:20:00",
    createdAtLabel: "Mar 26, 09:20 AM",
    relatedEntity: {
      kind: "redeem",
      id: "RDM-9032",
      label: "Recharge code",
    },
    canMarkAsRead: false,
    canMarkAsUnread: true,
    canArchive: true,
    canDelete: true,
  },
  {
    id: "notif-005",
    title: "Invalid or expired redeem code",
    message:
      "The code you entered could not be used. Please verify the code and try again.",
    type: "redeem-card",
    source: "redeem-card",
    severity: "error",
    status: "read",
    createdAt: "2026-03-26T09:14:00",
    createdAtLabel: "Mar 26, 09:14 AM",
    relatedEntity: {
      kind: "redeem",
      id: "RDM-9028",
      label: "Redeem attempt",
    },
    canMarkAsRead: false,
    canMarkAsUnread: true,
    canArchive: true,
    canDelete: true,
  },
  {
    id: "notif-006",
    title: "Pending print job will expire soon",
    message:
      "Your job “Operating_Systems_Notes.pdf” will be deleted soon if it is not printed within the retention period.",
    type: "print-job",
    source: "jobs-pending-release",
    severity: "warning",
    status: "unread",
    createdAt: "2026-03-26T07:40:00",
    createdAtLabel: "Mar 26, 07:40 AM",
    relatedEntity: {
      kind: "job",
      id: "JOB-23961",
      label: "Operating_Systems_Notes.pdf",
    },
    canMarkAsRead: true,
    canMarkAsUnread: false,
    canArchive: true,
    canDelete: true,
  },
  {
    id: "notif-007",
    title: "Printer issue affecting your job",
    message:
      "Printer CCM-Lab-02 reported a paper jam. Your pending release may be delayed.",
    type: "printer",
    source: "printer-device",
    severity: "critical",
    status: "unread",
    createdAt: "2026-03-25T01:42:00",
    createdAtLabel: "Mar 25, 01:42 PM",
    relatedEntity: {
      kind: "printer",
      id: "PRN-12",
      label: "CCM-Lab-02",
    },
    canMarkAsRead: true,
    canMarkAsUnread: false,
    canArchive: true,
    canDelete: true,
  },
  {
    id: "notif-008",
    title: "Refund processed",
    message:
      "A refund was added back to your balance for the failed print job “Networks_Lab.pdf”.",
    type: "balance",
    source: "transaction-history",
    severity: "info",
    status: "read",
    createdAt: "2026-03-25T10:08:00",
    createdAtLabel: "Mar 25, 10:08 AM",
    relatedEntity: {
      kind: "transaction",
      id: "TRX-8842",
      label: "Refund transaction",
    },
    canMarkAsRead: false,
    canMarkAsUnread: true,
    canArchive: true,
    canDelete: true,
  },
  {
    id: "notif-009",
    title: "Balance updated",
    message: "Your printing balance was updated after a recent transaction.",
    type: "balance",
    source: "transaction-history",
    severity: "info",
    status: "resolved",
    createdAt: "2026-03-24T11:00:00",
    createdAtLabel: "Mar 24, 11:00 AM",
    relatedEntity: {
      kind: "account",
      id: "ACC-001",
      label: "User balance",
    },
    canMarkAsRead: false,
    canMarkAsUnread: true,
    canArchive: true,
    canDelete: true,
  },
  {
    id: "notif-010",
    title: "System maintenance reminder",
    message:
      "Some printing services may be temporarily unavailable during scheduled maintenance tonight.",
    type: "system",
    source: "system",
    severity: "info",
    status: "read",
    createdAt: "2026-03-24T06:30:00",
    createdAtLabel: "Mar 24, 06:30 AM",
    relatedEntity: {
      kind: "account",
      id: "SYS-01",
      label: "System notice",
    },
    canMarkAsRead: false,
    canMarkAsUnread: true,
    canArchive: true,
    canDelete: true,
  },
  {
    id: "notif-011",
    title: "Your print job is ready for release",
    message:
      "“Software_Testing_Guide.pdf” is now waiting in your secure release queue.",
    type: "print-job",
    source: "web-print",
    severity: "info",
    status: "unread",
    createdAt: "2026-03-23T03:18:00",
    createdAtLabel: "Mar 23, 03:18 PM",
    relatedEntity: {
      kind: "job",
      id: "JOB-23870",
      label: "Software_Testing_Guide.pdf",
    },
    canMarkAsRead: true,
    canMarkAsUnread: false,
    canArchive: true,
    canDelete: true,
  },
  {
    id: "notif-012",
    title: "Account settings updated",
    message: "Your account settings were updated successfully.",
    type: "account",
    source: "system",
    severity: "success",
    status: "archived",
    createdAt: "2026-03-22T12:04:00",
    createdAtLabel: "Mar 22, 12:04 PM",
    relatedEntity: {
      kind: "account",
      id: "ACC-001",
      label: "Profile settings",
    },
    canMarkAsRead: false,
    canMarkAsUnread: true,
    canArchive: false,
    canDelete: true,
  },
];

export const userNotificationSeverityRank: Record<
  UserNotificationSeverity,
  number
> = {
  info: 1,
  success: 2,
  warning: 3,
  error: 4,
  critical: 5,
};

export const userNotificationStatusRank: Record<
  UserNotificationStatus,
  number
> = {
  unread: 1,
  read: 2,
  resolved: 3,
  archived: 4,
};

export const userNotificationModalContent = {
  markRead: {
    title: "Mark notifications as read",
    description:
      "Selected notifications will be marked as read and removed from your unread list.",
  },
  markUnread: {
    title: "Mark notifications as unread",
    description:
      "Selected notifications will be marked as unread so you can review them again later.",
  },
  archive: {
    title: "Archive notifications",
    description:
      "Archived notifications will be hidden from the main list but can still be kept for reference.",
  },
  delete: {
    title: "Delete notifications",
    description:
      "Deleted notifications will be permanently removed from your notification history.",
  },
  clearRead: {
    title: "Clear read notifications",
    description:
      "All read notifications will be removed from the current list.",
  },
  details: {
    title: "Notification details",
    description:
      "Review the full notification message and any related job, printer, or account reference.",
  },
} as const;

export const userNotificationTableMeta = {
  searchPlaceholder: "Search by title, message, or source...",
  emptyStateText: "No notifications found",
  actionLabel: "Actions",
  refreshSeconds: 20,
  columnsClassName:
    "[grid-template-columns:72px_minmax(320px,1.8fr)_170px_170px_140px_180px_140px_132px]",
} as const;
