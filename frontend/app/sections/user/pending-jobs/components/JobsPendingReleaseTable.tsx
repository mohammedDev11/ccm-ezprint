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
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";
import Modal from "@/components/ui/modal/Modal";
import { cn } from "@/lib/cn";
import { apiDelete, apiGet, apiPost } from "@/services/api";
import {
  Check,
  Clock3,
  FileStack,
  FileText,
  Layers3,
  Maximize2,
  Minimize2,
  MonitorUp,
  Printer,
  SlidersHorizontal,
  TicketCheck,
  Trash2,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type PendingReleaseSortKey =
  | "documentName"
  | "printerName"
  | "pages"
  | "cost"
  | "submittedAt"
  | "readinessPercent"
  | "releaseCode";

type PendingReleaseJob = {
  id: string;
  documentName: string;
  printerName: string;
  fileCount?: number;
  pages: number;
  cost: number;
  submittedAt: string;
  submittedMinutesAgo: number;
  clientSource: string;
  fileType: string;
  printMode: string;
  estimatedReady: string;
  readinessPercent: number;
  releaseCode: string;
  releaseCodeExpiry?: string | null;
};

type PendingReleaseResponse = {
  pendingReleaseQuota: number;
  balance?: number;
  jobs: PendingReleaseJob[];
};

type SortDir = "asc" | "desc";
type ReadinessFilter = "all" | "ready" | "stored" | "syncing";
type CancelAction = "delete" | "draft" | null;
type CancelDialogTarget = {
  ids: string[];
  label: string;
  count: number;
} | null;

const columnsClassName =
  "[grid-template-columns:72px_minmax(320px,1.6fr)_minmax(240px,1fr)_120px_140px_180px_minmax(180px,0.8fr)_170px]";

const pendingReleaseTableColumns: {
  key: PendingReleaseSortKey;
  label: string;
  sortable: boolean;
}[] = [
  { key: "documentName", label: "Document", sortable: true },
  { key: "printerName", label: "Printer", sortable: true },
  { key: "pages", label: "Pages", sortable: true },
  { key: "cost", label: "Cost / Quota", sortable: true },
  { key: "releaseCode", label: "Release Code", sortable: true },
  { key: "readinessPercent", label: "Status", sortable: true },
  { key: "submittedAt", label: "Submitted", sortable: true },
];

const readinessFilterOptions: ListBoxOption[] = [
  { label: "All Statuses", value: "all" },
  { label: "Ready", value: "ready" },
  { label: "Stored", value: "stored" },
  { label: "Syncing", value: "syncing" },
];

const numberFormatter = new Intl.NumberFormat("en-US");

function formatQuota(value: number) {
  return value.toFixed(2);
}

function getReadinessKey(
  job: PendingReleaseJob,
): Exclude<ReadinessFilter, "all"> {
  if (job.estimatedReady === "Stored on printer") {
    return "stored";
  }

  return job.readinessPercent >= 100 ? "ready" : "syncing";
}

function PendingStatusBadge({ job }: { job: PendingReleaseJob }) {
  const readiness = getReadinessKey(job);
  const meta: Record<
    Exclude<ReadinessFilter, "all">,
    { label: string; tone: StatusTone; icon: ReactNode }
  > = {
    ready: {
      label: "Ready",
      tone: "success",
      icon: <Check className="h-4 w-4" strokeWidth={2.8} />,
    },
    stored: {
      label: "Stored",
      tone: "inactive",
      icon: <TicketCheck className="h-4 w-4" strokeWidth={2.4} />,
    },
    syncing: {
      label: "Syncing",
      tone: "warning",
      icon: <Clock3 className="h-4 w-4" strokeWidth={2.4} />,
    },
  };

  return (
    <StatusBadge
      label={meta[readiness].label}
      tone={meta[readiness].tone}
      icon={meta[readiness].icon}
      className="px-4 py-2 text-sm"
    />
  );
}

function ReleaseCodeBadge({ code }: { code?: string }) {
  return (
    <span
      className="inline-flex min-w-[112px] items-center justify-center rounded-md border px-3 py-2 font-mono text-sm font-semibold tracking-[0.18em] text-[var(--title)]"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface-2)",
      }}
    >
      {code || "------"}
    </span>
  );
}

