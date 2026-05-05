"use client";

import {
  CalendarClock,
  CircleDollarSign,
  FileOutput,
  Info,
  Lock,
  Maximize2,
  Minimize2,
  Plus,
  Shield,
  Trash2,
  Users,
  WalletCards,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

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
import { exportTableData, TableExportFormat } from "@/lib/export";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";

type SortDir = "asc" | "desc";
type GroupSortKey = "name" | "members" | "initialQuota" | "restricted" | "schedule";
type GroupActionValue = "delete-selected" | "export-groups";
type ExportMethod = TableExportFormat;

type GroupSummary = {
  total: number;
  restricted: number;
  selectedByDefault: number;
  totalMembers: number;
};

type GroupItem = {
  id: string;
  name: string;
  members: number;
  initialQuota: number;
  restricted: "Restricted" | "Unrestricted";
  scheduleAmount: number;
  period: string;
  notes: string;
  selectedByDefault?: boolean;
};

type GroupsResponse = {
  summary: GroupSummary;
  groups: GroupItem[];
};

type GroupDetailResponse = {
  group: GroupItem & {
    description: string;
    groupType: string;
    resetPeriod: string;
    perUserAllocation: number;
    enabled: boolean;
    requiresApproval: boolean;
    canUpload: boolean;
    canRelease: boolean;
    costLimit: number;
    memberUserIds: string[];
    membersList: Array<{
      id: string;
      fullName: string;
      username: string;
      email: string;
      department: string;
      userType: string;
    }>;
    allowedQueues: Array<{
      id: string;
      name: string;
      description: string;
    }>;
  };
};

type GroupFormState = {
  name: string;
  description: string;
  initialQuota: string;
  scheduleAmount: string;
  resetPeriod: string;
  restricted: boolean;
};

const emptyForm: GroupFormState = {
  name: "",
  description: "",
  initialQuota: "0",
  scheduleAmount: "0",
  resetPeriod: "None",
  restricted: false,
};

const columnsClassName =
  "[grid-template-columns:72px_minmax(260px,1.5fr)_minmax(120px,0.7fr)_minmax(170px,0.85fr)_minmax(150px,0.8fr)_minmax(220px,1fr)]";

const formatQuotaValue = (value: number) => value.toFixed(2);
const formatScheduleAmount = (value: number) => {
  if (value === 0) {
    return "0";
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(2);
};
const formatScheduleValue = (amount: number, period?: string) => {
  const formattedAmount = formatScheduleAmount(amount);
  const normalizedPeriod = period?.trim();

  if (!normalizedPeriod || normalizedPeriod === "None" || amount === 0) {
    return formattedAmount;
  }

  return `${formattedAmount} / ${normalizedPeriod}`;
};
const getExportTimestamp = () =>
  new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
const exportFormatOptions: ExportMethod[] = ["PDF", "Excel", "CSV"];
const resetPeriodOptions = ["None", "Monthly", "Semester", "Annual"];
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
];

const restrictedRank: Record<GroupItem["restricted"], number> = {
  Restricted: 1,
  Unrestricted: 0,
};

const compareValues = (a: string | number, b: string | number, direction: SortDir) => {
  if (typeof a === "number" && typeof b === "number") {
    return direction === "asc" ? a - b : b - a;
  }

  return direction === "asc"
    ? String(a).localeCompare(String(b))
    : String(b).localeCompare(String(a));
};

export default function PrintingGroupsTable() {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [summary, setSummary] = useState<GroupSummary>({
    total: 0,
    restricted: 0,
    selectedByDefault: 0,
    totalMembers: 0,
  });
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<GroupSortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [detailsGroup, setDetailsGroup] =
    useState<GroupDetailResponse["group"] | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<GroupFormState>(emptyForm);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [actionModal, setActionModal] = useState<GroupActionValue | null>(null);
  const [exportMethod, setExportMethod] = useState<ExportMethod>("PDF");

  const loadGroups = useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const data = await apiGet<GroupsResponse>("/admin/groups", "admin");
      const nextGroups = Array.isArray(data?.groups) ? data.groups : [];

      setGroups(nextGroups);
      setSummary(
        data.summary || {
          total: 0,
          restricted: 0,
          selectedByDefault: 0,
          totalMembers: 0,
        },
      );
      setSelectedIds((current) =>
        current.filter((id) => nextGroups.some((group) => group.id === id)),
      );
      setError("");
    } catch (requestError) {
      setGroups([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load groups.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => loadGroups(true));
  }, [loadGroups]);

  const handleSort = (key: GroupSortKey) => {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir(key === "name" || key === "restricted" ? "asc" : "desc");
  };

  const filteredGroups = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return [...groups]
      .filter((group) => {
        if (!searchTerm) {
          return true;
        }

        return [group.name, group.period, group.notes, group.restricted]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm);
      })
      .sort((a, b) => {
        switch (sortKey) {
          case "members":
            return compareValues(a.members, b.members, sortDir);
          case "initialQuota":
            return compareValues(a.initialQuota, b.initialQuota, sortDir);
          case "restricted":
            return compareValues(
              restrictedRank[a.restricted],
              restrictedRank[b.restricted],
              sortDir,
            );
          case "schedule":
            return compareValues(a.scheduleAmount, b.scheduleAmount, sortDir);
          case "name":
          default:
            return compareValues(a.name, b.name, sortDir);
        }
      });
  }, [groups, search, sortDir, sortKey]);

  const visibleIds = filteredGroups.map((group) => group.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const toggleSelectedId = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !visibleIds.includes(id)),
      );
      return;
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...visibleIds])));
  };

  const runAction = async (action: () => Promise<void>) => {
    setBusy(true);
    setError("");

    try {
      await action();
      await loadGroups(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Group action failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  const openCreateForm = () => {
    setEditingGroupId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEditForm = async (groupId: string) => {
    setBusy(true);
    setError("");

    try {
      const data = await apiGet<GroupDetailResponse>(`/admin/groups/${groupId}`, "admin");
      const group = data.group;
      setEditingGroupId(group.id);
      setForm({
        name: group.name,
        description: group.description || "",
        initialQuota: String(group.initialQuota || 0),
        scheduleAmount: String(group.scheduleAmount || 0),
        resetPeriod: group.resetPeriod || group.period || "None",
        restricted: group.restricted === "Restricted",
      });
      setIsFormOpen(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load group details.",
      );
    } finally {
      setBusy(false);
    }
  };

  const openDetails = async (groupId: string) => {
    setBusy(true);
    setError("");

    try {
      const data = await apiGet<GroupDetailResponse>(`/admin/groups/${groupId}`, "admin");
      setDetailsGroup(data.group);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load group details.",
      );
    } finally {
      setBusy(false);
    }
  };

  const submitForm = async () => {
    const payload = {
      name: form.name,
      description: form.description,
      initialQuota: Number(form.initialQuota || 0),
      scheduleAmount: Number(form.scheduleAmount || 0),
      resetPeriod: form.resetPeriod || "None",
      restricted: form.restricted,
      groupType: "Custom",
      memberUserIds: [],
      allowedQueueIds: [],
    };

    await runAction(async () => {
      if (editingGroupId) {
        await apiPatch(`/admin/groups/${editingGroupId}`, payload, "admin");
      } else {
        await apiPost("/admin/groups", payload, "admin");
      }

      setIsFormOpen(false);
      setForm(emptyForm);
      setEditingGroupId(null);
    });
  };

  const selectedGroups = useMemo(
    () => groups.filter((group) => selectedIds.includes(group.id)),
    [groups, selectedIds],
  );

  const exportGroups = (format: TableExportFormat) => {
    if (selectedGroups.length === 0) return;

    exportTableData({
      title: "Printing Groups",
      filename: `groups-export-${getExportTimestamp()}`,
      format,
      columns: [
        { label: "Group", value: (row: GroupItem) => row.name },
        { label: "Members", value: (row) => row.members },
        { label: "Initial Quota", value: (row) => formatQuotaValue(row.initialQuota) },
        { label: "Restricted", value: (row) => row.restricted },
        {
          label: "Schedule",
          value: (row) => formatScheduleValue(row.scheduleAmount, row.period),
        },
        { label: "Notes", value: (row) => row.notes || "" },
      ],
      rows: selectedGroups,
    });
  };

  const handleExportChange = (value: string) => {
    if (selectedGroups.length === 0) return;

    setExportMethod(value as ExportMethod);
    setActionModal("export-groups");
  };

  const handleActionChange = (value: string) => {
    if (selectedGroups.length === 0) return;

    setActionModal(value as GroupActionValue);
  };

  const handleDeleteSelected = () => {
    if (selectedGroups.length === 0) return;

    return runAction(async () => {
      await Promise.all(
        selectedIds.map((id) => apiDelete(`/admin/groups/${id}`, "admin")),
      );
      setSelectedIds([]);
      setActionModal(null);
    });
  };

  const handleExportConfirmed = () => {
    exportGroups(exportMethod);
    setActionModal(null);
  };

  const removeSelectedGroupFromExport = (id: string) => {
    setSelectedIds((current) => current.filter((item) => item !== id));
  };

  const kpiCards = [
    {
      title: "Total Groups",
      value: summary.total.toLocaleString(),
      helper: `${filteredGroups.length.toLocaleString()} visible in current view`,
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Restricted Groups",
      value: summary.restricted.toLocaleString(),
      helper: "Printing-restricted groups",
      icon: <Lock className="h-5 w-5" />,
    },
    {
      title: "Default Groups",
      value: summary.selectedByDefault.toLocaleString(),
      helper: "Selected by default in access rules",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      title: "Total Members",
      value: summary.totalMembers.toLocaleString(),
      helper: "Members across loaded groups",
      icon: <Users className="h-5 w-5" />,
    },
  ];

  const renderGroupsTable = (expanded = false) => (
      <Table
        className={`flex min-h-[520px] flex-col ${
          expanded ? "h-dvh !rounded-none" : "max-h-[calc(100vh-20rem)]"
        }`}
      >
        <TableTop className={`shrink-0 ${expanded ? "bg-[var(--surface)]" : ""}`}>
          <TableTitleBlock
            title="Printing Groups"
          />

          <TableControls>
            <TableSearch
              id={expanded ? "search-groups-expanded" : "search-groups"}
              label="Search groups"
              value={search}
              onChange={setSearch}
            />

            <RefreshButton
              className="h-14"
              disabled={busy}
              onClick={() => loadGroups(false)}
            />

            <ListBox
              options={toolbarExportOptions}
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
              ariaLabel="Export selected groups"
            />

            <Button
              variant="primary"
              iconLeft={<Plus className="h-4 w-4" />}
              className="h-14 px-6 text-base"
              disabled={busy}
              onClick={openCreateForm}
            >
              Add Group
            </Button>

            <ListBox
              options={toolbarActionOptions}
              onValueChange={handleActionChange}
              placeholder={
                <span className="text-[var(--foreground)]">Actions</span>
              }
              disabled={selectedGroups.length === 0}
              className="w-auto"
              triggerClassName="h-14 min-w-[180px] px-6 text-base [&>span]:text-base"
              contentClassName="w-[260px]"
              optionClassName="py-4 text-lg"
              align="right"
              ariaLabel="Group actions"
            />

            <button
              type="button"
              onClick={() => setIsTableExpanded(!expanded)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-transparent text-[var(--muted)] transition hover:text-[var(--color-brand-500)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)]"
              aria-label={expanded ? "Collapse groups table" : "Expand groups table"}
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

        {error ? (
          <div className="px-6 pb-2">
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          </div>
        ) : null}

        <TableMain className="min-h-0 flex-1">
          <TableGrid minWidthClassName="flex h-full min-w-[1120px] flex-col">
            <TableHeader columnsClassName={columnsClassName}>
              <TableCell className="justify-center">
                <TableCheckbox
                  checked={allVisibleSelected}
                  onToggle={toggleSelectAllVisible}
                />
              </TableCell>
              <TableHeaderCell
                label="Group"
                sortable
                active={sortKey === "name"}
                direction={sortDir}
                onClick={() => handleSort("name")}
              />
              <TableHeaderCell
                label="Members"
                sortable
                active={sortKey === "members"}
                direction={sortDir}
                onClick={() => handleSort("members")}
              />
              <TableHeaderCell
                label="Initial Quota"
                sortable
                active={sortKey === "initialQuota"}
                direction={sortDir}
                onClick={() => handleSort("initialQuota")}
              />
              <TableHeaderCell
                label="Restricted"
                sortable
                active={sortKey === "restricted"}
                direction={sortDir}
                onClick={() => handleSort("restricted")}
              />
              <TableHeaderCell
                label="Schedule"
                sortable
                active={sortKey === "schedule"}
                direction={sortDir}
                onClick={() => handleSort("schedule")}
              />
            </TableHeader>

            <div className="min-h-0 flex-1 overflow-y-auto">
            <TableBody>
              {loading ? (
                <TableEmptyState text="Loading groups..." />
              ) : filteredGroups.length === 0 ? (
                <TableEmptyState text="No groups matched the current search." />
              ) : (
                filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => openDetails(group.id)}
                    className={`grid w-full cursor-pointer border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                  >
                    <TableCell className="justify-center">
                      <TableCheckbox
                        checked={selectedIds.includes(group.id)}
                        onToggle={() => toggleSelectedId(group.id)}
                      />
                    </TableCell>

                    <TableCell className="flex-col items-start">
                      <p className="font-semibold text-[var(--title)]">{group.name}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {group.notes || "No notes"}
                      </p>
                    </TableCell>

                    <TableCell className="text-[var(--title)]">{group.members}</TableCell>

                    <TableCell className="text-[var(--title)]">
                      {formatQuotaValue(group.initialQuota)}
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        label={group.restricted}
                        tone={group.restricted === "Restricted" ? "danger" : "success"}
                        className="px-3 py-1 text-xs"
                      />
                    </TableCell>

                    <TableCell className="text-[var(--title)]">
                      {formatScheduleValue(group.scheduleAmount, group.period)}
                    </TableCell>
                  </div>
                ))
              )}
            </TableBody>
            </div>
          </TableGrid>
        </TableMain>
      </Table>
  );

  return (
    <>
      {isTableExpanded ? (
        <FullscreenTablePortal open={isTableExpanded}>
          {renderGroupsTable(true)}
        </FullscreenTablePortal>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

          {renderGroupsTable()}
        </div>
      )}

      <Modal open={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <div className="w-[min(92vw,820px)] space-y-5 pr-4">
          <div>
            <h3 className="title-md">
              {editingGroupId ? "Edit Group" : "Create Group"}
            </h3>
            <p className="paragraph mt-1">
              This form is wired to the live groups module and stores directly in
              MongoDB.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-[var(--muted)]">Name</label>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Group name"
                className="h-14"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-[var(--muted)]">
                Description
              </label>
              <Input
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Optional group description"
                className="h-14"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--muted)]">
                Initial Quota
              </label>
              <Input
                type="number"
                min="0"
                value={form.initialQuota}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    initialQuota: event.target.value,
                  }))
                }
                className="h-14"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--muted)]">
                Scheduled Quota
              </label>
              <Input
                type="number"
                min="0"
                value={form.scheduleAmount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    scheduleAmount: event.target.value,
                  }))
                }
                className="h-14"
              />
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[var(--muted)]">
                Reset Period
              </span>
              <ListBox
                options={resetPeriodOptions}
                value={form.resetPeriod}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    resetPeriod: value,
                  }))
                }
                triggerClassName="h-14 w-full px-4 text-base"
                contentClassName="w-full"
                ariaLabel="Reset period"
              />
            </label>

            <label
              className="flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3"
              style={{
                borderColor: form.restricted
                  ? "color-mix(in srgb, var(--color-brand-500) 36%, var(--border))"
                  : "var(--border)",
                background: form.restricted
                  ? "rgba(var(--brand-rgb), 0.1)"
                  : "var(--surface)",
              }}
            >
              <input
                type="checkbox"
                checked={form.restricted}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    restricted: event.target.checked,
                  }))
                }
                className="sr-only"
              />
              <span
                className="flex h-5 w-5 items-center justify-center rounded-md border transition"
                style={{
                  borderColor: form.restricted
                    ? "var(--color-brand-500)"
                    : "var(--border)",
                  background: form.restricted
                    ? "var(--color-brand-500)"
                    : "transparent",
                }}
              >
                {form.restricted ? (
                  <span className="h-2 w-2 rounded-full bg-white" />
                ) : null}
              </span>
              <span className="text-sm font-medium text-[var(--title)]">
                Restrict printing for this group
              </span>
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              disabled={busy || !form.name.trim()}
              onClick={submitForm}
            >
              {editingGroupId ? "Save Changes" : "Create Group"}
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setIsFormOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(actionModal)} onClose={() => setActionModal(null)}>
        {actionModal === "delete-selected" ? (
          <div className="w-[min(92vw,720px)] space-y-5 pr-4">
            <div className="border-b pb-4" style={{ borderColor: "var(--border)" }}>
              <h3 className="title-md flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-[var(--color-brand-500)]" />
                Delete selected groups
              </h3>
              <p className="paragraph mt-2">
                Review the selected groups before removing them.
              </p>
              <p className="paragraph mt-2">
                Total selected:{" "}
                <span className="font-semibold">{selectedGroups.length}</span>
              </p>
            </div>

            <div className="max-h-[320px] space-y-3 overflow-y-auto pr-2">
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
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                    }}
                  >
                    <p className="font-semibold text-[var(--title)]">{group.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {group.members} members · {group.restricted}
                    </p>
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
                disabled={busy || selectedGroups.length === 0}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : null}

        {actionModal === "export-groups" ? (
          <div className="w-[min(92vw,760px)] space-y-5 pr-4">
            <div className="border-b pb-4" style={{ borderColor: "var(--border)" }}>
              <h3 className="title-md flex items-center gap-2">
                <FileOutput className="h-5 w-5 text-brand-500" />
                Export selected groups
              </h3>
              <p className="paragraph mt-2">
                Review the groups to export, remove any row if needed, then
                choose the export format.
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
                          {group.name}
                        </p>
                        <p className="truncate text-sm text-[var(--muted)]">
                          {group.members} members • {group.restricted}
                        </p>
                      </div>

                      <ExpandedButton
                        id={`remove-export-groups-${group.id}`}
                        label="Remove"
                        icon={Trash2}
                        variant="danger"
                        onClick={() => removeSelectedGroupFromExport(group.id)}
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
                onClick={handleExportConfirmed}
                className="px-8"
                disabled={busy || selectedGroups.length === 0}
              >
                Export
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={Boolean(detailsGroup)} onClose={() => setDetailsGroup(null)}>
        <div className="w-[min(92vw,980px)] space-y-5 pr-4">
          <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="title-md">{detailsGroup?.name}</h3>
              <p className="paragraph mt-1">
                Group policy, quota schedule, access state, and membership.
              </p>
            </div>

            {detailsGroup ? (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => {
                  const groupId = detailsGroup.id;
                  setDetailsGroup(null);
                  void openEditForm(groupId);
                }}
              >
                Edit Group
              </Button>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                label: "Description",
                value: detailsGroup?.description || "No description",
                icon: <Info className="h-4 w-4" />,
              },
              {
                label: "Type",
                value: detailsGroup?.groupType || "Custom",
                icon: <Shield className="h-4 w-4" />,
              },
              {
                label: "Members",
                value: detailsGroup?.members ?? 0,
                icon: <Users className="h-4 w-4" />,
              },
              {
                label: "Initial Quota",
                value: detailsGroup ? formatQuotaValue(detailsGroup.initialQuota) : "0.00",
                icon: <CircleDollarSign className="h-4 w-4" />,
              },
              {
                label: "Schedule",
                value: detailsGroup
                  ? formatScheduleValue(
                      detailsGroup.scheduleAmount,
                      detailsGroup.resetPeriod || detailsGroup.period,
                    )
                  : "0",
                icon: <CalendarClock className="h-4 w-4" />,
              },
              {
                label: "Status",
                value: detailsGroup?.restricted || "Unrestricted",
                icon: <Lock className="h-4 w-4" />,
              },
              {
                label: "Cost Limit",
                value: detailsGroup ? formatQuotaValue(detailsGroup.costLimit || 0) : "0.00",
                icon: <WalletCards className="h-4 w-4" />,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--color-brand-500)]"
                    style={{ background: "rgba(var(--brand-rgb), 0.1)" }}
                  >
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {item.label}
                    </p>
                    <div className="mt-2 text-sm font-semibold text-[var(--title)]">
                      {item.label === "Status" ? (
                        <StatusBadge
                          label={String(item.value)}
                          tone={item.value === "Restricted" ? "danger" : "success"}
                          className="px-3 py-1 text-xs"
                        />
                      ) : (
                        String(item.value)
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
          >
            <p className="text-sm font-semibold text-[var(--title)]">
              Allowed Queues
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {detailsGroup?.allowedQueues?.length ? (
                detailsGroup.allowedQueues.map((queue) => (
                  <span
                    key={queue.id}
                    className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold text-[var(--title)]"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {queue.name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[var(--muted)]">
                  No queue restrictions configured.
                </span>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
