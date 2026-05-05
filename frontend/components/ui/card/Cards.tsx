"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import React from "react";

type CardsGridItem = {
  id: string;
  content: React.ReactNode;
  href?: string;
};

type CardsGridProps = {
  items: CardsGridItem[];
  className?: string;
  cardClassName?: string;
};

export const CardsGrid = ({
  items,
  className,
  cardClassName,
}: CardsGridProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {items.map((item, idx) => {
        const Wrapper = item.href ? "a" : "div";

        return (
          <Wrapper
            key={item.id}
            {...(item.href ? { href: item.href } : {})}
            className="group relative block h-full w-full"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <AnimatePresence mode="wait">
              {hoveredIndex === idx && (
                <motion.span
                  layoutId="hoverBackground"
                  className="absolute inset-0 rounded-md border border-[var(--color-brand-200)] bg-[var(--surface-2)] shadow-brand"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: { duration: 0.18 },
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.98,
                    transition: { duration: 0.15 },
                  }}
                />
              )}
            </AnimatePresence>

            <div
              className={cn(
                "card relative z-10 h-full w-full overflow-hidden rounded-md p-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[var(--color-brand-300)] group-hover:shadow-surface-md",
                cardClassName
              )}
            >
              {item.content}
            </div>
          </Wrapper>
        );
      })}
    </div>
  );
};