const JobsPendingReleaseTable = () => {
  const isMountedRef = useRef(true);

  const [jobs, setJobs] = useState<PendingReleaseJob[]>([]);
  const [quota, setQuota] = useState(0);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] =
    useState<PendingReleaseSortKey>("submittedAt");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [readinessFilter, setReadinessFilter] =
    useState<ReadinessFilter>("all");
  const [printerFilter, setPrinterFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [openJobModal, setOpenJobModal] = useState<PendingReleaseJob | null>(
    null,
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelAction, setCancelAction] = useState<CancelAction>(null);
  const [cancelDialogTarget, setCancelDialogTarget] =
    useState<CancelDialogTarget>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadJobs = useCallback(
    async (mode: "initial" | "refresh" = "refresh") => {
      if (mode === "initial") {
        setIsInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setError("");

      try {
        const data = await apiGet<PendingReleaseResponse>(
          "/user/jobs/pending-release",
          "user",
        );

        if (!isMountedRef.current) return;

        const nextJobs = data?.jobs || [];

        setJobs(nextJobs);
        setQuota(
          typeof data?.pendingReleaseQuota === "number"
            ? data.pendingReleaseQuota
            : 0,
        );
        setSelectedIds((current) =>
          current.filter((id) => nextJobs.some((job) => job.id === id)),
        );
      } catch (loadError) {
        if (!isMountedRef.current) return;

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load pending jobs.",
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

  const handleSort = (key: PendingReleaseSortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir("asc");
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

  const sourceFilterOptions = useMemo<ListBoxOption[]>(() => {
    const sources = Array.from(
      new Set(jobs.map((job) => job.clientSource).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));

    return [
      { label: "All Sources", value: "all" },
      ...sources.map((source) => ({
        label: source,
        value: source,
        searchText: source,
      })),
    ];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...jobs]
      .filter((job) => {
        const searchableText = [
          job.documentName,
          job.printerName,
          job.releaseCode,
          job.submittedAt,
          job.clientSource,
          job.fileType,
          job.printMode,
          job.estimatedReady,
          formatQuota(job.cost),
          String(job.pages),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = !term || searchableText.includes(term);
        const matchesStatus =
          readinessFilter === "all" || getReadinessKey(job) === readinessFilter;
        const matchesPrinter =
          printerFilter === "all" || job.printerName === printerFilter;
        const matchesSource =
          sourceFilter === "all" || job.clientSource === sourceFilter;

        return (
          matchesSearch && matchesStatus && matchesPrinter && matchesSource
        );
      })
      .sort((a, b) => {
        const getSortValue = (item: PendingReleaseJob) => {
          switch (sortKey) {
            case "documentName":
              return item.documentName.toLowerCase();
            case "printerName":
              return item.printerName.toLowerCase();
            case "pages":
              return item.pages;
            case "cost":
              return item.cost;
            case "submittedAt":
              return item.submittedMinutesAgo;
            case "readinessPercent":
              return item.readinessPercent;
            case "releaseCode":
              return item.releaseCode || "";
            default:
              return item.submittedMinutesAgo;
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
    jobs,
    printerFilter,
    readinessFilter,
    search,
    sortDir,
    sortKey,
    sourceFilter,
  ]);

  const selectedJobs = useMemo(
    () => jobs.filter((job) => selectedIds.includes(job.id)),
    [jobs, selectedIds],
  );
  const selectedCost = selectedJobs.reduce((sum, job) => sum + job.cost, 0);
  const allVisibleIds = filteredJobs.map((job) => job.id);
  const isAllSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedIds.includes(id));
  const selectedVisibleCount = allVisibleIds.filter((id) =>
    selectedIds.includes(id),
  ).length;

  const hasActiveFilters =
    Boolean(search.trim()) ||
    readinessFilter !== "all" ||
    printerFilter !== "all" ||
    sourceFilter !== "all";

  const activeFilterCount = [
    readinessFilter !== "all",
    printerFilter !== "all",
    sourceFilter !== "all",
  ].filter(Boolean).length;

  const pendingPages = jobs.reduce((sum, job) => sum + job.pages, 0);
  const estimatedCost = jobs.reduce((sum, job) => sum + job.cost, 0);

  const kpiCards = [
    {
      title: "Pending Jobs",
      value: numberFormatter.format(jobs.length),
      helper: `${numberFormatter.format(filteredJobs.length)} visible after filters`,
      icon: <FileStack className="h-4 w-4" />,
    },
    {
      title: "Pending Pages",
      value: numberFormatter.format(pendingPages),
      helper: "Pages waiting for release",
      icon: <Layers3 className="h-4 w-4" />,
    },
    {
      title: "Estimated Quota Cost",
      value: formatQuota(estimatedCost),
      helper: "Total cost if all pending jobs print",
      icon: <TicketCheck className="h-4 w-4" />,
    },
    {
      title: "Available Quota",
      value: formatQuota(quota),
      helper: "Loaded from your account quota",
      icon: <WalletCards className="h-4 w-4" />,
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

  const openCancelDialog = (targetJobs: PendingReleaseJob[]) => {
    if (targetJobs.length === 0) {
      return;
    }

    setError("");
    setSuccess("");
    setCancelDialogTarget({
      ids: targetJobs.map((job) => job.id),
      label:
        targetJobs.length === 1
          ? targetJobs[0].documentName
          : `${targetJobs.length} selected jobs`,
      count: targetJobs.length,
    });
  };

  const runCancelAction = async (action: Exclude<CancelAction, null>) => {
    if (!cancelDialogTarget) {
      return;
    }

    setSubmitting(true);
    setCancelAction(action);
    setError("");
    setSuccess("");

    try {
      if (action === "draft") {
        await Promise.all(
          cancelDialogTarget.ids.map((jobId) =>
            apiPost(`/user/jobs/${jobId}/cancel-save-draft`, {}, "user"),
          ),
        );
      } else {
        await Promise.all(
          cancelDialogTarget.ids.map((jobId) =>
            apiDelete(`/user/jobs/${jobId}`, "user"),
          ),
        );
      }

      await loadJobs("refresh");
      setSelectedIds([]);
      setOpenJobModal(null);
      setCancelDialogTarget(null);
      setSuccess(
        action === "draft"
          ? `${cancelDialogTarget.count} print job${cancelDialogTarget.count === 1 ? "" : "s"} saved to draft and cancelled.`
          : `${cancelDialogTarget.count} print job${cancelDialogTarget.count === 1 ? "" : "s"} cancelled.`,
      );
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to update pending jobs.",
      );
    } finally {
      setSubmitting(false);
      setCancelAction(null);
    }
  };

  const renderPendingJobsTable = (expanded = false) => (
    <Table
      className={`flex min-h-[560px] flex-col ${
        expanded ? "h-dvh !rounded-none" : "max-h-[calc(100vh-20rem)]"
      }`}
    >
      <TableTop className={`shrink-0 ${expanded ? "bg-[var(--surface)]" : ""}`}>
        <TableTitleBlock title="Jobs Pending Release" />

        <TableControls>
          <TableSearch
            id={
              expanded ? "search-pending-jobs-expanded" : "search-pending-jobs"
            }
            label="Search pending jobs..."
            value={search}
            onChange={setSearch}
            wrapperClassName="w-full md:w-[360px]"
          />

          <RefreshButton
            label={isRefreshing ? "Refreshing" : "Refresh"}
            className="h-14"
            disabled={isInitialLoading || isRefreshing || submitting}
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
                      options={readinessFilterOptions}
                      value={readinessFilter}
                      onValueChange={(value) =>
                        setReadinessFilter(value as ReadinessFilter)
                      }
                      ariaLabel="Filter pending jobs by status"
                      triggerClassName="h-11 px-3"
                      maxHeightClassName="max-h-52"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Source
                    </p>
                    <ListBox
                      options={sourceFilterOptions}
                      value={sourceFilter}
                      onValueChange={setSourceFilter}
                      ariaLabel="Filter pending jobs by source"
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
                    ariaLabel="Filter pending jobs by printer"
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
                      setReadinessFilter("all");
                      setPrinterFilter("all");
                      setSourceFilter("all");
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
                ? "Collapse pending jobs table"
                : "Expand pending jobs table"
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

      {error ? (
        <div className="shrink-0 px-6 pb-2 pt-4">
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        </div>
      ) : null}

      {success ? (
        <div className="shrink-0 px-6 pb-2 pt-4">
          <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </p>
        </div>
      ) : null}

      <TableMain className="min-h-0 flex-1">
        <TableGrid minWidthClassName="flex h-full min-w-[1420px] flex-col">
          <TableHeader columnsClassName={columnsClassName}>
            <TableCell className="justify-center">
              <TableCheckbox
                checked={isAllSelected}
                onToggle={toggleSelectAll}
              />
            </TableCell>

            {pendingReleaseTableColumns.map((column) => (
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
                <TableEmptyState text="Loading pending jobs..." />
              ) : filteredJobs.length === 0 ? (
                <TableEmptyState
                  text={
                    hasActiveFilters
                      ? "No pending jobs match these filters"
                      : "No pending jobs found"
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

                      <TableCell className="min-w-0 gap-3">
                        <FileText className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                        <span className="min-w-0">
                          <span className="block truncate text-base font-medium text-[var(--title)]">
                            {job.documentName}
                          </span>
                          {(job.fileCount || 1) > 1 ? (
                            <span className="mt-1 block text-xs text-[var(--muted)]">
                              {job.fileCount} PDF files
                            </span>
                          ) : null}
                        </span>
                      </TableCell>

                      <TableCell className="min-w-0 gap-3">
                        <Printer className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                        <span className="block truncate text-base text-[var(--paragraph)]">
                          {job.printerName}
                        </span>
                      </TableCell>

                      <TableCell className="text-base font-medium text-[var(--title)]">
                        {job.pages}
                      </TableCell>

                      <TableCell className="text-base font-medium text-[var(--title)]">
                        {formatQuota(job.cost)}
                      </TableCell>

                      <TableCell>
                        <ReleaseCodeBadge code={job.releaseCode} />
                      </TableCell>

                      <TableCell>
                        <PendingStatusBadge job={job} />
                      </TableCell>

                      <TableCell className="text-base text-[var(--muted)]">
                        {job.submittedAt}
                      </TableCell>
                    </div>
                  );
                })
              )}
            </TableBody>
          </div>
        </TableGrid>
      </TableMain>

      <div className="shrink-0 border-t border-[var(--border)] px-6 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm font-medium text-[var(--muted)]">
            {selectedIds.length} selected
            {selectedIds.length ? (
              <span>
                {" "}
                · Estimated cost:{" "}
                <span className="font-semibold text-[var(--title)]">
                  {formatQuota(selectedCost)}
                </span>
              </span>
            ) : null}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/sections/printer">
              <Button
                variant="secondary"
                size="lg"
                iconLeft={<MonitorUp className="h-5 w-5" />}
                className="h-14 px-6 text-base"
              >
                Open Printer Screen
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              iconLeft={<Trash2 className="h-5 w-5" />}
              className="h-14 px-6 text-base"
              disabled={selectedIds.length === 0 || submitting}
              onClick={() => openCancelDialog(selectedJobs)}
            >
              {submitting ? "Cancelling..." : "Cancel Selected"}
            </Button>
          </div>
        </div>
      </div>
    </Table>
  );

  return (
    <>
      <FullscreenTablePortal open={isTableExpanded}>
        {renderPendingJobsTable(true)}
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

        {renderPendingJobsTable()}
      </div>

      <Modal open={Boolean(openJobModal)} onClose={() => setOpenJobModal(null)}>
        <div className="w-[min(92vw,760px)] space-y-5 pr-4">
          <div>
            <h3 className="title-md">{openJobModal?.documentName}</h3>
            <p className="paragraph mt-1">
              This job is held in the secure release queue. Use its release code
              at the printer screen.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Printer</p>
              <p className="paragraph mt-1">{openJobModal?.printerName}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Status</p>
              <div className="mt-2">
                {openJobModal ? <PendingStatusBadge job={openJobModal} /> : null}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Pages</p>
              <p className="paragraph mt-1">{openJobModal?.pages}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Files</p>
              <p className="paragraph mt-1">
                {openJobModal?.fileCount || 1} PDF
                {(openJobModal?.fileCount || 1) === 1 ? "" : "s"}
              </p>
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
                Submitted
              </p>
              <p className="paragraph mt-1">{openJobModal?.submittedAt}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                Client Source
              </p>
              <p className="paragraph mt-1">{openJobModal?.clientSource}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                File Type
              </p>
              <p className="paragraph mt-1">{openJobModal?.fileType}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                Print Mode
              </p>
              <p className="paragraph mt-1">{openJobModal?.printMode}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                Release Code
              </p>
              <div className="mt-2">
                <ReleaseCodeBadge code={openJobModal?.releaseCode} />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                Printer State
              </p>
              <p className="paragraph mt-1">{openJobModal?.estimatedReady}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              iconLeft={<Trash2 className="h-4 w-4" />}
              disabled={submitting || !openJobModal}
              onClick={() =>
                openJobModal ? openCancelDialog([openJobModal]) : undefined
              }
            >
              {submitting ? "Cancelling..." : "Cancel Job"}
            </Button>

            <Link href="/sections/printer">
              <Button
                variant="primary"
                iconLeft={<MonitorUp className="h-4 w-4" />}
              >
                Open Printer Screen
              </Button>
            </Link>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(cancelDialogTarget)}
        title="Cancel print job"
        description={
          <div className="space-y-2">
            <p>What would you like to do with this queued print job?</p>
            {cancelDialogTarget ? (
              <p className="font-medium text-[var(--title)]">
                {cancelDialogTarget.label}
              </p>
            ) : null}
          </div>
        }
        cancelText="Cancel"
        secondaryConfirmText="Delete completely"
        secondaryLoadingText="Deleting..."
        confirmText="Delete and save to draft"
        loadingText="Saving draft..."
        variant="default"
        secondaryVariant="danger"
        loading={submitting}
        loadingAction={
          cancelAction === "draft"
            ? "confirm"
            : cancelAction === "delete"
              ? "secondary"
              : null
        }
        onSecondaryConfirm={() => void runCancelAction("delete")}
        onConfirm={() => void runCancelAction("draft")}
        onClose={() => {
          if (!submitting) {
            setCancelDialogTarget(null);
          }
        }}
      />
    </>
  );
};

export default JobsPendingReleaseTable;
