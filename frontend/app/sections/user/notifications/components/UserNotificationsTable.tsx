"use client";

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
import StatusBadge, { type StatusTone } from "@/components/ui/badge/StatusBadge";
import Button from "@/components/ui/button/Button";
import ExpandedButton from "@/components/ui/button/ExpandedButton";
import RefreshButton from "@/components/ui/button/RefreshButton";
import ListBox, { type ListBoxOption } from "@/components/ui/listbox/ListBox";
import Modal from "@/components/ui/modal/Modal";
import { exportTableData, TableExportFormat } from "@/lib/export";
import { apiGet, apiPatch, apiPost } from "@/services/api";
import {
  Bell,
  CheckCircle2,
  FileOutput,
  Inbox,
  MoreHorizontal,
  ShieldAlert,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type SortDir = "asc" | "desc";
type NotificationSortKey =
  | "title"
  | "type"
  | "source"
  | "severity"
  | "status"
  | "createdAt";

type UserNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  source: string;
  severity: "info" | "success" | "warning" | "error" | "critical";
  status: "unread" | "read" | "resolved" | "archived";
  createdAt: string;
  createdAtLabel: string;
  canMarkAsRead?: boolean;
  canArchive?: boolean;
  canDelete?: boolean;
  relatedEntity?: {
    kind: string;
    id: string;
    label: string;
  };
};

type UserNotificationsResponse = {
  notifications: UserNotification[];
  summary: {
    total: number;
    unread: number;
    critical: number;
    actionRequired: number;
  };
};

const columnsClassName =
  "[grid-template-columns:72px_minmax(320px,1.55fr)_minmax(150px,0.75fr)_minmax(130px,0.62fr)_minmax(130px,0.62fr)_minmax(170px,0.8fr)_minmax(180px,0.82fr)]";

const notificationTableColumns: Array<{
  key: NotificationSortKey;
  label: string;
}> = [
  { key: "title", label: "Notification" },
  { key: "type", label: "Type" },
  { key: "severity", label: "Severity" },
  { key: "status", label: "Status" },
  { key: "source", label: "Source" },
  { key: "createdAt", label: "Created" },
];

const filterValues = {
  type: ["all", "print-job", "balance", "redeem-card", "printer", "system"],
  severity: ["all", "info", "success", "warning", "error", "critical"],
  status: ["all", "unread", "read", "resolved", "archived"],
  source: [
    "all",
    "web-print",
    "jobs-pending-release",
    "recent-print-jobs",
    "transaction-history",
    "redeem-card",
    "printer-device",
    "system",
  ],
};

const severityRank: Record<UserNotification["severity"], number> = {
  info: 0,
  success: 1,
  warning: 2,
  error: 3,
  critical: 4,
};

const statusRank: Record<UserNotification["status"], number> = {
  unread: 0,
  read: 1,
  resolved: 2,
  archived: 3,
};

const formatOptionLabel = (value: string) =>
  value
    .replaceAll("-", " ")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());

const toFilterOptions = (values: string[], label: string): ListBoxOption[] =>
  values.map((value) => ({
    value,
    label: value === "all" ? `All ${label}` : formatOptionLabel(value),
  }));

const exportFormatOptions: TableExportFormat[] = ["PDF", "Excel", "CSV"];
const toolbarExportOptions: ListBoxOption[] = exportFormatOptions.map((format) => ({
  value: format,
  label: format,
  selectedLabel: (
    <span className="inline-flex items-center gap-2">
      <FileOutput className="h-4 w-4" />
      Export
    </span>
  ),
}));

const parseSortableDate = (value: string) => {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? value : timestamp;
};

const compareValues = (
  a: string | number,
  b: string | number,
  direction: SortDir,
) => {
  if (typeof a === "number" && typeof b === "number") {
    return direction === "asc" ? a - b : b - a;
  }

  return direction === "asc"
    ? String(a).localeCompare(String(b))
    : String(b).localeCompare(String(a));
};

function getSeverityTone(severity: UserNotification["severity"]): StatusTone {
  if (severity === "success") return "success";
  if (severity === "warning") return "warning";
  if (severity === "info") return "inactive";
  return "danger";
}

function getStatusTone(status: UserNotification["status"]): StatusTone {
  if (status === "unread") return "warning";
  if (status === "read" || status === "resolved") return "success";
  return "inactive";
}

