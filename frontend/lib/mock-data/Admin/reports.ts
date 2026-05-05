export type ReportCategoryId =
  | "user"
  | "printer"
  | "group"
  | "account"
  | "summary";

export type ReportExportFormat = "pdf" | "html" | "excel";

export type ReportPeriod =
  | "Last 7 days"
  | "Last 30 days"
  | "Last 90 days"
  | "This year";

export type ReportItem = {
  id: string;
  title: string;
  description: string;
  supportedFormats: ReportExportFormat[];
  defaultPeriod: ReportPeriod;
  usagePercent?: number;
};

export type ReportCategory = {
  id: ReportCategoryId;
  label: string;
  description: string;
  panelTitle: string;
  panelDescription: string;
  exportFormats: ReportExportFormat[];
  overviewPercent: number;
  reports: ReportItem[];
};

export const reportPeriods: ReportPeriod[] = [
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "This year",
];

export const reportCategories: ReportCategory[] = [
  {
    id: "user",
    label: "User",
    description: "Generate and export user-focused reports.",
    panelTitle: "User Reports",
    panelDescription:
      "User-focused reports providing information about users, their account balance, and activity. Additional reports for individual users can be located under the user’s transaction and activity history sections.",
    exportFormats: ["pdf", "html", "excel"],
    overviewPercent: 82,
    reports: [
      {
        id: "user-list",
        title: "User list",
        description:
          "Complete list of all registered users with account details.",
        supportedFormats: ["pdf", "html", "excel"],
        defaultPeriod: "Last 30 days",
        usagePercent: 78,
      },
      {
        id: "executive-summary",
        title: "Executive summary",
        description: "High-level overview of user printing activity.",
        supportedFormats: ["pdf"],
        defaultPeriod: "Last 30 days",
        usagePercent: 55,
      },
      {
        id: "largest-print-users",
        title: "Largest print users",
        description: "Top users by total pages printed in the selected period.",
        supportedFormats: ["pdf", "html", "excel"],
        defaultPeriod: "Last 30 days",
        usagePercent: 84,
      },
      {
        id: "user-printing-summary",
        title: "User printing – summary",
        description: "Summary of printing activity per user.",
        supportedFormats: ["pdf", "html", "excel"],
        defaultPeriod: "Last 30 days",
        usagePercent: 67,
      },
      {
        id: "user-breakdown",
        title: "User print/copy/scan – breakdown",
        description: "Detailed breakdown by job type per user.",
        supportedFormats: ["pdf", "html", "excel"],
        defaultPeriod: "Last 30 days",
        usagePercent: 61,
      },
      {
        id: "user-balance-report",
        title: "User balance report",
        description: "Current account balances for all users.",
        supportedFormats: ["pdf", "html", "excel"],
        defaultPeriod: "Last 30 days",
        usagePercent: 73,
      },
    ],
  },
  {
    id: "printer",
    label: "Printer",
    description: "Usage, performance, and device activity reports.",
    panelTitle: "Printer Reports",
    panelDescription:
      "Reports focused on printer usage, performance, and activity across all managed devices.",
    exportFormats: ["pdf", "html", "excel"],
    overviewPercent: 71,
    reports: [
      {
        id: "printer-usage-summary",
        title: "Printer usage summary",
        description: "Total pages printed per printer.",
        supportedFormats: ["pdf", "html", "excel"],
        defaultPeriod: "Last 30 days",
        usagePercent: 74,
      },
      {
        id: "printer-activity-log",
        title: "Printer activity log",
        description: "Detailed timeline of all print jobs per device.",
        supportedFormats: ["pdf", "html"],
        defaultPeriod: "Last 30 days",
        usagePercent: 69,
      },
      {
        id: "printer-error-report",
        title: "Printer error report",
        description: "Summary of jams, failures, and offline events.",
        supportedFormats: ["pdf", "excel"],
        defaultPeriod: "Last 30 days",
        usagePercent: 58,
      },
      {
        id: "toner-usage",
        title: "Toner / supply usage",
        description: "Estimated toner consumption per printer.",
        supportedFormats: ["pdf", "html", "excel"],
        defaultPeriod: "Last 30 days",
        usagePercent: 88,
      },
    ],
  },
  {
    id: "group",
    label: "Group",
    description: "Aggregated reports for departments and groups.",
    panelTitle: "Group Reports",
    panelDescription:
      "Reports aggregated by user groups or departments, useful for cost allocation and operational comparison.",
    exportFormats: ["pdf", "html", "excel"],
    overviewPercent: 64,
    reports: [
      {
        id: "group-printing-summary",
        title: "Group printing – summary",
        description: "Total print volume per group.",
        supportedFormats: ["pdf", "html", "excel"],
        defaultPeriod: "Last 30 days",
        usagePercent: 60,
      },
      {
        id: "department-comparison",
        title: "Department comparison",
        description: "Side-by-side usage comparison across departments.",
        supportedFormats: ["pdf", "html"],
        defaultPeriod: "Last 30 days",
        usagePercent: 51,
      },
      {
        id: "group-quota-usage",
        title: "Group quota usage",
        description: "Quota consumption and remaining balance per group.",
        supportedFormats: ["pdf", "excel"],
        defaultPeriod: "Last 30 days",
        usagePercent: 70,
      },
    ],
  },
  {
    id: "account",
    label: "Account",
    description: "Financial and balance-related exports.",
    panelTitle: "Account Reports",
    panelDescription:
      "Financial and transaction reports related to user print accounts.",
    exportFormats: ["pdf", "html", "excel"],
    overviewPercent: 76,
    reports: [
      {
        id: "transaction-log",
        title: "Transaction log",
        description: "Full history of credits, debits, and adjustments.",
        supportedFormats: ["pdf", "html", "excel"],
        defaultPeriod: "Last 30 days",
        usagePercent: 83,
      },
      {
        id: "top-up-report",
        title: "Top-up report",
        description: "Summary of all balance top-ups by date.",
        supportedFormats: ["pdf", "excel"],
        defaultPeriod: "Last 30 days",
        usagePercent: 65,
      },
      {
        id: "low-balance-alerts",
        title: "Low balance alerts",
        description: "Users whose balance has dropped below threshold.",
        supportedFormats: ["pdf", "html"],
        defaultPeriod: "Last 30 days",
        usagePercent: 57,
      },
    ],
  },
  {
    id: "summary",
    label: "Summary",
    description: "Management-level overview reports.",
    panelTitle: "Summary Reports",
    panelDescription:
      "High-level overview reports for management and auditing purposes.",
    exportFormats: ["pdf", "html", "excel"],
    overviewPercent: 90,
    reports: [
      {
        id: "weekly-summary",
        title: "Weekly summary",
        description: "Print activity summary for the current week.",
        supportedFormats: ["pdf", "html"],
        defaultPeriod: "Last 30 days",
        usagePercent: 77,
      },
      {
        id: "monthly-overview",
        title: "Monthly overview",
        description: "Month-by-month printing volume and cost breakdown.",
        supportedFormats: ["pdf", "html", "excel"],
        defaultPeriod: "Last 30 days",
        usagePercent: 86,
      },
      {
        id: "annual-report",
        title: "Annual report",
        description: "Full-year statistics for budgeting and review.",
        supportedFormats: ["pdf"],
        defaultPeriod: "This year",
        usagePercent: 93,
      },
      {
        id: "environmental-impact",
        title: "Environmental impact",
        description: "Estimated paper and CO₂ usage metrics.",
        supportedFormats: ["pdf", "html"],
        defaultPeriod: "Last 30 days",
        usagePercent: 68,
      },
    ],
  },
];
