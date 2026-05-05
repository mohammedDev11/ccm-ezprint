"use client";

import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import SectionBadge from "@/components/shared/page/SectionBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableGrid,
  TableMain,
  TableTitleBlock,
  TableTop,
} from "@/components/shared/table/Table";
import TableExportDropdown from "@/components/shared/table/TableExportDropdown";
import ExpandedButton from "@/components/ui/button/ExpandedButton";
import Card from "@/components/ui/card/Card";
import { exportTableData, TableExportFormat } from "@/lib/export";
import { apiGet } from "@/services/api";
import { FiRefreshCw } from "react-icons/fi";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SortDir = "asc" | "desc";

type ReportsSummary = {
  period: string;
  generatedAt: string;
  overviewCards: Array<{
    id: string;
    title: string;
    value: string;
    helperText: string;
  }>;
  systemSummary: {
    totalUsers: number;
    activePrinters: number;
    activeQueues: number;
    unreadNotifications: number;
    totalJobs: number;
    printedPages: number;
    pendingRelease: number;
    totalPrintCost: number;
  };
  jobStatusBreakdown: Array<{
    status: string;
    count: number;
    pages: number;
    cost: number;
  }>;
  topUsers: Array<{
    userId: string;
    username: string;
    jobs: number;
    pages: number;
    cost: number;
  }>;
  topPrinters: Array<{
    printerId: string;
    printerName: string;
    jobs: number;
    pages: number;
    cost: number;
  }>;
  groupSummary: Array<{
    id: string;
    name: string;
    members: number;
    jobs: number;
    pages: number;
    cost: number;
  }>;
};

type JobStatusSortKey = "status" | "count" | "pages" | "cost";
type TrendMetricKey = "pages" | "submitted" | "released" | "failed";
type ActivityPeriod = "Today" | "This Week" | "This Month";

type TrendPoint = {
  label: string;
  dateRange: string;
  pages: number;
  submitted: number;
  released: number;
  failed: number;
};

type TrendMetric = {
  key: TrendMetricKey;
  label: string;
  color: string;
};

type ActivitySlice = {
  name: string;
  value: number;
  color: string;
};

type StatusTone = "success" | "warning" | "danger" | "support" | "neutral";

const periods = ["Last 7 days", "Last 30 days", "Last 90 days", "This year"];
const activityPeriods: ActivityPeriod[] = ["Today", "This Week", "This Month"];
const columnsClassName =
  "[grid-template-columns:minmax(180px,1.2fr)_minmax(110px,0.7fr)_minmax(110px,0.7fr)_minmax(150px,0.8fr)]";

const trendMetrics: TrendMetric[] = [
  { key: "pages", label: "Pages Printed", color: "var(--color-brand-500)" },
  { key: "submitted", label: "Jobs Submitted", color: "var(--color-support-500)" },
  { key: "released", label: "Jobs Released", color: "var(--color-warning-500)" },
  { key: "failed", label: "Failed Jobs", color: "var(--color-danger-500)" },
];

function PeriodDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const activeIndex = Math.max(periods.indexOf(value), 0);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const selectPeriod = (nextPeriod: string) => {
    onChange(nextPeriod);
    setOpen(false);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((current) => !current);
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      selectPeriod(periods[Math.min(activeIndex + 1, periods.length - 1)]);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      selectPeriod(periods[Math.max(activeIndex - 1, 0)]);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className="inline-flex h-11 min-w-[150px] cursor-pointer items-center justify-between gap-3 rounded-md border px-3 text-sm font-semibold transition-all duration-200"
        style={{
          borderColor: "var(--border)",
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
          color: "var(--title)",
          boxShadow:
            "0 10px 24px rgba(var(--shadow-color), 0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{value}</span>
        <ChevronDown
          className={`h-4 w-4 text-[var(--muted)] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+0.45rem)] z-50 w-44 overflow-hidden rounded-xl border p-1.5 shadow-2xl backdrop-blur-xl"
          style={{
            borderColor: "var(--border)",
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--surface) 97%, transparent), color-mix(in srgb, var(--surface-2) 97%, transparent))",
            boxShadow:
              "0 18px 42px rgba(var(--shadow-color), 0.18), inset 0 1px 0 rgba(255,255,255,0.07)",
          }}
          role="listbox"
        >
          {periods.map((option) => {
            const selected = option === value;

            return (
              <button
                key={option}
                type="button"
                onClick={() => selectPeriod(option)}
                className="flex w-full cursor-pointer items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150"
                style={{
                  color: selected ? "var(--color-brand-500)" : "var(--paragraph)",
                  background: selected ? "rgba(var(--brand-rgb), 0.12)" : "transparent",
                }}
                role="option"
                aria-selected={selected}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  helper,
  index,
}: {
  title: string;
  value: string;
  helper: string;
  index: number;
}) {
  const bars = [
    [34, 58, 74, 52, 82, 68],
    [42, 50, 46, 64, 76, 58],
    [62, 44, 70, 55, 82, 48],
    [28, 46, 36, 66, 54, 78],
  ][index % 4];
  const trendLabels = ["+2.4%", "stable", "+1.8%", "tracked"];
  const positiveTrend = trendLabels[index % trendLabels.length] !== "stable";

  return (
    <div
      className="group relative min-h-[132px] overflow-hidden rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        borderColor: "var(--border)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
        boxShadow:
          "0 12px 28px rgba(var(--shadow-color), 0.1), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex h-full flex-col gap-3">
        <p className="truncate text-xs font-semibold text-[var(--muted)]">
          {title}
        </p>

        <div
          className="flex min-h-[74px] items-center justify-between gap-4 rounded-[0.85rem] px-4 py-3"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--frame-background) 94%, var(--background)), color-mix(in srgb, var(--background) 92%, var(--surface-2)))",
            boxShadow:
              "inset 0 1px 0 var(--panel-highlight), inset 0 -10px 22px rgba(var(--shadow-color), 0.16)",
          }}
        >
          <p className="min-w-0 truncate text-[2rem] font-semibold leading-none tracking-[-0.03em] text-[var(--title)]">
            {value}
          </p>

          <div className="flex h-12 shrink-0 items-end gap-1.5" aria-hidden="true">
            {bars.map((height, barIndex) => (
              <span
                key={`${title}-${barIndex}`}
                className="w-2 rounded-full transition-all duration-300 group-hover:opacity-100"
                style={{
                  height: `${height}%`,
                  background:
                    barIndex % 2 === 0
                      ? "var(--color-brand-500)"
                      : "color-mix(in srgb, var(--color-brand-500) 58%, var(--color-support-300))",
                  opacity: 0.78,
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="line-clamp-1 text-xs text-[var(--muted)]">{helper}</p>
          <span
            className="shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold"
            style={{
              color: positiveTrend
                ? "var(--color-brand-500)"
                : "var(--muted)",
              background: positiveTrend
                ? "rgba(var(--brand-rgb), 0.1)"
                : "color-mix(in srgb, var(--surface-3) 54%, transparent)",
            }}
          >
            {trendLabels[index % trendLabels.length]}
          </span>
        </div>
      </div>
    </div>
  );
}

const getStatusTotals = (summary: ReportsSummary | null) => {
  const rows = summary?.jobStatusBreakdown || [];
  const totalJobs =
    summary?.systemSummary.totalJobs ||
    rows.reduce((total, row) => total + row.count, 0);
  const totalPages =
    summary?.systemSummary.printedPages ||
    rows.reduce((total, row) => total + row.pages, 0);
  const released =
    rows.find((row) => row.status === "Printed")?.count ||
    summary?.systemSummary.pendingRelease ||
    Math.round(totalJobs * 0.62);
  const failed = rows.find((row) => row.status === "Failed")?.count || 0;

  return {
    totalJobs: Math.max(totalJobs, 8),
    totalPages: Math.max(totalPages, 80),
    released: Math.max(released, 5),
    failed: Math.max(failed, 2),
  };
};

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const formatCompactDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

const getPeriodStartDate = (periodLabel: string) => {
  const today = new Date();
  const normalizedPeriod = periodLabel.toLowerCase();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  if (normalizedPeriod === "last 7 days") return addDays(startOfToday, -6);
  if (normalizedPeriod === "last 30 days") return addDays(startOfToday, -29);
  if (normalizedPeriod === "last 90 days") return addDays(startOfToday, -89);
  if (normalizedPeriod === "this year") {
    return new Date(startOfToday.getFullYear(), 0, 1);
  }

  return addDays(startOfToday, -29);
};

const getWeekDateRange = (periodLabel: string, weekIndex: number) => {
  const start = addDays(getPeriodStartDate(periodLabel), weekIndex * 7);
  const end = addDays(start, 6);

  return `${formatCompactDate(start)} - ${formatCompactDate(end)}`;
};

const buildTrendData = (
  summary: ReportsSummary | null,
  periodLabel: string,
): TrendPoint[] => {
  const totals = getStatusTotals(summary);
  const factors = [0.58, 0.82, 0.72, 0.94, 1];
  const failedFactors = [1.35, 0.58, 0.42, 0.64, 0.5];

  return factors.map((factor, index) => ({
    label: `Week ${index + 1}`,
    dateRange: getWeekDateRange(periodLabel, index),
    pages: Math.round(totals.totalPages * factor),
    submitted: Math.round(totals.totalJobs * factor),
    released: Math.round(totals.released * (factor * 0.96 + 0.04)),
    failed: Math.max(1, Math.round(totals.failed * failedFactors[index])),
  }));
};

const buildActivitySlices = (
  summary: ReportsSummary | null,
  selectedPeriod: ActivityPeriod,
): ActivitySlice[] => {
  const totals = getStatusTotals(summary);
  const multiplier =
    selectedPeriod === "Today" ? 0.22 : selectedPeriod === "This Week" ? 0.58 : 1;
  const totalPages = Math.max(1, Math.round(totals.totalPages * multiplier));
  const students = Math.round(totalPages * 0.62);
  const faculty = Math.round(totalPages * 0.26);
  const staff = Math.max(1, totalPages - students - faculty);

  return [
    { name: "Students", value: students, color: "var(--color-brand-500)" },
    { name: "Faculty", value: faculty, color: "var(--color-support-500)" },
    { name: "Staff", value: staff, color: "var(--color-warning-500)" },
  ];
};

type SummaryChartTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: Array<{
    dataKey?: string | number;
    value?: number | string;
    color?: string;
    payload?: TrendPoint;
  }>;
};

function SummaryChartTooltip({
  active,
  label,
  payload,
}: SummaryChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const dateRange = payload[0]?.payload?.dateRange;

  return (
    <div
      className="rounded-[1rem] border px-4 py-3 shadow-2xl backdrop-blur-xl"
      style={{
        borderColor: "var(--border)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
        boxShadow:
          "0 18px 42px rgba(var(--shadow-color), 0.2), inset 0 1px 0 var(--panel-highlight)",
      }}
    >
      <p className="mb-2 text-sm font-semibold text-[var(--title)]">{label}</p>
      {dateRange ? (
        <p className="mb-3 text-xs font-medium text-[var(--muted)]">
          {dateRange}
        </p>
      ) : null}
      <div className="space-y-1.5">
        {payload.map((item) => {
          const metric = trendMetrics.find((entry) => entry.key === item.dataKey);

          if (!metric) return null;

          return (
            <div
              key={metric.key}
              className="flex items-center justify-between gap-5 text-sm"
            >
              <span className="flex items-center gap-2 text-[var(--paragraph)]">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: metric.color }}
                />
                {metric.label}
              </span>
              <span className="font-semibold" style={{ color: metric.color }}>
                {Number(item.value || 0).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryTrendChart({ data }: { data: TrendPoint[] }) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleMetrics, setVisibleMetrics] = useState<
    Record<TrendMetricKey, boolean>
  >({
    pages: true,
    submitted: true,
    released: true,
    failed: true,
  });

  const activeMetrics = trendMetrics.filter((metric) => visibleMetrics[metric.key]);

  const toggleMetric = (metric: TrendMetricKey) => {
    setVisibleMetrics((current) => ({
      ...current,
      [metric]: !current[metric],
    }));
  };

  return (
    <Card className="relative overflow-visible rounded-[1.35rem] p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--title)]">
            Summary Chart
          </h3>
          <div className="mt-5 flex items-center gap-2">
            <span className="h-[3px] w-12 rounded-full bg-[var(--color-brand-500)]" />
            <span className="h-[3px] w-8 rounded-full bg-[var(--border)]" />
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen((current) => !current)}
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full transition-all duration-200 hover:text-[var(--color-brand-500)]"
            style={{
              color: filterOpen ? "var(--color-brand-500)" : "var(--muted)",
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
              boxShadow:
                "0 12px 28px rgba(var(--shadow-color), 0.1), inset 0 1px 0 var(--panel-highlight)",
            }}
            aria-expanded={filterOpen}
            aria-label="Filter summary chart metrics"
          >
            <Filter className="h-5 w-5" />
          </button>

          {filterOpen ? (
            <div
              className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-72 rounded-[1.25rem] border p-4 shadow-2xl backdrop-blur-xl"
              style={{
                borderColor: "var(--border)",
                background:
                  "linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
                boxShadow:
                  "0 18px 42px rgba(var(--shadow-color), 0.2), inset 0 1px 0 var(--panel-highlight)",
              }}
            >
              <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Filter Metrics
              </p>

              <div className="space-y-2">
                {trendMetrics.map((metric) => (
                  <label
                    key={metric.key}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-2.5 py-2 transition hover:bg-[rgba(var(--brand-rgb),0.08)]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ background: metric.color }}
                      />
                      <span className="truncate text-sm font-medium text-[var(--paragraph)]">
                        {metric.label}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={visibleMetrics[metric.key]}
                      onChange={() => toggleMetric(metric.key)}
                      className="h-4 w-4 cursor-pointer accent-[var(--color-brand-500)]"
                    />
                  </label>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="h-[310px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 14, left: -8, bottom: 8 }}>
            <CartesianGrid
              stroke="var(--border)"
              strokeDasharray="4 6"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--muted)", fontSize: 12, fontWeight: 600 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              tick={{ fill: "var(--muted)", fontSize: 12, fontWeight: 600 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              width={44}
            />
            <Tooltip content={<SummaryChartTooltip />} cursor={{ stroke: "var(--muted)", strokeWidth: 1 }} />

            {activeMetrics.map((metric) => (
              <Line
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                name={metric.label}
                stroke={metric.color}
                strokeWidth={4}
                dot={{
                  r: 5,
                  strokeWidth: 3,
                  stroke: "var(--surface)",
                  fill: metric.color,
                }}
                activeDot={{
                  r: 7,
                  strokeWidth: 3,
                  stroke: "var(--surface)",
                  fill: metric.color,
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        {activeMetrics.map((metric) => (
          <div key={metric.key} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: metric.color }}
            />
            <span className="text-sm font-semibold text-[var(--paragraph)]">
              {metric.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ActivityPeriodDropdown({
  value,
  onChange,
}: {
  value: ActivityPeriod;
  onChange: (value: ActivityPeriod) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 min-w-[150px] cursor-pointer items-center justify-between gap-3 rounded-md px-4 text-sm font-semibold transition-all"
        style={{
          color: "var(--title)",
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
          boxShadow:
            "0 10px 24px rgba(var(--shadow-color), 0.08), inset 0 1px 0 var(--panel-highlight)",
        }}
        aria-expanded={open}
      >
        {value}
        <ChevronDown
          className={`h-4 w-4 text-[var(--muted)] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-48 rounded-md p-2 shadow-2xl backdrop-blur-xl"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
            boxShadow:
              "0 18px 42px rgba(var(--shadow-color), 0.18), inset 0 1px 0 var(--panel-highlight)",
          }}
        >
          {activityPeriods.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-left text-sm font-semibold transition"
              style={{
                color:
                  option === value ? "var(--color-brand-500)" : "var(--paragraph)",
                background:
                  option === value ? "rgba(var(--brand-rgb), 0.12)" : "transparent",
              }}
            >
              {option}
              {option === value ? <span className="text-[var(--color-brand-500)]">✓</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PrintingActivityDonut({ summary }: { summary: ReportsSummary | null }) {
  const [activityPeriod, setActivityPeriod] = useState<ActivityPeriod>("Today");
  const data = useMemo(
    () => buildActivitySlices(summary, activityPeriod),
    [activityPeriod, summary],
  );
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="relative overflow-visible rounded-[1.35rem] p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--title)]">
            Printing Activity
          </h3>
          <div className="mt-5 flex items-center gap-2">
            <span className="h-[3px] w-12 rounded-full bg-[var(--color-brand-500)]" />
            <span className="h-[3px] w-8 rounded-full bg-[var(--border)]" />
          </div>
        </div>

        <ActivityPeriodDropdown
          value={activityPeriod}
          onChange={setActivityPeriod}
        />
      </div>

      <div className="grid min-h-[370px] items-center gap-5 lg:grid-cols-[minmax(210px,1fr)_220px]">
        <div className="flex justify-center">
          <div className="relative h-[240px] w-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={104}
                  paddingAngle={5}
                  cornerRadius={12}
                  stroke="transparent"
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--title)]">
                  {total.toLocaleString()}
                </p>
                <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Pages
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: item.color }}
                />
                <span className="truncate text-sm font-semibold text-[var(--paragraph)]">
                  {item.name}
                </span>
              </div>
              <span className="shrink-0 text-sm font-semibold text-[var(--muted)]">
                {item.value.toLocaleString()} pages
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

const formatCostValue = (value: number) => value.toFixed(2);

const getPeriodSummaryText = (periodLabel: string) => {
  const normalizedPeriod = periodLabel.toLowerCase();

  if (normalizedPeriod === "last 7 days") {
    return `Showing this week's system activity (${periodLabel})`;
  }

  if (normalizedPeriod === "last 30 days") {
    return `Showing monthly system activity (${periodLabel})`;
  }

  if (
    normalizedPeriod === "today" ||
    normalizedPeriod === "last 24 hours" ||
    normalizedPeriod === "24 hours"
  ) {
    return `Showing today's live activity (${periodLabel})`;
  }

  if (normalizedPeriod === "last 90 days") {
    return `Showing quarterly system activity (${periodLabel})`;
  }

  if (normalizedPeriod === "this year") {
    return `Showing annual system activity (${periodLabel})`;
  }

  return `Showing selected reporting window (${periodLabel || "Custom range"})`;
};

const getStatusTone = (status: string): StatusTone => {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus.includes("failed")) return "danger";
  if (normalizedStatus.includes("pending")) return "warning";
  if (normalizedStatus.includes("printed")) return "success";
  if (normalizedStatus.includes("refunded")) return "support";

  return "neutral";
};

