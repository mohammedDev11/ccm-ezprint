"use client";

import React from "react";
import { cn } from "@/lib/cn";

type GlowButtonProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        `
        relative px-7 py-3 rounded-2xl
        font-medium tracking-wide

        border border-[var(--border)]
        transition-all duration-300 hover:scale-[1.02]
        cursor-pointer
      `,
        className
      )}
    >
      {/* ✨ Soft outer glow */}
      <span
        className="
        absolute -inset-[1px] rounded-2xl
        bg-gradient-to-r from-support-300 via-brand-500 to-brand-700
        blur-md opacity-60
      "
      />

      {/* ✨ Thin gradient border */}
      <span
        className="
        absolute inset-0 rounded-2xl
        bg-gradient-to-r from-support-300 via-brand-500 to-brand-700
        opacity-80
      "
      />

      {/* 🔥 Inner background (theme aware) */}
      <span
        className="
        absolute inset-[1.5px] rounded-2xl
        bg-[var(--background)]
      "
      />

      {/* 🔥 Content (theme aware) */}
      <span
        className="
        relative z-10 flex items-center gap-2
        text-[var(--foreground)]
      "
      >
        {children}
      </span>
    </button>
  );
};

export default GlowButton;
