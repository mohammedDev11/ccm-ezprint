"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

export type ListBoxOption = {
  value: string;
  label?: React.ReactNode;
  selectedLabel?: React.ReactNode;
  searchText?: string;
  disabled?: boolean;
};

type ListBoxProps = {
  children?: React.ReactNode;
  options: Array<string | ListBoxOption>;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  optionClassName?: string;
  maxHeightClassName?: string;
  align?: "left" | "right";
  ariaLabel?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  combobox?: boolean;
  clearSearchOnSelect?: boolean;
};

type FloatingPosition = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  minWidth: number;
  maxHeight: number;
};

const floatingGap = 10;
const viewportPadding = 12;
const comfortablePanelHeight = 320;
const minimumPanelHeight = 96;

export default function ListBox({
  children,
  options,
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "Select",
  disabled = false,
  className = "",
  triggerClassName = "",
  contentClassName = "",
  optionClassName = "",
  maxHeightClassName = "max-h-64",
  align = "left",
  ariaLabel,
  searchable = false,
  searchPlaceholder = "Search...",
  emptyText = "No options found.",
  combobox = false,
  clearSearchOnSelect = true,
}: ListBoxProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [floatingPosition, setFloatingPosition] =
    useState<FloatingPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const normalizedOptions = useMemo(
    () =>
      options.map((option) =>
        typeof option === "string"
          ? { value: option, label: option }
          : { label: option.value, ...option },
      ),
    [options],
  );

  const selectedValue = value ?? internalValue;
  const selectedOption = normalizedOptions.find(
    (option) => option.value === selectedValue,
  );
  const getOptionText = (option: ListBoxOption) => {
    if (typeof option.selectedLabel === "string") return option.selectedLabel;
    if (typeof option.label === "string") return option.label;
    return option.value;
  };
  const filteredOptions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!searchable || !term) {
      return normalizedOptions;
    }

    return normalizedOptions.filter((option) => {
      const labelText =
        typeof option.label === "string" ? option.label : option.value;
      const searchText = `${option.searchText || ""} ${labelText} ${option.value}`;

      return searchText.toLowerCase().includes(term);
    });
  }, [normalizedOptions, searchTerm, searchable]);

  useEffect(() => {
    if (!combobox) return;

    const nextSearchTerm =
      !selectedValue
        ? ""
        : selectedOption && !clearSearchOnSelect
        ? getOptionText(selectedOption)
        : null;

    if (nextSearchTerm === null) {
      return;
    }

    let isActive = true;
    queueMicrotask(() => {
      if (isActive) {
        setSearchTerm(nextSearchTerm);
      }
    });

    return () => {
      isActive = false;
    };
  }, [clearSearchOnSelect, combobox, selectedOption, selectedValue]);

  const getFloatingPosition = useCallback((): FloatingPosition | null => {
    if (typeof window === "undefined" || !containerRef.current) {
      return null;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const availableBelow = Math.max(
      0,
      window.innerHeight - rect.bottom - floatingGap - viewportPadding,
    );
    const availableAbove = Math.max(0, rect.top - floatingGap - viewportPadding);
    const viewportMaxHeight = Math.max(0, window.innerHeight - viewportPadding * 2);
    const shouldUseViewportFallback =
      availableBelow < minimumPanelHeight && availableAbove < minimumPanelHeight;
    const shouldOpenAbove =
      !shouldUseViewportFallback &&
      availableBelow < comfortablePanelHeight &&
      availableAbove > availableBelow;
    const basePosition = {
      minWidth: rect.width,
      maxHeight: shouldUseViewportFallback
        ? viewportMaxHeight
        : shouldOpenAbove
        ? availableAbove
        : availableBelow,
    };

    if (align === "right") {
      return {
        ...basePosition,
        ...(shouldUseViewportFallback
          ? { top: viewportPadding }
          : shouldOpenAbove
          ? { bottom: window.innerHeight - rect.top + floatingGap }
          : { top: rect.bottom + floatingGap }),
        right: window.innerWidth - rect.right,
      };
    }

    return {
      ...basePosition,
      ...(shouldUseViewportFallback
        ? { top: viewportPadding }
        : shouldOpenAbove
        ? { bottom: window.innerHeight - rect.top + floatingGap }
        : { top: rect.bottom + floatingGap }),
      left: rect.left,
    };
  }, [align]);

  const updateFloatingPosition = useCallback(() => {
    const nextPosition = getFloatingPosition();

    if (nextPosition) {
      setFloatingPosition(nextPosition);
    }
  }, [getFloatingPosition]);

  const openListBox = useCallback(() => {
    const nextPosition = getFloatingPosition();

    if (nextPosition) {
      setFloatingPosition(nextPosition);
    }

    setOpen(true);
  }, [getFloatingPosition]);

  const closeListBox = useCallback(() => {
    setOpen(false);
    setFloatingPosition(null);
  }, []);

  useEffect(() => {
    if (!open) return;

    window.addEventListener("resize", updateFloatingPosition);
    window.addEventListener("scroll", updateFloatingPosition, true);

    return () => {
      window.removeEventListener("resize", updateFloatingPosition);
      window.removeEventListener("scroll", updateFloatingPosition, true);
    };
  }, [open, updateFloatingPosition]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideTrigger = containerRef.current?.contains(target);
      const isInsidePanel = panelRef.current?.contains(target);

      if (!isInsideTrigger && !isInsidePanel) {
        closeListBox();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeListBox();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closeListBox]);

  const handleSelect = (option: ListBoxOption) => {
    if (option.disabled) return;

    if (value === undefined) {
      setInternalValue(option.value);
    }

    onValueChange?.(option.value);
    closeListBox();
    setSearchTerm(clearSearchOnSelect ? "" : getOptionText(option));
  };

  const handleComboboxKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      openListBox();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        Math.min(current + 1, Math.max(filteredOptions.length - 1, 0)),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const option =
        filteredOptions[Math.min(activeIndex, filteredOptions.length - 1)];

      if (option) {
        handleSelect(option);
      }
      return;
    }

    if (event.key === "Escape") {
      closeListBox();
    }
  };

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    top: floatingPosition?.top,
    bottom: floatingPosition?.bottom,
    left: floatingPosition?.left,
    right: floatingPosition?.right,
    minWidth: floatingPosition?.minWidth,
    maxHeight: floatingPosition?.maxHeight,
    overflowX: "hidden",
    overflowY: "auto",
    overscrollBehavior: "contain",
    visibility: floatingPosition ? "visible" : "hidden",
  };

  const panelSurfaceStyle: React.CSSProperties = {
    background: "var(--surface)",
    borderColor: "var(--border)",
    boxShadow: "0 14px 40px rgba(var(--shadow-color), 0.16)",
  };

  const panel =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={panelRef}
            role="listbox"
            id={`${ariaLabel || "listbox"}-options`}
            onMouseDown={(event) => event.stopPropagation()}
            className="z-[1000020]"
            style={panelStyle}
          >
            <div
              className={cn(
                "overflow-hidden rounded-md border p-2 shadow-xl",
                contentClassName,
              )}
              style={panelSurfaceStyle}
            >
              {searchable && !combobox ? (
                <div className="relative mb-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={searchPlaceholder}
                    className="h-11 w-full rounded-md border bg-transparent pl-9 pr-3 text-sm font-medium outline-none transition focus:border-brand-500/50"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--title)",
                    }}
                  />
                </div>
              ) : null}

              <div className={cn("overflow-y-auto", maxHeightClassName)}>
                {children ? (
                  children
                ) : filteredOptions.length === 0 ? (
                  <div className="px-3 py-3 text-sm font-medium text-[var(--muted)]">
                    {emptyText}
                  </div>
                ) : (
                  filteredOptions.map((option, index) => {
                    const isSelected = option.value === selectedValue;
                    const isActive = combobox && index === activeIndex;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        disabled={option.disabled}
                        onClick={() => handleSelect(option)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition hover:bg-[var(--surface-2)] disabled:pointer-events-none disabled:opacity-50",
                          isSelected || isActive
                            ? "bg-[var(--surface-2)]"
                            : "bg-transparent",
                          optionClassName,
                        )}
                        style={{
                          color: "var(--paragraph)",
                        }}
                      >
                        <div className="min-w-0 flex-1 truncate">
                          {option.label}
                        </div>

                        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                          {isSelected ? (
                            <Check
                              className="h-4 w-4"
                              style={{ color: "var(--color-brand-500)" }}
                            />
                          ) : null}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {combobox ? (
        <div
          className={cn(
            "flex w-full items-center gap-3 rounded-md border px-4 py-2.5 text-left transition focus-within:ring-4 focus-within:ring-[rgba(var(--brand-rgb),0.16)]",
            disabled ? "pointer-events-none opacity-50" : "",
            triggerClassName,
          )}
          style={{
            background: "var(--surface)",
            borderColor: open
              ? "color-mix(in srgb, var(--color-brand-500) 34%, var(--border))"
              : "var(--border)",
            color: "var(--foreground)",
          }}
        >
          <Search className="h-5 w-5 shrink-0 text-[var(--muted)]" />
          <input
            type="text"
            role="combobox"
            disabled={disabled}
            aria-expanded={open}
            aria-label={ariaLabel}
            aria-controls={open ? `${ariaLabel || "listbox"}-options` : undefined}
            value={searchTerm}
            placeholder={
              typeof placeholder === "string" ? placeholder : searchPlaceholder
            }
            onFocus={() => {
              openListBox();
              setActiveIndex(0);
            }}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              openListBox();
              setActiveIndex(0);
            }}
            onKeyDown={handleComboboxKeyDown}
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[var(--title)] outline-none placeholder:text-[var(--muted)]"
          />
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-[var(--muted)] transition-transform",
              open ? "rotate-180" : "",
            )}
          />
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={ariaLabel}
          onClick={() => {
            if (open) {
              closeListBox();
              return;
            }

            openListBox();
          }}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-md border px-4 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)] disabled:pointer-events-none disabled:opacity-50",
            triggerClassName,
          )}
          style={{
            background: "var(--surface)",
            borderColor: open
              ? "color-mix(in srgb, var(--color-brand-500) 34%, var(--border))"
              : "var(--border)",
            color: selectedOption ? "var(--foreground)" : "var(--muted)",
          }}
        >
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {selectedOption?.selectedLabel ??
              selectedOption?.label ??
              placeholder}
          </span>

          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-[var(--muted)] transition-transform",
              open ? "rotate-180" : "",
            )}
          />
        </button>
      )}

      {panel}
    </div>
  );
}
