"use client";

import React from "react";
import { cn } from "@/lib/cn";

type IconLabelButtonProps = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
  labelClassName?: string;
  showLabel?: boolean;
  iconOnly?: boolean;
};

export default function IconLabelButton({
  icon,
  label,
  onClick,
  className,
  labelClassName,
  showLabel = false,
  iconOnly = false,
}: IconLabelButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "group inline-flex h-11 items-center justify-center rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] px-2.5 text-sm font-semibold text-[var(--foreground)] shadow-surface transition-all duration-200 cursor-pointer",
        "hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--color-brand-500)_34%,var(--border))] hover:bg-[color-mix(in_srgb,var(--color-brand-500)_9%,var(--surface))]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 active:translate-y-0",
        showLabel && "gap-2 px-3.5",
        iconOnly && "w-11 px-0",
        className
      )}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-brand-500)_10%,var(--surface-2))] text-[var(--color-brand-500)] transition-colors duration-200 group-hover:bg-[color-mix(in_srgb,var(--color-brand-500)_16%,var(--surface-2))]">
        {icon}
      </span>

      {!iconOnly && (
        <span
          className={cn(
            "overflow-hidden whitespace-nowrap transition-all duration-300",
            showLabel
              ? "max-w-[140px] opacity-100"
              : "ml-0 max-w-0 opacity-0 group-hover:ml-2 group-hover:max-w-[120px] group-hover:opacity-100",
            labelClassName
          )}
        >
          {label}
        </span>
      )}
    </button>
  );
}
