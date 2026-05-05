"use client";

import KpiMetricCard from "@/components/shared/cards/KpiMetricCard";
import FullscreenTablePortal from "@/components/shared/table/FullscreenTablePortal";
import {
  Bell,
  CheckCircle2,
  FileOutput,
  Inbox,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Settings2,
  ShieldAlert,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import PageIntro from "@/components/shared/page/Text/PageIntro";
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
import StatusBadge, { StatusTone } from "@/components/ui/badge/StatusBadge";
import Button from "@/components/ui/button/Button";
import ExpandedButton from "@/components/ui/button/ExpandedButton";
import RefreshButton from "@/components/ui/button/RefreshButton";
import ListBox, { type ListBoxOption } from "@/components/ui/listbox/ListBox";
import Modal from "@/components/ui/modal/Modal";
import { exportTableData, TableExportFormat } from "@/lib/export";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";

type Tab = "Notifications" | "Settings";
type SortDir = "asc" | "desc";
type NotificationSortKey = "title" | "type" | "source" | "severity" | "status" | "createdAt";

type AdminNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  source: string;
  severity: "info" | "warning" | "error" | "critical";
  status: "unread" | "read" | "resolved" | "dismissed";
  affected_device: string;
  error_details: string;
  action_taken: string;
  createdAt: string;
};

type AdminNotificationsResponse = {
  notifications: AdminNotification[];
  summary: {
    total: number;
    unread: number;
    critical: number;
    resolved: number;
  };
};

const REFRESH_SECONDS = 30;
const columnsClassName =
  "[grid-template-columns:72px_minmax(300px,1.45fr)_minmax(160px,0.78fr)_minmax(150px,0.72fr)_minmax(130px,0.62fr)_minmax(130px,0.62fr)_minmax(180px,0.82fr)_minmax(250px,1fr)]";
const getExportTimestamp = () =>
  new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
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

const severityRank: Record<AdminNotification["severity"], number> = {
  info: 0,
  warning: 1,
  error: 2,
  critical: 3,
};

const statusRank: Record<AdminNotification["status"], number> = {
  unread: 0,
  read: 1,
  resolved: 2,
  dismissed: 3,
};

const filterOptions = {
  type: [
    "all",
    "printer_alert",
    "device_error",
    "toner_low",
    "queue_warning",
    "maintenance_reminder",
    "system_warning",
    "job_issue",
  ],
  severity: ["all", "info", "warning", "error", "critical"],
  status: ["all", "unread", "read", "resolved", "dismissed"],
  source: ["all", "Printer", "Device", "Queue", "System", "Report Scheduler", "Admin"],
};

const notificationTableColumns: Array<{
  key: NotificationSortKey;
  label: string;
}> = [
  { key: "title", label: "Notification" },
  { key: "type", label: "Type" },
  { key: "source", label: "Source" },
  { key: "severity", label: "Severity" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created" },
];

const formatLabel = (value: string) =>
  value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());

const parseSortableDate = (value: string) => {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? value : timestamp;
};

const compareValues = (a: string | number, b: string | number, direction: SortDir) => {
  if (typeof a === "number" && typeof b === "number") {
    return direction === "asc" ? a - b : b - a;
  }

  return direction === "asc"
    ? String(a).localeCompare(String(b))
    : String(b).localeCompare(String(a));
};

function getSeverityTone(severity: AdminNotification["severity"]): StatusTone {
  if (severity === "info") return "success";
  if (severity === "warning") return "warning";
  return "danger";
}

function getStatusTone(status: AdminNotification["status"]): StatusTone {
  if (status === "resolved" || status === "read") return "success";
  if (status === "unread") return "warning";
  return "inactive";
}

