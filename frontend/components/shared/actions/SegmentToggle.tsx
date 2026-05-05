"use client";

import React from "react";
import { cn } from "@/lib/cn";

export type SegmentOption = {
  value: string;
  label: string;
  ariaLabel?: string;
  title?: string;
  icon?: React.ReactNode;
};

type SegmentToggleProps = {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  buttonClassName?: string;
  showLabels?: boolean;
};

const SegmentToggle = ({
  options,
  value,
  onChange,
  className = "",
  buttonClassName = "",
  showLabels = true,
}: SegmentToggleProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl border p-2",
        className,
      )}
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-5 py-3 text-sm font-semibold transition-all duration-200",
              active
                ? "bg-brand-500 text-white shadow-sm"
                : "text-[var(--paragraph)] hover:bg-[var(--surface-2)]",
              buttonClassName,
            )}
            aria-pressed={active}
            aria-label={option.ariaLabel ?? option.label}
            title={option.title ?? option.ariaLabel ?? option.label}
          >
            {option.icon ? (
              <span className="flex items-center justify-center">
                {option.icon}
              </span>
            ) : null}

            <span className={cn(!showLabels && "sr-only")}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SegmentToggle;
