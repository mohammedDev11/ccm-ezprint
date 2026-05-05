"use client";

import React, { createContext, useContext, useState } from "react";
import { IoIosAdd } from "react-icons/io";
import clsx from "clsx";

type FaqRootProps = {
  children: React.ReactNode;
  className?: string;
  allowMultiple?: boolean;
};

type FaqItemProps = {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
};

type FaqContextType = {
  openIds: Set<string>;
  toggle: (id: string) => void;
  allowMultiple: boolean;
};

const FaqContext = createContext<FaqContextType | null>(null);

function useFaqContext() {
  const ctx = useContext(FaqContext);
  if (!ctx) throw new Error("Faq.Item must be used inside <Faq />");
  return ctx;
}

const FaqRoot = ({
  children,
  className = "",
  allowMultiple = false,
}: FaqRootProps) => {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      const isOpen = next.has(id);

      if (allowMultiple) {
        if (isOpen) next.delete(id);
        else next.add(id);
        return next;
      }

      if (isOpen) return new Set();
      return new Set([id]);
    });
  };

  return (
    <FaqContext.Provider value={{ openIds, toggle, allowMultiple }}>
      <section className={clsx("w-full", className)}>
        <div className="grid items-start gap-4 sm:gap-5">{children}</div>
      </section>
    </FaqContext.Provider>
  );
};

const FaqItem = ({ id, title, children, className = "" }: FaqItemProps) => {
  const { openIds, toggle } = useFaqContext();
  const isOpen = openIds.has(id);

  return (
    <article
      className={clsx(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300",
        "bg-[var(--surface)] text-[var(--foreground)] shadow-surface",
        "hover:shadow-surface-md",
        className
      )}
    >
      {/* 🔥 Bottom glow line */}
      <span
        className={clsx(
          "pointer-events-none absolute bottom-0 left-0 h-[3px] w-full",
          "bg-gradient-to-r from-transparent via-brand-500 to-transparent",
          "opacity-40 blur-[2px] transition-all duration-300",
          isOpen && "opacity-100 blur-[1px]",
          "group-hover:opacity-80"
        )}
      />

      <button
        type="button"
        onClick={() => toggle(id)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
        aria-expanded={isOpen}
        aria-controls={`${id}-content`}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <span
            className={clsx(
              "grid h-10 w-10 shrink-0 place-items-center rounded-md text-white transition-all duration-300",
              "bg-gradient-to-b from-brand-300 via-brand-500 to-brand-700",
              "shadow-[0_6px_16px_rgba(var(--brand-rgb),0.28)]",
              "group-hover:shadow-[0_10px_24px_rgba(var(--brand-rgb),0.38)]",
              isOpen && "scale-[1.05] shadow-[0_12px_30px_rgba(var(--brand-rgb),0.46)]"
            )}
          >
            <span
              className={clsx(
                "block text-xl transition-transform duration-300",
                isOpen ? "rotate-45" : "rotate-0"
              )}
            >
              <IoIosAdd />
            </span>
          </span>

          <h3 className="text-sm font-semibold text-[var(--title)] sm:text-base">
            {title}
          </h3>
        </div>
      </button>

      {/* Content */}
      <div
        id={`${id}-content`}
        className={clsx(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 text-sm leading-7 text-[var(--paragraph)] sm:px-5 sm:pb-5">
            {children}
          </div>
        </div>
      </div>
    </article>
  );
};

export const Faq = Object.assign(FaqRoot, {
  Item: FaqItem,
});
