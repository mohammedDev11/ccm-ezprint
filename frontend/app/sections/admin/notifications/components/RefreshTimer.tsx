"use client";

import React from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { TOTAL_SECONDS } from "@/lib/mock-data/Admin/notifications";

type RefreshTimerProps = {
  secondsLeft: number;
  onRefreshNow: () => void;
};

export default function RefreshTimer({
  secondsLeft,
  onRefreshNow,
}: RefreshTimerProps) {
  const progress = secondsLeft / TOTAL_SECONDS;
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);
  const done = secondsLeft === 0;

  return (
    <button
      type="button"
      onClick={onRefreshNow}
      className="btn-secondary h-12 gap-3 px-4"
    >
      <span className="relative flex h-6 w-6 items-center justify-center">
        {done ? (
          <CheckCircle2 className="h-5 w-5 text-success-500" />
        ) : (
          <>
            <svg className="h-6 w-6 -rotate-90" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r={radius}
                fill="none"
                stroke="rgba(148,163,184,0.25)"
                strokeWidth="4"
              />
              <circle
                cx="20"
                cy="20"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="text-brand-500 transition-all duration-1000 ease-linear"
              />
            </svg>
            <RefreshCw className="absolute h-3.5 w-3.5 text-brand-500" />
          </>
        )}
      </span>

      <span className="font-medium">
        {done ? "Updated" : `${secondsLeft}s`}
      </span>
    </button>
  );
}