"use client";

import {
  Archive,
  CheckCircle2,
  CircleAlert,
  Crown,
  FileOutput,
  Link2,
  Maximize2,
  Minimize2,
  Plus,
  Shield,
  Trash2,
  UserRound,
  WalletCards,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

import FullscreenTablePortal from "@/components/shared/table/FullscreenTablePortal";
import KpiMetricCard from "@/components/shared/cards/KpiMetricCard";
import {
  Table,
  TableBody,
  TableCell,
  TableCheckbox,
  TableControls,
  TableEmptyState,
  TableGrid,
  TableHeader,
  TableHeaderCell,
  TableMain,
  TableSearch,
  TableTitleBlock,
  TableTop,
} from "@/components/shared/table/Table";
import StatusBadge from "@/components/ui/badge/StatusBadge";
import Button from "@/components/ui/button/Button";
import ExpandedButton from "@/components/ui/button/ExpandedButton";
import RefreshButton from "@/components/ui/button/RefreshButton";
import Input from "@/components/ui/input/Input";
import ListBox, { type ListBoxOption } from "@/components/ui/listbox/ListBox";
import Modal from "@/components/ui/modal/Modal";
import { exportTableData, TableExportFormat } from "@/lib/export";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";
import type { StatusTone } from "@/components/ui/badge/StatusBadge";

type SortDir = "asc" | "desc";

type ActionValue =
  | "export-groups"
  | "archive-group"
  | "delete-group"
  | "refresh-data";

type MiniPillTone = "neutral" | "brand" | "success" | "warning";
type ExportMethod = TableExportFormat;

type SharedAccountStatus = "Active" | "Needs Review" | "Archived";

type SharedAccountLinkedItem = {
  id: string;
  userId?: string;
  username: string;
  identifier: string;
  department: string;
  role: string;
  status: "Active" | "Inactive" | "Suspended";
  balance: number;
  pages: number;
  jobs: number;
  lastActivity: string;
  isPrimary: boolean;
};

type SharedAccountLogItem = {
  id: string;
  title: string;
  description: string;
  by: string;
  date: string;
};

type SharedAccountItem = {
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

type SharedAccountSortKey =
  | "personName"
  | "primaryAccount"
  | "linkedCount"
  | "linkedRoles"
  | "department"
  | "status"
  | "lastActivity";

type SharedAccountStatusMeta = {
  label: string;
  tone: StatusTone;
};

type BackendLinkedAccount = {
  id: string;
  userId?: string;
  username: string;
  identifier?: string;
  department?: string;
  role?: string;
  status?: string;
  statusLabel?: string;
  balance?: number;
  pages?: number;
  jobs?: number;
  lastActivityAt?: string | null;
  isPrimary?: boolean;
};

type BackendSharedAccount = {
  id: string;
  primaryAccount?: {
    userId?: string;
    username?: string;
  };
  linkedAccounts?: BackendLinkedAccount[];
  linkedCount?: number;
  linkedRoles?: string[];
  department?: string;
  status?: string;
  statusLabel?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

type SharedAccountsResponse = {
  accounts?: BackendSharedAccount[];
};

type AdminUserLookupItem = {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  department?: string;
  role?: string;
  userType?: string;
  standing?: string;
};

export type SharedAccountsTableHandle = {
  openCreateModal: () => void;
};

const columnsClassName =
  "[grid-template-columns:72px_minmax(220px,1.2fr)_minmax(190px,1fr)_minmax(210px,0.85fr)_minmax(260px,1.1fr)_minmax(180px,1fr)_minmax(140px,0.8fr)_minmax(200px,1fr)]";
const sharedExportFormatOptions: ExportMethod[] = ["PDF", "Excel", "CSV"];
const sharedToolbarExportOptions = [
  { value: "CSV", label: "CSV", selectedLabel: "Export" },
  { value: "PDF", label: "PDF", selectedLabel: "Export" },
  { value: "Excel", label: "Excel", selectedLabel: "Export" },
];
const sharedToolbarActionOptions = [
  {
    value: "export-groups",
    label: "Export Shared Accounts",
    selectedLabel: "Actions",
  },
  {
    value: "archive-group",
    label: "Archive Group",
    selectedLabel: "Actions",
  },
  {
    value: "delete-group",
    label: "Delete Group",
    selectedLabel: "Actions",
  },
  {
    value: "refresh-data",
    label: "Refresh Data",
    selectedLabel: "Actions",
  },
];

const sharedAccountsTableColumns: {
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

const sharedAccountStatusSortOrder: Record<SharedAccountStatus, number> = {
  Active: 0,
  "Needs Review": 1,
  Archived: 2,
};

const sharedAccountStatusMeta: Record<
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

const normalizeSharedStatus = (status?: string): SharedAccountStatus => {
  const normalized = (status || "").toLowerCase();

  if (normalized === "active") return "Active";
  if (normalized === "review" || normalized === "needs review") {
    return "Needs Review";
  }

  return "Archived";
};

const normalizeLinkedStatus = (
  status?: string,
): SharedAccountLinkedItem["status"] => {
  const normalized = (status || "").toLowerCase();

  if (normalized === "active") return "Active";
  if (normalized === "suspended") return "Suspended";

  return "Inactive";
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "No activity";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No activity";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getLatestDate = (values: Array<string | null | undefined>) => {
  const timestamps = values
    .map((value) => {
      if (!value) return 0;
      const timestamp = new Date(value).getTime();
      return Number.isNaN(timestamp) ? 0 : timestamp;
    })
    .filter((timestamp) => timestamp > 0);

  if (timestamps.length === 0) return null;

  return new Date(Math.max(...timestamps)).toISOString();
};

const mapSharedAccount = (
  account: BackendSharedAccount,
  usersByUsername: Map<string, AdminUserLookupItem>,
): SharedAccountItem => {
  const linkedAccounts = (account.linkedAccounts || []).map((linkedAccount) => {
    const user = usersByUsername.get(linkedAccount.username.toLowerCase());

    return {
      id: linkedAccount.id,
      userId: linkedAccount.userId,
      username: linkedAccount.username,
      identifier: linkedAccount.identifier || user?.username || "",
      department: linkedAccount.department || user?.department || "",
      role: linkedAccount.role || user?.role || "",
      status: normalizeLinkedStatus(linkedAccount.statusLabel || linkedAccount.status),
      balance: linkedAccount.balance ?? 0,
      pages: linkedAccount.pages ?? 0,
      jobs: linkedAccount.jobs ?? 0,
      lastActivity: formatDateTime(linkedAccount.lastActivityAt),
      isPrimary: Boolean(linkedAccount.isPrimary),
    };
  });

  const primaryAccount =
    linkedAccounts.find((linkedAccount) => linkedAccount.isPrimary) ||
    linkedAccounts[0] ||
    null;
  const primaryUsername =
    account.primaryAccount?.username || primaryAccount?.username || "Unknown";
  const primaryUser = usersByUsername.get(primaryUsername.toLowerCase());
  const latestActivity = getLatestDate([
    account.updatedAt,
    ...((account.linkedAccounts || []).map((linkedAccount) => linkedAccount.lastActivityAt)),
  ]);
  const createdAt = formatDateTime(account.createdAt);
  const updatedAt = formatDateTime(account.updatedAt);

  return {
    id: account.id,
    personName: primaryUser?.fullName || primaryUsername,
    identifier: primaryAccount?.identifier || primaryUser?.username || primaryUsername,
    primaryAccount: primaryUsername,
    linkedCount: account.linkedCount ?? linkedAccounts.length,
    linkedRoles: account.linkedRoles || [],
    department: account.department || primaryAccount?.department || primaryUser?.department || "",
    status: normalizeSharedStatus(account.statusLabel || account.status),
    lastActivity: formatDateTime(latestActivity),
    createdBy: "Not recorded",
    createdAt,
    updatedAt,
    notes: account.notes || "",
    linkedAccounts,
    logs: [
      {
        id: `${account.id}-created`,
        title: "Shared Account Created",
        description: "Shared account grouping was created in the database.",
        by: "System",
        date: createdAt,
      },
      {
        id: `${account.id}-updated`,
        title: "Shared Account Updated",
        description: "Latest persisted update for this grouping.",
        by: "System",
        date: updatedAt,
      },
    ],
  };
};

function SharedStatusBadge({
  status,
}: {
  status: SharedAccountStatus | string;
}) {
  const compactClassName =
    "whitespace-nowrap rounded-full !gap-2 !px-3 !py-1.5 !text-sm [&>span:first-child]:h-auto [&>span:first-child]:w-auto";

  const normalizedStatus: SharedAccountStatus =
    status === "Active" || status === "Needs Review" || status === "Archived"
      ? status
      : "Archived";

  const meta = sharedAccountStatusMeta[normalizedStatus];
  const icon =
    normalizedStatus === "Active" ? (
      <CheckCircle2 className="h-4 w-4" />
    ) : normalizedStatus === "Needs Review" ? (
      <CircleAlert className="h-4 w-4" />
    ) : (
      <Archive className="h-4 w-4" />
    );

  return (
    <StatusBadge
      label={meta.label}
      tone={meta.tone}
      icon={icon}
      className={compactClassName}
    />
  );
}

function MiniPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: MiniPillTone;
}) {
  const toneStyles: Record<MiniPillTone, React.CSSProperties> = {
    brand: {
      borderColor: "color-mix(in srgb, var(--color-brand-500) 28%, transparent)",
      background: "rgba(var(--brand-rgb), 0.12)",
      color: "color-mix(in srgb, var(--color-brand-700) 82%, var(--title))",
    },
    success: {
      borderColor:
        "color-mix(in srgb, var(--color-support-500) 24%, transparent)",
      background:
        "color-mix(in srgb, var(--color-support-500) 12%, var(--surface))",
      color: "color-mix(in srgb, var(--color-support-700) 76%, var(--title))",
    },
    warning: {
      borderColor:
        "color-mix(in srgb, var(--color-warning-500) 24%, transparent)",
      background:
        "color-mix(in srgb, var(--color-warning-500) 12%, var(--surface))",
      color: "color-mix(in srgb, var(--color-warning-600) 78%, var(--title))",
    },
    neutral: {
      borderColor: "var(--border)",
      background: "var(--surface-2)",
      color: "var(--title)",
    },
  };

  return (
    <span
      className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold"
      style={toneStyles[tone]}
    >
      {label}
    </span>
  );
}

const getLinkedStatusTone = (status: string): MiniPillTone => {
  if (status === "Active") return "success";
  if (status === "Suspended") return "warning";
  return "neutral";
};

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="min-w-0 rounded-[28px] border p-7"
      style={{
        background: "var(--surface-2)",
        borderColor: "var(--border)",
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {label}
      </p>
      <div className="mt-4 break-words text-3xl font-semibold text-[var(--title)]">
        {value}
      </div>
    </div>
  );
}

const getUserTypeLabel = (user: AdminUserLookupItem) =>
  user.userType || user.standing || user.role || "Not recorded";

const getUserSearchText = (user: AdminUserLookupItem) =>
  [
    user.fullName,
    user.username,
    user.email,
    user.department,
    user.role,
    user.userType,
    user.standing,
  ]
    .filter(Boolean)
    .join(" ");

function UserOptionLabel({ user }: { user: AdminUserLookupItem }) {
  return (
    <span className="block min-w-0">
      <span className="block truncate font-semibold text-[var(--title)]">
        {user.fullName}
      </span>
      <span className="mt-1 block truncate text-xs text-[var(--muted)]">
        {user.username} • {user.email || "No email"} • {getUserTypeLabel(user)}
      </span>
    </span>
  );
}

function UserSummaryCard({
  user,
  action,
}: {
  user: AdminUserLookupItem;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="flex min-w-0 items-start justify-between gap-4 rounded-2xl border p-4"
      style={{
        background: "var(--surface-2)",
        borderColor: "var(--border)",
      }}
    >
      <div className="min-w-0 space-y-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-[var(--title)]">
            {user.fullName}
          </p>
          <p className="mt-1 truncate text-sm text-[var(--muted)]">
            {user.username} • {user.email || "No email"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <MiniPill label={user.department || "No department"} />
          <MiniPill label={user.role || "User"} tone="brand" />
          <MiniPill label={getUserTypeLabel(user)} />
        </div>
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

const SharedAccountsTable = forwardRef<SharedAccountsTableHandle>(
function SharedAccountsTable(_props, ref) {
  const [groups, setGroups] = useState<SharedAccountItem[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUserLookupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SharedAccountSortKey>("personName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<SharedAccountItem | null>(
    null
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [isAddLinkedOpen, setIsAddLinkedOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isDeleteGroupConfirmOpen, setIsDeleteGroupConfirmOpen] =
    useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [detailsActionId, setDetailsActionId] = useState("");
  const [actionValue, setActionValue] = useState<ActionValue | null>(null);
  const [exportMethod, setExportMethod] = useState<ExportMethod>("PDF");

  const [createPrimaryUsername, setCreatePrimaryUsername] = useState("");
  const [createLinkedUsernames, setCreateLinkedUsernames] = useState<string[]>([]);
  const [createNotes, setCreateNotes] = useState("");
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [notesDraft, setNotesDraft] = useState("");
  const [linkedSearch, setLinkedSearch] = useState("");
  const [newLinkedUsername, setNewLinkedUsername] = useState("");

  useImperativeHandle(
    ref,
    () => ({
      openCreateModal: () => setIsCreateModalOpen(true),
    }),
    [],
  );

  const loadSharedAccounts = useCallback(async () => {
    setIsLoading(true);

    try {
      const [accountsData, usersData] = await Promise.all([
        apiGet<SharedAccountsResponse>("/admin/accounts", "admin"),
        apiGet<{ users: AdminUserLookupItem[] }>("/admin/users", "admin"),
      ]);
      const usersByUsername = new Map(
        (usersData.users || []).map((user) => [user.username.toLowerCase(), user]),
      );
      const nextGroups = (accountsData.accounts || []).map((account) =>
        mapSharedAccount(account, usersByUsername),
      );

      setAdminUsers(usersData.users || []);
      setGroups(nextGroups);
      setSelectedIds((current) =>
        current.filter((id) => nextGroups.some((group) => group.id === id)),
      );
      setSelectedGroup((current) => {
        if (!current) return null;

        return nextGroups.find((group) => group.id === current.id) || null;
      });
      setLoadError("");
    } catch (requestError) {
      setGroups([]);
      setSelectedIds([]);
      setSelectedGroup(null);
      setLoadError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load shared accounts.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadSharedAccounts);
  }, [loadSharedAccounts]);

  const handleSort = (key: SharedAccountSortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir("asc");
  };

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...groups]
      .filter((group) => {
        if (!term) return true;

        return (
          group.personName.toLowerCase().includes(term) ||
          group.primaryAccount.toLowerCase().includes(term) ||
          group.department.toLowerCase().includes(term) ||
          group.status.toLowerCase().includes(term) ||
          group.linkedRoles.join(" ").toLowerCase().includes(term) ||
          group.identifier.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        const getSortValue = (item: SharedAccountItem) => {
          switch (sortKey) {
            case "personName":
              return item.personName.toLowerCase();
            case "primaryAccount":
              return item.primaryAccount.toLowerCase();
            case "linkedCount":
              return item.linkedCount;
            case "linkedRoles":
              return item.linkedRoles.join(", ").toLowerCase();
            case "department":
              return item.department.toLowerCase();
            case "status":
              return sharedAccountStatusSortOrder[item.status];
            case "lastActivity":
              return item.lastActivity.toLowerCase();
            default:
              return item.personName.toLowerCase();
          }
        };

        const aValue = getSortValue(a);
        const bValue = getSortValue(b);

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDir === "asc" ? aValue - bValue : bValue - aValue;
        }

        return sortDir === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
  }, [groups, search, sortKey, sortDir]);

  const selectedGroups = useMemo(
    () => groups.filter((group) => selectedIds.includes(group.id)),
    [groups, selectedIds]
  );

  const accountStats = useMemo(() => {
    const linkedAccounts = groups.flatMap((group) => group.linkedAccounts);
    const totalBalance = linkedAccounts.reduce(
      (sum, account) => sum + account.balance,
      0
    );
    const activeAccounts = groups.filter(
      (group) => group.status === "Active"
    ).length;
    const reviewOrArchived = groups.length - activeAccounts;

    return {
      totalAccounts: groups.length,
      activeAccounts,
      reviewOrArchived,
      linkedAccounts: linkedAccounts.length,
      totalBalance,
    };
  }, [groups]);

  const kpiCards = [
    {
      title: "Total Shared Accounts",
      value: accountStats.totalAccounts.toLocaleString(),
      helper: `${filteredGroups.length.toLocaleString()} visible in current view`,
      icon: <WalletCards className="h-5 w-5" />,
    },
    {
      title: "Active Accounts",
      value: accountStats.activeAccounts.toLocaleString(),
      helper: "Shared groups currently active",
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
    {
      title: "Review / Archived",
      value: accountStats.reviewOrArchived.toLocaleString(),
      helper: "Groups needing review or archived",
      icon: <Archive className="h-5 w-5" />,
    },
    {
      title: "Linked Balance",
      value: accountStats.totalBalance.toFixed(2),
      helper: `${accountStats.linkedAccounts.toLocaleString()} linked accounts tracked`,
      icon: <Link2 className="h-5 w-5" />,
    },
  ];

  const usersByUsername = useMemo(
    () => new Map(adminUsers.map((user) => [user.username.toLowerCase(), user])),
    [adminUsers],
  );
  const selectedPrimaryUser = createPrimaryUsername
    ? usersByUsername.get(createPrimaryUsername)
    : undefined;
  const selectedLinkedUsers = createLinkedUsernames
    .map((username) => usersByUsername.get(username))
    .filter((user): user is AdminUserLookupItem => Boolean(user));
  const createPrimaryOptions = useMemo<ListBoxOption[]>(
    () =>
      adminUsers.map((user) => ({
        value: user.username.toLowerCase(),
        label: <UserOptionLabel user={user} />,
        selectedLabel: user.fullName,
        searchText: getUserSearchText(user),
      })),
    [adminUsers],
  );
  const createLinkedOptions = useMemo<ListBoxOption[]>(
    () =>
      adminUsers
        .filter((user) => {
          const username = user.username.toLowerCase();
          return (
            username !== createPrimaryUsername &&
            !createLinkedUsernames.includes(username)
          );
        })
        .map((user) => ({
          value: user.username.toLowerCase(),
          label: <UserOptionLabel user={user} />,
          selectedLabel: user.fullName,
          searchText: getUserSearchText(user),
        })),
    [adminUsers, createLinkedUsernames, createPrimaryUsername],
  );
  const canCreateSharedAccount =
    Boolean(selectedPrimaryUser) && createLinkedUsernames.length > 0 && !isCreating;
  const detailLinkedOptions = useMemo<ListBoxOption[]>(() => {
    if (!selectedGroup) return [];

    const linkedUsernames = new Set(
      selectedGroup.linkedAccounts.map((account) =>
        account.username.toLowerCase(),
      ),
    );

    return adminUsers
      .filter((user) => !linkedUsernames.has(user.username.toLowerCase()))
      .map((user) => ({
        value: user.username.toLowerCase(),
        label: <UserOptionLabel user={user} />,
        selectedLabel: user.fullName,
        searchText: getUserSearchText(user),
      }));
  }, [adminUsers, selectedGroup]);

  const allVisibleIds = filteredGroups.map((group) => group.id);
  const isAllSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedIds.includes(id));

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !allVisibleIds.includes(id))
      );
      return;
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
  };

  const removeSelectedGroupFromAction = (id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const exportSharedAccounts = (format: TableExportFormat) => {
    if (selectedGroups.length === 0) return;

    exportTableData({
      title: "Shared Accounts",
      filename: "alpha-queue-shared-accounts",
      format,
      columns: [
        { label: "Person Name", value: (row: SharedAccountItem) => row.personName },
        { label: "Identifier", value: (row) => row.identifier },
        { label: "Primary Account", value: (row) => row.primaryAccount },
        { label: "Linked Accounts", value: (row) => row.linkedCount },
        { label: "Linked Roles", value: (row) => row.linkedRoles },
        { label: "Department", value: (row) => row.department },
        { label: "Status", value: (row) => row.status },
        { label: "Last Activity", value: (row) => row.lastActivity },
        { label: "Notes", value: (row) => row.notes },
      ],
      rows: selectedGroups,
    });
  };

  const handleExportChange = (value: string) => {
    if (selectedGroups.length === 0) return;

    setExportMethod(value as ExportMethod);
    setActionValue("export-groups");
  };

  const handleExportConfirmed = () => {
    exportSharedAccounts(exportMethod);
    setActionValue(null);
  };

  const refreshSharedAccounts = () => {
    void loadSharedAccounts();
  };

  const selectedLinkedAccounts = useMemo(() => {
    if (!selectedGroup) return [];

    const term = linkedSearch.trim().toLowerCase();

    return selectedGroup.linkedAccounts.filter((account) => {
      if (!term) return true;

      return (
        account.username.toLowerCase().includes(term) ||
        account.identifier.toLowerCase().includes(term) ||
        account.department.toLowerCase().includes(term) ||
        account.role.toLowerCase().includes(term)
      );
    });
  }, [selectedGroup, linkedSearch]);

  const totals = useMemo(() => {
    if (!selectedGroup) return null;

    const linkedAccounts = selectedGroup.linkedAccounts;

    return {
      linkedAccounts: linkedAccounts.length,
      pages: linkedAccounts.reduce((sum, item) => sum + item.pages, 0),
      jobs: linkedAccounts.reduce((sum, item) => sum + item.jobs, 0),
      balance: linkedAccounts.reduce((sum, item) => sum + item.balance, 0),
    };
  }, [selectedGroup]);

  const prepareSelectedGroupDrafts = (group: SharedAccountItem) => {
    setNotesDraft(group.notes);
    setLinkedSearch("");
    setNewLinkedUsername("");
    setIsAddLinkedOpen(false);
    setIsLogsModalOpen(false);
    setIsDeleteGroupConfirmOpen(false);
    setDetailsError("");
    setDetailsActionId("");
  };

  const openGroupModal = (group: SharedAccountItem) => {
    prepareSelectedGroupDrafts(group);
    setSelectedGroup(group);
  };

  const resetCreateForm = () => {
    setCreatePrimaryUsername("");
    setCreateLinkedUsernames([]);
    setCreateNotes("");
    setCreateError("");
    setIsCreating(false);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    resetCreateForm();
  };

  const handleCreatePrimaryChange = (username: string) => {
    const normalizedUsername = username.toLowerCase();
    setCreatePrimaryUsername(normalizedUsername);
    setCreateLinkedUsernames((current) =>
      current.filter((item) => item !== normalizedUsername),
    );
    setCreateError("");
  };

  const handleCreateLinkedSelect = (username: string) => {
    const normalizedUsername = username.toLowerCase();

    if (
      !normalizedUsername ||
      normalizedUsername === createPrimaryUsername ||
      createLinkedUsernames.includes(normalizedUsername)
    ) {
      return;
    }

    setCreateLinkedUsernames((current) => [...current, normalizedUsername]);
    setCreateError("");
  };

  const removeCreateLinkedUser = (username: string) => {
    setCreateLinkedUsernames((current) =>
      current.filter((item) => item !== username),
    );
  };

  const createSharedAccount = async () => {
    if (!selectedPrimaryUser || createLinkedUsernames.length === 0) {
      setCreateError("Select a primary account and at least one linked account.");
      return;
    }

    setIsCreating(true);
    setCreateError("");

    try {
      await apiPost(
        "/admin/accounts",
        {
          primaryAccount: {
            userId: selectedPrimaryUser.id,
            username: selectedPrimaryUser.username,
          },
          linkedAccounts: selectedLinkedUsers.map((user) => ({
            userId: user.id,
            username: user.username,
          })),
          department: selectedPrimaryUser.department || "",
          status: "active",
          notes: createNotes.trim(),
        },
        "admin",
      );

      await loadSharedAccounts();
      closeCreateModal();
    } catch (requestError) {
      setCreateError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create shared account group.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const saveNotes = async () => {
    if (!selectedGroup) return;

    setDetailsActionId("notes");
    setDetailsError("");

    try {
      await apiPatch(
        `/admin/accounts/${selectedGroup.id}/notes`,
        {
          notes: notesDraft.trim(),
        },
        "admin",
      );

      await loadSharedAccounts();
    } catch (requestError) {
      setDetailsError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save notes.",
      );
    } finally {
      setDetailsActionId("");
    }
  };

  const addLinkedAccount = async (username = newLinkedUsername) => {
    if (!selectedGroup) return;
    const linkedUsername = username.trim().toLowerCase();
    if (!linkedUsername) return;

    setDetailsActionId("add-linked");
    setDetailsError("");

    try {
      await apiPatch(
        `/admin/accounts/${selectedGroup.id}/link`,
        {
          username: linkedUsername,
          department: selectedGroup.department,
        },
        "admin",
      );

      await loadSharedAccounts();
      setNewLinkedUsername("");
      setIsAddLinkedOpen(false);
    } catch (requestError) {
      setDetailsError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to add linked account.",
      );
    } finally {
      setDetailsActionId("");
    }
  };

  const changePrimaryAccount = async (linkedAccountId: string) => {
    if (!selectedGroup || !linkedAccountId) return;

    setDetailsActionId(`primary-${linkedAccountId}`);
    setDetailsError("");

    try {
      await apiPatch(
        `/admin/accounts/${selectedGroup.id}/primary`,
        {
          linkedAccountId,
        },
        "admin",
      );

      await loadSharedAccounts();
    } catch (requestError) {
      setDetailsError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to change primary account.",
      );
    } finally {
      setDetailsActionId("");
    }
  };

  const removeLinkedAccount = async (accountId: string) => {
    if (!selectedGroup) return;

    const accountToRemove = selectedGroup.linkedAccounts.find(
      (account) => account.id === accountId,
    );

    if (!accountToRemove || accountToRemove.isPrimary) return;

    setDetailsActionId(`remove-${accountId}`);
    setDetailsError("");

    try {
      await apiPatch(
        `/admin/accounts/${selectedGroup.id}`,
        {
          linkedAccounts: selectedGroup.linkedAccounts
            .filter((account) => account.id !== accountId)
            .map((account) => ({
              userId: account.userId || undefined,
              username: account.username,
              identifier: account.identifier,
              department: account.department,
              role: account.role,
              status: account.status.toLowerCase(),
              balance: account.balance,
              pages: account.pages,
              jobs: account.jobs,
              isPrimary: account.isPrimary,
            })),
        },
        "admin",
      );

      await loadSharedAccounts();
    } catch (requestError) {
      setDetailsError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to remove linked account.",
      );
    } finally {
      setDetailsActionId("");
    }
  };

  const deleteGrouping = async () => {
    if (!selectedGroup) return;

    setDetailsActionId("delete-group");
    setDetailsError("");

    try {
      await apiDelete(`/admin/accounts/${selectedGroup.id}`, "admin");
      setSelectedIds((prev) => prev.filter((id) => id !== selectedGroup.id));
      setIsDeleteGroupConfirmOpen(false);
      setSelectedGroup(null);
      await loadSharedAccounts();
    } catch (requestError) {
      setDetailsError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete shared account group.",
      );
    } finally {
      setDetailsActionId("");
    }
  };

  const handleActionConfirm = async () => {
    if (!actionValue) return;

    if (actionValue === "refresh-data") {
      await loadSharedAccounts();
      setActionValue(null);
      return;
    }

    if (actionValue === "archive-group") {
      if (selectedIds.length === 0) return;

      await Promise.all(
        selectedIds.map((id) =>
          apiPatch(
            `/admin/accounts/${id}`,
            {
              status: "archived",
            },
            "admin",
          ),
        ),
      );

      await loadSharedAccounts();
      setActionValue(null);
      return;
    }

    if (actionValue === "delete-group") {
      if (selectedIds.length === 0) return;

      await Promise.all(
        selectedIds.map((id) => apiDelete(`/admin/accounts/${id}`, "admin")),
      );

      setSelectedIds([]);
      if (selectedGroup && selectedIds.includes(selectedGroup.id)) {
        setSelectedGroup(null);
      }
      await loadSharedAccounts();
      setActionValue(null);
      return;
    }

    if (actionValue === "export-groups") {
      if (selectedGroups.length === 0) {
        setActionValue(null);
        return;
      }

      handleExportConfirmed();
      setActionValue(null);
      return;
    }

    setActionValue(null);
  };

  const renderSharedAccountDetailsContent = () => {
    if (!selectedGroup || !totals) return null;

    return (
      <div className="min-w-0 space-y-6 overflow-x-hidden">
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            label="Total Linked Accounts"
            value={totals.linkedAccounts}
          />
          <InfoCard label="Combined Pages" value={totals.pages} />
          <InfoCard label="Combined Jobs" value={totals.jobs} />
          <InfoCard label="Combined Balance" value={totals.balance.toFixed(2)} />
        </div>

        {detailsError ? (
          <div
            className="rounded-2xl border px-4 py-3 text-sm font-semibold"
            style={{
              background:
                "color-mix(in srgb, var(--color-brand-500) 10%, var(--surface))",
              borderColor:
                "color-mix(in srgb, var(--color-brand-500) 28%, var(--border))",
              color:
                "color-mix(in srgb, var(--color-brand-700) 82%, var(--title))",
            }}
          >
            {detailsError}
          </div>
        ) : null}

        <section
          className="min-w-0 rounded-[28px] border p-5"
          style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
        >
          <div className="mb-4 flex min-w-0 flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Linked Accounts
            </h4>

            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="w-full min-w-0 sm:min-w-[280px]">
                <Input
                  value={linkedSearch}
                  onChange={(e) => setLinkedSearch(e.target.value)}
                  placeholder="Search linked accounts..."
                  wrapperClassName="h-12"
                  className="h-full py-0"
                />
              </div>

              <Button
                iconLeft={<Plus className="h-4 w-4" />}
                className="h-12 shrink-0 px-5 text-sm"
                onClick={() => {
                  setIsAddLinkedOpen((current) => !current);
                  setNewLinkedUsername("");
                  setDetailsError("");
                }}
              >
                Add Linked Account
              </Button>
            </div>
          </div>

          {isAddLinkedOpen ? (
            <div
              className="mb-4 rounded-2xl border p-4"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                Add existing user
              </label>
              <ListBox
                value={newLinkedUsername}
                onValueChange={(value) => {
                  setNewLinkedUsername(value);
                  void addLinkedAccount(value);
                }}
                options={detailLinkedOptions}
                placeholder="Search linked accounts..."
                searchable
                combobox
                searchPlaceholder="Search linked accounts..."
                emptyText="No available users."
                triggerClassName="min-h-12 px-4 py-3"
                contentClassName="z-[70]"
                maxHeightClassName="max-h-72"
                disabled={detailsActionId === "add-linked"}
              />
            </div>
          ) : null}

          <div className="space-y-3">
            {selectedLinkedAccounts.length === 0 ? (
              <div className="rounded-2xl border px-5 py-4 text-sm font-medium text-[var(--muted)]">
                No linked accounts found.
              </div>
            ) : (
              selectedLinkedAccounts.map((account) => {
                const linkedUser = usersByUsername.get(
                  account.username.toLowerCase(),
                );
                const displayName = linkedUser?.fullName || account.username;
                const primaryStyles = account.isPrimary
                  ? {
                      background:
                        "color-mix(in srgb, var(--color-brand-500) 10%, var(--surface))",
                      borderColor:
                        "color-mix(in srgb, var(--color-brand-500) 38%, var(--border))",
                    }
                  : {
                      background: "var(--surface)",
                      borderColor: "var(--border)",
                    };

                return (
                  <div
                    key={account.id}
                    className="min-w-0 rounded-2xl border p-4"
                    style={primaryStyles}
                  >
                    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] xl:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="truncate text-lg font-semibold text-[var(--title)]">
                            {displayName}
                          </h5>
                          {account.isPrimary ? (
                            <MiniPill label="Primary" tone="brand" />
                          ) : null}
                        </div>
                        <p className="mt-1 truncate text-sm text-[var(--muted)]">
                          {account.username}
                          {linkedUser?.email ? ` • ${linkedUser.email}` : ""}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <MiniPill label={account.role || "User"} />
                          <MiniPill
                            label={account.status}
                            tone={getLinkedStatusTone(account.status)}
                          />
                          <MiniPill
                            label={account.department || "No department"}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 xl:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                            Balance
                          </p>
                          <p className="mt-1 font-semibold text-[var(--title)]">
                            {account.balance.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                            Pages
                          </p>
                          <p className="mt-1 font-semibold text-[var(--title)]">
                            {account.pages}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                            Jobs
                          </p>
                          <p className="mt-1 font-semibold text-[var(--title)]">
                            {account.jobs}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                            Last Activity
                          </p>
                          <p className="mt-1 truncate font-semibold text-[var(--title)]">
                            {account.lastActivity}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        {!account.isPrimary ? (
                          <>
                            <Button
                              variant="outline"
                              className="h-10 px-4 text-sm"
                              iconLeft={<Crown className="h-4 w-4" />}
                              disabled={detailsActionId === `primary-${account.id}`}
                              onClick={() => void changePrimaryAccount(account.id)}
                            >
                              Set as Primary
                            </Button>
                            <button
                              type="button"
                              className="flex h-10 w-10 items-center justify-center rounded-md border text-[var(--muted)] transition hover:border-[var(--color-brand-500)] hover:text-[var(--color-brand-500)] disabled:cursor-not-allowed disabled:opacity-50"
                              style={{
                                background: "var(--surface)",
                                borderColor: "var(--border)",
                              }}
                              disabled={detailsActionId === `remove-${account.id}`}
                              aria-label={`Remove ${account.username}`}
                              onClick={() => void removeLinkedAccount(account.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <MiniPill label="Primary cannot be removed" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section
          className="min-w-0 rounded-[28px] border p-5"
          style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Notes
            </h4>
            <Button
              className="h-10 px-4 text-sm"
              disabled={detailsActionId === "notes"}
              onClick={saveNotes}
            >
              {detailsActionId === "notes" ? "Saving..." : "Save"}
            </Button>
          </div>
          <textarea
            value={notesDraft}
            onChange={(event) => setNotesDraft(event.target.value)}
            placeholder="Add shared account notes"
            className="min-h-[110px] w-full resize-y rounded-md border bg-transparent px-4 py-3 text-sm outline-none transition focus:border-brand-500/50 focus:ring-4 focus:ring-[rgba(var(--brand-rgb),0.16)]"
            style={{ borderColor: "var(--border)", color: "var(--title)" }}
          />
        </section>
      </div>
    );
  };

  return (
    <>
      <style jsx global>{`
        .shared-accounts-details-modal {
          width: min(1100px, calc(100vw - 2rem)) !important;
          max-width: min(1100px, calc(100vw - 2rem)) !important;
          margin-inline: auto;
          overflow-x: hidden !important;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        @media (min-width: 640px) {
          .shared-accounts-details-modal {
            width: min(1100px, calc(100vw - 3rem)) !important;
            max-width: min(1100px, calc(100vw - 3rem)) !important;
          }
        }

        .shared-accounts-details-modal::-webkit-scrollbar {
          display: none;
        }

        .shared-accounts-modal-shell * {
          min-width: 0;
          box-sizing: border-box;
        }

      `}</style>

      <FullscreenTablePortal open={isTableExpanded}>
        {renderSharedAccountsTable(true)}
      </FullscreenTablePortal>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((card, index) => (
            <KpiMetricCard
              key={card.title}
              title={card.title}
              value={card.value}
              helper={card.helper}
              icon={card.icon}
              index={index}
            />
          ))}
        </div>

        {renderSharedAccountsTable()}
      </div>

      <Modal
        open={Boolean(selectedGroup)}
        onClose={() => {
          setSelectedGroup(null);
          setIsAddLinkedOpen(false);
          setIsLogsModalOpen(false);
          setIsDeleteGroupConfirmOpen(false);
          setDetailsError("");
        }}
        className="shared-accounts-details-modal"
      >
        {selectedGroup ? (
          <div className="shared-accounts-modal-shell w-full max-w-full min-w-0 space-y-6 overflow-x-hidden pr-2">
            <div className="flex min-w-0 flex-col gap-4 border-b border-[var(--border)] pb-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="break-words title-xl">
                    {selectedGroup.personName}
                  </h3>
                  <SharedStatusBadge status={selectedGroup.status} />
                </div>
                <p className="paragraph mt-2 break-words !text-base">
                  Primary account:{" "}
                  <span className="font-semibold text-[var(--title)]">
                    {selectedGroup.primaryAccount}
                  </span>
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {selectedGroup.department || "No department"} • Updated{" "}
                  {selectedGroup.updatedAt}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2 pr-10">
                <Button
                  variant="outline"
                  className="h-10 px-4 text-sm"
                  iconLeft={<Shield className="h-4 w-4" />}
                  onClick={() => setIsLogsModalOpen(true)}
                >
                  View Logs
                </Button>
                <Button
                  variant="outline"
                  className="h-10 px-4 text-sm text-[var(--color-brand-600)]"
                  iconLeft={<Trash2 className="h-4 w-4" />}
                  onClick={() => setIsDeleteGroupConfirmOpen(true)}
                >
                  Delete Group
                </Button>
              </div>
            </div>

            <div className="min-w-0 overflow-x-hidden">
              {renderSharedAccountDetailsContent()}
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(selectedGroup && isLogsModalOpen)}
        onClose={() => setIsLogsModalOpen(false)}
      >
        {selectedGroup ? (
          <div className="w-[min(92vw,760px)] max-w-full min-w-0 space-y-5 overflow-x-hidden">
            <div>
              <h3 className="title-lg">Shared Account Logs</h3>
              <p className="paragraph mt-2 !text-base">
                Audit trail for {selectedGroup.personName}
              </p>
            </div>

            <div className="max-h-[520px] space-y-3 overflow-y-auto pr-2">
              {selectedGroup.logs.map((log) => (
                <div
                  key={log.id}
                  className="min-w-0 rounded-2xl border p-5"
                  style={{
                    background: "var(--surface-2)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex min-w-0 gap-3">
                    <Shield className="mt-1 h-5 w-5 shrink-0 text-[var(--muted)]" />
                    <div className="min-w-0">
                      <h4 className="truncate text-lg font-semibold text-[var(--title)]">
                        {log.title}
                      </h4>
                      <p className="paragraph mt-2 break-words !text-base">
                        {log.description}
                      </p>
                      <p className="mt-3 text-sm font-semibold text-[var(--title)]">
                        {log.by} • {log.date}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(selectedGroup && isDeleteGroupConfirmOpen)}
        onClose={() => setIsDeleteGroupConfirmOpen(false)}
      >
        {selectedGroup ? (
          <div className="w-[min(92vw,560px)] max-w-full min-w-0 space-y-5 overflow-x-hidden">
            <div>
              <h3 className="title-md text-[var(--color-brand-600)]">
                Delete Group
              </h3>
              <p className="paragraph mt-2">
                This will permanently remove the shared account group for{" "}
                <span className="font-semibold text-[var(--title)]">
                  {selectedGroup.personName}
                </span>
                .
              </p>
            </div>

            <div
              className="rounded-2xl border p-4"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border)",
              }}
            >
              <p className="font-semibold text-[var(--title)]">
                {selectedGroup.primaryAccount}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {selectedGroup.linkedCount} linked accounts •{" "}
                {selectedGroup.department || "No department"}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteGroupConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                iconLeft={<Trash2 className="h-4 w-4" />}
                disabled={detailsActionId === "delete-group"}
                onClick={deleteGrouping}
              >
                {detailsActionId === "delete-group" ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={isCreateModalOpen}
        onClose={closeCreateModal}
      >
        <div className="w-[min(96vw,920px)] max-w-full min-w-0 space-y-8 overflow-x-hidden">
          <div>
            <h3 className="title-lg">Create Shared Account Group</h3>
          </div>

          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="min-w-0 space-y-4">
              <div className="min-w-0">
                <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                  Primary Account *
                </label>
                <ListBox
                  value={createPrimaryUsername}
                  onValueChange={handleCreatePrimaryChange}
                  options={createPrimaryOptions}
                  placeholder="Search primary account..."
                  searchable
                  combobox
                  clearSearchOnSelect={false}
                  searchPlaceholder="Search primary account..."
                  emptyText="No users found."
                  triggerClassName="min-h-14 px-4 py-3"
                  contentClassName="z-[70]"
                  maxHeightClassName="max-h-72"
                />
              </div>

              {selectedPrimaryUser ? (
                <UserSummaryCard user={selectedPrimaryUser} />
              ) : null}
            </div>

            <div className="min-w-0 space-y-4">
              <div className="min-w-0">
                <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                  Linked Account *
                </label>
                <ListBox
                  value=""
                  onValueChange={handleCreateLinkedSelect}
                  options={createLinkedOptions}
                  placeholder="Search linked accounts..."
                  searchable
                  combobox
                  searchPlaceholder="Search linked accounts..."
                  emptyText="No available linked users."
                  disabled={!selectedPrimaryUser}
                  triggerClassName="min-h-14 px-4 py-3"
                  contentClassName="z-[70]"
                  maxHeightClassName="max-h-72"
                />
              </div>

              <div className="space-y-3">
                {selectedLinkedUsers.length === 0 ? (
                  <div
                    className="rounded-2xl border px-4 py-4 text-sm font-medium text-[var(--muted)]"
                    style={{
                      background: "var(--surface-2)",
                      borderColor: "var(--border)",
                    }}
                  >
                    No linked accounts selected.
                  </div>
                ) : (
                  selectedLinkedUsers.map((user) => (
                    <UserSummaryCard
                      key={user.username}
                      user={user}
                      action={
                        <Button
                          variant="outline"
                          className="h-10 px-4 text-sm"
                          onClick={() => removeCreateLinkedUser(user.username)}
                        >
                          Remove
                        </Button>
                      }
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
              Notes
            </label>
            <Input
              value={createNotes}
              onChange={(e) => setCreateNotes(e.target.value)}
              placeholder="Optional notes..."
            />
          </div>

          {createError ? (
            <div
              className="rounded-2xl border px-4 py-3 text-sm font-semibold"
              style={{
                background:
                  "color-mix(in srgb, var(--color-brand-500) 10%, var(--surface))",
                borderColor:
                  "color-mix(in srgb, var(--color-brand-500) 28%, var(--border))",
                color:
                  "color-mix(in srgb, var(--color-brand-700) 82%, var(--title))",
              }}
            >
              {createError}
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={closeCreateModal}
            >
              Cancel
            </Button>
            <Button
              iconLeft={<UserRound className="h-4 w-4" />}
              onClick={createSharedAccount}
              disabled={!canCreateSharedAccount}
            >
              {isCreating ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(actionValue)} onClose={() => setActionValue(null)}>
        {actionValue === "export-groups" ? (
          <div className="w-[min(92vw,760px)] space-y-5 pr-4">
            <div
              className="border-b pb-4"
              style={{ borderColor: "var(--border)" }}
            >
              <h3 className="title-md flex items-center gap-2">
                <FileOutput className="h-5 w-5 text-brand-500" />
                Export selected shared accounts
              </h3>
              <p className="paragraph mt-2">
                Review the shared accounts to export, remove any row if needed,
                then choose the export format.
              </p>
              <p className="paragraph mt-2">
                Total selected:{" "}
                <span className="font-semibold">{selectedGroups.length}</span>
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
              <div
                className="max-h-[320px] space-y-3 overflow-y-auto pr-2"
                style={{ scrollbarWidth: "thin" }}
              >
                {selectedGroups.length === 0 ? (
                  <div
                    className="rounded-2xl border p-5 text-sm"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                      color: "var(--muted)",
                    }}
                  >
                    No shared accounts selected.
                  </div>
                ) : (
                  selectedGroups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border p-4"
                      style={{
                        borderColor: "var(--border)",
                        background: "var(--surface-2)",
                      }}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--title)]">
                          {group.personName}
                        </p>
                        <p className="truncate text-sm text-[var(--muted)]">
                          {group.primaryAccount} • {group.department}
                        </p>
                      </div>

                      <ExpandedButton
                        id={`remove-export-shared-accounts-${group.id}`}
                        label="Remove"
                        icon={Trash2}
                        variant="danger"
                        onClick={() => removeSelectedGroupFromAction(group.id)}
                      />
                    </div>
                  ))
                )}
              </div>

              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Export Method
                </p>

                <ListBox
                  options={sharedExportFormatOptions}
                  value={exportMethod}
                  onValueChange={(value) =>
                    setExportMethod(value as ExportMethod)
                  }
                  triggerClassName="h-12 w-full"
                  contentClassName="w-full"
                  ariaLabel="Export method"
                />

                <p className="mt-4 text-sm text-[var(--muted)]">
                  Selected format:{" "}
                  <span className="font-semibold text-[var(--title)]">
                    {exportMethod}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setActionValue(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleExportConfirmed}
                className="px-8"
                disabled={selectedGroups.length === 0}
              >
                Export
              </Button>
            </div>
          </div>
        ) : (
        <div className="w-[min(92vw,720px)] max-w-full min-w-0 space-y-5 overflow-x-hidden">
          <div>
            <h3 className="title-md flex items-center gap-2">
              {actionValue === "archive-group" && (
                <>
                  <Archive className="h-5 w-5 text-[var(--muted)]" />
                  Archive Group
                </>
              )}
              {actionValue === "delete-group" && (
                <>
                  <Trash2 className="h-5 w-5 text-[var(--color-brand-500)]" />
                  Delete Group
                </>
              )}
              {actionValue === "refresh-data" && "Refresh Data"}
            </h3>

            <p className="paragraph mt-2">
              {actionValue === "archive-group" &&
                "The selected groups below will be archived."}
              {actionValue === "delete-group" &&
                "The selected groups below will be permanently removed from the table."}
              {actionValue === "refresh-data" &&
                "This will reload shared accounts from the database."}
            </p>

            {actionValue !== "refresh-data" ? (
              <p className="paragraph mt-2">
                Total selected:{" "}
                <span className="font-semibold">{selectedGroups.length}</span>
              </p>
            ) : null}
          </div>

          {actionValue !== "refresh-data" ? (
            <div
              className="max-h-[320px] space-y-3 overflow-y-auto pr-2"
              style={{ scrollbarWidth: "thin" }}
            >
              {selectedGroups.length === 0 ? (
                <div
                  className="rounded-2xl border p-5 text-sm"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                    color: "var(--muted)",
                  }}
                >
                  No groups selected.
                </div>
              ) : (
                selectedGroups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border p-4"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                    }}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--title)]">
                        {group.personName}
                      </p>
                      <p className="truncate text-sm text-[var(--muted)]">
                        {group.primaryAccount} • {group.department}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      className="shrink-0"
                      onClick={() => removeSelectedGroupFromAction(group.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setActionValue(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleActionConfirm}
              disabled={
                actionValue !== "refresh-data" && selectedGroups.length === 0
              }
            >
              {actionValue === "refresh-data"
                ? "Refresh"
                : actionValue === "archive-group"
                ? "Archive"
                : "Delete"}
            </Button>
          </div>
        </div>
        )}
      </Modal>
    </>
  );

  function renderSharedAccountsTable(expanded = false) {
    return (
      <Table
        className={`flex min-h-[520px] flex-col ${
          expanded ? "h-dvh !rounded-none" : "max-h-[calc(100vh-20rem)]"
        }`}
      >
        <TableTop className={`shrink-0 ${expanded ? "bg-[var(--surface)]" : ""}`}>
          <TableTitleBlock title="Shared Accounts" />

          <TableControls>
            <TableSearch
              id={
                expanded
                  ? "search-shared-accounts-expanded"
                  : "search-shared-accounts"
              }
              label="Search shared accounts"
              value={search}
              onChange={setSearch}
              wrapperClassName="w-full md:w-[420px]"
            />

            <RefreshButton
              className="h-14"
              onClick={refreshSharedAccounts}
            />

            <ListBox
              options={sharedToolbarExportOptions}
              onValueChange={handleExportChange}
              placeholder={
                <span className="text-[var(--foreground)]">Export</span>
              }
              disabled={selectedGroups.length === 0}
              className="w-auto"
              triggerClassName="h-14 min-w-[160px] px-6 text-base [&>span]:text-base"
              contentClassName="w-[220px]"
              optionClassName="py-4 text-lg"
              align="right"
              ariaLabel="Export selected shared accounts"
            />

            <ListBox
              options={sharedToolbarActionOptions}
              onValueChange={(value) => {
                if (selectedGroups.length === 0) return;

                setActionValue(value as ActionValue);
              }}
              placeholder={
                <span className="text-[var(--foreground)]">Actions</span>
              }
              disabled={selectedGroups.length === 0}
              className="w-auto"
              triggerClassName="h-14 min-w-[180px] px-6 text-base [&>span]:text-base"
              contentClassName="w-[260px]"
              optionClassName="py-4 text-lg"
              align="right"
              ariaLabel="Shared account actions"
            />

            <button
              type="button"
              onClick={() => setIsTableExpanded(!expanded)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-transparent text-[var(--muted)] transition hover:text-[var(--color-brand-500)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)]"
              aria-label={
                expanded
                  ? "Collapse shared accounts table"
                  : "Expand shared accounts table"
              }
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </button>
          </TableControls>
        </TableTop>

        <TableMain className="min-h-0 flex-1">
          <TableGrid minWidthClassName="flex h-full min-w-[1522px] flex-col">
            <TableHeader columnsClassName={columnsClassName}>
              <TableCell className="justify-center">
                <TableCheckbox
                  checked={isAllSelected}
                  onToggle={toggleSelectAll}
                />
              </TableCell>

              {sharedAccountsTableColumns.map((column) => {
                const isSortable =
                  column.sortable || column.key === "linkedRoles";

                return (
                  <TableHeaderCell
                    key={column.key}
                    label={column.label}
                    sortable={isSortable}
                    active={sortKey === column.key}
                    direction={sortDir}
                    onClick={() => isSortable && handleSort(column.key)}
                  />
                );
              })}
            </TableHeader>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <TableBody>
                {isLoading ? (
                  <TableEmptyState text="Loading shared accounts..." />
                ) : loadError ? (
                  <TableEmptyState text={loadError} />
                ) : filteredGroups.length === 0 ? (
                  <TableEmptyState text="No shared accounts found" />
                ) : (
                  filteredGroups.map((group) => {
                    const isSelected = selectedIds.includes(group.id);

                    return (
                      <div
                        key={group.id}
                        onClick={() => openGroupModal(group)}
                        className={`grid w-full cursor-pointer border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                      >
                        <TableCell
                          className="justify-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <TableCheckbox
                            checked={isSelected}
                            onToggle={() => toggleRowSelection(group.id)}
                          />
                        </TableCell>

                        <TableCell className="text-[32px] font-semibold text-[var(--title)] sm:text-base">
                          {group.personName}
                        </TableCell>

                        <TableCell className="paragraph font-semibold text-[var(--title)]">
                          {group.primaryAccount}
                        </TableCell>

                        <TableCell className="paragraph font-semibold text-[var(--title)]">
                          {group.linkedCount}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {group.linkedRoles.map((role) => (
                              <MiniPill key={role} label={role} />
                            ))}
                          </div>
                        </TableCell>

                        <TableCell className="paragraph">
                          {group.department}
                        </TableCell>

                        <TableCell>
                          <SharedStatusBadge status={group.status} />
                        </TableCell>

                        <TableCell className="paragraph">
                          {group.lastActivity}
                        </TableCell>
                      </div>
                    );
                  })
                )}
              </TableBody>
            </div>
          </TableGrid>
        </TableMain>
      </Table>
    );
  }
});

export default SharedAccountsTable;
