"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

const Modal = ({
  open,
  onClose,
  children,
  className,
  contentClassName,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: ModalProps) => {
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000010] flex items-center justify-center overflow-y-auto p-4 py-[clamp(1rem,5vh,4rem)]"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-md"
      />

      <div
        className={cn(
          "relative z-10 max-h-[90vh] w-fit max-w-[min(96vw,1100px)] overflow-y-auto rounded-[1.25rem] border p-6 shadow-2xl backdrop-blur-xl",
          className,
        )}
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--surface) 98%, transparent), color-mix(in srgb, var(--surface-2) 98%, transparent))",
          borderColor: "var(--border)",
          boxShadow:
            "0 28px 70px rgba(var(--shadow-color), 0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-lg transition hover:text-[var(--color-brand-500)]"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
            boxShadow:
              "0 10px 24px rgba(var(--shadow-color), 0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className={cn("pr-12", contentClassName)}>{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
