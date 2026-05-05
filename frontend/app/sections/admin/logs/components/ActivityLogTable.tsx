"use client";

import KpiMetricCard from "@/components/shared/cards/KpiMetricCard";
import FullscreenTablePortal from "@/components/shared/table/FullscreenTablePortal";
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
import ListBox, { type ListBoxOption } from "@/components/ui/listbox/ListBox";
import Modal from "@/components/ui/modal/Modal";
import { exportTableData, TableExportFormat } from "@/lib/export";
import { apiGet } from "@/services/api";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  FileOutput,
  Info,
  Maximize2,
  Minimize2,
  Printer,
  ScrollText,
  SlidersHorizontal,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

type ActivityLog = {
  id: string;
  time: string;
  type: string;
  title: string;
  description: string;
  user: string;
  printer: string;
  pages: number | null;
  status: "Success" | "Failed" | "Warning" | "Info";
  documentName: string;
  deviceIp: string;
  queueName: string;
  serialNumber: string;
  location: string;
  resolutionNote: string;
  category: string;
  performedAt: string;
  success: boolean;
};

type LogsResponse = {
  total: number;
  count: number;
  filtersApplied: {
    search: string;
    category: string;
    success: string;
    startDate: string;
    endDate: string;
  };
  logs: ActivityLog[];
  auditLogs: ActivityLog[];
};

type SortDir = "asc" | "desc";
type LogSortKey =
  | "time"
  | "type"
  | "title"
  | "user"
  | "printer"
  | "pages"
  | "status";

const columnsClassName =
  "[grid-template-columns:72px_minmax(170px,0.85fr)_minmax(140px,0.7fr)_minmax(280px,1.4fr)_minmax(180px,0.9fr)_minmax(190px,0.9fr)_minmax(100px,0.5fr)_minmax(140px,0.7fr)]";

const typeOptions = ["all", "Print Job", "System", "User", "Printer"];
const statusOptions = ["all", "Success", "Failed", "Warning"];
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
const getExportTimestamp = () =>
  new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

const logTableColumns: Array<{
  key: LogSortKey;
  label: string;
}> = [
  { key: "time", label: "Time" },
  { key: "type", label: "Type" },
  { key: "title", label: "Event" },
  { key: "user", label: "User" },
  { key: "printer", label: "Printer" },
  { key: "pages", label: "Pages" },
  { key: "status", label: "Status" },
];

const getStatusTone = (status: ActivityLog["status"]) => {
  if (status === "Success") return "success";
  if (status === "Failed") return "danger";
  if (status === "Warning") return "warning";
  return "inactive";
};

const emptyValue = "—";

const stripDisplayCurrencyLabel = (value: string) =>
  value.replace(/(\d+(?:\.\d+)?)\s+SAR\b(?=\s*(?:[.,;:!?)]|$))/gi, "$1");

const renderLogTypeIcon = (type: string, className: string) => {
  const normalizedType = type.toLowerCase();

  if (normalizedType.includes("print")) {
    return <FileText className={className} />;
  }
  if (normalizedType.includes("printer") || normalizedType.includes("device")) {
    return <Printer className={className} />;
  }
  if (normalizedType.includes("user") || normalizedType.includes("security")) {
    return <UserRound className={className} />;
  }
  if (normalizedType.includes("system")) {
    return <ScrollText className={className} />;
  }

  return <Info className={className} />;
};

const getLogTypeStyle = (type: string) => {
  const normalizedType = type.toLowerCase();

  if (normalizedType.includes("print")) {
    return {
      borderColor: "color-mix(in srgb, var(--color-brand-500) 28%, var(--border))",
      background: "color-mix(in srgb, var(--color-brand-500) 10%, var(--surface))",
      color: "color-mix(in srgb, var(--color-brand-700) 80%, var(--title))",
    };
  }

  if (normalizedType.includes("printer") || normalizedType.includes("device")) {
    return {
      borderColor: "color-mix(in srgb, var(--color-warning-500) 30%, var(--border))",
      background: "color-mix(in srgb, var(--color-warning-500) 12%, var(--surface))",
      color: "color-mix(in srgb, var(--color-warning-600) 82%, var(--title))",
    };
  }

  if (normalizedType.includes("user") || normalizedType.includes("security")) {
    return {
      borderColor: "color-mix(in srgb, var(--color-support-500) 28%, var(--border))",
      background: "color-mix(in srgb, var(--color-support-500) 11%, var(--surface))",
      color: "color-mix(in srgb, var(--color-support-700) 78%, var(--title))",
    };
  }

  return {
    borderColor: "var(--border)",
    background: "var(--surface-2)",
    color: "var(--paragraph)",
  };
};

