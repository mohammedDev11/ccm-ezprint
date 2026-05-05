"use client";

import Card from "@/components/ui/card/Card";
import ListBox from "@/components/ui/listbox/ListBox";
import { Filter } from "lucide-react";
import { useMemo, useState } from "react";
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
import type { RecentPrintJob } from "../types";

type TrendMetricKey = "pages" | "jobs" | "cost" | "failed";

type TrendPoint = {
  label: string;
  dateRange: string;
  start: Date;
  end: Date;
  pages: number;
  jobs: number;
  cost: number;
  failed: number;
};

type TrendMetric = {
  key: TrendMetricKey;
  label: string;
  color: string;
};

type OutcomeSlice = {
  name: string;
  value: number;
  color: string;
};

type UserDashboardChartsProps = {
  recentJobs: RecentPrintJob[];
  loading?: boolean;
};

type TrendTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: Array<{
    dataKey?: string | number;
    value?: number | string;
    payload?: TrendPoint;
  }>;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MONTHLY_ACTIVITY_PERIOD = "Last 30 days";
const outcomePeriods = ["Last 7 days", "Last 30 days", "Last 90 days", "This year"];
const trendMetrics: TrendMetric[] = [
  { key: "pages", label: "Pages Printed", color: "var(--color-brand-500)" },
  { key: "jobs", label: "Print Jobs", color: "var(--color-support-500)" },
  { key: "cost", label: "Cost", color: "var(--color-warning-500)" },
  { key: "failed", label: "Failed Jobs", color: "var(--color-danger-500)" },
];

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const formatCompactDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

const parseJobDate = (job: RecentPrintJob) => {
  if (job.date) {
    const parsed = new Date(`${job.date}T00:00:00`);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  if (job.dateOrder) {
    const raw = String(job.dateOrder);
    const year = Number(raw.slice(0, 4));
    const month = Number(raw.slice(4, 6)) - 1;
    const day = Number(raw.slice(6, 8));
    const parsed = new Date(year, month, day);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
};

const getPeriodRange = (periodLabel: string) => {
  const today = startOfDay(new Date());
  const normalizedPeriod = periodLabel.toLowerCase();

  if (normalizedPeriod === "last 7 days") {
    return { start: addDays(today, -6), end: today };
  }

  if (normalizedPeriod === "last 90 days") {
    return { start: addDays(today, -89), end: today };
  }

  if (normalizedPeriod === "this year") {
    return { start: new Date(today.getFullYear(), 0, 1), end: today };
  }

  return { start: addDays(today, -29), end: today };
};

const getWeekDateRange = (start: Date, end: Date) =>
  `${formatCompactDate(start)} - ${formatCompactDate(end)}`;

const getJobsForPeriod = (jobs: RecentPrintJob[], period: string) => {
  const { start, end } = getPeriodRange(period);

  return jobs
    .map((job) => ({ job, date: parseJobDate(job) }))
    .filter((item): item is { job: RecentPrintJob; date: Date } => {
      if (!item.date) return false;
      return item.date >= start && item.date <= end;
    });
};

const buildWeeklyTrendData = (
  jobs: RecentPrintJob[],
  period: string,
): TrendPoint[] => {
  const { start, end } = getPeriodRange(period);
  const weekCount = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime() + MS_PER_DAY) / (7 * MS_PER_DAY)),
  );
  const buckets = Array.from({ length: weekCount }, (_, index) => {
    const bucketStart = addDays(start, index * 7);
    const bucketEnd = new Date(
      Math.min(addDays(bucketStart, 6).getTime(), end.getTime()),
    );

    return {
      label: `Week ${index + 1}`,
      dateRange: getWeekDateRange(bucketStart, bucketEnd),
      start: bucketStart,
      end: bucketEnd,
      pages: 0,
      jobs: 0,
      cost: 0,
      failed: 0,
    };
  });

  getJobsForPeriod(jobs, period).forEach(({ job, date }) => {
    const bucketIndex = Math.min(
      buckets.length - 1,
      Math.max(0, Math.floor((date.getTime() - start.getTime()) / (7 * MS_PER_DAY))),
    );
    const bucket = buckets[bucketIndex];

    bucket.pages += Number(job.pages || 0);
    bucket.jobs += 1;
    bucket.cost = Number((bucket.cost + Number(job.cost || 0)).toFixed(2));

    if (/failed/i.test(job.status)) {
      bucket.failed += 1;
    }
  });

  return buckets;
};

