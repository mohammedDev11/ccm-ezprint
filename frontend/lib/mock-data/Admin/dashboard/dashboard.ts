import { HiOutlineUsers, HiOutlinePrinter } from "react-icons/hi2";
import { TbChecklist, TbClockPause } from "react-icons/tb";
import { IconType } from "react-icons";

import { Users, Printer, FileCheck2, Clock3 } from "lucide-react";

export const dashboardPeriods = ["Today", "This Week", "This Month"] as const;

export type DashboardPeriod = (typeof dashboardPeriods)[number];

export const dashboardCardsByPeriod = {
  Today: [
    {
      id: "users",
      title: "Total Users",
      value: "125",
      change: "+12.4%",
      icon: Users,
    },
    {
      id: "printers",
      title: "Total Printers",
      value: "56",
      change: "+4.2%",
      icon: Printer,
    },
    {
      id: "pages",
      title: "Pages Printed",
      value: "568",
      change: "+9.8%",
      icon: FileCheck2,
    },
    {
      id: "hold",
      title: "Hold Jobs",
      value: "14",
      change: "-3.1%",
      icon: Clock3,
    },
  ],

  "This Week": [
    {
      id: "users",
      title: "Total Users",
      value: "412",
      change: "+18.2%",
      icon: Users,
    },
    {
      id: "printers",
      title: "Total Printers",
      value: "56",
      change: "+0.0%",
      icon: Printer,
    },
    {
      id: "pages",
      title: "Pages Printed",
      value: "3,240",
      change: "+15.6%",
      icon: FileCheck2,
    },
    {
      id: "hold",
      title: "Hold Jobs",
      value: "39",
      change: "-6.4%",
      icon: Clock3,
    },
  ],

  "This Month": [
    {
      id: "users",
      title: "Total Users",
      value: "1,286",
      change: "+22.1%",
      icon: Users,
    },
    {
      id: "printers",
      title: "Total Printers",
      value: "56",
      change: "+0.0%",
      icon: Printer,
    },
    {
      id: "pages",
      title: "Pages Printed",
      value: "12,480",
      change: "+27.3%",
      icon: FileCheck2,
    },
    {
      id: "hold",
      title: "Hold Jobs",
      value: "104",
      change: "-4.8%",
      icon: Clock3,
    },
  ],
};

//===============PrinterStatus======================

export type PrinterStatus = "Active" | "Offline" | "Paper Jam" | "Low Toner";

export type PrinterItem = {
  id: string;
  printer_name: string;
  location: string;
  status: PrinterStatus;
  pages_today: number;
  last_activity: string;
};

export type SortField =
  | "printer_name"
  | "location"
  | "status"
  | "pages_today"
  | "last_activity";

export type SortDir = "asc" | "desc";

export const printersData: PrinterItem[] = [
  {
    id: "printer-1",
    printer_name: "HP LaserJet Pro",
    location: "Admin Office",
    status: "Active",
    pages_today: 82,
    last_activity: "2 min ago",
  },
  {
    id: "printer-2",
    printer_name: "Canon iR 2625",
    location: "Library Floor 1",
    status: "Offline",
    pages_today: 0,
    last_activity: "1 hour ago",
  },
  {
    id: "printer-3",
    printer_name: "Brother DCP-L2550DW",
    location: "Lab 204",
    status: "Paper Jam",
    pages_today: 14,
    last_activity: "12 min ago",
  },
  {
    id: "printer-4",
    printer_name: "Epson EcoTank L6490",
    location: "Registration Desk",
    status: "Low Toner",
    pages_today: 37,
    last_activity: "8 min ago",
  },
  {
    id: "printer-5",
    printer_name: "Xerox VersaLink B405",
    location: "Engineering Building",
    status: "Active",
    pages_today: 129,
    last_activity: "Just now",
  },
];

export const printerStatusClasses: Record<PrinterStatus, string> = {
  Active: "status-badge status-success",
  Offline: "status-badge status-danger",
  "Paper Jam": "status-badge status-danger",
  "Low Toner": "status-badge status-warning",
};

export const printerTableColumns: { key: SortField; label: string }[] = [
  { key: "printer_name", label: "Printer Name" },
  { key: "location", label: "Location" },
  { key: "status", label: "Status" },
  { key: "pages_today", label: "Pages Today" },
  { key: "last_activity", label: "Last Activity" },
];

export const allPrinterStatuses: PrinterStatus[] = [
  "Active",
  "Offline",
  "Paper Jam",
  "Low Toner",
];

//===============Left Chart==================
export type ChartDataItem = {
  label: string;
  pagesPrinted: number;
  jobsSubmitted: number;
  jobsReleased: number;
  failedJobs: number;
};

export const summaryChartData: ChartDataItem[] = [
  {
    label: "Week 1",
    pagesPrinted: 120,
    jobsSubmitted: 84,
    jobsReleased: 76,
    failedJobs: 200,
  },
  {
    label: "Week 2",
    pagesPrinted: 168,
    jobsSubmitted: 112,
    jobsReleased: 97,
    failedJobs: 13,
  },
  {
    label: "Week 3",
    pagesPrinted: 142,
    jobsSubmitted: 95,
    jobsReleased: 88,
    failedJobs: 9,
  },
  {
    label: "Week 4",
    pagesPrinted: 196,
    jobsSubmitted: 131,
    jobsReleased: 117,
    failedJobs: 16,
  },
  {
    label: "Week 5",
    pagesPrinted: 174,
    jobsSubmitted: 119,
    jobsReleased: 106,
    failedJobs: 11,
  },
];
export const summaryMetricsConfig = {
  pagesPrinted: {
    label: "Pages Printed",
    color: "var(--color-brand-500)",
  },
  jobsSubmitted: {
    label: "Jobs Submitted",
    color: "var(--color-success-500)",
  },
  jobsReleased: {
    label: "Jobs Released",
    color: "var(--color-warning-500)",
  },
  failedJobs: {
    label: "Failed Jobs",
    color: "var(--color-danger-500)",
  },
};

//==================================
export type PieChartItem = {
  name: string;
  value: number;
  color: string;
};

export const printingActivityDataByFilter = {
  Today: [
    { name: "Students", value: 2140, color: "var(--color-brand-500)" },
    { name: "Faculty", value: 890, color: "var(--color-success-500)" },
    { name: "Staff", value: 420, color: "var(--color-warning-500)" },
  ],

  "This Week": [
    { name: "Students", value: 11240, color: "var(--color-brand-500)" },
    { name: "Faculty", value: 4320, color: "var(--color-success-500)" },
    { name: "Staff", value: 2100, color: "var(--color-warning-500)" },
  ],

  "This Month": [
    { name: "Students", value: 48200, color: "var(--color-brand-500)" },
    { name: "Faculty", value: 15800, color: "var(--color-success-500)" },
    { name: "Staff", value: 7200, color: "var(--color-warning-500)" },
  ],
};

export const printingActivityFilters = ["Today", "This Week", "This Month"];