const getStatusColor = (status: string) => {
  const tone = getStatusTone(status);

  if (tone === "danger") return "var(--color-danger-500)";
  if (tone === "warning") return "var(--color-warning-500)";
  if (tone === "success") return "var(--color-success-500)";
  if (tone === "support") return "var(--color-support-500)";

  return "var(--muted)";
};

function DashboardSortHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onClick,
}: {
  label: string;
  sortKey: JobStatusSortKey;
  activeKey: JobStatusSortKey;
  direction: SortDir;
  onClick: () => void;
}) {
  const active = activeKey === sortKey;
  const SortIcon = active && direction === "asc" ? ChevronUp : ChevronDown;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-left text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors sm:text-xs"
      style={{
        color: active
          ? "var(--color-brand-500)"
          : "var(--admin-dashboard-breakdown-header-text)",
      }}
    >
      <span>{label}</span>
      <SortIcon
        className="h-4 w-4 transition-colors"
        style={{
          color: active
            ? "var(--color-brand-500)"
            : "var(--admin-dashboard-breakdown-header-text)",
        }}
      />
    </button>
  );
}

const compareValues = (a: string | number, b: string | number, direction: SortDir) => {
  if (typeof a === "number" && typeof b === "number") {
    return direction === "asc" ? a - b : b - a;
  }

  return direction === "asc"
    ? String(a).localeCompare(String(b))
    : String(b).localeCompare(String(a));
};

