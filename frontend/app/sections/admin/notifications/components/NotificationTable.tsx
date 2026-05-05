"use client";

import React, { useMemo, useState } from "react";
import Button from "@/components/ui/button/Button";
import ListBox from "@/components/ui/listbox/ListBox";
import StatusBadge from "@/components/ui/badge/StatusBadge";
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
  TableTop,
} from "@/components/shared/table/Table";
import { XCircle, CheckCheck, ArrowUpDown } from "lucide-react";
import RefreshTimer from "./RefreshTimer";
import {
  formatLabel,
  formatTypeLabel,
  getSeverityTone,
  getStatusTone,
  Notification,
  NotificationFilters,
  NotificationSource,
  NotificationStatus,
  NotificationType,
} from "@/lib/mock-data/Admin/notifications";

type Props = {
  notifications: Notification[];
  filters: NotificationFilters;
  setFilters: React.Dispatch<React.SetStateAction<NotificationFilters>>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  secondsLeft: number;
  onRefreshNow: () => void;
  onBulkRead: (ids: string[]) => void;
  onBulkResolve: (ids: string[]) => void;
  onBulkDismiss: (ids: string[]) => void;
  onBulkDelete: (ids: string[]) => void;
  onResolveOne: (id: string) => void;
  onDismissOne: (id: string) => void;
  onDeleteOne: (id: string) => void;
};

type SortKey =
  | "title"
  | "type"
  | "source"
  | "severity"
  | "createdAt"
  | "status";

type SortDirection = "asc" | "desc";

const columnsClassName =
  "[grid-template-columns:72px_minmax(280px,1.7fr)_170px_120px_120px_150px_140px_130px]";

const severityOrder: Record<Notification["severity"], number> = {
  info: 1,
  warning: 2,
  error: 3,
  critical: 4,
};

const statusOrder: Record<Notification["status"], number> = {
  unread: 1,
  read: 2,
  resolved: 3,
  dismissed: 4,
};

const typeFilterOptions = [
  { value: "all", label: "All Types" },
  { value: "printer_alert", label: "Printer Alert" },
  { value: "device_error", label: "Device Error" },
  { value: "toner_low", label: "Toner Low" },
  { value: "queue_warning", label: "Queue Warning" },
  { value: "maintenance_reminder", label: "Maintenance Reminder" },
  { value: "system_warning", label: "System Warning" },
  { value: "job_issue", label: "Job Issue" },
];

const severityFilterOptions = [
  { value: "all", label: "All Severities" },
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
  { value: "critical", label: "Critical" },
];

