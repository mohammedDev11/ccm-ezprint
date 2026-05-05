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
import StatusBadge, {
  type StatusTone,
} from "@/components/ui/badge/StatusBadge";
import Button from "@/components/ui/button/Button";
import RefreshButton from "@/components/ui/button/RefreshButton";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown/Dropdown";
import ListBox, { type ListBoxOption } from "@/components/ui/listbox/ListBox";
import Modal from "@/components/ui/modal/Modal";
import { cn } from "@/lib/cn";
import { apiGet } from "@/services/api";
import {
  Check,
  Clock3,
  Download,
  Eye,
  FileStack,
  FileText,
  Layers3,
  Maximize2,
  Minimize2,
  Printer,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type RecentPrintJobStatus = "Printed" | "Failed" | "Refunded";

type RecentPrintJobSortKey =
  | "date"
  | "printerName"
  | "documentName"
  | "pages"
  | "cost"
  | "status";

type RecentPrintJobItem = {
  id: string;
  date: string;
  dateOrder: number;
  printerName: string;
  documentName: string;
  pages: number;
  cost: number;
  status: RecentPrintJobStatus;
  attributes: string[];
  submittedFrom: string;
  printedAt: string;
  note?: string;
};

type PendingReleaseJobItem = {
  id: string;
  pages: number;
  cost: number;
  status?: string;
};

type SortDir = "asc" | "desc";
type StatusFilter = "all" | RecentPrintJobStatus;
type DateFilter = "all" | "last7" | "last30" | "thisYear";

const columnsClassName =
  "[grid-template-columns:72px_160px_minmax(240px,1fr)_minmax(290px,1.5fr)_120px_140px_180px]";

const recentPrintJobsTableColumns: {
  key: RecentPrintJobSortKey;
  label: string;
  sortable: boolean;
}[] = [
  { key: "date", label: "Date", sortable: true },
  { key: "printerName", label: "Printer", sortable: true },
  { key: "documentName", label: "Document", sortable: true },
  { key: "pages", label: "Pages", sortable: true },
  { key: "cost", label: "Cost / Quota", sortable: true },
  { key: "status", label: "Status", sortable: true },
];

const recentPrintJobsStatusMeta: Record<
  RecentPrintJobStatus,
  { label: string; tone: StatusTone }
> = {
  Printed: { label: "Printed", tone: "success" },
  Failed: { label: "Failed", tone: "danger" },
  Refunded: { label: "Refunded", tone: "inactive" },
};

const statusFilterOptions: ListBoxOption[] = [
  { label: "All Statuses", value: "all" },
  { label: "Printed", value: "Printed" },
  { label: "Failed", value: "Failed" },
  { label: "Refunded", value: "Refunded" },
];

const dateFilterOptions: ListBoxOption[] = [
  { label: "All Dates", value: "all" },
  { label: "Last 7 Days", value: "last7" },
  { label: "Last 30 Days", value: "last30" },
  { label: "This Year", value: "thisYear" },
];

const numberFormatter = new Intl.NumberFormat("en-US");

function PrintJobStatusBadge({ status }: { status: RecentPrintJobStatus }) {
  const meta = recentPrintJobsStatusMeta[status];

  const icon =
    status === "Printed" ? (
      <Check className="h-4 w-4" strokeWidth={2.8} />
    ) : status === "Failed" ? (
      <X className="h-4 w-4" strokeWidth={2.8} />
    ) : (
      <RotateCcw className="h-4 w-4" strokeWidth={2.5} />
    );

  return (
    <StatusBadge
      label={meta.label}
      tone={meta.tone}
      icon={icon}
      className="px-4 py-2 text-sm"
    />
  );
}

function toDateOrder(date: Date) {
  return (
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  );
}

function matchesDateFilter(job: RecentPrintJobItem, dateFilter: DateFilter) {
  if (dateFilter === "all") return true;

  const today = new Date();

  if (dateFilter === "thisYear") {
    return Math.floor(job.dateOrder / 10000) === today.getFullYear();
  }

  const cutoff = new Date(today);
  cutoff.setDate(today.getDate() - (dateFilter === "last7" ? 7 : 30));

  return (
    job.dateOrder >= toDateOrder(cutoff) &&
    job.dateOrder <= toDateOrder(today)
  );
}

function formatQuota(value: number) {
  return value.toFixed(2);
}

const RecentPrintJobsTable = () => {
  const isMountedRef = useRef(true);

  const [jobs, setJobs] = useState<RecentPrintJobItem[]>([]);
  const [pendingJobs, setPendingJobs] = useState<PendingReleaseJobItem[]>([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<RecentPrintJobSortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [printerFilter, setPrinterFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [openJobModal, setOpenJobModal] = useState<RecentPrintJobItem | null>(
    null,
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");

  const loadJobs = useCallback(
    async (mode: "initial" | "refresh" = "refresh") => {
      if (mode === "initial") {
        setIsInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setLoadError("");

      try {
        const [recentData, pendingData] = await Promise.all([
          apiGet<{ jobs: RecentPrintJobItem[] }>("/user/jobs/recent", "user"),
          apiGet<{ jobs: PendingReleaseJobItem[] }>(
            "/user/jobs/pending-release",
            "user",
          ),
        ]);

        if (!isMountedRef.current) return;

        const nextJobs = recentData?.jobs || [];

        setJobs(nextJobs);
        setPendingJobs(pendingData?.jobs || []);
        setSelectedIds((current) =>
          current.filter((id) => nextJobs.some((job) => job.id === id)),
        );
      } catch (error) {
        if (!isMountedRef.current) return;

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load recent print jobs.",
        );
      } finally {
        if (!isMountedRef.current) return;

        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    isMountedRef.current = true;
    const timer = window.setTimeout(() => {
      void loadJobs("initial");
    }, 0);

    return () => {
      window.clearTimeout(timer);
      isMountedRef.current = false;
    };
  }, [loadJobs]);

  const handleSort = (key: RecentPrintJobSortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir(key === "date" ? "desc" : "asc");
  };

  const printerFilterOptions = useMemo<ListBoxOption[]>(() => {
    const printers = Array.from(
      new Set(jobs.map((job) => job.printerName).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));

    return [
      { label: "All Printers", value: "all" },
      ...printers.map((printer) => ({
        label: printer,
        value: printer,
        searchText: printer,
      })),
    ];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...jobs]
      .filter((job) => {
        const searchableText = [
          job.date,
          job.printerName,
          job.documentName,
          job.status,
          job.submittedFrom,
          job.note,
          formatQuota(job.cost),
          String(job.pages),
          ...(job.attributes || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = !term || searchableText.includes(term);
        const matchesStatus =
          statusFilter === "all" || job.status === statusFilter;
        const matchesPrinter =
          printerFilter === "all" || job.printerName === printerFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPrinter &&
          matchesDateFilter(job, dateFilter)
        );
      })
      .sort((a, b) => {
        const getSortValue = (item: RecentPrintJobItem) => {
          switch (sortKey) {
            case "date":
              return item.dateOrder;
            case "printerName":
              return item.printerName.toLowerCase();
            case "documentName":
              return item.documentName.toLowerCase();
            case "pages":
              return item.pages;
            case "cost":
              return item.cost;
            case "status":
              return item.status.toLowerCase();
            default:
              return item.dateOrder;
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
  }, [dateFilter, jobs, printerFilter, search, sortDir, sortKey, statusFilter]);

  const allVisibleIds = filteredJobs.map((job) => job.id);
  const isAllSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedIds.includes(id));
  const selectedVisibleCount = allVisibleIds.filter((id) =>
    selectedIds.includes(id),
  ).length;

  const hasActiveFilters =
    Boolean(search.trim()) ||
    statusFilter !== "all" ||
    printerFilter !== "all" ||
    dateFilter !== "all";

  const activeFilterCount = [
    statusFilter !== "all",
    printerFilter !== "all",
    dateFilter !== "all",
  ].filter(Boolean).length;

  const printedJobs = jobs.filter((job) => job.status === "Printed");
  const totalPagesPrinted = printedJobs.reduce((sum, job) => sum + job.pages, 0);
  const totalJobCount = jobs.length + pendingJobs.length;

  const kpiCards = [
    {
      title: "Total Jobs",
      value: numberFormatter.format(totalJobCount),
      helper: `${numberFormatter.format(jobs.length)} recent, ${numberFormatter.format(
        pendingJobs.length,
      )} pending`,
      icon: <FileStack className="h-4 w-4" />,
    },
    {
      title: "Printed Jobs",
      value: numberFormatter.format(printedJobs.length),
      helper: "Successful releases in your history",
      icon: <Check className="h-4 w-4" />,
    },
    {
      title: "Pending / Held Jobs",
      value: numberFormatter.format(pendingJobs.length),
      helper: "Waiting in secure release",
      icon: <Clock3 className="h-4 w-4" />,
    },
    {
      title: "Pages Printed",
      value: numberFormatter.format(totalPagesPrinted),
      helper: "Pages from printed jobs",
      icon: <Layers3 className="h-4 w-4" />,
    },
  ];

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !allVisibleIds.includes(id)),
      );
      return;
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
  };

  const renderRecentJobsTable = (expanded = false) => (
    <Table
      className={`flex min-h-[520px] flex-col ${
        expanded ? "h-dvh !rounded-none" : "max-h-[calc(100vh-20rem)]"
      }`}
    >
      <TableTop className={`shrink-0 ${expanded ? "bg-[var(--surface)]" : ""}`}>
        <TableTitleBlock title="Recent Print Jobs" />

        <TableControls>
          <TableSearch
            id={
              expanded
                ? "search-recent-print-jobs-expanded"
                : "search-recent-print-jobs"
            }
            label="Search printer, document, status..."
            value={search}
            onChange={setSearch}
            wrapperClassName="w-full md:w-[360px]"
          />

          <RefreshButton
            label={isRefreshing ? "Refreshing" : "Refresh"}
            className="h-14"
            disabled={isInitialLoading || isRefreshing}
            onClick={() => void loadJobs("refresh")}
          />

          <Dropdown>
            <DropdownTrigger className="h-14 min-w-[150px] px-6 text-base">
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
            </DropdownTrigger>

            <DropdownContent align="right" widthClassName="w-[380px]">
              <div className="space-y-4 p-2">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Status
                    </p>
                    <ListBox
                      options={statusFilterOptions}
                      value={statusFilter}
                      onValueChange={(value) =>
                        setStatusFilter(value as StatusFilter)
                      }
                      ariaLabel="Filter recent jobs by status"
                      triggerClassName="h-11 px-3"
                      maxHeightClassName="max-h-52"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Date Range
                    </p>
                    <ListBox
                      options={dateFilterOptions}
                      value={dateFilter}
                      onValueChange={(value) =>
                        setDateFilter(value as DateFilter)
                      }
                      ariaLabel="Filter recent jobs by date"
                      triggerClassName="h-11 px-3"
                      maxHeightClassName="max-h-52"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Printer
                  </p>
                  <ListBox
                    options={printerFilterOptions}
                    value={printerFilter}
                    onValueChange={setPrinterFilter}
                    ariaLabel="Filter recent jobs by printer"
                    searchable
                    searchPlaceholder="Search printers..."
                    triggerClassName="h-11 px-3"
                    maxHeightClassName="max-h-52"
                  />
                </div>

                {activeFilterCount > 0 ? (
                  <Button
                    variant="outline"
                    className="h-11 w-full text-sm"
                    onClick={() => {
                      setStatusFilter("all");
                      setPrinterFilter("all");
                      setDateFilter("all");
                    }}
                  >
                    Reset Filters
                  </Button>
                ) : null}
              </div>
            </DropdownContent>
          </Dropdown>

          <button
            type="button"
            onClick={() => setIsTableExpanded(!expanded)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-transparent text-[var(--muted)] transition hover:text-[var(--color-brand-500)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)]"
            aria-label={
              expanded
                ? "Collapse recent print jobs table"
                : "Expand recent print jobs table"
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

      {selectedVisibleCount > 0 ? (
        <div className="shrink-0 border-b border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--muted)]">
          {selectedVisibleCount} visible job
          {selectedVisibleCount === 1 ? "" : "s"} selected
        </div>
      ) : null}

      {loadError ? (
        <div className="shrink-0 px-6 pb-2 pt-4">
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </p>
        </div>
      ) : null}

      <TableMain className="min-h-0 flex-1">
        <TableGrid minWidthClassName="flex h-full min-w-[1260px] flex-col">
          <TableHeader columnsClassName={columnsClassName}>
            <TableCell className="justify-center">
              <TableCheckbox
                checked={isAllSelected}
                onToggle={toggleSelectAll}
              />
            </TableCell>

            {recentPrintJobsTableColumns.map((column) => (
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
              {isInitialLoading ? (
                <TableEmptyState text="Loading recent print jobs..." />
              ) : filteredJobs.length === 0 ? (
                <TableEmptyState
                  text={
                    hasActiveFilters
                      ? "No print jobs match these filters"
                      : "No print jobs found"
                  }
                />
              ) : (
                filteredJobs.map((job) => {
                  const isSelected = selectedIds.includes(job.id);

                  return (
                    <div
                      key={job.id}
                      onClick={() => setOpenJobModal(job)}
                      className={cn(
                        "grid w-full cursor-pointer items-center border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30",
                        columnsClassName,
                      )}
                    >
                      <TableCell className="justify-center">
                        <TableCheckbox
                          checked={isSelected}
                          onToggle={() => toggleRowSelection(job.id)}
                        />
                      </TableCell>

                      <TableCell className="text-base font-medium text-[var(--paragraph)]">
                        {job.date}
                      </TableCell>

                      <TableCell className="min-w-0 gap-3">
                        <Printer className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                        <span className="block truncate text-base text-[var(--paragraph)]">
                          {job.printerName}
                        </span>
                      </TableCell>

                      <TableCell className="min-w-0 gap-3">
                        <FileText className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                        <span className="block truncate text-base font-medium text-[var(--title)]">
                          {job.documentName}
                        </span>
                      </TableCell>

                      <TableCell className="text-base font-medium text-[var(--title)]">
                        {job.pages}
                      </TableCell>

                      <TableCell className="text-base font-medium text-[var(--title)]">
                        {formatQuota(job.cost)}
                      </TableCell>

                      <TableCell>
                        <PrintJobStatusBadge status={job.status} />
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
        {renderRecentJobsTable(true)}
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

        {renderRecentJobsTable()}
      </div>

      <Modal open={Boolean(openJobModal)} onClose={() => setOpenJobModal(null)}>
        <div className="w-[min(92vw,760px)] space-y-5 pr-4">
          <div>
            <h3 className="title-md">{openJobModal?.documentName}</h3>
            <p className="paragraph mt-1">
              View full details for this print job.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Date</p>
              <p className="paragraph mt-1">
                {openJobModal?.printedAt || openJobModal?.date}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Status</p>
              <div className="mt-2">
                {openJobModal?.status ? (
                  <PrintJobStatusBadge status={openJobModal.status} />
                ) : null}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Printer</p>
              <p className="paragraph mt-1">{openJobModal?.printerName}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Pages</p>
              <p className="paragraph mt-1">{openJobModal?.pages}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                Cost / Quota
              </p>
              <p className="paragraph mt-1">
                {openJobModal ? formatQuota(openJobModal.cost) : ""}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                Submitted From
              </p>
              <p className="paragraph mt-1">{openJobModal?.submittedFrom}</p>
            </div>
          </div>

          {openJobModal?.attributes?.length ? (
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                Print Attributes
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {openJobModal.attributes.map((attribute) => (
                  <span
                    key={attribute}
                    className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium"
                    style={{
                      background: "var(--surface-2)",
                      color: "var(--paragraph)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {attribute}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {openJobModal?.note ? (
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Note</p>
              <p className="paragraph mt-2">{openJobModal.note}</p>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              iconLeft={<Download className="h-4 w-4" />}
            >
              Export Receipt
            </Button>

            <Button variant="primary" iconLeft={<Eye className="h-4 w-4" />}>
              View Details
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RecentPrintJobsTable;
