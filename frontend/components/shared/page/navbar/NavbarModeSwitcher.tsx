"use client";

import { cn } from "@/lib/cn";
import { useRef, useState } from "react";
import {
  RiLayoutBottomLine,
  RiLayoutLeftLine,
  RiLayoutRightLine,
  RiLayoutTopLine,
} from "react-icons/ri";

export type NavbarMode = "left" | "right" | "bottom" | "top";

type NavbarModeSwitcherProps = {
  value: NavbarMode;
  onChange: (mode: NavbarMode) => void;
  className?: string;
  placement?: "up" | "down";
};

type Option = {
  value: NavbarMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const options: Option[] = [
  { value: "left", label: "Left", icon: RiLayoutLeftLine },
  { value: "right", label: "Right", icon: RiLayoutRightLine },
  { value: "bottom", label: "Bottom", icon: RiLayoutBottomLine },
  { value: "top", label: "Top", icon: RiLayoutTopLine },
];

export default function NavbarModeSwitcher({
  value,
  onChange,
  className,
  placement = "down",
}: NavbarModeSwitcherProps) {
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentOption =
    options.find((option) => option.value === value) ?? options[0];
  const CurrentIcon = currentOption.icon;

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  };

  const openMenu = () => {
    clearCloseTimeout();
    setOpen(true);
  };

  const closeMenuWithDelay = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 180);
  };

  const handleSelect = (nextMode: NavbarMode) => {
    onChange(nextMode);
    setOpen(false);
  };

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={openMenu}
      onMouseLeave={closeMenuWithDelay}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[1rem] px-3 text-sm font-semibold text-[var(--muted)] transition-all duration-300 hover:text-[var(--foreground)]"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
          boxShadow:
            "0 10px 24px rgba(var(--shadow-color), 0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Select navbar layout"
      >
        <CurrentIcon className="shrink-0 text-lg" />
        <span>{currentOption.label}</span>
      </button>

      {open ? (
        <div
          className={cn(
            "absolute right-0 z-50 w-40 overflow-hidden rounded-[1rem] border p-1.5 shadow-2xl backdrop-blur-xl",
            placement === "up"
              ? "bottom-[calc(100%+0.35rem)]"
              : "top-[calc(100%+0.35rem)]",
          )}
          style={{
            borderColor: "var(--border)",
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
            boxShadow:
              "0 18px 42px rgba(var(--shadow-color), 0.18), inset 0 1px 0 rgba(255,255,255,0.07)",
          }}
          role="menu"
        >
          {options.map((option) => {
            const Icon = option.icon;
            const active = value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded-[0.8rem] px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
                  active
                    ? "text-[var(--foreground)]"
                    : "text-[var(--paragraph)] hover:text-[var(--foreground)]",
                )}
                style={{
                  background: active
                    ? "color-mix(in srgb, var(--surface-3) 48%, transparent)"
                    : "transparent",
                }}
                role="menuitem"
              >
                <Icon className="shrink-0 text-lg" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
