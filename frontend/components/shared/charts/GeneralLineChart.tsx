"use client";

import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { FiFilter } from "react-icons/fi";
import Card from "@/components/ui/card/Card";

type MetricConfig = {
  label: string;
  color: string;
};

type MetricsConfig = Record<string, MetricConfig>;

type DataItem = Record<string, string | number>;

type ChartTooltipPayload = {
  dataKey?: string | number;
  value?: string | number;
  payload?: DataItem;
};

type ChartTooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: ChartTooltipPayload[];
  metricsConfig: MetricsConfig;
};

type GeneralLineChartProps = {
  title: string;
  data: DataItem[];
  metricsConfig: MetricsConfig;
  xDataKey: string;
  height?: number;
  showFilter?: boolean;
  showLegend?: boolean;
  showMoreButton?: boolean;
  showTooltipDateRange?: boolean;
  className?: string;
  yDomain?: [number, number] | ["auto", "auto"];
};

function ChartTooltip({
  active,
  label,
  payload,
  metricsConfig,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const dateRange =
    typeof payload[0]?.payload?.dateRange === "string"
      ? payload[0].payload.dateRange
      : "";

  return (
    <div
      className="rounded-[16px] border px-4 py-3 shadow-2xl"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
        color: "var(--foreground)",
        boxShadow: "0 10px 30px rgba(var(--shadow-color), 0.12)",
      }}
    >
      <p className="mb-1 text-sm font-semibold text-[var(--title)]">{label}</p>
      {dateRange ? (
        <p className="mb-3 text-xs font-medium text-[var(--muted)]">
          {dateRange}
        </p>
      ) : null}

      <div className="space-y-1.5">
        {payload.map((item) => {
          const metric = metricsConfig[String(item.dataKey)];

          if (!metric) return null;

          return (
            <div
              key={String(item.dataKey)}
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

const GeneralLineChart = ({
  title,
  data,
  metricsConfig,
  xDataKey,
  height = 320,
  showFilter = true,
  showLegend = true,
  showTooltipDateRange = false,
  className = "",
  yDomain = ["auto", "auto"],
}: GeneralLineChartProps) => {
  const metricKeys = Object.keys(metricsConfig);

  const initialVisibility = useMemo(() => {
    return metricKeys.reduce<Record<string, boolean>>((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
  }, [metricKeys]);

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [visibleMetrics, setVisibleMetrics] =
    useState<Record<string, boolean>>(initialVisibility);

  const activeMetrics = useMemo(() => {
    return metricKeys.filter((key) => visibleMetrics[key]);
  }, [metricKeys, visibleMetrics]);

  const toggleMetric = (metric: string) => {
    setVisibleMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric],
    }));
  };

  return (
    <Card className={`relative overflow-visible rounded-[24px] ${className}`}>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="title-md truncate">{title}</h3>
        </div>

        <div className="relative flex shrink-0 items-center gap-2">
          {showFilter && (
            <>
              <button
                onClick={() => setShowFilterMenu((prev) => !prev)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border transition"
                style={{
                  background: "var(--surface-2)",
                  borderColor: "var(--border)",
                  color: "var(--muted)",
                }}
                aria-label="Toggle chart filters"
              >
                <FiFilter size={16} />
              </button>

              {showFilterMenu && (
                <div
                  className="absolute right-0 top-12 z-30 w-56 rounded-2xl border p-3 shadow-lg"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                    boxShadow: "0 10px 30px rgba(var(--shadow-color), 0.14)",
                  }}
                >
                  <p className="text-muted mb-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
                    Filter Metrics
                  </p>

                  <div className="flex flex-col gap-2">
                    {Object.entries(metricsConfig).map(([key, config]) => (
                      <label
                        key={key}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-2 py-2 transition"
                        style={{ background: "transparent" }}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: config.color }}
                          />
                          <span
                            className="truncate text-sm"
                            style={{ color: "var(--paragraph)" }}
                          >
                            {config.label}
                          </span>
                        </div>

                        <input
                          type="checkbox"
                          checked={visibleMetrics[key]}
                          onChange={() => toggleMetric(key)}
                          className="accent-[var(--color-brand-500)]"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Accent */}
      <div className="mb-4 flex items-center gap-1.5">
        <div className="h-[3px] w-8 rounded-full bg-brand-500" />
        <div
          className="h-[3px] w-5 rounded-full"
          style={{ background: "var(--border)" }}
        />
      </div>

      {/* Chart */}
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 12, left: -10, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />

            <XAxis
              dataKey={xDataKey}
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              domain={yDomain}
              width={40}
            />

            {showTooltipDateRange ? (
              <Tooltip content={<ChartTooltip metricsConfig={metricsConfig} />} />
            ) : (
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--foreground)",
                  boxShadow: "0 10px 30px rgba(var(--shadow-color), 0.12)",
                }}
                labelStyle={{
                  color: "var(--title)",
                  fontWeight: 600,
                  marginBottom: "6px",
                }}
              />
            )}

            {activeMetrics.map((metricKey) => (
              <Line
                key={metricKey}
                type="monotone"
                dataKey={metricKey}
                name={metricsConfig[metricKey].label}
                stroke={metricsConfig[metricKey].color}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
          {Object.entries(metricsConfig).map(([key, config]) => {
            if (!visibleMetrics[key]) return null;

            return (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--paragraph)" }}
                >
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default GeneralLineChart;
