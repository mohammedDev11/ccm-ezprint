export type UserDashboardCard = {
  id: number | string;
  title: string;
  value: string;
  change: string;
  iconKey?: string;
};

export type UserDashboardInfoItem = {
  id: number | string;
  label: string;
  value: string;
  iconKey?: string;
};

export type UserDashboardQuickAction = {
  id: number | string;
  label: string;
  href: string;
  variant?: "primary" | "secondary";
  iconKey?: string;
};

export type UserDashboardData = {
  period: string;
  cards: UserDashboardCard[];
  printActivity: unknown[];
  printUsage: unknown[];
  userInformation: UserDashboardInfoItem[];
  quickActions: UserDashboardQuickAction[];
};

export type RecentPrintJob = {
  id: string;
  date: string;
  dateOrder: number;
  printerName: string;
  documentName: string;
  pages: number;
  cost: number;
  status: string;
  attributes?: string[];
};
