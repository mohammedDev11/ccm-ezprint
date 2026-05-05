"use client";

import {
  Coins,
  FileOutput,
  FileText,
  Maximize2,
  Minimize2,
  Play,
  SlidersHorizontal,
  Timer,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type MouseEventHandler,
} from "react";

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
import Button from "@/components/ui/button/Button";
import ExpandedButton from "@/components/ui/button/ExpandedButton";
import RefreshButton from "@/components/ui/button/RefreshButton";
import ListBox, { type ListBoxOption } from "@/components/ui/listbox/ListBox";
import Modal from "@/components/ui/modal/Modal";
import { exportTableData, TableExportFormat } from "@/lib/export";
import { apiGet, apiPost } from "@/services/api";

type SortDir = "asc" | "desc";
type CostFilter = "all" | "low" | "high";
type PagesFilter = "all" | "single" | "multiple";
type JobSortKey =
  | "jobId"
  | "userName"
  | "documentName"
  | "printerName"
  | "pages"
  | "cost"
  | "submittedAt";

type PendingReleaseJob = {
  id: string;
  jobId: string;
  userName: string;
  userEmail: string;
  documentName: string;
  printerName: string;
  pages: number;
  options: string[];
  status: string;
  submittedAt: string;
  queueName: string;
  cost: number;
};

type PendingReleaseResponse = {
  summary: {
    total: number;
    totalPages: number;
    totalCost: number;
  };
  jobs: PendingReleaseJob[];
};

const columnsClassName =
  "[grid-template-columns:72px_minmax(140px,0.8fr)_minmax(210px,1fr)_minmax(260px,1.2fr)_minmax(200px,1fr)_minmax(90px,0.5fr)_minmax(130px,0.7fr)_minmax(190px,0.9fr)]";

const costFilterOptions: Array<{ value: CostFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "low", label: "Free/Low cost" },
  { value: "high", label: "Higher cost" },
];

const pagesFilterOptions: Array<{ value: PagesFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "single", label: "1 page" },
  { value: "multiple", label: "Multiple pages" },
];
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

const formatMoney = (value: number) => value.toFixed(2);
const getExportTimestamp = () =>
  new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

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

function ExpandReleaseButton({
  disabled,
  onClick,
}: {
  disabled?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group inline-flex h-11 items-center overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-0 text-[var(--foreground)] transition-all duration-500 hover:border-transparent hover:bg-[var(--color-brand-500)] hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)] disabled:pointer-events-none disabled:opacity-50"
      aria-label="Release job"
      title="Release"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center">
        <Play className="h-4 w-4" />
      </div>

      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-500 group-hover:max-w-[120px] group-hover:pr-3">
        Release
      </span>
    </button>
  );
}

