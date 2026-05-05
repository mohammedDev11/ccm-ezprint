import React from "react";
import { cn } from "@/lib/cn";

type UsageTone = "success" | "warning" | "danger" | "muted";

type UsageProgressProps = {
  value: number;
  className?: string;
};

const getUsageTone = (value: number): UsageTone => {
  if (value <= 0) return "muted";
  if (value >= 90) return "danger";
  if (value >= 60) return "warning";
  return "success";
};

const toneBarClass: Record<UsageTone, string> = {
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  muted: "bg-inactive-500",
};

const UsageProgress = ({ value, className = "" }: UsageProgressProps) => {
  const safeValue = Math.max(0, Math.min(100, value));
  const tone = getUsageTone(safeValue);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="h-2.5 w-[120px] overflow-hidden rounded-full"
        style={{ background: "var(--surface-2)" }}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all",
            toneBarClass[tone]
          )}
          style={{ width: `${safeValue}%` }}
        />
      </div>

      <span className="min-w-[42px] text-sm font-medium text-[var(--paragraph)]">
        {safeValue}%
      </span>
    </div>
  );
};

export default UsageProgress;
