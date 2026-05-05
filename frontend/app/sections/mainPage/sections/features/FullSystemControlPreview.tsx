"use client";

import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  IconPrinter,
  IconWallet,
  IconChartBar,
  IconArrowUp,
} from "@tabler/icons-react";

const linePoints = [
  [0, 118],
  [62, 92],
  [118, 69],
  [182, 50],
  [230, 59],
  [280, 34],
  [300, 34],
] as const;

const FullSystemControlPreview = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const chartPath = useMemo(
    () =>
      "M0 118 C28 100, 40 94, 62 92 C82 89, 95 70, 118 69 C144 67, 154 48, 182 50 C203 52, 213 63, 230 59 C252 54, 262 48, 280 34 C289 28, 295 30, 300 34",
    []
  );

  return (
    <div className="relative mx-auto aspect-[1.18/1] w-full overflow-visible">
      {/* ambient glow */}
      <motion.div
        className="absolute left-1/2 top-1/2 z-0 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-100/40 blur-3xl"
        animate={{ scale: [1, 1.05, 1], opacity: [0.45, 0.6, 0.45] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* top left card */}
      <MiniCard
        id="jobs"
        activeCard={activeCard}
        setActiveCard={setActiveCard}
        className="absolute left-[2%] top-[2%] w-[36%]"
        icon={<IconPrinter size={16} className="text-brand-500" />}
        title="Print Jobs"
        value="42"
        change="12 today"
        floatY={[-3, 3, -3]}
        delay={0}
      />

      {/* top right card */}
      <MiniCard
        id="balance"
        activeCard={activeCard}
        setActiveCard={setActiveCard}
        className="absolute right-[2%] top-[8%] w-[34%]"
        icon={<IconWallet size={16} className="text-brand-500" />}
        title="Quota"
        value="127.50"
        change="+25.75"
        floatY={[3, -4, 3]}
        delay={0.4}
      />

      {/* bottom right card */}
      <MiniCard
        id="usage"
        activeCard={activeCard}
        setActiveCard={setActiveCard}
        className="absolute bottom-[6%] right-[10%] w-[34%]"
        icon={<IconChartBar size={16} className="text-brand-500" />}
        title="Usage"
        value="1.2k"
        suffix="pages"
        change="+18% this week"
        floatY={[-2, 4, -2]}
        delay={0.8}
      />

      {/* main board */}
      <motion.div
        className="absolute left-1/2 top-1/2 z-10 h-[64%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-[4.5%] shadow-surface-lg"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* charts row */}
        <div className="grid h-[46%] grid-cols-[34%_1fr] gap-[4%]">
          {/* pie */}
          <div className="flex items-center justify-center">
            <motion.div
              className="aspect-square w-[88%] rounded-full bg-[conic-gradient(var(--color-brand-500)_0_42%,var(--color-brand-300)_42%_68%,var(--color-warning-500)_68%_86%,var(--color-danger-500)_86%_100%)] shadow-[0_10px_25px_rgba(var(--brand-rgb),0.14)]"
              animate={{ rotate: [0, 6, 0] }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* line chart */}
          <div className="relative overflow-hidden rounded-xl bg-[linear-gradient(to_bottom,rgba(var(--brand-rgb),0.06),transparent)]">
            <div className="absolute inset-0 grid grid-cols-5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="border-l border-[rgba(148,163,184,0.12)]"
                />
              ))}
            </div>

            <div className="absolute inset-0 grid grid-rows-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="border-t border-[rgba(148,163,184,0.12)]"
                />
              ))}
            </div>

            <svg
              viewBox="0 0 300 140"
              className="absolute inset-0 h-full w-full"
              fill="none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(var(--brand-rgb),0.34)" />
                  <stop offset="100%" stopColor="rgba(var(--brand-rgb),0.06)" />
                </linearGradient>
              </defs>

              <motion.path
                d="M0 118 C28 100, 40 94, 62 92 C82 89, 95 70, 118 69 C144 67, 154 48, 182 50 C203 52, 213 63, 230 59 C252 54, 262 48, 280 34 C289 28, 295 30, 300 34 L300 140 L0 140 Z"
                fill="url(#usageFill)"
                animate={{ opacity: [0.75, 1, 0.75] }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <motion.path
                d={chartPath}
                stroke="var(--color-brand-500)"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.2, ease: "easeOut" }}
              />

              {linePoints.slice(1, -1).map(([cx, cy], i) => (
                <motion.circle
                  key={`${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  r="5"
                  fill="var(--color-brand-500)"
                  animate={{ scale: [1, 1.18, 1] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.18,
                  }}
                />
              ))}
            </svg>
          </div>
        </div>

        {/* legend */}
        <div className="mt-[4%] flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-medium text-[var(--paragraph)] sm:text-xs">
          <LegendDot color="bg-brand-500" label="Printed" />
          <LegendDot color="bg-warning-500" label="Pending" />
          <LegendDot color="bg-danger-500" label="Canceled" />
          <LegendDot color="bg-brand-200" label="Failed" />
        </div>

        {/* jobs */}
        <div className="mt-[4%] rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-[4%] shadow-surface">
          <div className="space-y-[10px]">
            {[1, 2, 3].map((item, index) => (
              <motion.div
                key={item}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3"
                animate={{ x: [0, 2, 0] }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.22,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-50">
                    <IconPrinter size={14} className="text-brand-500" />
                  </div>

                  <div className="w-full min-w-0">
                    <motion.div
                      className="h-2 w-[70%] rounded-full bg-brand-100"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.15,
                      }}
                    />
                    <motion.div
                      className="mt-1.5 h-2 w-[48%] rounded-full bg-brand-50"
                      animate={{ opacity: [0.5, 0.9, 0.5] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.2 + index * 0.15,
                      }}
                    />
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-[var(--title)] sm:text-xs">
                  42
                </span>

                <div className="flex items-center gap-2">
                  <motion.span
                    className={`h-2.5 w-2.5 rounded-full ${
                      index === 0
                        ? "bg-success-500"
                        : index === 1
                        ? "bg-warning-500"
                        : "bg-danger-500"
                    }`}
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2,
                    }}
                  />
                  <div className="h-2 w-6 rounded-full bg-brand-100" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

type MiniCardProps = {
  id: string;
  activeCard: string | null;
  setActiveCard: (id: string | null) => void;
  className?: string;
  icon: React.ReactNode;
  title: string;
  value: string;
  suffix?: string;
  change: string;
  floatY: number[];
  delay?: number;
};

const MiniCard = ({
  id,
  activeCard,
  setActiveCard,
  className = "",
  icon,
  title,
  value,
  suffix,
  change,
  floatY,
  delay = 0,
}: MiniCardProps) => {
  const isActive = activeCard === id;

  return (
    <motion.div
      onHoverStart={() => setActiveCard(id)}
      onHoverEnd={() => setActiveCard(null)}
      className={`${className} cursor-pointer`}
      animate={
        isActive
          ? {
              y: 0,
              scale: 1.1,
              zIndex: 50,
            }
          : {
              y: floatY,
              scale: 1,
              zIndex: 30,
            }
      }
      transition={
        isActive
          ? { duration: 0.22, ease: "easeOut" }
          : {
              y: {
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
              },
              scale: { duration: 0.22, ease: "easeOut" },
            }
      }
      whileHover={{
        scale: 1.1,
        y: -4,
        zIndex: 50,
      }}
      style={{ transformOrigin: "center center" }}
    >
      <div
        className={`rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-[7%] transition-shadow duration-300 ${
          isActive
            ? "shadow-surface-lg"
            : "shadow-[0_10px_28px_rgba(var(--brand-rgb),0.14)]"
        }`}
      >
        <div className="mb-2.5 flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-50">
            {icon}
          </div>
          <p className="truncate text-xs font-semibold text-[var(--title)] sm:text-sm">
            {title}
          </p>
        </div>

        <div className="flex items-end gap-1.5">
          <h3 className="text-xl font-bold leading-none tracking-tight text-[var(--title)] sm:text-2xl">
            {value}
          </h3>
          {suffix ? (
            <span className="pb-0.5 text-[10px] font-medium text-[var(--paragraph)] sm:text-xs">
              {suffix}
            </span>
          ) : null}
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-brand-500">
          <IconArrowUp size={12} />
          <span className="text-[10px] font-semibold sm:text-xs">{change}</span>
        </div>
      </div>
    </motion.div>
  );
};

const LegendDot = ({ color, label }: { color: string; label: string }) => {
  return (
    <motion.div
      className="flex items-center gap-1.5"
      animate={{ y: [0, -1, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span>{label}</span>
    </motion.div>
  );
};

export default FullSystemControlPreview;
