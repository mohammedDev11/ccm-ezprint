"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

type RangeSliderProps = {
  min?: number;
  max?: number;
  step?: number;
  value?: [number, number];
  defaultValue?: [number, number];
  onChange?: (value: [number, number]) => void;
  label?: string;
  minLabel?: string;
  maxLabel?: string;
  wrapperClassName?: string;
  trackClassName?: string;
  disabled?: boolean;
  showInputs?: boolean;
  formatValue?: (value: number) => string;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const RangeSlider = ({
  min = 0,
  max = 1000,
  step = 1,
  value,
  defaultValue,
  onChange,
  label = "Range",
  minLabel = "Min",
  maxLabel = "Max",
  wrapperClassName = "",
  trackClassName = "",
  disabled = false,
  showInputs = true,
  formatValue = (value) => String(value),
}: RangeSliderProps) => {
  const initialValue: [number, number] = useMemo(() => {
    if (value) return value;
    if (defaultValue) return defaultValue;
    return [min, max];
  }, [value, defaultValue, min, max]);

  const [internalValue, setInternalValue] =
    useState<[number, number]>(initialValue);

  const currentValue = value ?? internalValue;
  const [minValue, maxValue] = currentValue;

  useEffect(() => {
    if (!value) return;

    const timer = window.setTimeout(() => {
      setInternalValue(value);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value]);

  const range = max - min || 1;

  const minPercent = ((minValue - min) / range) * 100;
  const maxPercent = ((maxValue - min) / range) * 100;

  const updateValue = (nextMin: number, nextMax: number) => {
    const safeMin = clamp(nextMin, min, max);
    const safeMax = clamp(nextMax, min, max);

    const normalized: [number, number] =
      safeMin <= safeMax ? [safeMin, safeMax] : [safeMax, safeMin];

    if (!value) {
      setInternalValue(normalized);
    }

    onChange?.(normalized);
  };

  const handleMinChange = (next: number) => {
    updateValue(next, Math.max(next, maxValue));
  };

  const handleMaxChange = (next: number) => {
    updateValue(Math.min(minValue, next), next);
  };

  return (
    <div
      className={cn(
        "w-full rounded-2xl border p-5",
        disabled && "pointer-events-none opacity-60",
        wrapperClassName
      )}
      style={{
        background: "var(--surface-2)",
        borderColor: "var(--border)",
      }}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            {label}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium">
          <span
            className="rounded-md px-3 py-1.5"
            style={{
              background: "var(--surface)",
              color: "var(--title)",
              border: "1px solid var(--border)",
            }}
          >
            {formatValue(minValue)}
          </span>
          <span className="text-[var(--muted)]">—</span>
          <span
            className="rounded-md px-3 py-1.5"
            style={{
              background: "var(--surface)",
              color: "var(--title)",
              border: "1px solid var(--border)",
            }}
          >
            {formatValue(maxValue)}
          </span>
        </div>
      </div>

      <div className="relative h-12">
        <div
          className={cn(
            "absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full",
            trackClassName
          )}
          style={{ background: "var(--border)" }}
        />

        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
            background:
              "linear-gradient(to right, var(--color-brand-400), var(--color-brand-600))",
          }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          disabled={disabled}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          className="range-thumb pointer-events-none absolute left-0 top-1/2 h-12 w-full -translate-y-1/2 appearance-none bg-transparent"
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          disabled={disabled}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          className="range-thumb pointer-events-none absolute left-0 top-1/2 h-12 w-full -translate-y-1/2 appearance-none bg-transparent"
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs font-medium text-[var(--muted)]">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>

      {showInputs ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--title)]">
              {minLabel}
            </p>
            <input
              type="number"
              min={min}
              max={maxValue}
              step={step}
              value={minValue}
              disabled={disabled}
              onChange={(e) => handleMinChange(Number(e.target.value))}
              className="w-full rounded-md border px-4 py-3 text-sm outline-none transition sm:text-base"
              style={{
                background: "var(--surface)",
                color: "var(--title)",
                borderColor: "var(--border)",
              }}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-[var(--title)]">
              {maxLabel}
            </p>
            <input
              type="number"
              min={minValue}
              max={max}
              step={step}
              value={maxValue}
              disabled={disabled}
              onChange={(e) => handleMaxChange(Number(e.target.value))}
              className="w-full rounded-md border px-4 py-3 text-sm outline-none transition sm:text-base"
              style={{
                background: "var(--surface)",
                color: "var(--title)",
                borderColor: "var(--border)",
              }}
            />
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .range-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          height: 22px;
          width: 22px;
          border-radius: 9999px;
          background: var(--surface);
          border: 3px solid var(--color-brand-500);
          box-shadow: 0 6px 18px rgba(var(--shadow-color), 0.18);
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .range-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.08);
        }

        .range-thumb::-moz-range-thumb {
          pointer-events: auto;
          height: 22px;
          width: 22px;
          border-radius: 9999px;
          background: var(--surface);
          border: 3px solid var(--color-brand-500);
          box-shadow: 0 6px 18px rgba(var(--shadow-color), 0.18);
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .range-thumb::-moz-range-thumb:hover {
          transform: scale(1.08);
        }

        .range-thumb::-webkit-slider-runnable-track {
          background: transparent;
        }

        .range-thumb::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default RangeSlider;
