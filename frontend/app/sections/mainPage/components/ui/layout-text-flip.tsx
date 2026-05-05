"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";

type LayoutTextFlipProps = {
  text?: string;
  words?: string[];
  duration?: number;
  className?: string;
  textClassName?: string;
  flipClassName?: string;
};

export const LayoutTextFlip = ({
  text = "Smart Printing,",
  words = ["Simplified", "Secure", "Modern", "Fast"],
  duration = 3000,
  className,
  textClassName,
  flipClassName,
}: LayoutTextFlipProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!words.length) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [words, duration]);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:flex-wrap",
        className
      )}
    >
      <motion.span
        layoutId="layout-text-flip-static"
        className={cn("title-xl", textClassName)}
      >
        {text}
      </motion.span>

      <motion.span
        layout
        className={cn(
          "relative inline-flex min-h-[56px] items-center overflow-hidden rounded-md px-4 py-2 shadow sm:min-h-[64px] sm:px-5",
          flipClassName
        )}
        style={{
          background: "var(--surface)",
        }}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={currentIndex}
            initial={{ y: -32, opacity: 0, filter: "blur(8px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: 32, opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.45 }}
            className="inline-block whitespace-nowrap text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, var(--color-brand-300), var(--color-brand-500), var(--color-brand-700))",
            }}
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </div>
  );
};