const LogTypeBadge = ({ type }: { type: string }) => {
  if (!type) return <span>{emptyValue}</span>;

  return (
    <span
      className="inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold"
      style={getLogTypeStyle(type)}
      title={type}
    >
      {renderLogTypeIcon(type, "h-3.5 w-3.5 shrink-0")}
      <span className="truncate">{type}</span>
    </span>
  );
};

const DetailField = ({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) => {
  const isEmpty = value === null || value === undefined || value === "";

  return (
    <div
      className="min-w-0 rounded-xl border px-4 py-3.5"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </p>
      <div className="mt-2 min-w-0 break-words text-sm font-semibold text-[var(--title)]">
        {isEmpty ? emptyValue : value}
      </div>
    </div>
  );
};

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

const ActivityLogTable = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<LogSortKey>("time");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportMethod, setExportMethod] = useState<TableExportFormat>("PDF");

  const loadLogs = useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const data = await apiGet<LogsResponse>("/admin/logs", "admin");
      const nextLogs = data.logs || [];
      setLogs(nextLogs);
      setSelectedIds((current) =>
        current.filter((id) => nextLogs.some((log) => log.id === id)),
      );
      setError("");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to load logs.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadLogs(false);
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [loadLogs]);

  const handleSort = (key: LogSortKey) => {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir(key === "time" || key === "pages" ? "desc" : "asc");
  };

  const filteredLogs = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return [...logs]
      .filter((log) => {
        const haystack = [
          log.time,
          log.type,
          log.title,
          log.description,
          log.user,
          log.printer,
          log.documentName,
          log.queueName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (searchTerm && !haystack.includes(searchTerm)) {
          return false;
        }

        if (typeFilter !== "all") {
          const isPrinterLog =
            typeFilter === "Printer" &&
            ["Printer", "Device"].includes(log.type);
          const isUserLog =
            typeFilter === "User" && ["User", "Security"].includes(log.type);

          if (log.type !== typeFilter && !isPrinterLog && !isUserLog) {
            return false;
          }
        }

        if (statusFilter !== "all" && log.status !== statusFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const getSortValue = (log: ActivityLog) => {
          switch (sortKey) {
            case "time":
              return parseSortableDate(log.time);
            case "type":
              return log.type;
            case "title":
              return log.title;
            case "user":
              return log.user;
            case "printer":
              return log.printer;
            case "pages":
              return log.pages ?? 0;
            case "status":
              return log.status;
            default:
              return log.time;
          }
        };

        return compareValues(getSortValue(a), getSortValue(b), sortDir);
      });
  }, [logs, search, sortDir, sortKey, statusFilter, typeFilter]);

  const successCount = logs.filter((log) => log.status === "Success").length;
  const failureCount = logs.filter((log) => log.status === "Failed").length;
  const warningCount = logs.filter((log) => log.status === "Warning").length;
  const visibleIds = filteredLogs.map((log) => log.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const activeFilterCount = [typeFilter !== "all", statusFilter !== "all"].filter(
    Boolean,
  ).length;

  const kpiCards = [
    {
      title: "Entries",
      value: logs.length.toLocaleString(),
      helper: "Logs returned from MongoDB",
      icon: <ScrollText className="h-4 w-4" />,
    },
    {
      title: "Success",
      value: successCount.toLocaleString(),
      helper: "Completed backend actions",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
      title: "Failures",
      value: failureCount.toLocaleString(),
      helper: "Requests or jobs that failed",
      icon: <XCircle className="h-4 w-4" />,
    },
    {
      title: "Warnings",
      value: warningCount.toLocaleString(),
      helper: "Issues worth checking soon",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
  ];

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !visibleIds.includes(id)),
      );
      return;
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...visibleIds])));
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const selectedLogs = useMemo(
    () => logs.filter((log) => selectedIds.includes(log.id)),
    [logs, selectedIds],
  );

  const exportLogs = (format: TableExportFormat) => {
    if (selectedLogs.length === 0) return;

    exportTableData({
      title: "System Logs",
      filename: `logs-export-${getExportTimestamp()}`,
      format,
      columns: [
        { label: "Time", value: (row: ActivityLog) => row.time },
        { label: "Type", value: (row) => row.type },
        { label: "Event", value: (row) => row.title },
        { label: "User", value: (row) => row.user || "" },
        { label: "Printer", value: (row) => row.printer || "" },
        { label: "Pages", value: (row) => row.pages ?? "" },
        { label: "Status", value: (row) => row.status },
      ],
      rows: selectedLogs,
    });
  };

  const handleExportChange = (format: TableExportFormat) => {
    setExportMethod(format);
    setIsExportModalOpen(true);
  };

  const handleExportConfirmed = () => {
    exportLogs(exportMethod);
    setIsExportModalOpen(false);
  };

  const removeSelectedLogFromExport = (id: string) => {
    setSelectedIds((current) => current.filter((item) => item !== id));
  };

  const renderLogsTable = (expanded = false) => (
    <Table
      className={`flex min-h-[520px] flex-col ${
        expanded ? "h-dvh !rounded-none" : "max-h-[calc(100vh-20rem)]"
      }`}
    >
      <TableTop
        className={`shrink-0 ${expanded ? "bg-[var(--surface)]" : ""}`}
      >
        <TableTitleBlock title="System Logs" />

        <TableControls>
          <TableSearch
            id={expanded ? "search-logs-expanded" : "search-logs"}
            label="Search logs"
            value={search}
            onChange={setSearch}
          />

          <RefreshButton className="h-14" onClick={() => loadLogs(false)} />

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
            contentClassName="w-[360px]"
            maxHeightClassName=""
            align="right"
            ariaLabel="Filter logs"
          >
            <div className="space-y-4 p-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Type
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {typeOptions.map((option) => {
                    const isSelected = typeFilter === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setTypeFilter(option)}
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
                        {option === "all" ? "All" : option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Status
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((option) => {
                    const isSelected = statusFilter === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setStatusFilter(option)}
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
                        {option === "all" ? "All" : option}
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeFilterCount > 0 ? (
                <Button
                  variant="outline"
                  className="h-11 w-full text-sm"
                  onClick={() => {
                    setTypeFilter("all");
                    setStatusFilter("all");
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
            ariaLabel="Export selected logs"
          />

          <button
            type="button"
            onClick={() => setIsTableExpanded(!expanded)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-transparent text-[var(--muted)] transition hover:text-[var(--color-brand-500)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)]"
            aria-label={expanded ? "Collapse logs table" : "Expand logs table"}
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
        <TableGrid minWidthClassName="flex h-full min-w-[1320px] flex-col">
          <TableHeader columnsClassName={columnsClassName}>
            <TableCell className="justify-center">
              <TableCheckbox checked={allVisibleSelected} onToggle={toggleSelectAll} />
            </TableCell>

            {logTableColumns.map((column) => (
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
                <TableEmptyState text="Loading logs..." />
              ) : filteredLogs.length === 0 ? (
                <TableEmptyState text="No logs matched the current filters." />
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`grid w-full cursor-pointer border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                  >
                    <TableCell className="justify-center">
                      <TableCheckbox
                        checked={selectedIds.includes(log.id)}
                        onToggle={() => toggleRowSelection(log.id)}
                      />
                    </TableCell>

                    <TableCell className="text-sm font-medium text-[var(--title)]">
                      {log.time}
                    </TableCell>

                    <TableCell>
                      <span
                        className="inline-flex max-w-[120px] items-center rounded-full border px-3 py-1 text-xs font-semibold"
                        style={{
                          borderColor: "var(--border)",
                          background: "var(--surface-2)",
                          color: "var(--paragraph)",
                        }}
                        title={log.type}
                      >
                        <span className="truncate">{log.type}</span>
                      </span>
                    </TableCell>

                    <TableCell className="flex-col items-start">
                      <p className="font-semibold text-[var(--title)]">{log.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                        {log.description}
                      </p>
                    </TableCell>

                    <TableCell className="text-sm font-medium text-[var(--title)]">
                      {log.user || "—"}
                    </TableCell>

                    <TableCell className="text-sm font-medium text-[var(--title)]">
                      {log.printer || "—"}
                    </TableCell>

                    <TableCell className="text-sm font-medium text-[var(--title)]">
                      {log.pages ?? "—"}
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        label={log.status}
                        tone={getStatusTone(log.status)}
                        className="px-3 py-1.5 text-sm"
                      />
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
        {renderLogsTable(true)}
      </FullscreenTablePortal>

      {renderLogsTable()}

      <Modal open={isExportModalOpen} onClose={() => setIsExportModalOpen(false)}>
        <div className="w-[min(92vw,760px)] space-y-5 pr-4">
          <div className="border-b pb-4" style={{ borderColor: "var(--border)" }}>
            <h3 className="title-md flex items-center gap-2">
              <FileOutput className="h-5 w-5 text-brand-500" />
              Export selected logs
            </h3>
            <p className="paragraph mt-2">
              Review the logs to export, remove any row if needed, then choose
              the export format.
            </p>
            <p className="paragraph mt-2">
              Total selected:{" "}
              <span className="font-semibold">{selectedLogs.length}</span>
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
            <div
              className="max-h-[320px] space-y-3 overflow-y-auto pr-2"
              style={{ scrollbarWidth: "thin" }}
            >
              {selectedLogs.length === 0 ? (
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
                selectedLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border p-4"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                    }}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--title)]">
                        {log.title}
                      </p>
                      <p className="truncate text-sm text-[var(--muted)]">
                        {log.time} - {log.type} - {log.user || "No user"} -{" "}
                        {log.status}
                      </p>
                    </div>

                    <ExpandedButton
                      id={`remove-export-logs-${log.id}`}
                      label="Remove"
                      icon={Trash2}
                      variant="danger"
                      onClick={() => removeSelectedLogFromExport(log.id)}
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
              disabled={selectedLogs.length === 0}
            >
              Export
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(selectedLog)} onClose={() => setSelectedLog(null)}>
        {selectedLog ? (
          <div className="w-[min(92vw,940px)] max-h-[calc(90vh-5rem)] space-y-6 overflow-y-auto pr-2">
            <div
              className="rounded-[1.35rem] border p-5"
              style={{
                borderColor: "var(--border)",
                background:
                  "linear-gradient(180deg, color-mix(in srgb, var(--surface-2) 88%, transparent), var(--surface))",
              }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border"
                    style={getLogTypeStyle(selectedLog.type)}
                  >
                    {renderLogTypeIcon(selectedLog.type, "h-6 w-6")}
                  </div>

                  <div className="min-w-0">
                    <h3 className="break-words text-2xl font-bold text-[var(--title)]">
                      {selectedLog.title || "Log event"}
                    </h3>
                    <p className="mt-2 text-sm font-medium text-[var(--muted)]">
                      {selectedLog.time || emptyValue}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <LogTypeBadge type={selectedLog.type} />
                  <StatusBadge
                    label={selectedLog.status}
                    tone={getStatusTone(selectedLog.status)}
                    className="px-3 py-1.5 text-sm"
                  />
                </div>
              </div>
            </div>

            <section
              className="rounded-[1.35rem] border p-5"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <div className="mb-4 flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-[var(--color-brand-500)]" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Event details
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <DetailField
                  label="Type"
                  value={<LogTypeBadge type={selectedLog.type} />}
                />
                <DetailField
                  label="Status"
                  value={
                    <StatusBadge
                      label={selectedLog.status}
                      tone={getStatusTone(selectedLog.status)}
                      className="px-3 py-1.5 text-sm"
                    />
                  }
                />
                <DetailField label="User" value={selectedLog.user} />
                <DetailField label="Printer" value={selectedLog.printer} />
                <DetailField label="Pages" value={selectedLog.pages} />
                <DetailField label="Document" value={selectedLog.documentName} />
                <DetailField label="Queue" value={selectedLog.queueName} />
                <DetailField label="Device IP" value={selectedLog.deviceIp} />
                <DetailField
                  label="Serial Number"
                  value={selectedLog.serialNumber}
                />
                <DetailField label="Location" value={selectedLog.location} />
              </div>
            </section>

            <section
              className="rounded-[1.35rem] border p-5"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Info className="h-4 w-4 text-[var(--color-brand-500)]" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Description
                </p>
              </div>
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[var(--paragraph)]">
                {stripDisplayCurrencyLabel(
                  selectedLog.description || "No description.",
                )}
              </p>
            </section>

            {selectedLog.resolutionNote ? (
              <section
                className="rounded-[1.35rem] border p-5"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-support-500)]" />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Resolution note
                  </p>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[var(--paragraph)]">
                  {stripDisplayCurrencyLabel(selectedLog.resolutionNote)}
                </p>
              </section>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default ActivityLogTable;
