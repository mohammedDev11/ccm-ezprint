"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  IconLock,
  IconShieldCheck,
  IconPrinter,
  IconFileText,
  IconArrowUp,
} from "@tabler/icons-react";

const SecurePrintQueuePreview = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const jobs = [
    { name: "Document.pdf", status: "Queued" },
    { name: "Report.docx", status: "Waiting" },
    { name: "Slides.pptx", status: "Secured" },
  ];

  return (
    <div className="relative mx-auto aspect-[1.16/1] w-full overflow-visible">
      <motion.div
        className="absolute left-1/2 top-1/2 z-0 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-100/40 blur-3xl"
        animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.58, 0.4] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
      />

      <MiniCard
        id="encrypted"
        activeCard={activeCard}
        setActiveCard={setActiveCard}
        className="absolute left-[1%] top-[5%] z-30 w-[34%]"
        icon={<IconShieldCheck size={16} className="text-brand-500" />}
        title="Encrypted"
        value="AES-256"
        change="Protected"
        floatY={[-3, 3, -3]}
        delay={0}
      />

      <motion.div
        className="absolute left-1/2 top-[54%] z-10 h-[62%] w-[64%] -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-[4.5%] shadow-surface-lg"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative flex h-[56%] items-center justify-center overflow-hidden rounded-[20px] border border-[var(--border)] bg-[linear-gradient(to_bottom,rgba(var(--brand-rgb),0.08),rgba(var(--brand-rgb),0.02))]">
          <motion.div
            className="absolute h-[64%] w-[64%] rounded-full border border-brand-200/60"
            animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute h-[84%] w-[84%] rounded-full border border-brand-100"
            animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.5, 0.25] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="absolute left-[8%] top-1/2 h-[2px] w-[18%] -translate-y-1/2 rounded-full bg-brand-200"
            animate={{ scaleX: [0.55, 1, 0.55], opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "left center" }}
          />
          <motion.div
            className="absolute right-[8%] top-1/2 h-[2px] w-[18%] -translate-y-1/2 rounded-full bg-brand-200"
            animate={{ scaleX: [0.55, 1, 0.55], opacity: [0.35, 1, 0.35] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.35,
            }}
            style={{ transformOrigin: "right center" }}
          />

          <motion.div
            className="relative z-10 flex h-[86px] w-[86px] items-center justify-center rounded-[22px] bg-brand-gradient shadow-brand sm:h-[96px] sm:w-[96px]"
            animate={{ y: [0, -3, 0], rotate: [0, 1.5, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-[8px] rounded-[16px] border border-white/25" />
            <IconLock size={34} className="text-white sm:size-[38px]" />
          </motion.div>
        </div>

        <div className="mt-[5%] grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
          <FlowNode
            icon={<IconFileText size={14} className="text-brand-500" />}
            label="Upload"
            delay={0}
          />
          <FlowArrow delay={0.1} />
          <FlowNode
            icon={<IconLock size={14} className="text-brand-500" />}
            label="Queue"
            delay={0.2}
          />
          <FlowArrow delay={0.3} />
          <FlowNode
            icon={<IconPrinter size={14} className="text-brand-500" />}
            label="Release"
            delay={0.4}
          />
        </div>
      </motion.div>

      <motion.div
        className="absolute right-[2%] top-[8%] z-40 w-[42%] rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-[4%] shadow-surface-lg"
        animate={{ y: [0, -4, 0] }}
        transition={{
          duration: 3.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4,
        }}
      >
        <div className="space-y-[10px]">
          {jobs.map((item, index) => (
            <motion.div
              key={item.name}
              className="grid grid-cols-[1fr_auto] items-center gap-3"
              animate={{ x: [0, 2, 0] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.18,
              }}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-50">
                  <IconFileText size={14} className="text-brand-500" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[10px] font-semibold text-[var(--title)] sm:text-xs">
                    {item.name}
                  </div>
                  <motion.div
                    className="mt-1.5 h-2 w-[58%] rounded-full bg-brand-100"
                    animate={{ opacity: [0.55, 1, 0.55] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.12,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-full bg-brand-50 px-2 py-1">
                <motion.span
                  className="h-2 w-2 rounded-full bg-success-500"
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.16,
                  }}
                />
                <span className="text-[10px] font-semibold text-brand-600">
                  {item.status}
                </span>
              </div>
            </motion.div>
          ))}
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
          ? { y: 0, scale: 1.1, zIndex: 50 }
          : { y: floatY, scale: 1, zIndex: 30 }
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
      whileHover={{ scale: 1.1, y: -4, zIndex: 50 }}
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
          <h3 className="text-sm font-bold leading-none tracking-tight text-[var(--title)] sm:text-xl">
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

const FlowNode = ({
  icon,
  label,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  delay?: number;
}) => {
  return (
    <motion.div
      className="flex flex-col items-center gap-1.5"
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 sm:h-9 sm:w-9">
        {icon}
      </div>
      <span className="text-[9px] font-semibold text-[var(--paragraph)] sm:text-[10px]">
        {label}
      </span>
    </motion.div>
  );
};

const FlowArrow = ({ delay = 0 }: { delay?: number }) => {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="h-[2px] w-full rounded-full bg-brand-200"
        animate={{ scaleX: [0.4, 1, 0.4], opacity: [0.3, 1, 0.3] }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
        style={{ transformOrigin: "left center" }}
      />
    </div>
  );
};

export default SecurePrintQueuePreview;