const buildOutcomeSlices = (
  jobs: RecentPrintJob[],
  period: string,
): OutcomeSlice[] => {
  const totals = getJobsForPeriod(jobs, period).reduce<Record<string, number>>(
    (acc, { job }) => {
      const status = job.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {},
  );
  const colorByStatus: Record<string, string> = {
    Printed: "var(--color-brand-500)",
    Failed: "var(--color-danger-500)",
    Refunded: "var(--color-support-500)",
    Cancelled: "var(--color-warning-500)",
  };

  return Object.entries(totals).map(([name, value]) => ({
    name,
    value,
    color: colorByStatus[name] || "var(--muted)",
  }));
};

const formatMetricValue = (metricKey: TrendMetricKey, value: number | string) => {
  const numericValue = Number(value || 0);

  if (metricKey === "cost") {
    return numericValue.toFixed(2);
  }

  return numericValue.toLocaleString();
};

function TrendTooltip({ active, label, payload }: TrendTooltipProps) {
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
                {formatMetricValue(metric.key, item.value || 0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeeklyTrendChart({
  data,
  hasJobs,
}: {
  data: TrendPoint[];
  hasJobs: boolean;
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleMetrics, setVisibleMetrics] = useState<
    Record<TrendMetricKey, boolean>
  >({
    pages: true,
    jobs: true,
    cost: true,
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
            Weekly Print Activity
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
            aria-label="Filter weekly activity metrics"
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

      <div className="relative h-[310px] w-full">
        {!hasJobs ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="rounded-xl border px-4 py-3 text-sm font-medium text-[var(--muted)] backdrop-blur-xl"
              style={{
                borderColor: "var(--border)",
                background: "color-mix(in srgb, var(--surface) 84%, transparent)",
              }}
            >
              No completed job activity for this period.
            </div>
          </div>
        ) : null}
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
              minTickGap={18}
            />
            <YAxis
              tick={{ fill: "var(--muted)", fontSize: 12, fontWeight: 600 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              width={44}
            />
            <Tooltip
              content={<TrendTooltip />}
              cursor={{ stroke: "var(--muted)", strokeWidth: 1 }}
            />

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

function OutcomeDonut({
  data,
  period,
  onPeriodChange,
}: {
  data: OutcomeSlice[];
  period: string;
  onPeriodChange: (period: string) => void;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="relative overflow-visible rounded-[1.35rem] p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--title)]">
            Print Outcomes
          </h3>
          <div className="mt-5 flex items-center gap-2">
            <span className="h-[3px] w-12 rounded-full bg-[var(--color-brand-500)]" />
            <span className="h-[3px] w-8 rounded-full bg-[var(--border)]" />
          </div>
        </div>

        <ListBox
          value={period}
          options={outcomePeriods}
          onValueChange={onPeriodChange}
          className="w-[170px] sm:w-[180px]"
          triggerClassName="h-11 font-semibold"
          contentClassName="w-[180px]"
          align="right"
          ariaLabel="Print outcomes period"
        />
      </div>

      <div className="grid min-h-[370px] items-center gap-5 lg:grid-cols-[minmax(210px,1fr)_220px]">
        <div className="flex justify-center">
          <div className="relative h-[240px] w-[240px]">
            {data.length > 0 ? (
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
            ) : null}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--title)]">
                  {total.toLocaleString()}
                </p>
                <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Jobs
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {data.length === 0 ? (
            <p className="text-sm font-medium text-[var(--muted)]">
              No completed job outcomes for this period.
            </p>
          ) : null}

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
                {item.value.toLocaleString()} jobs
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

const UserDashboardCharts = ({
  recentJobs,
}: UserDashboardChartsProps) => {
  const [outcomesRange, setOutcomesRange] = useState("Last 30 days");
  const trendData = useMemo(
    () => buildWeeklyTrendData(recentJobs, MONTHLY_ACTIVITY_PERIOD),
    [recentJobs],
  );
  const outcomeData = useMemo(
    () => buildOutcomeSlices(recentJobs, outcomesRange),
    [outcomesRange, recentJobs],
  );
  const hasJobs = trendData.some((item) => item.jobs > 0);

  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_0.75fr]">
      <WeeklyTrendChart data={trendData} hasJobs={hasJobs} />
      <OutcomeDonut
        data={outcomeData}
        period={outcomesRange}
        onPeriodChange={setOutcomesRange}
      />
    </section>
  );
};

export default UserDashboardCharts;
