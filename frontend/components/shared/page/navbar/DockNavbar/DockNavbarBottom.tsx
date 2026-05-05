"use client";

import PreviewVideo from "@/components/ui/video/PreviewVideo";
import { cn } from "@/lib/cn";
import {
  getDockItems,
  type SidebarItem,
  type SidebarSection,
} from "@/lib/mock-data/Navbar";
import useIsClient from "@/lib/useIsClient";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type DockNavbarBottomProps = {
  sections: SidebarSection[];
  inFrame?: boolean;
  className?: string;
};

type DockItemProps = {
  item: SidebarItem;
  index: number;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
};

type PreviewPortalProps = {
  item: SidebarItem;
  anchorRef: React.RefObject<HTMLElement | null>;
  visible: boolean;
  active: boolean;
  onPreviewEnter: () => void;
  onPreviewLeave: () => void;
};

const DOCK_ITEM_SIZE = "clamp(2.4rem, 3.4vw, 3rem)";

const getDockItemTransform = (hoveredIndex: number | null, index: number) => {
  if (hoveredIndex === null) return { scale: 1, y: 0 };

  const distance = Math.abs(hoveredIndex - index);
  if (distance === 0) return { scale: 1.25, y: -10 };
  if (distance === 1) return { scale: 1.12, y: -5 };
  if (distance === 2) return { scale: 1.05, y: -2 };

  return { scale: 1, y: 0 };
};

function WindowChrome({
  title,
  subtitle,
  active,
}: {
  title: string;
  subtitle?: string;
  active?: boolean;
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div
          className="truncate text-sm font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          {title}
        </div>

        {subtitle ? (
          <div className="truncate text-xs" style={{ color: "var(--muted)" }}>
            {subtitle}
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: "var(--muted)" }}
        />
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: "var(--muted)" }}
        />
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{
            background: active ? "var(--inverse-surface)" : "var(--border)",
          }}
        />
      </div>
    </div>
  );
}

