"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineBars3, HiOutlineXMark } from "react-icons/hi2";
import favicon from "@/app/favicon.ico";
import { cn } from "@/lib/cn";
import type { SidebarSection } from "@/lib/mock-data/Navbar";
import ThemeToggle from "../../actions/ThemeToggle";
import Logo from "../Logo";

type MobileNavbarProps = {
  sections: SidebarSection[];
};

export default function MobileNavbar({ sections }: MobileNavbarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[70] border-b bg-[var(--surface)] px-4 py-3 md:hidden ">
        <div
          className="mx-auto flex max-w-[1700px] items-center justify-between "
          style={{ borderColor: "var(--border)" }}
        >
          <Logo />

          <div className="flex items-center gap-2 ">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border bg-[var(--surface)] text-[var(--foreground)] transition hover:bg-[var(--surface-2)]"
              style={{ borderColor: "var(--border)" }}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? (
                <HiOutlineXMark className="text-[1.45rem]" />
              ) : (
                <HiOutlineBars3 className="text-[1.45rem]" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[65] bg-black/45 md:hidden"
              aria-label="Close mobile menu overlay"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed right-0 top-0 z-[80] flex h-screen w-[88%] max-w-[340px] flex-col border-l bg-[var(--surface)] px-4 pb-6 pt-5 md:hidden"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Logo />
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border transition hover:bg-[var(--surface-2)]"
                  style={{ borderColor: "var(--border)" }}
                  aria-label="Close menu"
                >
                  <HiOutlineXMark className="text-[1.35rem]" />
                </button>
              </div>

              <div className="ezprint-sidebar-scroll flex-1 space-y-6 overflow-y-auto">
                {sections.map((section, sectionIndex) => (
                  <div key={section.title}>
                    <p className="text-muted mb-3 text-xs font-semibold tracking-[0.22em] uppercase">
                      {section.title}
                    </p>

                    <div className="space-y-2">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const active =
                          pathname === item.href ||
                          pathname.startsWith(`${item.href}/`);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex h-12 items-center gap-3 rounded-md px-3 transition",
                              active
                                ? "inverse-surface"
                                : "text-[var(--paragraph)]  hover:text-[var(--foreground)]"
                            )}
                          >
                            <Icon className={cn("text-[1.35rem]")} />
                            <span
                              className={cn(
                                "text-[1rem] font-medium",
                                active && "font-semibold"
                              )}
                            >
                              {item.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>

                    {sectionIndex !== sections.length - 1 && (
                      <div
                        className="mt-4 h-px w-full"
                        style={{ background: "var(--border)" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
