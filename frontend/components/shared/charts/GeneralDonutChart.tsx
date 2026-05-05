"use client";

import React, { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Card from "@/components/ui/card/Card";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/components/ui/dropdown/Dropdown";

export type DonutChartItem = {
  name: string;
  value: number;
  color: string;
};

type GeneralDonutChartProps = {
  title: string;
  data: DonutChartItem[];
  filters?: string[];
  defaultFilter?: string;
  totalLabel?: string;
  valueSuffix?: string;
  className?: string;
  chartSize?: number;
  innerRadius?: number;
  outerRadius?: number;
  onFilterChange?: (filter: string) => void;
};

const GeneralDonutChart = ({
  title,
  data,
  filters = [],
  defaultFilter,
  totalLabel = "total",
  valueSuffix = "",
  className = "",
  chartSize = 210,
  innerRadius = 58,
  outerRadius = 84,
  onFilterChange,
}: GeneralDonutChartProps) => {
  const [selectedFilter, setSelectedFilter] = useState<string>(
    defaultFilter || filters[0] || ""
  );

  const total = useMemo(() => {
    return data.reduce((acc, item) => acc + item.value, 0);
  }, [data]);

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    onFilterChange?.(value);
  };

  return (
    <Card className={`rounded-[24px] ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="title-md whitespace-nowrap leading-none">{title}</h3>

        {filters.length > 0 && (
          <div className="shrink-0">
            <Dropdown value={selectedFilter} onValueChange={handleFilterChange}>
              <DropdownTrigger className="min-w-[140px] rounded-md px-3 py-2">
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--paragraph)" }}
                >
                  {selectedFilter}
                </span>
              </DropdownTrigger>

              <DropdownContent align="right" widthClassName="w-48">
                {filters.map((filter) => (
                  <DropdownItem key={filter} value={filter}>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--paragraph)" }}
                    >
                      {filter}
                    </span>
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>
          </div>
        )}
      </div>

      {/* Accent line */}
      <div className="mb-4 flex items-center gap-1.5">
        <div className="h-[3px] w-8 rounded-full bg-brand-500" />
        <div
          className="h-[3px] w-5 rounded-full"
          style={{ background: "var(--border)" }}
        />
      </div>

      {/* Chart */}
      <div className="flex items-center justify-center py-2">
        <div
          className="relative flex items-center justify-center"
          style={{ width: chartSize, height: chartSize }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={4}
                cornerRadius={5}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p
                className="text-2xl font-bold sm:text-3xl"
                style={{ color: "var(--title)" }}
              >
                {total.toLocaleString()}
              </p>
              <p
                className="text-[10px] font-medium uppercase tracking-[0.16em] sm:text-[11px]"
                style={{ color: "var(--muted)" }}
              >
                {totalLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-col gap-3">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span
                className="truncate text-sm font-medium"
                style={{ color: "var(--paragraph)" }}
              >
                {item.name}
              </span>
            </div>

            <span
              className="shrink-0 text-sm"
              style={{ color: "var(--muted)" }}
            >
              {item.value.toLocaleString()}
              {valueSuffix ? ` ${valueSuffix}` : ""}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default GeneralDonutChart;
