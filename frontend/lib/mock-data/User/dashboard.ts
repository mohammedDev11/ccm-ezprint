import { DonutChartItem } from "@/components/shared/charts/GeneralDonutChart";
import {
  Clock3,
  CreditCard,
  DollarSign,
  FileText,
  IdCard,
  Layers3,
  Upload,
  User2,
  type LucideIcon,
} from "lucide-react";

export type UserTopCard = {
  id: number;
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
};

export type UserDashboardPeriod = "Today" | "This Week" | "This Month";

export const userDashboardPeriods: UserDashboardPeriod[] = [
  "Today",
  "This Week",
  "This Month",
];

export const userDashboardCardsByPeriod: Record<
  UserDashboardPeriod,
  UserTopCard[]
> = {
  Today: [
    {
      id: 1,
      title: "Current Quota",
      value: "24.50",
      change: "+5.00",
      icon: DollarSign,
    },
    {
      id: 2,
      title: "Total Print Jobs",
      value: "142",
      change: "+3 today",
      icon: FileText,
    },
    {
      id: 3,
      title: "Total Pages Printed",
      value: "1,847",
      change: "+18 today",
      icon: Layers3,
    },
    {
      id: 4,
      title: "Active Pending Jobs",
      value: "3",
      change: "Ready to release",
      icon: Clock3,
    },
  ],
  "This Week": [
    {
      id: 1,
      title: "Current Quota",
      value: "24.50",
      change: "+5.00",
      icon: DollarSign,
    },
    {
      id: 2,
      title: "Total Print Jobs",
      value: "142",
      change: "+12 this week",
      icon: FileText,
    },
    {
      id: 3,
      title: "Total Pages Printed",
      value: "1,847",
      change: "+89 this week",
      icon: Layers3,
    },
    {
      id: 4,
      title: "Active Pending Jobs",
      value: "3",
      change: "Ready to release",
      icon: Clock3,
    },
  ],
  "This Month": [
    {
      id: 1,
      title: "Current Quota",
      value: "24.50",
      change: "$12.00",
      icon: DollarSign,
    },
    {
      id: 2,
      title: "Total Print Jobs",
      value: "142",
      change: "+37 this month",
      icon: FileText,
    },
    {
      id: 3,
      title: "Total Pages Printed",
      value: "1,847",
      change: "+264 this month",
      icon: Layers3,
    },
    {
      id: 4,
      title: "Active Pending Jobs",
      value: "3",
      change: "Ready to release",
      icon: Clock3,
    },
  ],
};

//==========Charts================

export const userPrintActivityFilters = [
  "This Week",
  "This Month",
  "This Year",
];

export const userPrintActivityData = {
  "This Week": [
    { day: "Mon", pages: 12, jobs: 2 },
    { day: "Tue", pages: 18, jobs: 3 },
    { day: "Wed", pages: 10, jobs: 2 },
    { day: "Thu", pages: 22, jobs: 4 },
    { day: "Fri", pages: 14, jobs: 2 },
    { day: "Sat", pages: 8, jobs: 1 },
    { day: "Sun", pages: 16, jobs: 3 },
  ],
  "This Month": [
    { day: "W1", pages: 64, jobs: 10 },
    { day: "W2", pages: 78, jobs: 12 },
    { day: "W3", pages: 53, jobs: 9 },
    { day: "W4", pages: 89, jobs: 15 },
  ],
  "This Year": [
    { day: "Jan", pages: 140, jobs: 22 },
    { day: "Feb", pages: 168, jobs: 28 },
    { day: "Mar", pages: 152, jobs: 24 },
    { day: "Apr", pages: 181, jobs: 30 },
    { day: "May", pages: 134, jobs: 21 },
    { day: "Jun", pages: 196, jobs: 33 },
  ],
};

export const userPrintActivityMetricsConfig = {
  pages: {
    label: "Pages Printed",
    color: "var(--color-brand-500)",
  },
  jobs: {
    label: "Print Jobs",
    color: "var(--color-success-500)",
  },
};

export const userPrintUsageFilters = ["This Week", "This Month", "This Year"];

export const userPrintUsageData: Record<string, DonutChartItem[]> = {
  "This Week": [
    {
      name: "Black & White",
      value: 84,
      color: "var(--color-brand-500)",
    },
    {
      name: "Color",
      value: 26,
      color: "var(--color-success-500)",
    },
    {
      name: "Duplex",
      value: 18,
      color: "var(--color-warning-500)",
    },
  ],
  "This Month": [
    {
      name: "Black & White",
      value: 312,
      color: "var(--color-brand-500)",
    },
    {
      name: "Color",
      value: 104,
      color: "var(--color-success-500)",
    },
    {
      name: "Duplex",
      value: 76,
      color: "var(--color-warning-500)",
    },
  ],
  "This Year": [
    {
      name: "Black & White",
      value: 1847,
      color: "var(--color-brand-500)",
    },
    {
      name: "Color",
      value: 562,
      color: "var(--color-success-500)",
    },
    {
      name: "Duplex",
      value: 418,
      color: "var(--color-warning-500)",
    },
  ],
};

//===============user info===========

export type UserInfoItem = {
  id: number;
  label: string;
  value: string;
  icon: LucideIcon;
  isSensitive?: boolean;
};

export const userInformationData: UserInfoItem[] = [
  {
    id: 1,
    label: "Name",
    value: "Mohammed Alshammasi",
    icon: User2,
  },
  {
    id: 2,
    label: "User ID",
    value: "s202279720",
    icon: IdCard,
  },
];

//===========Actions==============
export type UserQuickAction = {
  id: number;
  label: string;
  href: string;
  icon: LucideIcon;
  variant?: "primary" | "secondary";
};

export const userQuickActions: UserQuickAction[] = [
  {
    id: 1,
    label: "Upload Document",
    href: "/sections/user/web-print",
    icon: Upload,
    variant: "primary",
  },
  {
    id: 2,
    label: "Redeem Card",
    href: "/sections/user/redeem-card",
    icon: CreditCard,
    variant: "secondary",
  },
  {
    id: 3,
    label: "View Pending Jobs",
    href: "/sections/user/jobs-pending-release",
    icon: Clock3,
    variant: "secondary",
  },
];
