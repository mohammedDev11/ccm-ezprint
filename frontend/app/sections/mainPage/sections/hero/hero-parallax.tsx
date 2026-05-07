"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  MotionValue,
} from "motion/react";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/cn";

type Product = {
  title: string;
  link: string;
  thumbnail: string;
  lightThumbnail?: string;
  darkThumbnail?: string;
};

type HeroParallaxProps = {
  products: Product[];
  title?: React.ReactNode;
  description?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
};

export const HeroParallax = ({
  products,
  title = <>Welcome to EzPrint</>,
  description = "Manage your print jobs, upload files easily, and print with a modern experience designed to be simple, secure, and efficient.",
  primaryAction,
  secondaryAction,
}: HeroParallaxProps) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);

  const ref = React.useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 140, damping: 24 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 260]),
    springConfig
  );

  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -260]),
    springConfig
  );

  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.22], [14, 0]),
    springConfig
  );

  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.22], [-7, 0]),
    springConfig
  );

  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.18], [0.55, 1]),
    springConfig
  );

  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.22], [-90, 60]),
    springConfig
  );

  return (
    <section
      ref={ref}
      className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]"
    >
      {/* content */}
      <div className="relative z-10 flex min-h-screen w-full flex-col justify-start px-4 pt-28 pb-10 sm:px-6 sm:pt-32 lg:px-8 lg:pt-36">
        <Header
          title={title}
          description={description}
          primaryAction={primaryAction}
          secondaryAction={secondaryAction}
        />

        <motion.div
          style={{
            rotateX,
            rotateZ,
            y: translateY,
            opacity,
          }}
          className="mt-10 [perspective:1200px] [transform-style:preserve-3d] sm:mt-12 lg:mt-24"
        >
          <motion.div className="mb-5 flex flex-row-reverse gap-4 lg:mb-7 lg:gap-7">
            {firstRow.map((product) => (
              <ProductCard
                key={product.title}
                product={product}
                translate={translateX}
              />
            ))}
          </motion.div>

          <motion.div className="mb-5 flex flex-row gap-4 lg:mb-7 lg:gap-7">
            {secondRow.map((product) => (
              <ProductCard
                key={product.title}
                product={product}
                translate={translateXReverse}
              />
            ))}
          </motion.div>

          <motion.div className="flex flex-row-reverse gap-4 lg:gap-7">
            {thirdRow.map((product) => (
              <ProductCard
                key={product.title}
                product={product}
                translate={translateX}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

type HeaderProps = {
  title: React.ReactNode;
  description: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
};

const Header = ({
  title,
  description,
  primaryAction,
  secondaryAction,
}: HeaderProps) => {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl text-4xl font-bold tracking-normal text-[var(--foreground)] sm:text-5xl lg:text-7xl"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="mt-6 max-w-3xl text-base leading-8 text-[var(--paragraph)] sm:text-lg"
      >
        {description}
      </motion.p>

      {(primaryAction || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14 }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          {primaryAction && <HeroActionLink action={primaryAction} />}

          {secondaryAction && (
            <HeroActionLink action={secondaryAction} variant="secondary" />
          )}
        </motion.div>
      )}
    </div>
  );
};

const HeroActionLink = ({
  action,
  variant = "primary",
}: {
  action: {
    label: string;
    href: string;
  };
  variant?: "primary" | "secondary";
}) => {
  const isPrimary = variant === "primary";

  return (
    <Link
      href={action.href}
      className={cn(
        "group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 sm:px-6 sm:text-base",
        isPrimary
          ? "bg-[linear-gradient(135deg,var(--color-brand-400),var(--color-brand-600))] text-white shadow-[0_16px_36px_rgba(var(--brand-rgb),0.3)] hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(var(--brand-rgb),0.36)] active:translate-y-0"
          : "border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] text-[var(--foreground)] shadow-surface hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--color-brand-500)_34%,var(--border))] hover:bg-[color-mix(in_srgb,var(--color-brand-500)_9%,var(--surface))] active:translate-y-0"
      )}
    >
      <span>{action.label}</span>
      {isPrimary ? (
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      ) : (
        <LayoutDashboard className="h-4 w-4" />
      )}
    </Link>
  );
};

const ProductCard = ({
  product,
  translate,
}: {
  product: Product;
  translate: MotionValue<number>;
}) => {
  const { resolvedTheme, theme } = useTheme();
  const isDarkMode = resolvedTheme === "dark" || theme === "dark";
  const thumbnail = isDarkMode
    ? product.darkThumbnail || product.thumbnail
    : product.lightThumbnail || product.thumbnail;

  return (
    <motion.div
      style={{ x: translate }}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.25 }}
      className="group relative h-44 w-[17rem] shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl sm:h-52 sm:w-[20rem] lg:h-72 lg:w-[26rem]"
    >
      <a href={product.link} className="block h-full w-full">
        <img
          src={thumbnail}
          alt={product.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </a>

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90" />

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-white sm:text-xl">
          {product.title}
        </h3>
      </div>
    </motion.div>
  );
};