function FilterChipGroup({
  title,
  value,
  options,
  onChange,
  getLabel = formatLabel,
}: {
  title: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  getLabel?: (value: string) => string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {title}
      </p>

      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const isSelected = value === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className="rounded-md border px-3 py-2 text-left text-sm font-semibold transition"
              style={{
                background: isSelected
                  ? "rgba(var(--brand-rgb), 0.1)"
                  : "var(--surface-2)",
                borderColor: isSelected
                  ? "color-mix(in srgb, var(--color-brand-500) 36%, var(--border))"
                  : "var(--border)",
                color: isSelected
                  ? "var(--color-brand-600)"
                  : "var(--paragraph)",
              }}
            >
              {option === "all" ? "All" : getLabel(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [tab, setTab] = useState<Tab>("Notifications");
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [summary, setSummary] = useState<AdminNotificationsResponse["summary"]>({
    total: 0,
    unread: 0,
    critical: 0,
    resolved: 0,
  });
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<NotificationSortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [detailsNotification, setDetailsNotification] =
    useState<AdminNotification | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportMethod, setExportMethod] = useState<TableExportFormat>("PDF");

  const loadNotifications = useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const data = await apiGet<AdminNotificationsResponse>(
        "/admin/notifications",
        "admin",
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
          resolved: 0,
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
          : "Unable to load admin notifications.",
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

  useEffect(() => {
    const refreshTimer = window.setInterval(() => {
      void loadNotifications(false);
    }, REFRESH_SECONDS * 1000);

    return () => {
      window.clearInterval(refreshTimer);
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
          notification.affected_device,
          notification.error_details,
          notification.type,
          notification.source,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (searchTerm && !haystack.includes(searchTerm)) {
          return false;
        }

        if (typeFilter !== "all" && notification.type !== typeFilter) {
          return false;
        }

        if (severityFilter !== "all" && notification.severity !== severityFilter) {
          return false;
        }

        if (statusFilter !== "all" && notification.status !== statusFilter) {
          return false;
        }

        if (sourceFilter !== "all" && notification.source !== sourceFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortKey) {
          case "severity":
            return compareValues(severityRank[a.severity], severityRank[b.severity], sortDir);
          case "status":
            return compareValues(statusRank[a.status], statusRank[b.status], sortDir);
          case "createdAt":
            return compareValues(
              parseSortableDate(a.createdAt),
              parseSortableDate(b.createdAt),
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

  const visibleIds = filteredNotifications.map((notification) => notification.id);
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

  const exportNotifications = (format: TableExportFormat) => {
    if (selectedNotifications.length === 0) return;

    exportTableData({
      title: "Admin Notifications",
      filename: `notifications-export-${getExportTimestamp()}`,
      format,
      columns: [
        { label: "Notification", value: (row: AdminNotification) => row.title },
        { label: "Type", value: (row) => formatLabel(row.type) },
        { label: "Source", value: (row) => row.source },
        { label: "Severity", value: (row) => formatLabel(row.severity) },
        { label: "Status", value: (row) => formatLabel(row.status) },
        { label: "Created", value: (row) => row.createdAt },
      ],
      rows: selectedNotifications,
    });
  };

  const handleExportChange = (format: TableExportFormat) => {
    setExportMethod(format);
    setIsExportModalOpen(true);
  };

  const handleExportConfirmed = () => {
    exportNotifications(exportMethod);
    setIsExportModalOpen(false);
  };

  const removeSelectedNotificationFromExport = (id: string) => {
    setSelectedIds((current) => current.filter((item) => item !== id));
  };

  const sourceOptions = useMemo(() => {
    const loadedSources = notifications
      .map((notification) => notification.source)
      .filter(Boolean);

    return Array.from(new Set([...filterOptions.source, ...loadedSources]));
  }, [notifications]);

  const activeFilterCount = [
    typeFilter,
    severityFilter,
    statusFilter,
    sourceFilter,
  ].filter((value) => value !== "all").length;

  const kpiCards = [
    {
      title: "Total",
      value: summary.total.toLocaleString(),
      helper: "Backend-tracked notifications",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      title: "Unread",
      value: summary.unread.toLocaleString(),
      helper: "Still waiting for admin action",
      icon: <Inbox className="h-5 w-5" />,
    },
    {
      title: "Critical",
      value: summary.critical.toLocaleString(),
      helper: "Highest severity alerts",
      icon: <ShieldAlert className="h-5 w-5" />,
    },
    {
      title: "Resolved",
      value: summary.resolved.toLocaleString(),
      helper: "Already handled in the system",
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
  ];

  const handleBulkAction = (value: string) => {
    const ids = [...selectedIds];
    if (ids.length === 0 || busy) return;

    if (value === "mark-read") {
      void runAction(async () => {
        await apiPatch(
          "/admin/notifications/bulk/read",
          { notificationIds: ids },
          "admin",
        );
        setSelectedIds([]);
      });
    }

    if (value === "resolve") {
      void runAction(async () => {
        await Promise.all(
          ids.map((id) => apiPatch(`/admin/notifications/${id}/resolve`, {}, "admin")),
        );
        setSelectedIds([]);
      });
    }

    if (value === "dismiss") {
      void runAction(async () => {
        await Promise.all(
          ids.map((id) => apiPatch(`/admin/notifications/${id}/dismiss`, {}, "admin")),
        );
        setSelectedIds([]);
      });
    }

    if (value === "delete") {
      void runAction(async () => {
        await apiPost(
          "/admin/notifications/bulk/delete",
          { notificationIds: ids },
          "admin",
        );
        setSelectedIds([]);
      });
    }
  };

  const renderNotificationsTable = (expanded = false) => (
    <Table
      className={`flex min-h-[520px] flex-col ${
        expanded ? "h-dvh !rounded-none" : "max-h-[calc(100vh-20rem)]"
      }`}
    >
      <TableTop className={`shrink-0 ${expanded ? "bg-[var(--surface)]" : ""}`}>
        <TableTitleBlock title="Admin Notifications" />

        <TableControls>
          <TableSearch
            id={expanded ? "search-admin-notifications-expanded" : "search-admin-notifications"}
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
            options={[]}
            placeholder={
              <span className="flex items-center gap-2">
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
            className="w-auto"
            triggerClassName="h-14 min-w-[150px] px-6 text-base [&>span]:text-base"
            contentClassName="w-[420px] max-w-[calc(100vw-2rem)]"
            maxHeightClassName="max-h-[calc(100vh-8rem)]"
            align="right"
            ariaLabel="Filter notifications"
          >
            <div className="space-y-4 p-2">
              <FilterChipGroup
                title="Type"
                value={typeFilter}
                options={filterOptions.type}
                onChange={setTypeFilter}
              />

              <FilterChipGroup
                title="Severity"
                value={severityFilter}
                options={filterOptions.severity}
                onChange={setSeverityFilter}
              />

              <FilterChipGroup
                title="Status"
                value={statusFilter}
                options={filterOptions.status}
                onChange={setStatusFilter}
              />

              <FilterChipGroup
                title="Source"
                value={sourceFilter}
                options={sourceOptions}
                onChange={setSourceFilter}
                getLabel={(value) => value}
              />

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
            onValueChange={(value) =>
              handleExportChange(value as TableExportFormat)
            }
            placeholder={
              <span className="inline-flex items-center gap-2 text-[var(--foreground)]">
                <FileOutput className="h-4 w-4" />
                Export
              </span>
            }
            disabled={selectedIds.length === 0}
            className="w-auto"
            triggerClassName="h-14 min-w-[160px] px-6 text-base [&>span]:text-base"
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
                value: "resolve",
                label: "Resolve selected",
                disabled: selectedIds.length === 0,
              },
              {
                value: "dismiss",
                label: "Dismiss selected",
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
              <span className="inline-flex items-center gap-2">
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
            className="w-full md:w-auto"
            triggerClassName="h-14 min-w-[180px] px-6 text-base"
            align="right"
            ariaLabel="Notification actions"
          />

          <button
            type="button"
            onClick={() => setIsTableExpanded(!expanded)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-transparent text-[var(--muted)] transition hover:text-[var(--color-brand-500)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)]"
            aria-label={expanded ? "Collapse notifications table" : "Expand notifications table"}
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
        <div className="shrink-0 px-6 pb-2">
          <p
            className="rounded-xl border px-4 py-3 text-sm"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-brand-600) 24%, transparent)",
              background:
                "color-mix(in srgb, var(--color-brand-500) 10%, var(--surface))",
              color:
                "color-mix(in srgb, var(--color-brand-700) 82%, var(--title))",
            }}
          >
            {error}
          </p>
        </div>
      ) : null}

      <TableMain className="min-h-0 flex-1">
        <TableGrid minWidthClassName="flex h-full min-w-[1500px] flex-col">
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

            <TableHeaderCell label="Actions" />
          </TableHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <TableBody>
              {loading ? (
                <TableEmptyState text="Loading notifications..." />
              ) : filteredNotifications.length === 0 ? (
                <TableEmptyState text="No notifications matched the current filters." />
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => setDetailsNotification(notification)}
                    className={`grid w-full cursor-pointer border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                  >
                    <TableCell className="justify-center">
                      <TableCheckbox
                        checked={selectedIds.includes(notification.id)}
                        onToggle={() => toggleSelectedId(notification.id)}
                      />
                    </TableCell>

                    <TableCell className="min-w-0 flex-col items-start">
                      <p className="max-w-full truncate font-semibold text-[var(--title)]">
                        {notification.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                        {notification.message}
                      </p>
                    </TableCell>

                    <TableCell className="min-w-0 text-sm font-medium text-[var(--title)]">
                      <span className="block truncate">
                        {formatLabel(notification.type)}
                      </span>
                    </TableCell>

                    <TableCell className="min-w-0 text-sm font-medium text-[var(--title)]">
                      <span className="block truncate">{notification.source}</span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        label={formatLabel(notification.severity)}
                        tone={getSeverityTone(notification.severity)}
                        className="px-3 py-1.5 text-xs"
                      />
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        label={formatLabel(notification.status)}
                        tone={getStatusTone(notification.status)}
                        className="px-3 py-1.5 text-xs"
                      />
                    </TableCell>

                    <TableCell className="text-sm font-medium text-[var(--title)]">
                      {notification.createdAt}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {notification.status === "unread" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={(event) => {
                              event.stopPropagation();
                              void runAction(async () => {
                                await apiPatch(
                                  `/admin/notifications/${notification.id}/read`,
                                  {},
                                  "admin",
                                );
                              });
                            }}
                          >
                            Mark Read
                          </Button>
                        ) : null}

                        {notification.status !== "resolved" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={(event) => {
                              event.stopPropagation();
                              void runAction(async () => {
                                await apiPatch(
                                  `/admin/notifications/${notification.id}/resolve`,
                                  {},
                                  "admin",
                                );
                              });
                            }}
                          >
                            Resolve
                          </Button>
                        ) : null}

                        {notification.status !== "dismissed" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={(event) => {
                              event.stopPropagation();
                              void runAction(async () => {
                                await apiPatch(
                                  `/admin/notifications/${notification.id}/dismiss`,
                                  {},
                                  "admin",
                                );
                              });
                            }}
                          >
                            Dismiss
                          </Button>
                        ) : null}

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={(event) => {
                            event.stopPropagation();
                            void runAction(async () => {
                              await apiDelete(
                                `/admin/notifications/${notification.id}`,
                                "admin",
                              );
                            });
                          }}
                        >
                          Delete
                        </Button>
                      </div>
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
    <div className="space-y-6">
      <PageIntro
        title="Notifications"
        description="Monitor live printer, queue, and job alerts from the backend instead of the old mock table."
      />

      <div className="border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          {(["Notifications", "Settings"] as Tab[]).map((item) => {
            const active = tab === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`rounded-t-md px-5 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-b-2 border-brand-500 text-brand-500"
                    : "text-[var(--muted)]"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "Notifications" ? (
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

          <FullscreenTablePortal open={isTableExpanded}>
            {renderNotificationsTable(true)}
          </FullscreenTablePortal>

          {renderNotificationsTable()}
        </div>
      ) : (
        <div
          className="rounded-2xl border p-6"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: "var(--surface-2)" }}
            >
              <Settings2 className="h-5 w-5 text-[var(--color-brand-500)]" />
            </div>
            <div>
              <h2 className="title-md">Notification Settings</h2>
              <p className="paragraph mt-1">
                Live notification state is backend-backed, while rule editing and
                scheduler persistence are intentionally deferred.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div
              className="rounded-2xl border p-5"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <p className="text-sm font-semibold text-[var(--title)]">
                Finished now
              </p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                <li>Admin can read, resolve, dismiss, and delete live notifications.</li>
                <li>Notifications are created from real job, quota, and backend events.</li>
                <li>Unread and critical counts come from MongoDB.</li>
              </ul>
            </div>

            <div
              className="rounded-2xl border p-5"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <p className="text-sm font-semibold text-[var(--title)]">
                Deferred safely
              </p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                <li>Rule-builder persistence for thresholds and recipients.</li>
                <li>Email, SMS, and push delivery orchestration.</li>
                <li>Scheduled report notification automation.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <Modal open={isExportModalOpen} onClose={() => setIsExportModalOpen(false)}>
        <div className="w-[min(92vw,760px)] space-y-5 pr-4">
          <div className="border-b pb-4" style={{ borderColor: "var(--border)" }}>
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
                  Select rows to export.
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
                        {formatLabel(notification.type)} - {notification.source} -{" "}
                        {formatLabel(notification.status)}
                      </p>
                    </div>

                    <ExpandedButton
                      id={`remove-export-notifications-${notification.id}`}
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
              onClick={handleExportConfirmed}
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
        <div className="space-y-4 pr-8">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: "var(--surface-2)" }}
            >
              <Bell className="h-5 w-5 text-[var(--color-brand-500)]" />
            </div>
            <div>
              <h3 className="title-md">{detailsNotification?.title}</h3>
              <p className="paragraph mt-1">{detailsNotification?.createdAt}</p>
            </div>
          </div>

          <div
            className="rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
          >
            <p className="text-sm text-[var(--title)]">
              {detailsNotification?.message}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div
              className="rounded-xl border p-4"
              style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Affected Device
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                {detailsNotification?.affected_device || "Not attached"}
              </p>
            </div>

            <div
              className="rounded-xl border p-4"
              style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Error Details
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                {detailsNotification?.error_details || "None"}
              </p>
            </div>
          </div>

          {detailsNotification?.severity === "critical" ? (
            <div
              className="rounded-2xl border px-4 py-3 text-sm"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--color-brand-600) 24%, transparent)",
                background:
                  "color-mix(in srgb, var(--color-brand-500) 10%, var(--surface))",
                color:
                  "color-mix(in srgb, var(--color-brand-700) 82%, var(--title))",
              }}
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Critical notification
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
