import React from "react";
import { cn } from "@/lib/cn";

export type StatusTone = "success" | "warning" | "danger" | "inactive";

type StatusBadgeProps = {
  label?: string;
  tone: StatusTone;
  icon?: React.ReactNode;
  className?: string;
};

const toneStyles: Record<StatusTone, React.CSSProperties> = {
  success: {
    borderColor: "color-mix(in srgb, var(--color-support-500) 24%, transparent)",
    background: "color-mix(in srgb, var(--color-support-500) 12%, var(--surface))",
    color: "color-mix(in srgb, var(--color-support-700) 76%, var(--title))",
  },
  warning: {
    borderColor: "color-mix(in srgb, var(--color-warning-500) 24%, transparent)",
    background: "color-mix(in srgb, var(--color-warning-500) 12%, var(--surface))",
    color: "color-mix(in srgb, var(--color-warning-600) 78%, var(--title))",
  },
  danger: {
    borderColor: "color-mix(in srgb, var(--color-brand-600) 24%, transparent)",
    background: "color-mix(in srgb, var(--color-brand-500) 13%, var(--surface))",
    color: "color-mix(in srgb, var(--color-brand-700) 82%, var(--title))",
  },
  inactive: {
    borderColor: "color-mix(in srgb, var(--muted) 20%, transparent)",
    background: "color-mix(in srgb, var(--surface-3) 55%, transparent)",
    color: "var(--muted)",
  },
};

const StatusBadge = ({
  label,
  tone,
  icon,
  className = "",
}: StatusBadgeProps) => {
  const isIconOnly = !!icon && !label;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md font-semibold",
        isIconOnly
          ? "px-4 py-2"
          : "gap-3 px-5 py-3 text-base",
        "border",
        className
      )}
      style={toneStyles[tone]}
    >
      {icon && <span className="flex items-center justify-center">{icon}</span>}

      {label && <span>{label}</span>}
    </span>
  );
};

export default StatusBadge;