const statusFilterOptions = [
  { value: "all", label: "All Statuses" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

const sourceFilterOptions = [
  { value: "all", label: "All Sources" },
  { value: "Printer", label: "Printer" },
  { value: "Device", label: "Device" },
  { value: "Queue", label: "Queue" },
  { value: "System", label: "System" },
  { value: "Report Scheduler", label: "Report Scheduler" },
];

const actionOptions = [
  { value: "read", label: "Read" },
  { value: "resolve", label: "Resolve" },
  { value: "dismiss", label: "Dismiss" },
  { value: "delete", label: "Delete" },
];

function parseNotificationDate(dateStr: string) {
  const parsed = new Date(dateStr);
  if (!Number.isNaN(parsed.getTime())) return parsed.getTime();
  return 0;
}

function compareValues(
  a: string | number,
  b: string | number,
  direction: SortDirection
) {
  let result = 0;

  if (typeof a === "number" && typeof b === "number") {
    result = a - b;
  } else {
    result = String(a).localeCompare(String(b), undefined, {
      numeric: true,
      sensitivity: "base",
    });
  }

  return direction === "asc" ? result : -result;
}

function SortableHeader({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 text-left text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:opacity-80 sm:text-xs"
      style={{ color: active ? "var(--title)" : "var(--muted)" }}
    >
      <span>{label}</span>
      <ArrowUpDown
        className={`h-3.5 w-3.5 transition ${
          active ? "opacity-100" : "opacity-50"
        }`}
      />
      {active && (
        <span className="text-[10px] normal-case tracking-normal">
          {direction === "asc" ? "Asc" : "Desc"}
        </span>
      )}
    </button>
  );
}

export default function NotificationTable({
  notifications,
  filters,
  setFilters,
  selectedIds,
  setSelectedIds,
  secondsLeft,
  onRefreshNow,
  onBulkRead,
  onBulkResolve,
  onBulkDismiss,
  onBulkDelete,
  onResolveOne,
  onDismissOne,
  onDeleteOne,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const sortedNotifications = useMemo(() => {
    const items = [...notifications];

    items.sort((a, b) => {
      switch (sortKey) {
        case "title":
          return compareValues(a.title, b.title, sortDirection);

        case "type":
          return compareValues(
            formatTypeLabel(a.type),
            formatTypeLabel(b.type),
            sortDirection
          );

        case "source":
          return compareValues(a.source, b.source, sortDirection);

        case "severity":
          return compareValues(
            severityOrder[a.severity],
            severityOrder[b.severity],
            sortDirection
          );

        case "status":
          return compareValues(
            statusOrder[a.status],
            statusOrder[b.status],
            sortDirection
          );

        case "createdAt":
          return compareValues(
            parseNotificationDate(a.createdAt),
            parseNotificationDate(b.createdAt),
            sortDirection
          );

        default:
          return 0;
      }
    });

    return items;
  }, [notifications, sortKey, sortDirection]);

  const allVisibleIds = sortedNotifications.map((item) => item.id);
  const isAllSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !allVisibleIds.includes(id))
      );
      return;
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <Table>
      <TableTop className="pb-4">
        <TableControls>
          <TableSearch
            id="search-notifications"
            label="Search by title, message, device..."
            value={filters.search}
            onChange={(value: string) =>
              setFilters((prev) => ({ ...prev, search: value }))
            }
            wrapperClassName="w-full md:w-[440px]"
          />

          <ListBox
            value={filters.type}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                type: value as NotificationType | "all",
              }))
            }
            options={typeFilterOptions}
            className="w-auto"
            triggerClassName="h-12 min-w-[170px] px-5 text-base"
            contentClassName="w-[220px]"
            ariaLabel="Filter notifications by type"
          />

          <ListBox
            value={filters.severity}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                severity: value as NotificationFilters["severity"],
              }))
            }
            options={severityFilterOptions}
            className="w-auto"
            triggerClassName="h-12 min-w-[170px] px-5 text-base"
            contentClassName="w-[220px]"
            ariaLabel="Filter notifications by severity"
          />

          <ListBox
            value={filters.status}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                status: value as NotificationStatus | "all",
              }))
            }
            options={statusFilterOptions}
            className="w-auto"
            triggerClassName="h-12 min-w-[170px] px-5 text-base"
            contentClassName="w-[220px]"
            ariaLabel="Filter notifications by status"
          />

          <ListBox
            value={filters.source}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                source: value as NotificationSource | "all",
              }))
            }
            options={sourceFilterOptions}
            className="w-auto"
            triggerClassName="h-12 min-w-[170px] px-5 text-base"
            contentClassName="w-[220px]"
            ariaLabel="Filter notifications by source"
          />

          <RefreshTimer secondsLeft={secondsLeft} onRefreshNow={onRefreshNow} />

          <ListBox
            value=""
            options={actionOptions}
            onValueChange={(value) => {
              if (value === "read") onBulkRead(selectedIds);
              if (value === "resolve") onBulkResolve(selectedIds);
              if (value === "dismiss") onBulkDismiss(selectedIds);
              if (value === "delete") onBulkDelete(selectedIds);
            }}
            placeholder="Actions"
            disabled={selectedIds.length === 0}
            className="w-auto"
            triggerClassName="h-12 min-w-[170px] px-5 text-base"
            contentClassName="w-[220px]"
            optionClassName="py-4 text-lg"
            align="right"
            ariaLabel="Notification actions"
          />
        </TableControls>
      </TableTop>

      <TableMain>
        <TableGrid minWidthClassName="min-w-[1280px]">
          <TableHeader columnsClassName={columnsClassName}>
            <TableCell className="justify-center">
              <TableCheckbox
                checked={isAllSelected}
                onToggle={toggleSelectAll}
              />
            </TableCell>

            <div>
              <SortableHeader
                label="Title"
                active={sortKey === "title"}
                direction={sortDirection}
                onClick={() => handleSort("title")}
              />
            </div>

            <div>
              <SortableHeader
                label="Type"
                active={sortKey === "type"}
                direction={sortDirection}
                onClick={() => handleSort("type")}
              />
            </div>

            <div>
              <SortableHeader
                label="Source"
                active={sortKey === "source"}
                direction={sortDirection}
                onClick={() => handleSort("source")}
              />
            </div>

            <div>
              <SortableHeader
                label="Severity"
                active={sortKey === "severity"}
                direction={sortDirection}
                onClick={() => handleSort("severity")}
              />
            </div>

            <div>
              <SortableHeader
                label="Date"
                active={sortKey === "createdAt"}
                direction={sortDirection}
                onClick={() => handleSort("createdAt")}
              />
            </div>

            <div>
              <SortableHeader
                label="Status"
                active={sortKey === "status"}
                direction={sortDirection}
                onClick={() => handleSort("status")}
              />
            </div>

            <div
              className="text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-xs"
              style={{ color: "var(--muted)" }}
            >
              Quick Actions
            </div>
          </TableHeader>

          <TableBody>
            {sortedNotifications.length === 0 ? (
              <TableEmptyState text="No notifications found" />
            ) : (
              sortedNotifications.map((notification) => {
                const isSelected = selectedIds.includes(notification.id);

                return (
                  <div
                    key={notification.id}
                    className={`grid w-full items-center border-b border-[var(--border)] px-6 py-4 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                  >
                    <TableCell className="justify-center">
                      <TableCheckbox
                        checked={isSelected}
                        onToggle={() => toggleRowSelection(notification.id)}
                      />
                    </TableCell>

                    <TableCell className="min-w-0 flex-col items-start gap-0.5">
                      <span className="block truncate text-sm font-semibold text-[var(--title)]">
                        {notification.title}
                      </span>
                      <span className="block truncate text-sm text-[var(--muted)]">
                        {notification.message}
                      </span>
                    </TableCell>

                    <TableCell className="min-w-0 paragraph font-medium">
                      <span className="block truncate">
                        {formatTypeLabel(notification.type)}
                      </span>
                    </TableCell>

                    <TableCell className="min-w-0 paragraph font-medium">
                      <span className="block truncate">
                        {notification.source}
                      </span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        label={formatLabel(notification.severity)}
                        tone={getSeverityTone(notification.severity)}
                        className="px-3 py-1.5 text-xs"
                      />
                    </TableCell>

                    <TableCell className="min-w-0 paragraph font-medium">
                      <span className="block truncate">
                        {notification.createdAt}
                      </span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        label={formatLabel(notification.status)}
                        tone={getStatusTone(notification.status)}
                        className="px-3 py-1.5 text-xs"
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          className="h-9 px-2 text-[var(--muted)] hover:bg-[var(--surface-2)]"
                          onClick={() => onResolveOne(notification.id)}
                          title="Resolve"
                        >
                          <CheckCheck className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          className="h-9 px-2 text-[var(--muted)] hover:bg-[var(--surface-2)]"
                          onClick={() => onDismissOne(notification.id)}
                          title="Dismiss"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </div>
                );
              })
            )}
          </TableBody>
        </TableGrid>
      </TableMain>
    </Table>
  );
}