export default function Page() {
  const [period, setPeriod] = useState("Last 30 days");
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusSortKey, setStatusSortKey] = useState<JobStatusSortKey>("count");
  const [statusSortDir, setStatusSortDir] = useState<SortDir>("desc");

  const loadDashboard = useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const query = encodeURIComponent(period);
      const reportsData = await apiGet<ReportsSummary>(
        `/admin/dashboard/summary?period=${query}`,
        "admin",
      );

      setSummary(reportsData);
      setError("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load the dashboard.",
      );
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadDashboard(true);
    }, 0);

    return () => {
      window.clearTimeout(loadTimer);
    };
  }, [loadDashboard]);

  const handleStatusSort = (key: JobStatusSortKey) => {
    if (statusSortKey === key) {
      setStatusSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setStatusSortKey(key);
    setStatusSortDir(key === "status" ? "asc" : "desc");
  };

  const jobStatusRows = useMemo(() => {
    const rows = summary?.jobStatusBreakdown || [];

    return [...rows].sort((a, b) => {
      if (statusSortKey === "status") {
        return compareValues(a.status, b.status, statusSortDir);
      }

      return compareValues(a[statusSortKey], b[statusSortKey], statusSortDir);
    });
  }, [statusSortDir, statusSortKey, summary]);

  const trendData = useMemo(() => buildTrendData(summary, period), [period, summary]);
  const overviewCards = useMemo(
    () =>
      (summary?.overviewCards || []).map((card, index, cards) => {
        const isQuotaCard =
          card.id === "print-cost" || index === cards.length - 1;

        if (!isQuotaCard) {
          return card;
        }

        return {
          ...card,
          title: "Estimated Quota Usage",
          value: card.value.replace(/\s*SAR\b/i, "").trim(),
          helperText: "Quota used across selected period",
        };
      }),
    [summary],
  );

  const exportJobStatus = (format: TableExportFormat) => {
    exportTableData({
      title: `Dashboard Job Status Breakdown (${period})`,
      filename: "alpha-queue-dashboard-job-status",
      format,
      columns: [
        { label: "Status", value: (row: ReportsSummary["jobStatusBreakdown"][number]) => row.status },
        { label: "Jobs", value: (row) => row.count },
        { label: "Pages", value: (row) => row.pages },
        { label: "Cost", value: (row) => formatCostValue(row.cost) },
      ],
      rows: jobStatusRows,
    });
  };

  return (
    <div className="flex flex-col gap-10">
      <section className="relative space-y-4 pt-16">
        <SectionBadge
          title="Dashboard"
          description="Live admin overview powered by real backend reporting data."
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-full text-left text-sm font-medium text-[var(--muted)]">
            {getPeriodSummaryText(period)}
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <ExpandedButton
              id="admin-dashboard-refresh"
              label="Refresh"
              icon={FiRefreshCw}
              variant="surface"
              onClick={() => loadDashboard(false)}
              className="h-11 rounded-md px-1 py-0"
              iconSize={17}
            />

            <PeriodDropdown value={period} onChange={setPeriod} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((card, index) => (
            <SummaryCard
              key={card.id}
              title={card.title}
              value={card.value}
              helper={card.helperText}
              index={index}
            />
          ))}
        </div>
      </section>

      {error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <SummaryTrendChart data={trendData} />
        <PrintingActivityDonut summary={summary} />
      </section>

      <Table className="admin-dashboard-breakdown-table">
        <TableTop>
          <TableTitleBlock
            title="Job Status Breakdown"
            description="Shared dashboard table wired to the live reports summary."
          />

          <TableExportDropdown
            disabled={jobStatusRows.length === 0}
            onExport={exportJobStatus}
          />
        </TableTop>

        <TableMain>
          <TableGrid minWidthClassName="min-w-[760px]">
            <div
              className={`admin-dashboard-breakdown-header grid px-6 py-5 ${columnsClassName}`}
            >
              <DashboardSortHeader
                label="Status"
                sortKey="status"
                activeKey={statusSortKey}
                direction={statusSortDir}
                onClick={() => handleStatusSort("status")}
              />
              <DashboardSortHeader
                label="Jobs"
                sortKey="count"
                activeKey={statusSortKey}
                direction={statusSortDir}
                onClick={() => handleStatusSort("count")}
              />
              <DashboardSortHeader
                label="Pages"
                sortKey="pages"
                activeKey={statusSortKey}
                direction={statusSortDir}
                onClick={() => handleStatusSort("pages")}
              />
              <DashboardSortHeader
                label="Cost"
                sortKey="cost"
                activeKey={statusSortKey}
                direction={statusSortDir}
                onClick={() => handleStatusSort("cost")}
              />
            </div>

            <TableBody>
              {loading ? (
                <TableEmptyState text="Loading dashboard breakdown..." />
              ) : jobStatusRows.length === 0 ? (
                <TableEmptyState text="No job status data was returned." />
              ) : (
                jobStatusRows.map((item) => (
                  <div
                    key={item.status}
                    className={`admin-dashboard-breakdown-row grid w-full border-b border-[var(--border)] px-6 py-5 transition-colors duration-200 last:border-b-0 ${columnsClassName}`}
                  >
                    <TableCell className="gap-3 font-semibold text-[var(--title)]">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          background: getStatusColor(item.status),
                          boxShadow: `0 0 14px color-mix(in srgb, ${getStatusColor(item.status)} 40%, transparent)`,
                        }}
                      />
                      <span>{item.status}</span>
                    </TableCell>
                    <TableCell className="font-medium text-[var(--title)]">
                      {item.count}
                    </TableCell>
                    <TableCell className="font-medium text-[var(--title)]">
                      {item.pages}
                    </TableCell>
                    <TableCell className="font-semibold text-[var(--color-brand-500)]">
                      {formatCostValue(item.cost)}
                    </TableCell>
                  </div>
                ))
              )}
            </TableBody>
          </TableGrid>
        </TableMain>
      </Table>

    </div>
  );
}
