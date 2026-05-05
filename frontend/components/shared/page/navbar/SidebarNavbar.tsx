"use client";

import PreviewVideo from "@/components/ui/video/PreviewVideo";
import { cn } from "@/lib/cn";
import type { SidebarItem, SidebarSection } from "@/lib/mock-data/Navbar";
import useIsClient from "@/lib/useIsClient";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { BrandMark } from "../Logo";

type SidebarNavbarProps = {
  sections: SidebarSection[];
  isExpanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  side?: "left" | "right";
  inFrame?: boolean;
  className?: string;
  showBrand?: boolean;
};

type SidebarVideoPreviewProps = {
  item: SidebarItem;
  anchorRef: RefObject<HTMLAnchorElement | null>;
  visible: boolean;
  side: "left" | "right";
};

type SidebarNavItemProps = {
  item: SidebarItem;
  isExpanded: boolean;
  pathname: string;
  side: "left" | "right";
  shortcutLabel?: string;
  registerItemElement?: (
    href: string,
    element: HTMLAnchorElement | null,
  ) => void;
};

type ActiveIndicatorState = {
  top: number;
  height: number;
};

const sidebarActiveIndicatorSnapshots: Partial<
  Record<"admin" | "user", ActiveIndicatorState>
> = {};

const sidebarShortcutLabels = [
  "⌥⇧1",
  "⌥⇧2",
  "⌥⇧3",
  "⌥⇧4",
  "⌥⇧5",
  "⌥⇧6",
  "⌥⇧7",
  "⌥⇧8",
  "⌥⇧9",
  "⌥⇧0",
  "⌥⇧-",
  "⌥⇧=",
];

const getSidebarShortcutLabel = (index: number) =>
  sidebarShortcutLabels[index] ?? "";

const SIDEBAR_PREVIEW_WIDTH = 240;
const SIDEBAR_PREVIEW_GAP = 18;
const SIDEBAR_PREVIEW_VIEWPORT_PADDING = 12;

function SidebarVideoPreview({
  item,
  anchorRef,
  visible,
  side,
}: SidebarVideoPreviewProps) {
  const mounted = useIsClient();
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!visible || !anchorRef.current) return;

    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;

      const previewLeft =
        side === "right"
          ? Math.max(
              SIDEBAR_PREVIEW_VIEWPORT_PADDING,
              rect.left - SIDEBAR_PREVIEW_GAP - SIDEBAR_PREVIEW_WIDTH,
            )
          : rect.right + SIDEBAR_PREVIEW_GAP;

      setCoords({
        top: rect.top + rect.height / 2,
        left: previewLeft,
      });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [visible, anchorRef, side]);

  if (!mounted || !visible) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0, x: side === "right" ? 8 : -8, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="pointer-events-none fixed z-[99999]"
      style={{
        top: coords.top,
        left: coords.left,
        transform: "translateY(-50%)",
      }}
    >
      <div className="relative">
        <div
          className="w-[240px] overflow-hidden rounded-[1.5rem] border p-2.5 shadow-2xl backdrop-blur-xl"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--surface) 92%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
            borderColor: "var(--border)",
            boxShadow:
              "0 22px 56px rgba(var(--shadow-color), 0.3), 0 0 0 1px rgba(var(--support-rgb), 0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <div className="overflow-hidden rounded-[1.1rem] border border-[var(--border)]">
            <div className="aspect-[16/10] w-full">
              <PreviewVideo
                lightVideoSrc={item.lightVideoSrc}
                darkVideoSrc={item.darkVideoSrc}
                className="h-full w-full"
              />
            </div>
          </div>

          <div className="mt-3 px-1">
            <p
              className="truncate text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              {item.label}
            </p>
            <p className="truncate text-xs" style={{ color: "var(--muted)" }}>
              Live page preview
            </p>
          </div>
        </div>

        <span
          className={cn(
            "absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-45 border",
            side === "right"
              ? "right-0 translate-x-1/2"
              : "left-0 -translate-x-1/2",
          )}
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--surface) 92%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
            borderColor: "var(--border)",
          }}
        />
      </div>
    </motion.div>,
    document.body,
  );
}

