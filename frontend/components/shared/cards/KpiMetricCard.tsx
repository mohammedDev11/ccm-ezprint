"use client";

import React from "react";

type KpiMetricCardProps = {
  title: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  index: number;
};

export default function KpiMetricCard({
  title,
  value,
  helper,
  icon,
  index,
}: KpiMetricCardProps) {
  const bars = [
    [34, 58, 74, 52, 82, 68],
    [42, 50, 46, 64, 76, 58],
    [62, 44, 70, 55, 82, 48],
    [28, 46, 36, 66, 54, 78],
  ][index % 4];

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
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-xs font-semibold text-[var(--muted)]">
            {title}
          </p>
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--color-brand-500)]"
            style={{ background: "rgba(var(--brand-rgb), 0.1)" }}
          >
            {icon}
          </span>
        </div>

        <div
          className="flex min-h-[74px] items-center justify-between gap-4 rounded-[0.85rem] px-4 py-3"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--frame-background) 94%, var(--background)), color-mix(in srgb, var(--background) 92%, var(--surface-2)))",
            boxShadow:
              "inset 0 1px 0 var(--panel-highlight), inset 0 -10px 22px rgba(var(--shadow-color), 0.16)",
          }}
        >
          <p className="min-w-0 truncate text-[2rem] font-semibold leading-none text-[var(--title)]">
            {value}
          </p>

          <div className="flex h-12 shrink-0 items-end gap-1.5" aria-hidden="true">
            {bars.map((height, barIndex) => (
              <span
                key={`${title}-${barIndex}`}
                className="w-2 rounded-full transition-all duration-300"
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

        <p className="line-clamp-1 text-xs text-[var(--muted)]">{helper}</p>
      </div>
    </div>
  );
}
