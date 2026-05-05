import React, { forwardRef } from "react";

type FloatingInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  wrapperClassName?: string;
  label: string;
};

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  (
    { icon, label, id, className = "", wrapperClassName = "", ...props },
    ref
  ) => {
    if (!id) {
      console.warn("FloatingInput requires an id for proper label behavior.");
    }

    const hasIcon = Boolean(icon);

    return (
      <div
        className={`relative w-full min-w-0 rounded-md border transition-all duration-200 focus-within:ring-2 focus-within:ring-brand-500/20 ${wrapperClassName}`}
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        {icon && (
          <span
            className="absolute top-1/2 left-4 z-10 -translate-y-1/2"
            style={{ color: "var(--muted)" }}
          >
            {icon}
          </span>
        )}

        <input
          ref={ref}
          id={id}
          placeholder=" "
          className={`peer h-14 w-full rounded-md bg-transparent pt-5 pb-2 pr-4 text-sm outline-none ${
            hasIcon ? "pl-12" : "pl-4"
          } ${className}`}
          style={{ color: "var(--foreground)" }}
          {...props}
        />

        <label
          htmlFor={id}
          className={`
            pointer-events-none absolute z-[1] px-1 text-sm transition-all duration-200 ease-out
            peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs
            peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:-translate-y-1/2 peer-not-placeholder-shown:text-xs
            ${hasIcon ? "left-11" : "left-3"}
          `}
          style={{
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--muted)",
            background: "var(--surface)",
          }}
        >
          {label}
        </label>
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";

export default FloatingInput;
