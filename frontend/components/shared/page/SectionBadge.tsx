"use client";

import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";
import type { NavbarMode } from "./navbar/NavbarModeSwitcher";

const navbarModeStorageKey = "ezprint-navbar-mode";

type SectionBadgeProps = {
  title: string;
  description?: string;
  className?: string;
};

const readNavbarMode = (): NavbarMode => {
  if (typeof window === "undefined") return "left";

  const saved = window.localStorage.getItem(navbarModeStorageKey);

  return saved === "left" ||
    saved === "right" ||
    saved === "bottom" ||
    saved === "top"
    ? saved
    : "left";
};

export default function SectionBadge({
  title,
  description,
  className,
}: SectionBadgeProps) {
  const [navbarMode, setNavbarMode] = useState<NavbarMode>(() => readNavbarMode());
  const isRightMode = navbarMode === "right";

  useEffect(() => {
    const handleNavbarModeChange = (event: Event) => {
      const nextMode = (event as CustomEvent<NavbarMode>).detail;

      if (
        nextMode === "left" ||
        nextMode === "right" ||
        nextMode === "bottom" ||
        nextMode === "top"
      ) {
        setNavbarMode(nextMode);
      }
    };

    window.addEventListener(
      "ezprint-navbar-mode-change",
      handleNavbarModeChange,
    );

    return () => {
      window.removeEventListener(
        "ezprint-navbar-mode-change",
        handleNavbarModeChange,
      );
    };
  }, []);

  const edgeClass = "pointer-events-none absolute top-0 z-20";
  const badgeEdgeClass = "pointer-events-none absolute z-20 -top-4 sm:-top-6 lg:-top-8";
  const badgeLeftEdgeClass = "-left-4 sm:-left-6 lg:-left-8";
  const badgeRightEdgeClass = "-right-4 sm:-right-6 lg:-right-8";
  const descriptionEdgeClass =
    "pointer-events-none absolute z-20 -top-4 sm:-top-6 lg:-top-8";
  const textLeftEdgeClass = "left-0";
  const textRightEdgeClass = "right-0";

  return (
    <>
      {description ? (
        <p
          key={`${description}-${isRightMode ? "right" : "left"}`}
          className={cn(
            "ezprint-section-description max-w-[min(36rem,calc(100vw-16rem))] py-3.5 text-sm font-semibold leading-6 text-[var(--title)] sm:py-4",
            descriptionEdgeClass,
            isRightMode
              ? `${textRightEdgeClass} ezprint-section-description-from-right text-right`
              : `${textLeftEdgeClass} ezprint-section-description-from-left text-left`,
          )}
        >
          {description}
        </p>
      ) : null}

      <div
        className={cn(
          edgeClass,
          badgeEdgeClass,
          isRightMode ? badgeLeftEdgeClass : badgeRightEdgeClass,
          className,
        )}
      >
        <div
          className={cn(
            "ezprint-section-badge-inner min-w-[150px] px-6 py-3.5 shadow-2xl sm:min-w-[170px] sm:px-7 sm:py-4",
            isRightMode
              ? "rounded-br-[1.45rem]"
              : "rounded-bl-[1.45rem]",
          )}
          style={{
            transformOrigin: isRightMode ? "top left" : "top right",
          }}
        >
          <h1
            key={`${title}-${isRightMode ? "right" : "left"}`}
            className={cn(
              "ezprint-section-badge-text text-center text-base font-semibold tracking-[-0.01em] text-[var(--title)] sm:text-lg",
              isRightMode
                ? "ezprint-section-badge-text-from-left"
                : "ezprint-section-badge-text-from-right",
            )}
          >
            {title}
          </h1>
        </div>
      </div>
    </>
  );
}
