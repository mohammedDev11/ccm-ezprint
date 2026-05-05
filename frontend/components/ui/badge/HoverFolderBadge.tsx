"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import type { Icon } from "@tabler/icons-react";

/* ===========================
   helper
=========================== */
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/* ===========================
   types
=========================== */
export type HoverItem = {
  id: string;
  label: string;
  icon: Icon;
  iconClassName?: string;
};

interface HoverFolderBadgeProps {
  text?: string;
  items: HoverItem[];
  className?: string;
  href?: string;
  target?: string;

  folderSize?: { width: number; height: number };
  teaserCardSize?: { width: number; height: number };
  hoverCardSize?: { width: number; height: number };

  hoverTranslateY?: number;
  hoverSpread?: number;
  hoverRotation?: number;

  enableTimerPreview?: boolean;
  previewStartDelay?: number;
  previewOpenDuration?: number;
  previewInterval?: number;
  repeatPreview?: boolean;
}

export function HoverFolderBadge({
  text = "Files",
  items,
  className,
  href,
  target,
  folderSize = { width: 72, height: 54 },
  teaserCardSize = { width: 34, height: 24 },
  hoverCardSize = { width: 80, height: 56 },
  hoverTranslateY = -62,
  hoverSpread = 46,
  hoverRotation = 10,

  enableTimerPreview = false,
  previewStartDelay = 800,
  previewOpenDuration = 1400,
  previewInterval = 5000,
  repeatPreview = true,
}: HoverFolderBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = () => {
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    openTimeoutRef.current = null;
    closeTimeoutRef.current = null;
    intervalRef.current = null;
  };

  useEffect(() => {
    if (!enableTimerPreview) {
      const timer = setTimeout(() => {
        setIsPreviewing(false);
      }, 0);
      clearAllTimers();

      return () => {
        clearTimeout(timer);
      };
    }

    const runPreview = () => {
      setIsPreviewing(true);

      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = setTimeout(() => {
        setIsPreviewing(false);
      }, previewOpenDuration);
    };

    openTimeoutRef.current = setTimeout(() => {
      runPreview();

      if (repeatPreview) {
        intervalRef.current = setInterval(() => {
          runPreview();
        }, previewInterval);
      }
    }, previewStartDelay);

    return () => {
      clearAllTimers();
    };
  }, [
    enableTimerPreview,
    previewStartDelay,
    previewOpenDuration,
    previewInterval,
    repeatPreview,
  ]);

  const showCards = isHovered || isPreviewing;
  const displayItems = items.slice(0, 4);

  const tabWidth = folderSize.width * 0.34;
  const tabHeight = folderSize.height * 0.22;

  const Component = href ? "a" : "div";

  return (
    <Component
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      onMouseEnter={() => {
        setIsHovered(true);
        setIsPreviewing(false);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      className={cn(
        "inline-flex cursor-pointer select-none items-center gap-3 overflow-visible bg-transparent",
        className
      )}
      style={{ background: "transparent" }}
    >
      <motion.div
        className="relative overflow-visible bg-transparent"
        style={{
          width: folderSize.width,
          height: folderSize.height,
          transformStyle: "preserve-3d",
          perspective: 1200,
          overflow: "visible",
          background: "transparent",
        }}
      >
        {/* folder back */}
        <div
          className="absolute inset-0 rounded-[10px]"
          style={{
            background:
              "linear-gradient(180deg, var(--color-brand-400) 0%, var(--color-brand-600) 100%)",
            boxShadow:
              "0 12px 28px rgba(var(--brand-rgb), 0.22), 0 6px 14px rgba(var(--shadow-color), 0.12)",
          }}
        >
          {/* folder tab */}
          <div
            className="absolute left-1.5 rounded-t-[6px]"
            style={{
              top: -tabHeight * 0.65,
              width: tabWidth,
              height: tabHeight,
              background:
                "linear-gradient(180deg, var(--color-brand-300) 0%, var(--color-brand-500) 100%)",
              boxShadow: "0 6px 14px rgba(var(--brand-rgb), 0.16)",
            }}
          />
        </div>

        {/* cards */}
        {displayItems.map((item, index) => {
          const total = displayItems.length;

          const spreadBoost =
            total === 1 ? 0 : total === 2 ? hoverSpread + 10 : hoverSpread + 18;

          const baseRotation =
            total === 1
              ? 0
              : total === 2
              ? (index - 0.5) * hoverRotation
              : total === 3
              ? (index - 1) * hoverRotation
              : (index - 1.5) * (hoverRotation * 0.9);

          const hoverX =
            total === 1
              ? 0
              : total === 2
              ? (index - 0.5) * spreadBoost
              : total === 3
              ? (index - 1) * spreadBoost
              : (index - 1.5) * (spreadBoost * 0.95);

          const hoverY =
            hoverTranslateY - Math.abs(index - (total - 1) / 2) * 2;

          const teaseY = -8 - (total - 1 - index) * 2;
          const teaseRotation =
            total === 1
              ? 0
              : total === 2
              ? (index - 0.5) * 4
              : total === 3
              ? (index - 1) * 4
              : (index - 1.5) * 3;

          const IconComp = item.icon;

          return (
            <motion.div
              key={item.id}
              className="absolute left-1/2 top-1 origin-bottom overflow-visible"
              animate={{
                x: `calc(-50% + ${showCards ? hoverX : 0}px)`,
                y: showCards ? hoverY : teaseY,
                rotate: showCards ? baseRotation : teaseRotation,
                width: showCards ? hoverCardSize.width : teaserCardSize.width,
                height: showCards
                  ? hoverCardSize.height
                  : teaserCardSize.height,
              }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 24,
                delay: index * 0.04,
              }}
              style={{
                zIndex: 10 + index,
                overflow: "visible",
              }}
            >
              <div
                className="h-full w-full overflow-hidden rounded-[12px] border"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  boxShadow:
                    "0 10px 25px rgba(var(--shadow-color), 0.16), 0 4px 10px rgba(var(--brand-rgb), 0.08)",
                }}
              >
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2">
                  <IconComp
                    className={cn(
                      "shrink-0",
                      showCards ? "h-6 w-6" : "h-3.5 w-3.5",
                      item.iconClassName
                    )}
                    stroke={1.8}
                  />

                  <span
                    className={cn(
                      "font-semibold tracking-wide transition-opacity duration-200",
                      showCards
                        ? "text-[10px] opacity-100"
                        : "text-[0px] opacity-0"
                    )}
                    style={{ color: "var(--title)" }}
                  >
                    {item.label}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* folder front */}
        <motion.div
          className="absolute inset-x-0 bottom-0 h-[84%] origin-bottom rounded-[10px]"
          animate={{
            rotateX: showCards ? -48 : -24,
            scaleY: showCards ? 0.82 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 360,
            damping: 24,
          }}
          style={{
            zIndex: 30,
            transformStyle: "preserve-3d",
            background:
              "linear-gradient(180deg, var(--color-brand-300) 0%, var(--color-brand-500) 100%)",
            boxShadow:
              "0 14px 34px rgba(var(--brand-rgb), 0.32), inset 0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          <div
            className="absolute left-2 right-2 top-1.5 h-px"
            style={{ background: "rgba(255,255,255,0.25)" }}
          />
        </motion.div>
      </motion.div>

      {text ? (
        <span
          className="text-sm font-medium"
          style={{ color: "var(--foreground)" }}
        >
          {text}
        </span>
      ) : null}
    </Component>
  );
}

export default HoverFolderBadge;
