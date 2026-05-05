"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/cn";

type FormFieldInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: React.HTMLInputTypeAttribute;
  className?: string;
  inputClassName?: string;
  rows?: number;
};

const sharedClassName =
  "w-full rounded-md border bg-[var(--surface)] px-4 text-sm outline-none transition focus:ring-2 focus:ring-brand-500/20";

const FormFieldInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FormFieldInputProps
>(
  (
    {
      label,
      value,
      onChange,
      placeholder,
      multiline = false,
      type = "text",
      className = "",
      inputClassName = "",
      rows = 4,
    },
    ref
  ) => {
    return (
      <div className={cn("space-y-2", className)}>
        <label className="text-sm font-medium text-[var(--paragraph)]">
          {label}
        </label>

        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={cn(sharedClassName, "py-3", inputClassName)}
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(sharedClassName, "h-14", inputClassName)}
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />
        )}
      </div>
    );
  }
);

FormFieldInput.displayName = "FormFieldInput";

export default FormFieldInput;
