export type NotificationType =
  | "printer_alert"
  | "device_error"
  | "toner_low"
  | "queue_warning"
  | "maintenance_reminder"
  | "system_warning"
  | "job_issue";

export type NotificationSource =
  | "Printer"
  | "Device"
  | "Queue"
  | "System"
  | "Report Scheduler";

export type NotificationSeverity = "info" | "warning" | "error" | "critical";

export type NotificationStatus = "unread" | "read" | "resolved" | "dismissed";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  source: NotificationSource;
  severity: NotificationSeverity;
  status: NotificationStatus;
  affected_device?: string;
  error_details?: string;
  action_taken?: string;
  related_log_id?: string;
  createdAt: string;
};

export type NotifyRoles =
  | "admin_only"
  | "sub_admin_only"
  | "admin_and_sub_admin"
  | "all_users";

export type NotificationSettingsType = {
  enabled: boolean;
  email_enabled: boolean;
  email_recipients: string;
  alert_printer_offline: boolean;
  alert_toner_low: boolean;
  toner_threshold: number;
  alert_device_error: boolean;
  alert_queue_pending: boolean;
  queue_threshold: number;
  alert_maintenance: boolean;
  alert_job_issues: boolean;
  alert_system_warnings: boolean;
  notify_roles: NotifyRoles;
};

export type NotificationFilters = {
  search: string;
  type: NotificationType | "all";
  severity: NotificationSeverity | "all";
  status: NotificationStatus | "all";
  source: NotificationSource | "all";
};

export const DEFAULT_NOTIFICATION_FILTERS: NotificationFilters = {
  search: "",
  type: "all",
  severity: "all",
  status: "all",
  source: "all",
};

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "N-001",
    title: "Printer HP-LaserJet-1 is offline",
    message: "The printer is not responding to heartbeat checks.",
    type: "printer_alert",
    source: "Printer",
    severity: "error",
    status: "unread",
    affected_device: "HP-LaserJet-1",
    createdAt: "Mar 27, 02:33 AM",
  },
  {
    id: "N-002",
    title: "Toner Low — Canon-Office-3",
    message: "Toner level dropped below the configured threshold.",
    type: "toner_low",
    source: "Printer",
    severity: "warning",
    status: "unread",
    affected_device: "Canon-Office-3",
    createdAt: "Mar 27, 02:33 AM",
  },
  {
    id: "N-003",
    title: "Large print queue on Floor 2 printer",
    message: "Pending jobs exceeded queue threshold.",
    type: "queue_warning",
    source: "Queue",
    severity: "warning",
    status: "read",
    affected_device: "Floor 2 printer",
    createdAt: "Mar 27, 02:33 AM",
  },
  {
    id: "N-004",
    title: "Device error on Xerox-Scanner-1",
    message: "Scanner reported a hardware fault during operation.",
    type: "device_error",
    source: "Device",
    severity: "critical",
    status: "unread",
    affected_device: "Xerox-Scanner-1",
    createdAt: "Mar 27, 02:33 AM",
  },
  {
    id: "N-005",
    title: "Scheduled maintenance due — Printer Lab-A",
    message: "Preventive maintenance is due within 24 hours.",
    type: "maintenance_reminder",
    source: "System",
    severity: "info",
    status: "read",
    affected_device: "Printer Lab-A",
    createdAt: "Mar 27, 02:33 AM",
  },
  {
    id: "N-006",
    title: "Print job failed for user john.doe",
    message: "A print job failed before release.",
    type: "job_issue",
    source: "Queue",
    severity: "error",
    status: "unread",
    createdAt: "Mar 27, 02:33 AM",
  },
  {
    id: "N-007",
    title: "System backup completed successfully",
    message: "Backup finished and integrity checks passed.",
    type: "system_warning",
    source: "System",
    severity: "info",
    status: "resolved",
    createdAt: "Mar 27, 02:33 AM",
  },
  {
    id: "N-008",
    title: "Paper level critical on Ricoh-HR-1",
    message: "Input tray level is critically low.",
    type: "printer_alert",
    source: "Printer",
    severity: "critical",
    status: "unread",
    affected_device: "Ricoh-HR-1",
    createdAt: "Mar 27, 02:33 AM",
  },
  {
    id: "N-009",
    title: "Monthly report scheduler delayed",
    message: "The report scheduler started later than expected.",
    type: "system_warning",
    source: "Report Scheduler",
    severity: "warning",
    status: "dismissed",
    createdAt: "Mar 27, 02:33 AM",
  },
  {
    id: "N-010",
    title: "Queue spike detected in Student Lab",
    message: "Job count exceeded expected hourly average.",
    type: "queue_warning",
    source: "Queue",
    severity: "warning",
    status: "unread",
    createdAt: "Mar 27, 02:33 AM",
  },
];

export const INITIAL_NOTIFICATION_SETTINGS: NotificationSettingsType = {
  enabled: true,
  email_enabled: false,
  email_recipients: "",
  alert_printer_offline: true,
  alert_toner_low: true,
  toner_threshold: 20,
  alert_device_error: true,
  alert_queue_pending: true,
  queue_threshold: 10,
  alert_maintenance: true,
  alert_job_issues: true,
  alert_system_warnings: true,
  notify_roles: "admin_only",
};

export const NOTIFICATION_TABS = ["Notifications", "Settings"] as const;
export type NotificationTab = (typeof NOTIFICATION_TABS)[number];

export const TOTAL_SECONDS = 30;

export function getSeverityTone(severity: NotificationSeverity) {
  switch (severity) {
    case "info":
      return "inactive";
    case "warning":
      return "warning";
    case "error":
    case "critical":
      return "danger";
    default:
      return "inactive";
  }
}

export function getStatusTone(status: NotificationStatus) {
  switch (status) {
    case "resolved":
      return "success";
    case "read":
    case "dismissed":
      return "inactive";
    case "unread":
      return "warning";
    default:
      return "inactive";
  }
}

export function formatTypeLabel(type: NotificationType) {
  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatRoleLabel(role: NotifyRoles) {
  switch (role) {
    case "admin_only":
      return "Admin Only";
    case "sub_admin_only":
      return "Sub-Admin Only";
    case "admin_and_sub_admin":
      return "Admin & Sub-Admin";
    case "all_users":
      return "All Users";
    default:
      return "Admin Only";
  }
}