import React from "react";
import type { IconType } from "react-icons";
import { cn } from "@/lib/cn";

type ExpandedButtonProps = {
  id: string;
  label: string;
  icon: IconType;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "default" | "ghost" | "surface" | "danger";
  iconSize?: number;
  disabled?: boolean;
};

const ExpandedButton: React.FC<ExpandedButtonProps> = ({
  label,
  icon: Icon,
  className = "",
  onClick,
  variant = "default",
  iconSize = 18,
  disabled = false,
}) => {
  const baseStyles =
    "group inline-flex items-center overflow-hidden rounded-md border transition-all duration-500 cursor-pointer";

  const variantStyles = {
    default:
      "bg-brand-500 text-white border-transparent hover:bg-brand-600 hover:shadow-brand",
    ghost:
      "bg-transparent text-[var(--foreground)] border-transparent hover:bg-[var(--surface-2)]",
    surface:
      "bg-[var(--surface-2)] text-[var(--foreground)] border-[var(--border)] hover:bg-brand-500 hover:text-white hover:border-transparent",
    danger:
      "bg-[var(--surface-2)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--color-danger-500)] hover:text-white hover:border-transparent",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseStyles,
        variantStyles[variant],
        "px-2 py-1 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center">
        <Icon size={iconSize} />
      </div>

      <span
        className="
          max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium
          transition-all duration-500
          group-hover:max-w-[140px]
          group-hover:pr-3
        "
      >
        {label}
      </span>
    </button>
  );
};

export default ExpandedButton;