export default function UserNotificationsTable() {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [summary, setSummary] = useState<UserNotificationsResponse["summary"]>({
    total: 0,
    unread: 0,
    critical: 0,
    actionRequired: 0,
  });
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<NotificationSortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [exportMethod, setExportMethod] = useState<TableExportFormat>("PDF");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [detailsNotification, setDetailsNotification] =
    useState<UserNotification | null>(null);

  const loadNotifications = useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const data = await apiGet<UserNotificationsResponse>(
        "/user/notifications",
        "user",
      );
      const nextNotifications = Array.isArray(data?.notifications)
        ? data.notifications
        : [];

      setNotifications(nextNotifications);
      setSummary(
        data.summary || {
          total: 0,
          unread: 0,
          critical: 0,
          actionRequired: 0,
        },
      );
      setSelectedIds((current) =>
        current.filter((id) => nextNotifications.some((item) => item.id === id)),
      );
      setError("");
    } catch (requestError) {
      setNotifications([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load notifications.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void loadNotifications(true);
    }, 0);

    return () => {
      window.clearTimeout(initialLoad);
    };
  }, [loadNotifications]);

  const handleSort = (key: NotificationSortKey) => {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir(key === "createdAt" ? "desc" : "asc");
  };

  const filteredNotifications = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return [...notifications]
      .filter((notification) => {
        const haystack = [
          notification.title,
          notification.message,
          notification.type,
          notification.source,
          notification.severity,
          notification.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = !searchTerm || haystack.includes(searchTerm);
        const matchesType =
          typeFilter === "all" || notification.type === typeFilter;
        const matchesSeverity =
          severityFilter === "all" || notification.severity === severityFilter;
        const matchesStatus =
          statusFilter === "all" || notification.status === statusFilter;
        const matchesSource =
          sourceFilter === "all" || notification.source === sourceFilter;

        return (
          matchesSearch &&
          matchesType &&
          matchesSeverity &&
          matchesStatus &&
          matchesSource
        );
      })
      .sort((a, b) => {
        switch (sortKey) {
          case "severity":
            return compareValues(
              severityRank[a.severity],
              severityRank[b.severity],
              sortDir,
            );
          case "status":
            return compareValues(
              statusRank[a.status],
              statusRank[b.status],
              sortDir,
            );
          case "createdAt":
            return compareValues(
              parseSortableDate(a.createdAt),
              parseSortableDate(b.createdAt),
              sortDir,
            );
          case "source":
            return compareValues(
              formatOptionLabel(a.source),
              formatOptionLabel(b.source),
              sortDir,
            );
          case "type":
            return compareValues(
              formatOptionLabel(a.type),
              formatOptionLabel(b.type),
              sortDir,
            );
          default:
            return compareValues(a[sortKey], b[sortKey], sortDir);
        }
      });
  }, [
    notifications,
    search,
    sortDir,
    sortKey,
    sourceFilter,
    severityFilter,
    statusFilter,
    typeFilter,
  ]);

  const visibleIds = filteredNotifications.map(
    (notification) => notification.id,
  );
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const selectedVisibleCount = visibleIds.filter((id) =>
    selectedIds.includes(id),
  ).length;

  const sourceFilterOptions = useMemo(() => {
    const loadedSources = notifications
      .map((notification) => notification.source)
      .filter(Boolean);
    const uniqueSources = Array.from(
      new Set([...filterValues.source, ...loadedSources]),
    );

    return toFilterOptions(uniqueSources, "Sources");
  }, [notifications]);

  const activeFilterCount = [
    typeFilter,
    severityFilter,
    statusFilter,
    sourceFilter,
  ].filter((value) => value !== "all").length;
  const hasActiveFilters =
    Boolean(search.trim()) ||
    typeFilter !== "all" ||
    severityFilter !== "all" ||
    statusFilter !== "all" ||
    sourceFilter !== "all";

  const kpiCards = [
    {
      title: "Total",
      value: summary.total.toLocaleString(),
      helper: "Backend-tracked notifications",
      icon: <Bell className="h-4 w-4" />,
    },
    {
      title: "Unread",
      value: summary.unread.toLocaleString(),
      helper: "Items still waiting for attention",
      icon: <Inbox className="h-4 w-4" />,
    },
    {
      title: "Critical",
      value: summary.critical.toLocaleString(),
      helper: "Highest severity alerts",
      icon: <ShieldAlert className="h-4 w-4" />,
    },
    {
      title: "Action Required",
      value: summary.actionRequired.toLocaleString(),
      helper: "Flagged by the backend for follow-up",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
  ];

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

  const selectedNotifications = useMemo(
    () =>
      notifications.filter((notification) =>
        selectedIds.includes(notification.id),
      ),
    [notifications, selectedIds],
  );

  const runAction = async (action: () => Promise<void>) => {
    setBusy(true);
    setError("");

    try {
      await action();
      await loadNotifications(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Notification action failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleBulkAction = (value: string) => {
    const ids = [...selectedIds];
    if (ids.length === 0 || busy) return;

    if (value === "mark-read") {
      void runAction(async () => {
        await apiPatch(
          "/user/notifications/bulk/read",
          { notificationIds: ids },
          "user",
        );
        setSelectedIds([]);
      });
    }

    if (value === "archive") {
      void runAction(async () => {
        await Promise.all(
          ids.map((id) => apiPatch(`/user/notifications/${id}/archive`, {}, "user")),
        );
        setSelectedIds([]);
      });
    }

    if (value === "delete") {
      void runAction(async () => {
        await apiPost(
          "/user/notifications/bulk/delete",
          { notificationIds: ids },
          "user",
        );
        setSelectedIds([]);
      });
    }
  };

  const handleExportChange = (value: string) => {
    if (selectedNotifications.length === 0) return;

    setExportMethod(value as TableExportFormat);
    setIsExportModalOpen(true);
  };

  const removeSelectedNotificationFromExport = (id: string) => {
    setSelectedIds((current) => current.filter((item) => item !== id));
  };

  const exportNotifications = () => {
    if (selectedNotifications.length === 0) return;

    exportTableData({
      title: "User Notifications",
      filename: "alpha-queue-user-notifications",
      format: exportMethod,
      columns: [
        { label: "Notification", value: (row: UserNotification) => row.title },
        { label: "Message", value: (row) => row.message },
        { label: "Type", value: (row) => formatOptionLabel(row.type) },
        { label: "Severity", value: (row) => formatOptionLabel(row.severity) },
        { label: "Status", value: (row) => formatOptionLabel(row.status) },
        { label: "Source", value: (row) => formatOptionLabel(row.source) },
        { label: "Created", value: (row) => row.createdAtLabel },
      ],
      rows: selectedNotifications,
    });

    setIsExportModalOpen(false);
  };

  return (
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

      <Table className="flex min-h-[540px] flex-col max-h-[calc(100vh-20rem)]">
        <TableTop className="shrink-0">
          <TableTitleBlock title="User Notifications" />

          <TableControls>
            <TableSearch
              id="search-user-notifications"
              label="Search notifications"
              value={search}
              onChange={setSearch}
            />

            <RefreshButton
              className="h-14"
              disabled={busy}
              onClick={() => {
                void loadNotifications(false);
              }}
            />

            <ListBox
              value=""
              options={[]}
              className="w-auto shrink-0 self-start md:self-auto"
              placeholder={
                <span className="flex items-center gap-2 text-[var(--foreground)]">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filter</span>
                  {activeFilterCount > 0 ? (
                    <span
                      className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold"
                      style={{
                        background: "rgba(var(--brand-rgb), 0.12)",
                        color: "var(--color-brand-600)",
                      }}
                    >
                      {activeFilterCount}
                    </span>
                  ) : null}
                </span>
              }
              triggerClassName="h-14 w-auto min-w-[150px] px-6 text-base"
              contentClassName="w-[420px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] overflow-y-auto"
              maxHeightClassName="max-h-none"
              align="right"
              ariaLabel="Filter user notifications"
            >
              <div className="space-y-4 p-2">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Type
                    </p>
                    <ListBox
                      value={typeFilter}
                      onValueChange={setTypeFilter}
                      options={toFilterOptions(filterValues.type, "Types")}
                      triggerClassName="h-11 px-3"
                      maxHeightClassName="max-h-52"
                      ariaLabel="Filter notifications by type"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Severity
                    </p>
                    <ListBox
                      value={severityFilter}
                      onValueChange={setSeverityFilter}
                      options={toFilterOptions(
                        filterValues.severity,
                        "Severity",
                      )}
                      triggerClassName="h-11 px-3"
                      maxHeightClassName="max-h-52"
                      ariaLabel="Filter notifications by severity"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Status
                    </p>
                    <ListBox
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                      options={toFilterOptions(filterValues.status, "Status")}
                      triggerClassName="h-11 px-3"
                      maxHeightClassName="max-h-52"
                      ariaLabel="Filter notifications by status"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Source
                    </p>
                    <ListBox
                      value={sourceFilter}
                      onValueChange={setSourceFilter}
                      options={sourceFilterOptions}
                      triggerClassName="h-11 px-3"
                      maxHeightClassName="max-h-52"
                      ariaLabel="Filter notifications by source"
                    />
                  </div>
                </div>

                {activeFilterCount > 0 ? (
                  <Button
                    variant="outline"
                    className="h-11 w-full text-sm"
                    onClick={() => {
                      setTypeFilter("all");
                      setSeverityFilter("all");
                      setStatusFilter("all");
                      setSourceFilter("all");
                    }}
                  >
                    Reset Filters
                  </Button>
                ) : null}
              </div>
            </ListBox>

            <ListBox
              options={toolbarExportOptions}
              onValueChange={handleExportChange}
              placeholder={
                <span className="inline-flex items-center gap-2 text-[var(--foreground)]">
                  <FileOutput className="h-4 w-4" />
                  Export
                </span>
              }
              disabled={selectedNotifications.length === 0}
              className="w-auto shrink-0 self-start md:self-auto"
              triggerClassName="h-14 w-auto min-w-[160px] px-6 text-base [&>span]:text-base"
              contentClassName="w-[220px]"
              optionClassName="py-4 text-base"
              align="right"
              ariaLabel="Export selected notifications"
            />

            <ListBox
              value=""
              options={[
                {
                  value: "mark-read",
                  label: "Mark selected read",
                  disabled: selectedIds.length === 0,
                },
                {
                  value: "archive",
                  label: "Archive selected",
                  disabled: selectedIds.length === 0,
                },
                {
                  value: "delete",
                  label: "Delete selected",
                  disabled: selectedIds.length === 0,
                },
              ]}
              onValueChange={handleBulkAction}
              placeholder={
                <span className="inline-flex items-center gap-2 text-[var(--foreground)]">
                  <MoreHorizontal className="h-4 w-4" />
                  <span>Actions</span>
                  {selectedIds.length > 0 ? (
                    <span
                      className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold"
                      style={{
                        background: "rgba(var(--brand-rgb), 0.12)",
                        color: "var(--color-brand-600)",
                      }}
                    >
                      {selectedIds.length}
                    </span>
                  ) : null}
                </span>
              }
              disabled={busy || selectedIds.length === 0}
              className="w-auto shrink-0 self-start md:self-auto"
              triggerClassName="h-14 w-auto min-w-[180px] px-6 text-base"
              align="right"
              ariaLabel="Notification actions"
            />
          </TableControls>
        </TableTop>

        {selectedVisibleCount > 0 ? (
          <div className="shrink-0 border-b border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--muted)]">
            {selectedVisibleCount} visible notification
            {selectedVisibleCount === 1 ? "" : "s"} selected
          </div>
        ) : null}

        {error ? (
          <div className="shrink-0 px-6 pb-2 pt-4">
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          </div>
        ) : null}

        <TableMain className="min-h-0 flex-1">
          <TableGrid minWidthClassName="flex h-full min-w-[1360px] flex-col">
            <TableHeader columnsClassName={columnsClassName}>
              <TableCell className="justify-center">
                <TableCheckbox
                  checked={allVisibleSelected}
                  onToggle={toggleSelectAllVisible}
                />
              </TableCell>

              {notificationTableColumns.map((column) => (
                <TableHeaderCell
                  key={column.key}
                  label={column.label}
                  sortable
                  active={sortKey === column.key}
                  direction={sortDir}
                  onClick={() => handleSort(column.key)}
                />
              ))}
            </TableHeader>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <TableBody>
                {loading ? (
                  <TableEmptyState text="Loading notifications..." />
                ) : filteredNotifications.length === 0 ? (
                  <TableEmptyState
                    text={
                      hasActiveFilters
                        ? "No notifications match these filters"
                        : "No notifications found"
                    }
                  />
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => setDetailsNotification(notification)}
                      className={`grid w-full cursor-pointer items-center border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                    >
                      <TableCell className="justify-center">
                        <TableCheckbox
                          checked={selectedIds.includes(notification.id)}
                          onToggle={() => toggleSelectedId(notification.id)}
                        />
                      </TableCell>

                      <TableCell className="min-w-0 flex-col items-start">
                        <p className="w-full truncate text-base font-semibold text-[var(--title)]">
                          {notification.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-[var(--muted)]">
                          {notification.message}
                        </p>
                      </TableCell>

                      <TableCell className="text-base font-medium text-[var(--title)]">
                        {formatOptionLabel(notification.type)}
                      </TableCell>

                      <TableCell>
                        <StatusBadge
                          label={formatOptionLabel(notification.severity)}
                          tone={getSeverityTone(notification.severity)}
                          className="px-4 py-2 text-sm"
                        />
                      </TableCell>

                      <TableCell>
                        <StatusBadge
                          label={formatOptionLabel(notification.status)}
                          tone={getStatusTone(notification.status)}
                          className="px-4 py-2 text-sm"
                        />
                      </TableCell>

                      <TableCell className="text-base font-medium text-[var(--title)]">
                        {formatOptionLabel(notification.source)}
                      </TableCell>

                      <TableCell className="text-base text-[var(--muted)]">
                        {notification.createdAtLabel}
                      </TableCell>
                    </div>
                  ))
                )}
              </TableBody>
            </div>
          </TableGrid>
        </TableMain>
      </Table>

      <Modal
        open={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      >
        <div className="w-[min(92vw,760px)] space-y-5 pr-4">
          <div
            className="border-b pb-4"
            style={{ borderColor: "var(--border)" }}
          >
            <h3 className="title-md flex items-center gap-2">
              <FileOutput className="h-5 w-5 text-brand-500" />
              Export selected notifications
            </h3>
            <p className="paragraph mt-2">
              Review the notifications to export, remove any row if needed,
              then choose the export format.
            </p>
            <p className="paragraph mt-2">
              Total selected:{" "}
              <span className="font-semibold">
                {selectedNotifications.length}
              </span>
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
            <div
              className="max-h-[320px] space-y-3 overflow-y-auto pr-2"
              style={{ scrollbarWidth: "thin" }}
            >
              {selectedNotifications.length === 0 ? (
                <div
                  className="rounded-2xl border p-5 text-sm"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                    color: "var(--muted)",
                  }}
                >
                  No notifications selected.
                </div>
              ) : (
                selectedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border p-4"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                    }}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--title)]">
                        {notification.title}
                      </p>
                      <p className="truncate text-sm text-[var(--muted)]">
                        {formatOptionLabel(notification.type)} •{" "}
                        {formatOptionLabel(notification.status)} •{" "}
                        {notification.createdAtLabel}
                      </p>
                    </div>

                    <ExpandedButton
                      id={`remove-export-notification-${notification.id}`}
                      label="Remove"
                      icon={Trash2}
                      variant="danger"
                      onClick={() =>
                        removeSelectedNotificationFromExport(notification.id)
                      }
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
                  setExportMethod(value as TableExportFormat)
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
            <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={exportNotifications}
              className="px-8"
              disabled={selectedNotifications.length === 0}
            >
              Export
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(detailsNotification)}
        onClose={() => setDetailsNotification(null)}
      >
        <div className="w-[min(92vw,760px)] space-y-5 pr-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: "var(--surface-2)" }}
            >
              <Bell className="h-5 w-5 text-[var(--color-brand-500)]" />
            </div>
            <div>
              <h3 className="title-md">{detailsNotification?.title}</h3>
              <p className="paragraph mt-1">
                {detailsNotification?.createdAtLabel}
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
            <p className="text-sm leading-6 text-[var(--title)]">
              {detailsNotification?.message}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              [
                "Type",
                detailsNotification
                  ? formatOptionLabel(detailsNotification.type)
                  : "-",
              ],
              [
                "Severity",
                detailsNotification
                  ? formatOptionLabel(detailsNotification.severity)
                  : "-",
              ],
              [
                "Status",
                detailsNotification
                  ? formatOptionLabel(detailsNotification.status)
                  : "-",
              ],
              [
                "Source",
                detailsNotification
                  ? formatOptionLabel(detailsNotification.source)
                  : "-",
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border p-4"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {label}
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
