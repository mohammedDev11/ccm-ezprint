"use client";

import React from "react";
import { cn } from "@/lib/cn";

type IconLabelButtonProps = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
  labelClassName?: string;
};

export default function IconLabelButton({
  icon,
  label,
  onClick,
  className,
  labelClassName,
}: IconLabelButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group inline-flex items-center rounded-[1rem] border px-2.5 py-2 text-sm font-medium transition-all duration-300 cursor-pointer",
        className
      )}
      style={{
        borderColor: "var(--border)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
        color: "var(--foreground)",
        boxShadow:
          "0 10px 24px rgba(var(--shadow-color), 0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <span className="flex h-8 w-8 items-center justify-center shrink-0">
        {icon}
      </span>

      <span
        className={cn(
          "ml-0 max-w-0 overflow-hidden whitespace-nowrap opacity-0",
          "transition-all duration-700",
          "group-hover:ml-0.5 group-hover:max-w-[120px] group-hover:opacity-100",
          labelClassName
        )}
      >
        {label}
      </span>
    </button>
  );
}