function SidebarNavItem({
  item,
  isExpanded,
  pathname,
  side,
  shortcutLabel,
  registerItemElement,
}: SidebarNavItemProps) {
  const Icon = item.icon;
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const [hovered, setHovered] = useState(false);

  const active =
    pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(`${item.href}/`));

  const hasPreviewVideo = Boolean(item.lightVideoSrc || item.darkVideoSrc);
  const labelBounds = shortcutLabel
    ? side === "right"
      ? "left-[4.25rem] right-[78px] text-right"
      : "left-[78px] right-[4.25rem]"
    : side === "right"
      ? "left-4 right-[78px] text-right"
      : "left-[78px] right-4";

  return (
    <>
      <Link
        ref={(element) => {
          linkRef.current = element;
          registerItemElement?.(item.href, element);
        }}
        href={item.href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "ezprint-sidebar-link group relative z-10 flex h-[3.7rem] items-center rounded-full px-0 transition-all duration-300",
          active
            ? "ezprint-sidebar-link-active border-transparent text-[var(--color-brand-500)] outline-none ring-0"
            : "text-[var(--paragraph)] hover:text-[var(--color-brand-500)]",
        )}
      >
        {!active ? (
          <span
            className="ezprint-sidebar-link-hover pointer-events-none absolute inset-0 rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100"
          />
        ) : null}

        <span
          className={cn(
            "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 shrink-0 items-center justify-center rounded-full transition-colors duration-300",
            side === "right" ? "right-[22px]" : "left-[22px]",
            active && "text-[var(--color-brand-500)]",
          )}
        >
          <Icon
            className={cn(
              "text-[1.28rem] transition-all duration-300",
              active
                ? "text-[var(--color-brand-500)]"
                : "text-[var(--muted)] group-hover:text-[var(--color-brand-500)]",
            )}
          />
        </span>

        <span
          className={cn(
            "pointer-events-none absolute top-1/2 z-10 min-w-0 -translate-y-1/2 overflow-hidden whitespace-nowrap text-[0.96rem] font-medium tracking-[-0.01em] transition-[opacity,transform] duration-300",
            labelBounds,
            isExpanded
              ? "translate-x-0 opacity-100"
              : side === "right"
                ? "translate-x-1 opacity-0"
                : "-translate-x-1 opacity-0",
          )}
        >
          <span className="block truncate">{item.label}</span>
        </span>

        {shortcutLabel ? (
          <kbd
            aria-hidden={!isExpanded}
            className={cn(
              "pointer-events-none absolute top-1/2 z-10 shrink-0 -translate-y-1/2 rounded-md border px-1.5 py-0.5 text-[0.64rem] font-semibold leading-4 transition-[opacity,transform,color,background-color,border-color] duration-300",
              side === "right" ? "left-4" : "right-4",
              isExpanded
                ? "translate-x-0 opacity-100"
                : side === "right"
                  ? "-translate-x-1 opacity-0"
                  : "translate-x-1 opacity-0",
            )}
            style={{
              borderColor: "var(--border)",
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--surface) 88%, transparent), color-mix(in srgb, var(--surface-2) 94%, transparent))",
              color: active ? "var(--color-brand-600)" : "var(--muted)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {shortcutLabel}
          </kbd>
        ) : null}

        {active && isExpanded && !shortcutLabel ? (
          <span
            className={cn(
              "absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full",
              side === "right" ? "left-4" : "right-4",
            )}
            style={{
              background: "rgba(var(--support-rgb), 0.95)",
              boxShadow: "0 0 14px rgba(var(--support-rgb), 0.55)",
            }}
          />
        ) : null}
      </Link>

      {isExpanded && hovered && hasPreviewVideo ? (
        <SidebarVideoPreview
          item={item}
          anchorRef={linkRef}
          visible={hovered}
          side={side}
        />
      ) : null}
    </>
  );
}

