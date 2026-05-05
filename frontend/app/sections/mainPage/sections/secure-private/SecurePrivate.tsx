"use client";

import React from "react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import SectionHeader from "../../components/SectionHeader";
import {
  IconLock,
  IconShieldCheck,
  IconEyeOff,
  IconFileCheck,
} from "@tabler/icons-react";
import { ContainerScroll } from "../../components/ui/container-scroll-animation";

const items = [
  {
    title: "Secure Print Release",
    description:
      "Jobs remain protected until you authenticate and release them at the printer.",
    subtitle: "Authentication required",
    icon: IconLock,
    hover: { x: 26, y: 18, rotate: 4, scale: 1.04 },
  },
  {
    title: "Private File Access",
    description:
      "Only the original uploader can access a file before printing begins.",
    subtitle: "Uploader-only access",
    icon: IconEyeOff,
    hover: { x: -26, y: 18, rotate: -4, scale: 1.04 },
  },
  {
    title: "Automatic File Deletion",
    description:
      "Files are removed after printing or once the retention period expires.",
    subtitle: "Auto cleanup enabled",
    icon: IconFileCheck,
    hover: { x: 26, y: -18, rotate: 4, scale: 1.04 },
  },
  {
    title: "Role-Based Protection",
    description:
      "Permissions control access to jobs, files, and administrative actions.",
    subtitle: "Access by permission",
    icon: IconShieldCheck,
    hover: { x: -26, y: -18, rotate: -4, scale: 1.04 },
  },
];

const SecurePrivate = () => {
  const { resolvedTheme, theme } = useTheme();
  const isDarkMode = resolvedTheme === "dark" || theme === "dark";
  const dashboardPreview = isDarkMode
    ? "/mainPage/hero/dashboad_dark.png"
    : "/mainPage/hero/dashboaed_light.png";

  return (
    <section id="secure-private" className="relative overflow-hidden">
      {/* top scroll showcase */}
      <ContainerScroll
        className="pb-0"
        titleComponent={
          <SectionHeader
            title="Secure & Private"
            description="EzPrint protects every document from upload to release with secure queues, controlled access, and privacy-first handling."
            align="center"
          />
        }
      >
        <img
          src={dashboardPreview}
          alt="EzPrint secure dashboard preview"
          className="block h-auto w-full object-contain"
          draggable={false}
        />
      </ContainerScroll>

      {/* cards section */}
      <div className="pt-0">
        <div className="container">
          <div className="space-y-8 sm:space-y-10">
            <div className="relative mx-auto max-w-7xl rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-2 sm:rounded-[28px] sm:p-3 lg:rounded-[36px] lg:p-5">
              <div className="grid gap-2 sm:gap-3 lg:grid-cols-2">
                {items.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={index}
                      className="group relative min-h-[240px] sm:min-h-[270px] lg:min-h-[320px]"
                    >
                      <div
                        className="pointer-events-none absolute inset-0 z-0 rounded-[22px] border border-[var(--border)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:rounded-[26px] lg:rounded-[30px]"
                        style={{
                          background:
                            "repeating-linear-gradient(-45deg, transparent 0px, transparent 7px, rgba(148,163,184,0.08) 7px, rgba(148,163,184,0.08) 11px)",
                        }}
                      />

                      <motion.div
                        initial={false}
                        whileHover={{
                          x: item.hover.x,
                          y: item.hover.y,
                          rotate: item.hover.rotate,
                          scale: item.hover.scale,
                        }}
                        transition={{
                          duration: 0.28,
                          ease: "easeOut",
                        }}
                        className="relative z-10 flex h-full flex-col justify-between rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-surface transition-shadow duration-300 will-change-transform group-hover:z-30 group-hover:shadow-surface-lg sm:rounded-[26px] sm:p-6 lg:rounded-[30px] lg:p-8"
                      >
                        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                          <div className="max-w-full sm:max-w-[95%]">
                            <h3 className="text-xl font-medium leading-[1.35] tracking-[-0.02em] text-[var(--title)] sm:text-2xl lg:text-[32px]">
                              {item.title}
                            </h3>
                          </div>

                          <p className="max-w-full text-sm leading-7 text-[var(--paragraph)] sm:max-w-[95%] sm:text-base sm:leading-8 lg:max-w-[90%] lg:text-lg">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 pt-6 sm:gap-4 sm:pt-8">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 sm:h-12 sm:w-12 lg:h-14 lg:w-14">
                            <Icon
                              size={22}
                              stroke={1.8}
                              className="sm:hidden"
                            />
                            <Icon
                              size={24}
                              stroke={1.8}
                              className="hidden sm:block lg:hidden"
                            />
                            <Icon
                              size={26}
                              stroke={1.8}
                              className="hidden lg:block"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-base font-semibold tracking-tight text-[var(--title)] sm:text-lg lg:text-xl">
                              EzPrint Security
                            </p>
                            <p className="truncate text-sm text-[var(--muted)] sm:text-base">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecurePrivate;
