"use client";

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
import FullscreenTablePortal from "@/components/shared/table/FullscreenTablePortal";
import KpiMetricCard from "@/components/shared/cards/KpiMetricCard";
import StatusBadge from "@/components/ui/badge/StatusBadge";
import Button from "@/components/ui/button/Button";
import ExpandedButton from "@/components/ui/button/ExpandedButton";
import RefreshButton from "@/components/ui/button/RefreshButton";
import Input from "@/components/ui/input/Input";
import ListBox from "@/components/ui/listbox/ListBox";
import Modal from "@/components/ui/modal/Modal";
import {
  UserAccountItem,
  UserDepartment,
  UserRestrictedStatus,
  UserRole,
  UserSortKey,
  UserStanding,
  userRestrictedSortOrder,
  userTableColumns,
} from "@/lib/mock-data/Admin/users";
import { exportTableData } from "@/lib/export";
import { apiGet } from "@/services/api";
import {
  BriefcaseBusiness,
  ChevronDown,
  FileOutput,
  FileSpreadsheet,
  Lock,
  LockOpen,
  Mail,
  Maximize2,
  Minimize2,
  Phone,
  RotateCcw,
  Shield,
  SlidersHorizontal,
  Trash2,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

type SortDir = "asc" | "desc";
type ActionValue =
  | "delete-selected"
  | "export-users"
  | "assign-quota"
  | "restrict-selected"
  | "unrestrict-selected";

type ExportMethod = "PDF" | "Excel" | "CSV";

const columnsClassName =
  "[grid-template-columns:72px_minmax(220px,1.1fr)_minmax(320px,1.6fr)_minmax(160px,0.9fr)_minmax(170px,0.9fr)_minmax(120px,0.7fr)_minmax(100px,0.6fr)]";

const formatMoney = (value: number) => value.toFixed(2);
const getExportTimestamp = () =>
  new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
const exportFormatOptions: ExportMethod[] = ["PDF", "Excel", "CSV"];
const toolbarExportOptions = [
  { value: "CSV", label: "CSV", selectedLabel: "Export" },
  { value: "PDF", label: "PDF", selectedLabel: "Export" },
  { value: "Excel", label: "Excel", selectedLabel: "Export" },
];
const toolbarActionOptions = [
  {
    value: "delete-selected",
    label: "Delete selected",
    selectedLabel: "Actions",
  },
  { value: "assign-quota", label: "Assign quota", selectedLabel: "Actions" },
  {
    value: "restrict-selected",
    label: "Restrict selected",
    selectedLabel: "Actions",
  },
  {
    value: "unrestrict-selected",
    label: "Unrestrict selected",
    selectedLabel: "Actions",
  },
];
const fallbackRoleOptions: UserRole[] = ["Admin", "SubAdmin", "User"];
const fallbackDepartmentOptions: UserDepartment[] = [
  "Software Engineering",
  "Computer Science",
  "Information Systems",
  "Cybersecurity",
  "Mathematics",
  "Deanship",
];
const fallbackStandingOptions: UserStanding[] = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Graduate",
  "Faculty",
  "Staff",
];
const getUniqueOptions = (values: string[], fallbackValues: string[]) => {
  const options = Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));

  return options.length > 0 ? options : fallbackValues;
};

function RestrictedBadge({ status }: { status: UserRestrictedStatus }) {
  const isUnrestricted = status === "Unrestricted";

  return (
    <StatusBadge
      label=""
      tone={isUnrestricted ? "success" : "danger"}
      icon={
        isUnrestricted ? (
          <LockOpen className="h-5 w-5" />
        ) : (
          <Lock className="h-5 w-5" />
        )
      }
      className="justify-center [&>span:first-child]:h-auto [&>span:first-child]:w-auto [&>span:first-child]:rounded-none [&>span:first-child]:border-0"
    />
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl border p-4"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface-2)",
      }}
    >
      <div className="mt-0.5 shrink-0" style={{ color: "var(--muted)" }}>
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {label}
        </p>
        <div className="mt-1 break-words text-sm sm:text-base">{value}</div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-semibold transition"
      style={{
        borderColor: checked
          ? "color-mix(in srgb, var(--color-brand-500) 34%, var(--border))"
          : "var(--border)",
        background: checked
          ? "rgba(var(--brand-rgb), 0.12)"
          : "color-mix(in srgb, var(--surface-2) 82%, transparent)",
        color: checked ? "var(--color-brand-600)" : "var(--paragraph)",
      }}
    >
      {label}
    </button>
  );
}