export default function SidebarNavbar({
  sections,
  isExpanded,
  onMouseEnter,
  onMouseLeave,
  side = "left",
  inFrame = false,
  className,
  showBrand = true,
}: SidebarNavbarProps) {
  const pathname = usePathname();
  const workspaceKey = pathname.startsWith("/sections/admin") ? "admin" : "user";
  const workspaceLabel = pathname.startsWith("/sections/admin")
    ? "Admin operations"
    : "User workspace";
  const navItemsContainerRef = useRef<HTMLDivElement | null>(null);
  const itemElementsRef = useRef(new Map<string, HTMLAnchorElement>());
  const [activeIndicator, setActiveIndicator] =
    useState<ActiveIndicatorState | null>(
      () => sidebarActiveIndicatorSnapshots[workspaceKey] || null,
    );
  const activeHref =
    sections
      .flatMap((section) => section.items)
      .find(
        (item) =>
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(`${item.href}/`)),
      )?.href || "";

  const registerItemElement = (
    href: string,
    element: HTMLAnchorElement | null,
  ) => {
    if (element) {
      itemElementsRef.current.set(href, element);
      return;
    }

    itemElementsRef.current.delete(href);
  };

  useLayoutEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const container = navItemsContainerRef.current;
      const activeElement = activeHref
        ? itemElementsRef.current.get(activeHref)
        : null;

      if (!container || !activeElement) {
        setActiveIndicator(null);
        delete sidebarActiveIndicatorSnapshots[workspaceKey];
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();
      const nextIndicator = {
        top: activeRect.top - containerRect.top,
        height: activeRect.height,
      };

      sidebarActiveIndicatorSnapshots[workspaceKey] = nextIndicator;
      setActiveIndicator(nextIndicator);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [activeHref, sections, workspaceKey]);

  return (
    <aside
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "z-40 transition-[width] duration-300 ease-out",
        inFrame
          ? "relative self-stretch"
          : side === "right"
            ? "fixed right-0 top-0 hidden h-screen lg:flex"
            : "fixed left-0 top-0 hidden h-screen lg:flex",
        inFrame ? "w-full" : isExpanded ? "w-[320px]" : "w-[112px]",
        className,
      )}
      style={{
        width: isExpanded ? "296px" : "112px",
      }}
    >
      <div
        className={cn(
          "flex w-full flex-col p-3",
          inFrame
            ? "h-full min-h-0"
            : "rounded-[1.9rem] border h-full min-h-[calc(100vh-7.5rem)]",
        )}
        style={{
          borderColor: "var(--frame-border)",
          background: inFrame
            ? "transparent"
            : "linear-gradient(180deg, color-mix(in srgb, var(--frame-elevated) 84%, transparent), color-mix(in srgb, var(--frame-background) 94%, transparent))",
          boxShadow: inFrame
            ? "none"
            : "inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 48px rgba(var(--shadow-color), 0.14)",
        }}
      >
        {showBrand ? (
          <div className="mb-4 flex min-h-[88px] items-center">
            <Link
              href="/"
              className={cn(
                "group relative flex w-full items-center rounded-[1.5rem] border px-3 py-3 transition-all duration-300",
                isExpanded ? "justify-start" : "justify-center",
              )}
              style={{
                borderColor: "var(--border)",
                background:
                  "linear-gradient(180deg, color-mix(in srgb, var(--surface) 92%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 28px rgba(var(--shadow-color), 0.08)",
              }}
            >
              <BrandMark className={isExpanded ? "h-12 w-12" : "h-11 w-11"} />

              <span
                className={cn(
                  "ml-3 overflow-hidden whitespace-nowrap transition-all duration-300",
                  isExpanded
                    ? "max-w-[180px] opacity-100"
                    : "max-w-0 opacity-0",
                )}
              >
                <span className="block text-lg font-semibold tracking-[-0.03em] text-[var(--title)]">
                  EzPrint
                </span>
                <span
                  className="mt-0.5 block text-[0.68rem] font-semibold uppercase tracking-[0.24em]"
                  style={{ color: "var(--muted)" }}
                >
                  {workspaceLabel}
                </span>
              </span>
            </Link>
          </div>
        ) : null}

        <div className="ezprint-sidebar-scroll flex min-h-0 flex-1 flex-col justify-between">
          <div ref={navItemsContainerRef} className="relative space-y-6">
            {activeIndicator ? (
              <motion.span
                className="ezprint-sidebar-link-pressed absolute left-0 right-0 z-0 rounded-full border-0"
                initial={false}
                animate={{
                  top: activeIndicator.top,
                  height: activeIndicator.height,
                }}
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            ) : null}
            {sections.map((section, sectionIndex) => (
              <div key={section.title}>
                <p
                  className={cn(
                    "mb-3 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.26em] transition-all duration-300",
                    isExpanded
                      ? "max-w-[200px] opacity-100"
                      : "max-w-0 opacity-0",
                  )}
                  style={{ color: "var(--muted)" }}
                >
                  {section.title}
                </p>

                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => {
                    const shortcutIndex =
                      sections
                        .slice(0, sectionIndex)
                        .reduce(
                          (count, currentSection) =>
                            count + currentSection.items.length,
                          0,
                        ) + itemIndex;

                    return (
                      <SidebarNavItem
                        key={item.href}
                        item={item}
                        isExpanded={isExpanded}
                        pathname={pathname}
                        side={side}
                        shortcutLabel={getSidebarShortcutLabel(shortcutIndex)}
                        registerItemElement={registerItemElement}
                      />
                    );
                  })}
                </div>

                {sectionIndex === 0 ? (
                  <div
                    className="mt-5 h-px w-full"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, var(--border), transparent)",
                    }}
                  />
                ) : null}
              </div>
            ))}
          </div>

          <div
            className={cn(
              "overflow-hidden pt-4 transition-all duration-300",
              isExpanded ? "max-h-32 opacity-100" : "max-h-0 opacity-0",
            )}
          >
            <div
              className="rounded-[1.5rem] border p-4"
              style={{
                borderColor: "var(--border)",
                background:
                  "linear-gradient(180deg, rgba(var(--brand-rgb), 0.08), rgba(var(--support-rgb), 0.04))",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <p
                className="text-[0.66rem] font-semibold uppercase tracking-[0.24em]"
                style={{ color: "var(--muted)" }}
              >
                Guided Preview
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                Hover any destination to preview its live surface before opening
                it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
