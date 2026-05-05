"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import React, {
  RefObject,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type DropdownContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedValue?: string;
  selectedLabel?: React.ReactNode;
  onSelect: (value: string, label?: React.ReactNode) => void;
  fullWidth: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
};

const DropdownContext = createContext<DropdownContextType | null>(null);

const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be used inside <Dropdown />");
  }
  return context;
};

type DropdownProps = {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  fullWidth?: boolean;
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

export function Dropdown({
  children,
  value,
  defaultValue,
  onValueChange,
  className = "",
  fullWidth = false,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const [selectedLabel, setSelectedLabel] = useState<React.ReactNode>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedValue = value !== undefined ? value : internalValue;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideTrigger = containerRef.current?.contains(target);
      const isInsidePanel = panelRef.current?.contains(target);

      if (!isInsideTrigger && !isInsidePanel) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const onSelect = useCallback((nextValue: string, label?: React.ReactNode) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    setSelectedLabel(label ?? null);
    onValueChange?.(nextValue);
    setOpen(false);
  }, [onValueChange, value]);

  const contextValue = useMemo(
    () => ({
      open,
      setOpen,
      selectedValue,
      selectedLabel,
      onSelect,
      fullWidth,
      containerRef,
      panelRef,
    }),
    [containerRef, fullWidth, onSelect, open, panelRef, selectedLabel, selectedValue]
  );

  return (
    <DropdownContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={`relative ${
          fullWidth ? "block w-full" : "inline-block"
        } ${className}`}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

type DropdownTriggerProps = {
  children?: React.ReactNode;
  placeholder?: React.ReactNode;
  className?: string;
  showChevron?: boolean;
  disabled?: boolean;
};

export function DropdownTrigger({
  children,
  placeholder = "Select",
  className = "",
  showChevron = true,
  disabled = false,
}: DropdownTriggerProps) {
  const { open, setOpen, selectedLabel, fullWidth } = useDropdown();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        setOpen((prev) => !prev);
      }}
      className={`flex items-center justify-between gap-3 rounded-md border px-4 py-2.5 text-left transition ${
        fullWidth ? "w-full" : "w-auto"
      } ${className}`}
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        color: "var(--foreground)",
      }}
    >
      <div className="min-w-0 flex-1 truncate text-left">
        {children ?? selectedLabel ?? placeholder}
      </div>

      {showChevron && (
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          style={{ color: "var(--muted)" }}
        />
      )}
    </button>
  );
}

type DropdownContentProps = {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right";
  widthClassName?: string;
};

export function DropdownContent({
  children,
  className = "",
  align = "left",
  widthClassName,
}: DropdownContentProps) {
  const { open, fullWidth, containerRef, panelRef } = useDropdown();
  const [floatingPosition, setFloatingPosition] =
    useState<FloatingPosition | null>(null);

  const resolvedWidthClassName =
    widthClassName ?? (fullWidth ? "w-full" : "w-56");

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
  }, [align, containerRef]);

  const updateFloatingPosition = useCallback(() => {
    const nextPosition = getFloatingPosition();

    if (nextPosition) {
      setFloatingPosition(nextPosition);
    }
  }, [getFloatingPosition]);

  useEffect(() => {
    if (!open) return;

    const positionFrame = window.requestAnimationFrame(updateFloatingPosition);
    window.addEventListener("resize", updateFloatingPosition);
    window.addEventListener("scroll", updateFloatingPosition, true);

    return () => {
      window.cancelAnimationFrame(positionFrame);
      window.removeEventListener("resize", updateFloatingPosition);
      window.removeEventListener("scroll", updateFloatingPosition, true);
    };
  }, [open, updateFloatingPosition]);

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

  return (
    <AnimatePresence>
      {open && typeof document !== "undefined"
        ? createPortal(
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onMouseDown={(event) => event.stopPropagation()}
              className="z-[1000020]"
              style={panelStyle}
            >
              <div
                className={`rounded-md border p-2 shadow-xl ${resolvedWidthClassName} ${className}`}
                style={panelSurfaceStyle}
              >
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                      },
                    },
                  }}
                  className="flex flex-col gap-1"
                >
                  {children}
                </motion.div>
              </div>
            </motion.div>,
            document.body,
          )
        : null}
    </AnimatePresence>
  );
}

type DropdownItemProps = {
  value: string;
  children: React.ReactNode;
  className?: string;
};

export function DropdownItem({
  value,
  children,
  className = "",
}: DropdownItemProps) {
  const { selectedValue, onSelect } = useDropdown();
  const isSelected = selectedValue === value;

  return (
    <motion.button
      type="button"
      variants={{
        hidden: { opacity: 0, x: -14 },
        visible: { opacity: 1, x: 0 },
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={() => onSelect(value, children)}
      className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition ${className}`}
      style={{
        background: isSelected ? "var(--surface-2)" : "transparent",
        color: "var(--paragraph)",
      }}
    >
      <div className="min-w-0 flex-1">{children}</div>

      <span className="ml-3 shrink-0">
        {isSelected && (
          <Check
            className="h-4 w-4"
            style={{ color: "var(--color-brand-500)" }}
          />
        )}
      </span>
    </motion.button>
  );
}
