"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";

type FullscreenTablePortalProps = {
  open: boolean;
  children: React.ReactNode;
};

export default function FullscreenTablePortal({
  open,
  children,
}: FullscreenTablePortalProps) {
  useEffect(() => {
    if (!open) return;

    document.body.classList.add("fullscreen-table-mode");
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.classList.remove("fullscreen-table-mode");
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000000] h-dvh w-screen overflow-hidden bg-[var(--background)]"
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen table"
    >
      {children}
    </div>,
    document.body,
  );
}