export default function PrintReleaseTable() {
  const [jobs, setJobs] = useState<PendingReleaseJob[]>([]);
  const [summary, setSummary] = useState<PendingReleaseResponse["summary"]>({
    total: 0,
    totalPages: 0,
    totalCost: 0,
  });
  const [search, setSearch] = useState("");
  const [printerFilter, setPrinterFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [costFilter, setCostFilter] = useState<CostFilter>("all");
  const [pagesFilter, setPagesFilter] = useState<PagesFilter>("all");
  const [sortKey, setSortKey] = useState<JobSortKey>("submittedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [detailsJob, setDetailsJob] = useState<PendingReleaseJob | null>(null);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [releaseJobs, setReleaseJobs] = useState<PendingReleaseJob[]>([]);
  const [destinationPrinter, setDestinationPrinter] = useState("");
  const [releaseCopies, setReleaseCopies] = useState("1");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportMethod, setExportMethod] = useState<TableExportFormat>("PDF");

  const loadJobs = async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const data = await apiGet<PendingReleaseResponse>(
        "/admin/jobs/pending-release",
        "admin",
      );
      const nextJobs = Array.isArray(data?.jobs) ? data.jobs : [];
      setJobs(nextJobs);
      setSummary(
        data.summary || {
          total: 0,
          totalPages: 0,
          totalCost: 0,
        },
      );
      setSelectedIds((current) =>
        current.filter((id) => nextJobs.some((job) => job.id === id)),
      );
      setError("");
    } catch (requestError) {
      setJobs([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load pending release jobs.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadJobs(false);
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, []);

  const handleSort = (key: JobSortKey) => {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir(key === "jobId" || key === "userName" || key === "documentName" ? "asc" : "desc");
  };

  const printerFilterOptions = useMemo<ListBoxOption[]>(
    () => [
      { value: "all", label: "All" },
      ...Array.from(new Set(jobs.map((job) => job.printerName).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b))
        .map((printer) => ({ value: printer, label: printer })),
    ],
    [jobs],
  );

  const userFilterOptions = useMemo<ListBoxOption[]>(
    () => [
      { value: "all", label: "All" },
      ...Array.from(new Set(jobs.map((job) => job.userName).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b))
        .map((user) => ({ value: user, label: user })),
    ],
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return [...jobs]
      .filter((job) => {
        const matchesSearch =
          !searchTerm ||
          [
            job.jobId,
            job.userName,
            job.userEmail,
            job.documentName,
            job.printerName,
            job.queueName,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(searchTerm);

        const matchesPrinter =
          printerFilter === "all" || job.printerName === printerFilter;
        const matchesUser = userFilter === "all" || job.userName === userFilter;
        const matchesCost =
          costFilter === "all" ||
          (costFilter === "low" && job.cost <= 1) ||
          (costFilter === "high" && job.cost > 1);
        const matchesPages =
          pagesFilter === "all" ||
          (pagesFilter === "single" && job.pages === 1) ||
          (pagesFilter === "multiple" && job.pages > 1);

        return (
          matchesSearch &&
          matchesPrinter &&
          matchesUser &&
          matchesCost &&
          matchesPages
        );
      })
      .sort((a, b) => {
        switch (sortKey) {
          case "pages":
            return compareValues(a.pages, b.pages, sortDir);
          case "cost":
            return compareValues(a.cost, b.cost, sortDir);
          case "submittedAt":
            return compareValues(
              parseSortableDate(a.submittedAt),
              parseSortableDate(b.submittedAt),
              sortDir,
            );
          case "jobId":
          case "userName":
          case "documentName":
          case "printerName":
          default:
            return compareValues(a[sortKey], b[sortKey], sortDir);
        }
      });
  }, [
    costFilter,
    jobs,
    pagesFilter,
    printerFilter,
    search,
    sortDir,
    sortKey,
    userFilter,
  ]);

  const visibleIds = filteredJobs.map((job) => job.id);
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

  const selectedJobs = useMemo(
    () => jobs.filter((job) => selectedIds.includes(job.id)),
    [jobs, selectedIds],
  );

  const runAction = async (action: () => Promise<void>) => {
    setBusy(true);
    setError("");

    try {
      await action();
      await loadJobs(false);
      return true;
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Queue action failed.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  };

  const exportJobs = (format: TableExportFormat) => {
    if (selectedJobs.length === 0) return;

    exportTableData({
      title: "Pending Release Jobs",
      filename: `print-release-export-${getExportTimestamp()}`,
      format,
      columns: [
        { label: "Job ID", value: (row: PendingReleaseJob) => row.jobId },
        { label: "User", value: (row) => row.userName },
        { label: "Email", value: (row) => row.userEmail },
        { label: "Document", value: (row) => row.documentName },
        { label: "Printer", value: (row) => row.printerName },
        { label: "Queue", value: (row) => row.queueName },
        { label: "Pages", value: (row) => row.pages },
        { label: "Cost", value: (row) => formatMoney(row.cost) },
        { label: "Submitted", value: (row) => row.submittedAt },
        { label: "Status", value: (row) => row.status },
      ],
      rows: selectedJobs,
    });
  };

  const handleExportChange = (format: TableExportFormat) => {
    setExportMethod(format);
    setIsExportModalOpen(true);
  };

  const handleExportConfirmed = () => {
    exportJobs(exportMethod);
    setIsExportModalOpen(false);
  };

  const removeSelectedJobFromExport = (id: string) => {
    setSelectedIds((current) => current.filter((item) => item !== id));
  };

  const activeFilterCount = [
    printerFilter !== "all",
    userFilter !== "all",
    costFilter !== "all",
    pagesFilter !== "all",
  ].filter(Boolean).length;

  const kpiCards = [
    {
      title: "Pending Jobs",
      value: summary.total.toLocaleString(),
      helper: "Jobs currently waiting for release",
      icon: <Timer className="h-4 w-4" />,
    },
    {
      title: "Pages",
      value: summary.totalPages.toLocaleString(),
      helper: "Total pages across the pending queue",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: "Estimated Cost",
      value: formatMoney(summary.totalCost),
      helper: "Current pending cost exposure",
      icon: <Coins className="h-4 w-4" />,
    },
  ];

  const destinationPrinterOptions = useMemo<ListBoxOption[]>(
    () =>
      Array.from(new Set(jobs.map((job) => job.printerName).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b))
        .map((printer) => ({ value: printer, label: printer })),
    [jobs],
  );

  const openReleaseModal = (job: PendingReleaseJob) => {
    setReleaseJobs([job]);
    setDestinationPrinter(job.printerName || destinationPrinterOptions[0]?.value || "");
    setReleaseCopies("1");
    setReleaseModalOpen(true);
  };

  const confirmRelease = async () => {
    const job = releaseJobs[0];
    if (!job) return;

    const success = await runAction(async () => {
      await apiPost(`/admin/jobs/${job.id}/release`, {}, "admin");
    });

    if (success) {
      setReleaseModalOpen(false);
      setReleaseJobs([]);
    }
  };

  const renderReleaseTable = (expanded = false) => (
    <Table
      className={`flex min-h-[520px] flex-col ${
        expanded ? "h-dvh !rounded-none" : "max-h-[calc(100vh-20rem)]"
      }`}
    >
      <TableTop
        className={`shrink-0 ${expanded ? "bg-[var(--surface)]" : ""}`}
      >
        <TableTitleBlock title="Print Release Queue" />

        <TableControls>
          <TableSearch
            id={
              expanded
                ? "search-release-jobs-expanded"
                : "search-release-jobs"
            }
            label="Search pending jobs"
            value={search}
            onChange={setSearch}
          />

          <RefreshButton
            className="h-14"
            disabled={busy}
            onClick={() => loadJobs(false)}
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
            contentClassName="w-[380px]"
            maxHeightClassName=""
            align="right"
            ariaLabel="Filter print release jobs"
          >
            <div className="space-y-4 p-2">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Printer
                  </p>
                  <ListBox
                    value={printerFilter}
                    onValueChange={setPrinterFilter}
                    options={printerFilterOptions}
                    triggerClassName="h-11 px-3"
                    maxHeightClassName="max-h-52"
                    ariaLabel="Filter by printer"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    User
                  </p>
                  <ListBox
                    value={userFilter}
                    onValueChange={setUserFilter}
                    options={userFilterOptions}
                    triggerClassName="h-11 px-3"
                    maxHeightClassName="max-h-52"
                    ariaLabel="Filter by user"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Cost
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {costFilterOptions.map((option) => {
                    const isSelected = costFilter === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setCostFilter(option.value)}
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
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Pages
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {pagesFilterOptions.map((option) => {
                    const isSelected = pagesFilter === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPagesFilter(option.value)}
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
                        {option.label}
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
                    setPrinterFilter("all");
                    setUserFilter("all");
                    setCostFilter("all");
                    setPagesFilter("all");
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
            ariaLabel="Export selected print release jobs"
          />

          <button
            type="button"
            onClick={() => setIsTableExpanded(!expanded)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-transparent text-[var(--muted)] transition hover:text-[var(--color-brand-500)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)]"
            aria-label={
              expanded
                ? "Collapse print release table"
                : "Expand print release table"
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
              <TableCheckbox
                checked={allVisibleSelected}
                onToggle={toggleSelectAllVisible}
              />
            </TableCell>
            <TableHeaderCell
              label="Job"
              sortable
              active={sortKey === "jobId"}
              direction={sortDir}
              onClick={() => handleSort("jobId")}
            />
            <TableHeaderCell
              label="User"
              sortable
              active={sortKey === "userName"}
              direction={sortDir}
              onClick={() => handleSort("userName")}
            />
            <TableHeaderCell
              label="Document"
              sortable
              active={sortKey === "documentName"}
              direction={sortDir}
              onClick={() => handleSort("documentName")}
            />
            <TableHeaderCell
              label="Printer"
              sortable
              active={sortKey === "printerName"}
              direction={sortDir}
              onClick={() => handleSort("printerName")}
            />
            <TableHeaderCell
              label="Pages"
              sortable
              active={sortKey === "pages"}
              direction={sortDir}
              onClick={() => handleSort("pages")}
            />
            <TableHeaderCell
              label="Cost"
              sortable
              active={sortKey === "cost"}
              direction={sortDir}
              onClick={() => handleSort("cost")}
            />
            <TableHeaderCell label="Actions" />
          </TableHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <TableBody>
              {loading ? (
                <TableEmptyState text="Loading pending jobs..." />
              ) : filteredJobs.length === 0 ? (
                <TableEmptyState text="No pending release jobs were found." />
              ) : (
                filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setDetailsJob(job)}
                    className={`grid w-full cursor-pointer border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                  >
                    <TableCell className="justify-center">
                      <TableCheckbox
                        checked={selectedIds.includes(job.id)}
                        onToggle={() => toggleSelectedId(job.id)}
                      />
                    </TableCell>

                    <TableCell className="font-semibold text-[var(--title)]">
                      {job.jobId}
                    </TableCell>

                    <TableCell className="flex-col items-start">
                      <p className="font-semibold text-[var(--title)]">
                        {job.userName}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {job.userEmail}
                      </p>
                    </TableCell>

                    <TableCell className="flex-col items-start">
                      <p className="font-semibold text-[var(--title)]">
                        {job.documentName}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {job.submittedAt}
                      </p>
                    </TableCell>

                    <TableCell className="flex-col items-start">
                      <p className="font-semibold text-[var(--title)]">
                        {job.printerName}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {job.queueName}
                      </p>
                    </TableCell>

                    <TableCell className="text-[var(--title)]">
                      {job.pages}
                    </TableCell>

                    <TableCell className="text-[var(--title)]">
                      {formatMoney(job.cost)}
                    </TableCell>

                    <TableCell>
                      <ExpandReleaseButton
                        disabled={busy}
                        onClick={(event) => {
                          event.stopPropagation();
                          openReleaseModal(job);
                        }}
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
      <FullscreenTablePortal open={isTableExpanded}>
        {renderReleaseTable(true)}
      </FullscreenTablePortal>

      <div className="grid gap-4 md:grid-cols-3">
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

      {renderReleaseTable()}

      <Modal open={isExportModalOpen} onClose={() => setIsExportModalOpen(false)}>
        <div className="w-[min(92vw,760px)] space-y-5 pr-4">
          <div className="border-b pb-4" style={{ borderColor: "var(--border)" }}>
            <h3 className="title-md flex items-center gap-2">
              <FileOutput className="h-5 w-5 text-brand-500" />
              Export selected print jobs
            </h3>
            <p className="paragraph mt-2">
              Review the print jobs to export, remove any row if needed, then
              choose the export format.
            </p>
            <p className="paragraph mt-2">
              Total selected:{" "}
              <span className="font-semibold">{selectedJobs.length}</span>
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
            <div
              className="max-h-[320px] space-y-3 overflow-y-auto pr-2"
              style={{ scrollbarWidth: "thin" }}
            >
              {selectedJobs.length === 0 ? (
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
                selectedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border p-4"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                    }}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--title)]">
                        {job.documentName}
                      </p>
                      <p className="truncate text-sm text-[var(--muted)]">
                        {job.jobId} - {job.userName} - {job.printerName} -{" "}
                        {job.pages} page{job.pages === 1 ? "" : "s"} -{" "}
                        {formatMoney(job.cost)}
                      </p>
                    </div>

                    <ExpandedButton
                      id={`remove-export-print-jobs-${job.id}`}
                      label="Remove"
                      icon={Trash2}
                      variant="danger"
                      onClick={() => removeSelectedJobFromExport(job.id)}
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
              disabled={selectedJobs.length === 0}
            >
              Export
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={releaseModalOpen}
        onClose={() => {
          setReleaseModalOpen(false);
          setReleaseJobs([]);
        }}
      >
        <div className="w-[min(92vw,720px)] space-y-6">
          <div>
            <h3 className="title-md">Release Job</h3>
            <p className="paragraph mt-1">
              Choose the destination printer and confirm the secure release.
            </p>
          </div>

          {releaseJobs.length === 0 ? (
            <div
              className="rounded-xl border px-4 py-6 text-center text-sm"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
                color: "var(--muted)",
              }}
            >
              Select at least one job to release.
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Selected Jobs
                </p>

                <div className="max-h-[260px] space-y-3 overflow-y-auto pr-1">
                  {releaseJobs.map((job) => (
                    <div
                      key={job.id}
                      className="rounded-xl border p-4"
                      style={{
                        borderColor: "var(--border)",
                        background: "var(--surface-2)",
                      }}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--title)]">
                            {job.documentName}
                          </p>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {job.jobId} - {job.userName}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                          <span
                            className="rounded-full border px-3 py-1 text-xs font-semibold"
                            style={{
                              borderColor: "var(--border)",
                              color: "var(--paragraph)",
                            }}
                          >
                            {job.pages} page{job.pages === 1 ? "" : "s"}
                          </span>
                          <span
                            className="rounded-full border px-3 py-1 text-xs font-semibold"
                            style={{
                              borderColor: "var(--border)",
                              color: "var(--paragraph)",
                            }}
                          >
                            {formatMoney(job.cost)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_140px]">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--paragraph)]">
                    Destination Printer
                  </label>
                  <ListBox
                    value={destinationPrinter}
                    onValueChange={setDestinationPrinter}
                    options={destinationPrinterOptions}
                    placeholder="Select printer"
                    triggerClassName="h-14 px-4"
                    maxHeightClassName="max-h-56"
                    ariaLabel="Destination printer"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="release-copies"
                    className="text-sm font-medium text-[var(--paragraph)]"
                  >
                    Copies
                  </label>
                  <input
                    id="release-copies"
                    type="number"
                    min={1}
                    value={releaseCopies}
                    onChange={(event) => setReleaseCopies(event.target.value)}
                    className="h-14 w-full rounded-md border bg-[var(--surface)] px-4 text-sm font-medium outline-none transition focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)]"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setReleaseModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              iconLeft={<Play className="h-4 w-4" />}
              disabled={
                busy ||
                releaseJobs.length === 0 ||
                !destinationPrinter ||
                Number(releaseCopies) < 1
              }
              onClick={() => void confirmRelease()}
            >
              Release
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(detailsJob)} onClose={() => setDetailsJob(null)}>
        <div className="space-y-4 pr-8">
          <div>
            <h3 className="title-md">{detailsJob?.jobId}</h3>
            <p className="paragraph mt-1">
              Review the pending job before releasing it to the printer.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["User", detailsJob?.userName || "—"],
              ["Email", detailsJob?.userEmail || "—"],
              ["Document", detailsJob?.documentName || "—"],
              ["Printer", detailsJob?.printerName || "—"],
              ["Queue", detailsJob?.queueName || "—"],
              ["Submitted", detailsJob?.submittedAt || "—"],
              ["Pages", detailsJob?.pages ?? "—"],
              ["Cost", detailsJob ? formatMoney(detailsJob.cost) : "—"],
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

          <div
            className="rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
          >
            <p className="text-sm font-semibold text-[var(--title)]">Print Options</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {detailsJob?.options?.length ? (
                detailsJob.options.map((option) => (
                  <span
                    key={option}
                    className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold text-[var(--title)]"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {option}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[var(--muted)]">No special options.</span>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
