"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/cn";

type InputVariant = "default" | "centered" | "code";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  wrapperClassName?: string;
  variant?: InputVariant;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className = "", wrapperClassName = "", variant = "default", ...props },
    ref
  ) => {
    return (
      <div
        className={cn(
          "relative w-full rounded-md border transition-all duration-200",
          "focus-within:ring-2 focus-within:ring-brand-500/20",
          wrapperClassName
        )}
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <input
          ref={ref}
          className={cn(
            "w-full rounded-md border-0 outline-none transition-all",
            "px-4 py-3 text-sm sm:text-base",
            variant === "centered" && "text-center",
            variant === "code" &&
              "text-center tracking-[0.25em] text-lg sm:text-xl py-5",
            className
          )}
          style={{
            background: "transparent",
            color: "var(--title)",
          }}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