function VideoPreview({
  item,
  active,
}: {
  item: SidebarItem;
  active: boolean;
}) {
  return (
    <div className="space-y-3">
      <div
        className="overflow-hidden rounded-2xl border"
        style={{
          background: "color-mix(in srgb, var(--surface) 84%, transparent)",
          borderColor: "var(--border)",
        }}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
          <PreviewVideo
            lightVideoSrc={item.lightVideoSrc}
            darkVideoSrc={item.darkVideoSrc}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
            style={{
              background:
                "linear-gradient(to top, color-mix(in srgb, var(--surface) 92%, transparent), transparent)",
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div
            className="truncate text-xs font-medium"
            style={{ color: "var(--foreground)" }}
          >
            {item.label}
          </div>
          <div
            className="truncate text-[11px]"
            style={{ color: "var(--muted)" }}
          >
            {item.href}
          </div>
        </div>

        <div
          className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold"
          style={{
            background: active
              ? "var(--inverse-surface)"
              : "color-mix(in srgb, var(--surface-3) 80%, transparent)",
            color: active ? "var(--inverse-foreground)" : "var(--foreground)",
          }}
        >
          {active ? "Current" : "Preview"}
        </div>
      </div>
    </div>
  );
}

function PreviewPortal({
  item,
  anchorRef,
  visible,
  active,
  onPreviewEnter,
  onPreviewLeave,
}: PreviewPortalProps) {
  const mounted = useIsClient();
  const [coords, setCoords] = useState({ left: 0, bottom: 0 });

  useLayoutEffect(() => {
    if (!visible || !anchorRef.current) return;

    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;

      const gap = 16;

      setCoords({
        left: rect.left + rect.width / 2,
        bottom: window.innerHeight - rect.top + gap,
      });
    };

    updatePosition();

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [visible, anchorRef]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed z-[99999]"
          style={{
            left: coords.left,
            bottom: coords.bottom,
            transform: "translateX(-50%)",
          }}
          onMouseEnter={onPreviewEnter}
          onMouseLeave={onPreviewLeave}
        >
          <div className="relative">
            <div
              className="w-[340px] overflow-hidden rounded-[1.6rem] border p-3 shadow-2xl backdrop-blur-2xl"
              style={{
                background:
                  "color-mix(in srgb, var(--surface) 92%, transparent)",
                borderColor: "var(--border)",
                boxShadow:
                  "0 22px 60px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <WindowChrome
                title={item.label}
                subtitle="Live page preview"
                active={active}
              />

              <VideoPreview item={item} active={active} />
            </div>

            <span
              className="absolute -bottom-1.5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border"
              style={{
                background:
                  "color-mix(in srgb, var(--surface) 92%, transparent)",
                borderColor: "var(--border)",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function DockItem({
  item,
  index,
  hoveredIndex,
  setHoveredIndex,
}: DockItemProps) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const pathname = usePathname();

  const [hoveredIcon, setHoveredIcon] = useState(false);
  const [hoveredPreview, setHoveredPreview] = useState(false);

  const closeTimeoutRef = useRef<number | null>(null);

  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  const isOpen = hoveredIcon || hoveredPreview;

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openPreview = () => {
    clearCloseTimeout();
    setHoveredIndex(index);
    setHoveredIcon(true);
  };

  const closePreviewWithDelay = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = window.setTimeout(() => {
      setHoveredIcon(false);
      setHoveredPreview(false);
    }, 120);
  };

  useEffect(() => {
    return () => clearCloseTimeout();
  }, []);

  return (
    <div className="relative flex shrink-0 items-center justify-center">
      <PreviewPortal
        item={item}
        anchorRef={ref}
        visible={isOpen}
        active={active}
        onPreviewEnter={() => {
          clearCloseTimeout();
          setHoveredPreview(true);
        }}
        onPreviewLeave={() => {
          setHoveredPreview(false);
          closePreviewWithDelay();
        }}
      />

      <motion.div
        animate={getDockItemTransform(hoveredIndex, index)}
        transition={{ type: "spring", stiffness: 260, damping: 20, mass: 0.22 }}
        style={{
          width: DOCK_ITEM_SIZE,
          height: DOCK_ITEM_SIZE,
          transformOrigin: "bottom center",
          willChange: "transform",
        }}
        className="relative flex aspect-square items-center justify-center"
      >
        <Link
          ref={ref}
          href={item.href}
          onMouseEnter={openPreview}
          onMouseLeave={() => {
            setHoveredIcon(false);
            closePreviewWithDelay();
          }}
          className={cn(
            "relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border transition-colors duration-200",
            active
              ? "text-[var(--color-brand-500)]"
              : "text-[var(--foreground)]",
          )}
          style={{
            background: active
              ? "linear-gradient(180deg, color-mix(in srgb, var(--color-brand-500) 16%, var(--surface)), color-mix(in srgb, var(--color-brand-500) 10%, var(--surface-2)))"
              : undefined,
            borderColor: active
              ? "color-mix(in srgb, var(--color-brand-500) 30%, var(--border))"
              : "var(--border)",
            boxShadow: active
              ? "0 10px 24px rgba(var(--shadow-color), 0.10), inset 0 1px 0 rgba(255,255,255,0.08)"
              : "0 8px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.10)",
            backdropFilter: "blur(18px)",
          }}
        >
          {!active && (
            <span
              className="pointer-events-none absolute inset-[1px] rounded-[calc(1rem-2px)]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
              }}
            />
          )}

          <div className="relative z-[1] flex items-center justify-center">
            <Icon
              className="text-[1.28rem] 2xl:text-[1.38rem]"
              style={{
                color: active
                  ? "color-mix(in srgb, var(--color-brand-500) 72%, var(--foreground))"
                  : "var(--foreground)",
              }}
            />
          </div>
        </Link>
      </motion.div>
    </div>
  );
}

export default function DockNavbarBottom({
  sections,
  inFrame = false,
  className,
}: DockNavbarBottomProps) {
  const dockItems = useMemo(() => getDockItems(sections), [sections]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "hidden md:block",
        inFrame ? "relative" : "fixed bottom-4 left-4 right-4 z-50",
        className,
      )}
    >
      <div
        onMouseLeave={() => setHoveredIndex(null)}
        className="flex h-[76px] w-full items-center justify-center overflow-visible"
      >
        <div
          className={cn(
            "flex w-fit items-center overflow-visible rounded-[2rem] border px-2.5 py-2 shadow-2xl backdrop-blur-md",
            inFrame ? "max-w-full" : "max-w-[calc(100vw-2rem)]",
          )}
          style={{
            gap: "clamp(0.45rem, 0.75vw, 0.75rem)",
            background:
              "linear-gradient(180deg, var(--surface), color-mix(in srgb, var(--surface) 92%, var(--background)))",
            borderColor: "var(--border)",
            boxShadow:
              "0 16px 38px rgba(var(--shadow-color), 0.16), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {dockItems.map((item, index) => (
            <DockItem
              key={item.href}
              item={item}
              index={index}
              hoveredIndex={hoveredIndex}
              setHoveredIndex={setHoveredIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
