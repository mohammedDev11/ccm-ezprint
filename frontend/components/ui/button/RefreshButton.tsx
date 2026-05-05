"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/cn";

type RefreshButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
};

export default function RefreshButton({
  label = "Refresh",
  className = "",
  type = "button",
  ...props
}: RefreshButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "group inline-flex items-center overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-0 text-[var(--foreground)] transition-all duration-500 hover:border-transparent hover:bg-[var(--color-brand-500)] hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)] disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center">
        <RefreshCw className="h-4 w-4" />
      </div>

      <span className="max-w-0 overflow-hidden whitespace-nowrap text-base font-medium transition-all duration-500 group-hover:max-w-[140px] group-hover:pr-4">
        {label}
      </span>
    </button>
  );
}