const UserAccountsTable = () => {
  const [users, setUsers] = useState<UserAccountItem[]>([]);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<UserSortKey>("username");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openUserModal, setOpenUserModal] = useState<UserAccountItem | null>(
    null,
  );

  const [editingRestricted, setEditingRestricted] =
    useState<UserRestrictedStatus>("Unrestricted");
  const [editingQuota, setEditingQuota] = useState("");
  const [editingNotes, setEditingNotes] = useState("");

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [actionModal, setActionModal] = useState<ActionValue | null>(null);

  const [filterRestricted, setFilterRestricted] = useState<
    UserRestrictedStatus[]
  >([]);
  const [filterRoles, setFilterRoles] = useState<UserRole[]>([]);
  const [filterDepartments, setFilterDepartments] = useState<UserDepartment[]>(
    [],
  );
  const [filterStandings, setFilterStandings] = useState<UserStanding[]>([]);
  const [minimumQuota, setMinimumQuota] = useState("");
  const [maximumQuota, setMaximumQuota] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");

  const [exportMethod, setExportMethod] = useState<ExportMethod>("PDF");
  const [quotaToAssign, setQuotaToAssign] = useState("");
  const [quotaComment, setQuotaComment] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      const data = await apiGet<{ users: UserAccountItem[] }>(
        "/admin/users",
        "admin",
      );
      setUsers(Array.isArray(data?.users) ? data.users : []);
      setLoadError("");
    } catch (requestError) {
      setUsers([]);
      setLoadError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load users.",
      );
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadUsers);
  }, [loadUsers]);

  useEffect(() => {
    if (!isFilterPanelOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Element | null;

      if (target?.closest("[data-admin-users-filter-panel]")) {
        return;
      }

      setIsFilterPanelOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFilterPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isFilterPanelOpen]);

  const restrictedOptions: UserRestrictedStatus[] = [
    "Restricted",
    "Unrestricted",
  ];
  const roleOptions = useMemo(
    () => getUniqueOptions(users.map((user) => user.role), fallbackRoleOptions),
    [users],
  );
  const departmentOptions = useMemo(
    () =>
      getUniqueOptions(
        users.map((user) => user.department),
        fallbackDepartmentOptions,
      ),
    [users],
  );
  const standingOptions = useMemo(
    () =>
      getUniqueOptions(
        users.map((user) => user.standing),
        fallbackStandingOptions,
      ),
    [users],
  );

  const handleSort = (key: UserSortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir("asc");
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleFromList = <T,>(
    value: T,
    list: T[],
    setter: (next: T[]) => void,
  ) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
      return;
    }

    setter([...list, value]);
  };

  const resetFilters = () => {
    setFilterRestricted([]);
    setFilterRoles([]);
    setFilterDepartments([]);
    setFilterStandings([]);
    setMinimumQuota("");
    setMaximumQuota("");
    setDepartmentSearch("");
  };

  const openUserDetails = (user: UserAccountItem) => {
    setEditingRestricted(user.restricted);
    setEditingQuota(String(user.quota));
    setEditingNotes(user.notes);
    setOpenUserModal(user);
  };

  const hasActiveFilters =
    filterRestricted.length > 0 ||
    filterRoles.length > 0 ||
    filterDepartments.length > 0 ||
    filterStandings.length > 0 ||
    minimumQuota.trim() !== "" ||
    maximumQuota.trim() !== "";

  const activeFilterLabels = [
    ...filterRestricted,
    ...filterRoles,
    ...filterDepartments,
    ...filterStandings,
    minimumQuota.trim() ? `Min ${minimumQuota}` : "",
    maximumQuota.trim() ? `Max ${maximumQuota}` : "",
  ].filter(Boolean);

  const visibleDepartmentOptions = departmentOptions.filter((department) =>
    department.toLowerCase().includes(departmentSearch.trim().toLowerCase()),
  );

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    const minQuotaValue =
      minimumQuota.trim() === "" ? null : Number(minimumQuota);
    const maxQuotaValue =
      maximumQuota.trim() === "" ? null : Number(maximumQuota);

    return [...users]
      .filter((user) => {
        const matchesSearch =
          !term ||
          user.username.toLowerCase().includes(term) ||
          user.fullName.toLowerCase().includes(term) ||
          user.restricted.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.role.toLowerCase().includes(term) ||
          user.department.toLowerCase().includes(term) ||
          user.standing.toLowerCase().includes(term);

        const matchesRestricted =
          filterRestricted.length === 0 ||
          filterRestricted.includes(user.restricted);

        const matchesRole =
          filterRoles.length === 0 || filterRoles.includes(user.role);

        const matchesDepartment =
          filterDepartments.length === 0 ||
          filterDepartments.includes(user.department);

        const matchesStanding =
          filterStandings.length === 0 ||
          filterStandings.includes(user.standing);

        const matchesMinQuota =
          minQuotaValue === null || user.quota >= minQuotaValue;

        const matchesMaxQuota =
          maxQuotaValue === null || user.quota <= maxQuotaValue;

        return (
          matchesSearch &&
          matchesRestricted &&
          matchesRole &&
          matchesDepartment &&
          matchesStanding &&
          matchesMinQuota &&
          matchesMaxQuota
        );
      })
      .sort((a, b) => {
        const getSortValue = (item: UserAccountItem) => {
          switch (sortKey) {
            case "username":
              return item.username.toLowerCase();
            case "fullName":
              return item.fullName.toLowerCase();
            case "quota":
              return item.quota;
            case "restricted":
              return userRestrictedSortOrder[item.restricted];
            case "pages":
              return item.pages;
            case "jobs":
              return item.jobs;
            default:
              return item.username.toLowerCase();
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
  }, [
    users,
    search,
    sortKey,
    sortDir,
    filterRestricted,
    filterRoles,
    filterDepartments,
    filterStandings,
    minimumQuota,
    maximumQuota,
  ]);

  const selectedUsers = useMemo(
    () => users.filter((user) => selectedIds.includes(user.id)),
    [users, selectedIds],
  );

  const userStats = useMemo(() => {
    const totalPages = users.reduce((total, user) => total + user.pages, 0);
    const totalJobs = users.reduce((total, user) => total + user.jobs, 0);
    const restrictedUsers = users.filter(
      (user) => user.restricted === "Restricted",
    ).length;

    return {
      totalUsers: users.length,
      restrictedUsers,
      totalPages,
      totalJobs,
    };
  }, [users]);

  const kpiCards = [
    {
      title: "Total Users",
      value: userStats.totalUsers.toLocaleString(),
      helper: `${filteredUsers.length.toLocaleString()} visible in current view`,
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Restricted Users",
      value: userStats.restrictedUsers.toLocaleString(),
      helper: "Accounts currently restricted",
      icon: <Lock className="h-5 w-5" />,
    },
    {
      title: "Total Pages",
      value: userStats.totalPages.toLocaleString(),
      helper: "Printed pages from loaded users",
      icon: <FileSpreadsheet className="h-5 w-5" />,
    },
    {
      title: "Total Jobs",
      value: userStats.totalJobs.toLocaleString(),
      helper: "Jobs from loaded users",
      icon: <BriefcaseBusiness className="h-5 w-5" />,
    },
  ];

  const allVisibleIds = filteredUsers.map((user) => user.id);
  const isAllSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !allVisibleIds.includes(id)),
      );
      return;
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
  };

  const removeSelectedUserFromAction = (id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const applyBulkRestrictedStatus = (status: UserRestrictedStatus) => {
    if (selectedIds.length === 0) return;

    setUsers((prev) =>
      prev.map((user) =>
        selectedIds.includes(user.id) ? { ...user, restricted: status } : user,
      ),
    );

    if (openUserModal && selectedIds.includes(openUserModal.id)) {
      setOpenUserModal((prev) =>
        prev ? { ...prev, restricted: status } : prev,
      );
      setEditingRestricted(status);
    }

    setActionModal(null);
  };

  const handleActionChange = (value: string) => {
    if (selectedUsers.length === 0) return;

    const nextValue = value as ActionValue;

    if (nextValue === "restrict-selected") {
      applyBulkRestrictedStatus("Restricted");
      return;
    }

    if (nextValue === "unrestrict-selected") {
      applyBulkRestrictedStatus("Unrestricted");
      return;
    }

    if (nextValue === "assign-quota") {
      setQuotaToAssign("");
      setQuotaComment("");
    }

    setActionModal(nextValue);
  };

  const handleExportChange = (value: string) => {
    if (selectedUsers.length === 0) return;

    setExportMethod(value as ExportMethod);
    setActionModal("export-users");
  };

  const handleSaveUserModal = () => {
    if (!openUserModal) return;

    const parsedQuota = Number(editingQuota);
    const safeQuota = Number.isNaN(parsedQuota)
      ? openUserModal.quota
      : parsedQuota;

    const updatedUser: UserAccountItem = {
      ...openUserModal,
      restricted: editingRestricted,
      quota: safeQuota,
      notes: editingNotes,
    };

    setUsers((prev) =>
      prev.map((user) => (user.id === openUserModal.id ? updatedUser : user)),
    );

    setOpenUserModal(null);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;

    setUsers((prev) => prev.filter((user) => !selectedIds.includes(user.id)));
    setSelectedIds([]);
    setActionModal(null);
  };

  const handleAssignQuota = () => {
    const parsedQuota = Number(quotaToAssign);
    if (selectedIds.length === 0 || Number.isNaN(parsedQuota)) return;

    setUsers((prev) =>
      prev.map((user) =>
        selectedIds.includes(user.id)
          ? {
              ...user,
              quota: parsedQuota,
              notes: quotaComment.trim()
                ? `${user.notes} ${quotaComment.trim()}`
                : user.notes,
            }
          : user,
      ),
    );

    if (openUserModal && selectedIds.includes(openUserModal.id)) {
      setOpenUserModal((prev) =>
        prev
          ? {
              ...prev,
              quota: parsedQuota,
              notes: quotaComment.trim()
                ? `${prev.notes} ${quotaComment.trim()}`
                : prev.notes,
            }
          : prev,
      );
    }

    setActionModal(null);
  };

  const handleExportSelectedUsers = () => {
    if (selectedUsers.length === 0) return;

    exportTableData({
      title: "User Accounts",
      filename: `users-export-${getExportTimestamp()}`,
      format: exportMethod,
      columns: [
        { label: "Username", value: (user: UserAccountItem) => user.username },
        { label: "Full Name", value: (user) => user.fullName },
        { label: "Email", value: (user) => user.email },
        { label: "Role", value: (user) => user.role },
        { label: "Department", value: (user) => user.department },
        { label: "Standing", value: (user) => user.standing },
        { label: "Quota", value: (user) => formatMoney(user.quota) },
        { label: "Restricted", value: (user) => user.restricted },
        { label: "Pages", value: (user) => user.pages },
        { label: "Jobs", value: (user) => user.jobs },
      ],
      rows: selectedUsers,
    });

    setActionModal(null);
  };

  const renderFilterPanelContent = () => (
    <div className="space-y-4 p-2">
      <div
        className="rounded-2xl border p-3"
        style={{
          borderColor: "var(--border)",
          background: "color-mix(in srgb, var(--surface-2) 82%, transparent)",
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap gap-2">
            {activeFilterLabels.length > 0 ? (
              activeFilterLabels.slice(0, 8).map((label, index) => (
                <span
                  key={`${label}-${index}`}
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background: "rgba(var(--brand-rgb), 0.1)",
                    color: "var(--color-brand-600)",
                  }}
                >
                  {label}
                </span>
              ))
            ) : (
              <span className="text-sm text-[var(--muted)]">
                No filters applied
              </span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            iconLeft={<RotateCcw className="h-4 w-4" />}
            onClick={resetFilters}
          >
            Clear all
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div
          className="rounded-2xl border p-4"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Status
          </h4>

          <div className="flex flex-wrap gap-2">
            {restrictedOptions.map((status) => (
              <FilterChip
                key={status}
                label={status}
                checked={filterRestricted.includes(status)}
                onChange={() =>
                  toggleFromList(
                    status,
                    filterRestricted,
                    setFilterRestricted,
                  )
                }
              />
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl border p-4"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Role
          </h4>

          <div className="flex flex-wrap gap-2">
            {roleOptions.map((role) => (
              <FilterChip
                key={role}
                label={role}
                checked={filterRoles.includes(role)}
                onChange={() => toggleFromList(role, filterRoles, setFilterRoles)}
              />
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl border p-4"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Department
          </h4>

          <Input
            value={departmentSearch}
            onChange={(e) => setDepartmentSearch(e.target.value)}
            placeholder="Search departments"
            className="mb-3"
          />

          <div className="max-h-32 overflow-y-auto pr-1">
            <div className="flex flex-wrap gap-2">
              {visibleDepartmentOptions.map((department) => (
                <FilterChip
                  key={department}
                  label={department}
                  checked={filterDepartments.includes(department)}
                  onChange={() =>
                    toggleFromList(
                      department,
                      filterDepartments,
                      setFilterDepartments,
                    )
                  }
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl border p-4"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Standing
          </h4>

          <div className="flex flex-wrap gap-2">
            {standingOptions.map((standing) => (
              <FilterChip
                key={standing}
                label={standing}
                checked={filterStandings.includes(standing)}
                onChange={() =>
                  toggleFromList(
                    standing,
                    filterStandings,
                    setFilterStandings,
                  )
                }
              />
            ))}
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl border p-4"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface-2)",
        }}
      >
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          Quota Range
        </h4>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--title)]">
              Minimum quota
            </p>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={minimumQuota}
              onChange={(e) => setMinimumQuota(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-[var(--title)]">
              Maximum quota
            </p>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={maximumQuota}
              onChange={(e) => setMaximumQuota(e.target.value)}
              placeholder="500.00"
            />
          </div>
        </div>
      </div>

      <div
        className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="text-sm text-[var(--muted)]">
          {hasActiveFilters
            ? `${filteredUsers.length} users match current filters`
            : "Showing all users"}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            iconLeft={<RotateCcw className="h-4 w-4" />}
            onClick={resetFilters}
          >
            Clear all
          </Button>

          <Button onClick={() => setIsFilterPanelOpen(false)}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );

  const renderUsersTable = (expanded = false) => (
      <Table
        className={`flex min-h-[520px] flex-col ${
          expanded ? "h-dvh !rounded-none" : "max-h-[calc(100vh-20rem)]"
        }`}
      >
        <TableTop
          className={`shrink-0 ${expanded ? "bg-[var(--surface)]" : ""}`}
        >
          <TableTitleBlock
            title="User Accounts"
            description={
              hasActiveFilters
                ? `Showing ${filteredUsers.length} filtered user${
                    filteredUsers.length === 1 ? "" : "s"
                  }`
                : undefined
            }
          />

          <TableControls>
            <TableSearch
              id={expanded ? "search-users-expanded" : "search-users"}
              label="Search users"
              value={search}
              onChange={setSearch}
            />

            <RefreshButton
              onClick={() => void loadUsers()}
              className="h-14"
            />

            <div
              className="relative w-auto shrink-0 self-start md:self-auto"
              data-admin-users-filter-panel
            >
              <Button
                variant="outline"
                iconLeft={<SlidersHorizontal className="h-4 w-4" />}
                iconRight={
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isFilterPanelOpen ? "rotate-180" : ""
                    }`}
                  />
                }
                className="h-14 min-w-[150px] px-6 text-base"
                aria-haspopup="dialog"
                aria-expanded={isFilterPanelOpen}
                onClick={() => setIsFilterPanelOpen((current) => !current)}
              >
                <span className="inline-flex items-center gap-2">
                  Filter
                  {activeFilterLabels.length > 0 ? (
                    <span
                      className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold"
                      style={{
                        background: "rgba(var(--brand-rgb), 0.12)",
                        color: "var(--color-brand-600)",
                      }}
                    >
                      {activeFilterLabels.length}
                    </span>
                  ) : null}
                </span>
              </Button>

              {isFilterPanelOpen ? (
                <div
                  className="absolute left-0 top-[calc(100%+10px)] z-50 max-h-[420px] w-[min(92vw,560px)] overflow-y-auto rounded-md border p-2 shadow-xl md:left-auto md:right-0"
                  role="dialog"
                  aria-label="Filter users"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                    boxShadow: "0 14px 40px rgba(var(--shadow-color), 0.16)",
                  }}
                >
                  {renderFilterPanelContent()}
                </div>
              ) : null}
            </div>

            <ListBox
              options={toolbarExportOptions}
              onValueChange={handleExportChange}
              placeholder={
                <span className="text-[var(--foreground)]">Export</span>
              }
              disabled={selectedUsers.length === 0}
              className="w-auto"
              triggerClassName="h-14 min-w-[160px] px-6 text-base [&>span]:text-base"
              contentClassName="w-[220px]"
              optionClassName="py-4 text-lg"
              align="right"
              ariaLabel="Export selected users"
            />

            <ListBox
              options={toolbarActionOptions}
              onValueChange={handleActionChange}
              placeholder={
                <span className="text-[var(--foreground)]">Actions</span>
              }
              disabled={selectedUsers.length === 0}
              className="w-auto"
              triggerClassName="h-14 min-w-[180px] px-6 text-base [&>span]:text-base"
              contentClassName="w-[280px]"
              optionClassName="py-4 text-lg"
              align="right"
              ariaLabel="User account actions"
            />

            <button
              type="button"
              onClick={() => setIsTableExpanded(!expanded)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-transparent text-[var(--muted)] transition hover:text-[var(--color-brand-500)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)]"
              aria-label={expanded ? "Collapse users table" : "Expand users table"}
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

        {loadError ? (
          <div className="px-6 pb-2">
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </p>
          </div>
        ) : null}

        <TableMain className="min-h-0 flex-1">
          <TableGrid minWidthClassName="flex h-full min-w-[1200px] flex-col">
            <TableHeader columnsClassName={columnsClassName}>
              <TableCell className="justify-center">
                <TableCheckbox
                  checked={isAllSelected}
                  onToggle={toggleSelectAll}
                />
              </TableCell>

              {userTableColumns.map((column) => (
                <TableHeaderCell
                  key={column.key}
                  label={column.label}
                  sortable={column.sortable}
                  active={sortKey === column.key}
                  direction={sortDir}
                  onClick={() => handleSort(column.key)}
                />
              ))}
            </TableHeader>

            <div className="min-h-0 flex-1 overflow-y-auto">
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableEmptyState text="No users found" />
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedIds.includes(user.id);

                  return (
                    <div
                      key={user.id}
                      onClick={() => openUserDetails(user)}
                      className={`grid w-full cursor-pointer border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                    >
                      <TableCell className="justify-center">
                        <TableCheckbox
                          checked={isSelected}
                          onToggle={() => toggleRowSelection(user.id)}
                        />
                      </TableCell>

                      <TableCell className="text-[32px] font-semibold text-[var(--title)] sm:text-base">
                        {user.username}
                      </TableCell>

                      <TableCell className="paragraph">
                        {user.fullName}
                      </TableCell>

                      <TableCell className="text-[32px] font-semibold text-[var(--title)] sm:text-base">
                        {formatMoney(user.quota)}
                      </TableCell>

                      <TableCell>
                        <RestrictedBadge status={user.restricted} />
                      </TableCell>

                      <TableCell className="text-[32px] font-medium text-[var(--title)] sm:text-base">
                        {user.pages}
                      </TableCell>

                      <TableCell className="text-[32px] font-medium text-[var(--title)] sm:text-base">
                        {user.jobs}
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

  return (
    <>
      <FullscreenTablePortal open={isTableExpanded}>
        {renderUsersTable(true)}
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

          {renderUsersTable()}
        </div>

      <Modal
        open={Boolean(openUserModal)}
        onClose={() => setOpenUserModal(null)}
      >
        {openUserModal ? (
          <div className="w-[min(92vw,860px)] space-y-6 pr-4">
            <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="title-md">{openUserModal.fullName}</h3>
                <p className="paragraph mt-1">
                  Username:{" "}
                  <span className="font-semibold">
                    {openUserModal.username}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[var(--muted)]">
                  Status
                </span>

                <div
                  className="inline-flex items-center rounded-full border p-1"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setEditingRestricted("Unrestricted")}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                      editingRestricted === "Unrestricted" ? "shadow-sm" : ""
                    }`}
                    style={{
                      background:
                        editingRestricted === "Unrestricted"
                          ? "color-mix(in srgb, var(--color-support-500) 12%, transparent)"
                          : "transparent",
                      color:
                        editingRestricted === "Unrestricted"
                          ? "color-mix(in srgb, var(--color-support-700) 78%, var(--title))"
                          : "var(--muted)",
                    }}
                  >
                    <LockOpen className="h-4 w-4" />
                    Unrestricted
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingRestricted("Restricted")}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                      editingRestricted === "Restricted" ? "shadow-sm" : ""
                    }`}
                    style={{
                      background:
                        editingRestricted === "Restricted"
                          ? "rgba(var(--brand-rgb), 0.12)"
                          : "transparent",
                      color:
                        editingRestricted === "Restricted"
                          ? "color-mix(in srgb, var(--color-brand-700) 82%, var(--title))"
                          : "var(--muted)",
                    }}
                  >
                    <Lock className="h-4 w-4" />
                    Restricted
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoRow
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={openUserModal.email}
              />
              <InfoRow
                icon={<Phone className="h-4 w-4" />}
                label="Phone"
                value={openUserModal.phone}
              />
              <InfoRow
                icon={<Shield className="h-4 w-4" />}
                label="Role"
                value={openUserModal.role}
              />
              <InfoRow
                icon={<UserRound className="h-4 w-4" />}
                label="Standing"
                value={openUserModal.standing}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Quota
                </p>
                <div className="mt-3">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingQuota}
                    onChange={(e) => setEditingQuota(e.target.value)}
                    placeholder="Enter quota"
                    className="text-lg font-semibold"
                  />
                </div>
              </div>

              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Pages
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--title)]">
                  {openUserModal.pages}
                </p>
              </div>

              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Jobs
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--title)]">
                  {openUserModal.jobs}
                </p>
              </div>

              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Last Activity
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                  {openUserModal.lastActivity}
                </p>
              </div>
            </div>

            <div
              className="rounded-2xl border p-4"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Notes
              </p>

              <div className="mt-3">
                <Input
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Add notes about this user"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button className="px-8" onClick={handleSaveUserModal}>
                Save
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={Boolean(actionModal)} onClose={() => setActionModal(null)}>
        {actionModal === "delete-selected" ? (
          <div className="w-[min(92vw,760px)] space-y-5 pr-4">
            <div
              className="border-b pb-4"
              style={{ borderColor: "var(--border)" }}
            >
              <h3 className="title-md flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Delete selected users
              </h3>
              <p className="paragraph mt-2">
                This action will remove the selected users from the table.
                Review the list below and remove any row you do not want to
                delete.
              </p>
              <p className="paragraph mt-2">
                Total selected:{" "}
                <span className="font-semibold">{selectedUsers.length}</span>
              </p>
            </div>

            <div
              className="max-h-[320px] space-y-3 overflow-y-auto pr-2"
              style={{ scrollbarWidth: "thin" }}
            >
              {selectedUsers.length === 0 ? (
                <div
                  className="rounded-2xl border p-5 text-sm"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                    color: "var(--muted)",
                  }}
                >
                  No users selected.
                </div>
              ) : (
                selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border p-4"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                    }}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--title)]">
                        {user.fullName}
                      </p>
                      <p className="truncate text-sm text-[var(--muted)]">
                        {user.username} • {user.email}
                      </p>
                    </div>

                    <ExpandedButton
                      id={`remove-delete-${user.id}`}
                      label="Remove"
                      icon={Trash2}
                      variant="danger"
                      onClick={() => removeSelectedUserFromAction(user.id)}
                    />
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setActionModal(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleDeleteSelected}
                className="px-8"
                disabled={selectedUsers.length === 0}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : null}

        {actionModal === "export-users" ? (
          <div className="w-[min(92vw,760px)] space-y-5 pr-4">
            <div
              className="border-b pb-4"
              style={{ borderColor: "var(--border)" }}
            >
              <h3 className="title-md flex items-center gap-2">
                <FileOutput className="h-5 w-5 text-brand-500" />
                Export selected users
              </h3>
              <p className="paragraph mt-2">
                Review the users to export, remove any row if needed, then
                choose the export format.
              </p>
              <p className="paragraph mt-2">
                Total selected:{" "}
                <span className="font-semibold">{selectedUsers.length}</span>
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
              <div
                className="max-h-[320px] space-y-3 overflow-y-auto pr-2"
                style={{ scrollbarWidth: "thin" }}
              >
                {selectedUsers.length === 0 ? (
                  <div
                    className="rounded-2xl border p-5 text-sm"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                      color: "var(--muted)",
                    }}
                  >
                    No users selected.
                  </div>
                ) : (
                  selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border p-4"
                      style={{
                        borderColor: "var(--border)",
                        background: "var(--surface-2)",
                      }}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--title)]">
                          {user.fullName}
                        </p>
                        <p className="truncate text-sm text-[var(--muted)]">
                          {user.username} • {user.department}
                        </p>
                      </div>

                      <ExpandedButton
                        id={`remove-export-${user.id}`}
                        label="Remove"
                        icon={Trash2}
                        variant="danger"
                        onClick={() => removeSelectedUserFromAction(user.id)}
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
                  options={exportFormatOptions}
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
              <Button variant="outline" onClick={() => setActionModal(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleExportSelectedUsers}
                className="px-8"
                disabled={selectedUsers.length === 0}
              >
                Export
              </Button>
            </div>
          </div>
        ) : null}

        {actionModal === "assign-quota" ? (
          <div className="w-[min(92vw,760px)] space-y-5 pr-4">
            <div
              className="border-b pb-4"
              style={{ borderColor: "var(--border)" }}
            >
              <h3 className="title-md flex items-center gap-2">
                <Wallet className="h-5 w-5 text-brand-500" />
                Assign quota
              </h3>
              <p className="paragraph mt-2">
                Set a new quota value for the selected users. You can also leave
                a short note for this update.
              </p>
              <p className="paragraph mt-2">
                Total selected:{" "}
                <span className="font-semibold">{selectedUsers.length}</span>
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <div
                className="max-h-[320px] space-y-3 overflow-y-auto pr-2"
                style={{ scrollbarWidth: "thin" }}
              >
                {selectedUsers.length === 0 ? (
                  <div
                    className="rounded-2xl border p-5 text-sm"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                      color: "var(--muted)",
                    }}
                  >
                    No users selected.
                  </div>
                ) : (
                  selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border p-4"
                      style={{
                        borderColor: "var(--border)",
                        background: "var(--surface-2)",
                      }}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--title)]">
                          {user.fullName}
                        </p>
                        <p className="truncate text-sm text-[var(--muted)]">
                          Current quota: {formatMoney(user.quota)}
                        </p>
                      </div>

                      <ExpandedButton
                        id={`remove-quota-${user.id}`}
                        label="Remove"
                        icon={Trash2}
                        variant="danger"
                        onClick={() => removeSelectedUserFromAction(user.id)}
                      />
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-4">
                <div
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                  }}
                >
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    New Quota
                  </p>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={quotaToAssign}
                    onChange={(e) => setQuotaToAssign(e.target.value)}
                    placeholder="Enter new quota"
                  />
                </div>

                <div
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                  }}
                >
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    Comment
                  </p>
                  <Input
                    value={quotaComment}
                    onChange={(e) => setQuotaComment(e.target.value)}
                    placeholder="Optional note for this quota update"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setActionModal(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleAssignQuota}
                className="px-8"
                disabled={
                  selectedUsers.length === 0 ||
                  quotaToAssign.trim() === "" ||
                  Number.isNaN(Number(quotaToAssign))
                }
              >
                Assign Quota
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
};

export default UserAccountsTable;
