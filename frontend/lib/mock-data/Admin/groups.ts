// export type GroupRestrictedStatus = "Locked" | "Unlocked";
// export type GroupPeriod = "None" | "Monthly";

// export type GroupItem = {
//   id: string;
//   name: string;
//   members: number;
//   initialCredit: number;
//   restricted: GroupRestrictedStatus;
//   scheduleAmount: number;
//   period: GroupPeriod;
//   selectedByDefault?: boolean;
// };

// export const printingGroupsData: GroupItem[] = [
//   {
//     id: "all-users",
//     name: "All Users",
//     members: 3000,
//     initialCredit: 0,
//     restricted: "Locked",
//     scheduleAmount: 0,
//     period: "None",
//     selectedByDefault: true,
//   },
//   {
//     id: "ccm-it",
//     name: "CCM-IT",
//     members: 45,
//     initialCredit: 0,
//     restricted: "Unlocked",
//     scheduleAmount: 0,
//     period: "None",
//     selectedByDefault: true,
//   },
//   {
//     id: "ccm-staff",
//     name: "CCM-Staff",
//     members: 60,
//     initialCredit: 0,
//     restricted: "Locked",
//     scheduleAmount: 0,
//     period: "None",
//   },
//   {
//     id: "coe-faculty",
//     name: "COE-Faculty",
//     members: 35,
//     initialCredit: 100,
//     restricted: "Locked",
//     scheduleAmount: 100,
//     period: "Monthly",
//   },
//   {
//     id: "coe-graduate",
//     name: "COE-Graduate",
//     members: 120,
//     initialCredit: 100,
//     restricted: "Unlocked",
//     scheduleAmount: 0,
//     period: "None",
//     selectedByDefault: true,
//   },
//   {
//     id: "coe-ug",
//     name: "COE-UG",
//     members: 600,
//     initialCredit: 50,
//     restricted: "Unlocked",
//     scheduleAmount: 50,
//     period: "Monthly",
//     selectedByDefault: true,
//   },
//   {
//     id: "ics-faculty",
//     name: "ICS-Faculty",
//     members: 30,
//     initialCredit: 100,
//     restricted: "Locked",
//     scheduleAmount: 0,
//     period: "None",
//   },
// ];

// export type GroupSortKey =
//   | "name"
//   | "members"
//   | "initialCredit"
//   | "restricted"
//   | "scheduleAmount"
//   | "period";

// export const groupColumns: {
//   key: GroupSortKey;
//   label: string;
//   sortable: boolean;
// }[] = [
//   { key: "name", label: "Group Name", sortable: true },
//   { key: "members", label: "Members", sortable: true },
//   { key: "initialCredit", label: "Initial Credit", sortable: true },
//   { key: "restricted", label: "Restricted", sortable: true },
//   { key: "scheduleAmount", label: "Schedule Amount", sortable: true },
//   { key: "period", label: "Period", sortable: true },
// ];

// export const groupRestrictedSortOrder: Record<GroupRestrictedStatus, number> = {
//   Unlocked: 1,
//   Locked: 2,
// };

// export const groupPeriodSortOrder: Record<GroupPeriod, number> = {
//   None: 1,
//   Monthly: 2,
// };

// ============NEW==============
// groups.ts
export type GroupRestrictedStatus = "Restricted" | "Unrestricted";
export type GroupPeriod = "None" | "Daily" | "Weekly" | "Monthly";
export type GroupFilterRestriction = "All" | GroupRestrictedStatus;
export type GroupFilterPeriod = "All" | GroupPeriod;

export type GroupItem = {
  id: string;
  name: string;
  members: number;
  initialQuota: number;
  restricted: GroupRestrictedStatus;
  scheduleAmount: number;
  period: GroupPeriod;
  notes?: string;
  selectedByDefault?: boolean;
  accumulationEnabled?: boolean;
  accumulationLimit?: number;
  initialOverdraft?: number;
};

export type GroupFilters = {
  restriction: GroupFilterRestriction;
  period: GroupFilterPeriod;
  quotaRange: [number, number];
};

export const maxGroupQuota = 1000;

export const initialGroupFilters: GroupFilters = {
  restriction: "All",
  period: "All",
  quotaRange: [0, maxGroupQuota],
};

export const printingGroupsData: GroupItem[] = [
  {
    id: "all-users",
    name: "All Users",
    members: 3000,
    initialQuota: 0,
    restricted: "Restricted",
    scheduleAmount: 0,
    period: "None",
    selectedByDefault: true,
    notes: "Main university-wide group",
  },
  {
    id: "ccm-it",
    name: "CCM-IT",
    members: 45,
    initialQuota: 0,
    restricted: "Unrestricted",
    scheduleAmount: 0,
    period: "None",
    selectedByDefault: true,
    notes: "IT staff group",
  },
  {
    id: "ccm-staff",
    name: "CCM-Staff",
    members: 60,
    initialQuota: 0,
    restricted: "Restricted",
    scheduleAmount: 0,
    period: "None",
  },
  {
    id: "coe-faculty",
    name: "COE-Faculty",
    members: 35,
    initialQuota: 100,
    restricted: "Restricted",
    scheduleAmount: 100,
    period: "Monthly",
  },
  {
    id: "coe-graduate",
    name: "COE-Graduate",
    members: 120,
    initialQuota: 100,
    restricted: "Unrestricted",
    scheduleAmount: 0,
    period: "None",
    selectedByDefault: true,
  },
  {
    id: "coe-ug",
    name: "COE-UG",
    members: 600,
    initialQuota: 50,
    restricted: "Unrestricted",
    scheduleAmount: 50,
    period: "Monthly",
    selectedByDefault: true,
  },
  {
    id: "ics-faculty",
    name: "ICS-Faculty",
    members: 30,
    initialQuota: 100,
    restricted: "Restricted",
    scheduleAmount: 0,
    period: "None",
  },
];

export type GroupSortKey =
  | "name"
  | "members"
  | "initialQuota"
  | "restricted"
  | "scheduleAmount"
  | "period";

export const groupColumns: {
  key: GroupSortKey;
  label: string;
  sortable: boolean;
}[] = [
  { key: "name", label: "Group Name", sortable: true },
  { key: "members", label: "Members", sortable: true },
  { key: "initialQuota", label: "Initial Quota", sortable: true },
  { key: "restricted", label: "Restricted", sortable: true },
  { key: "scheduleAmount", label: "Schedule Amount", sortable: true },
  { key: "period", label: "Period", sortable: true },
];

export const groupRestrictedSortOrder: Record<GroupRestrictedStatus, number> = {
  Unrestricted: 1,
  Restricted: 2,
};

export const groupPeriodSortOrder: Record<GroupPeriod, number> = {
  None: 1,
  Daily: 2,
  Weekly: 3,
  Monthly: 4,
};

export const groupPeriodOptions: GroupPeriod[] = [
  "None",
  "Daily",
  "Weekly",
  "Monthly",
];
