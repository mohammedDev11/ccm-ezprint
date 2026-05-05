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
import Button from "@/components/ui/button/Button";

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
      className="relative min-h-screen overflow-hidden bg-[var(--color-surface)] text-[var(--color-text)]"
    >
      {/* content */}
      <div className="container relative z-10 flex min-h-screen flex-col justify-start px-4 pt-28 pb-10 sm:pt-32 lg:pt-36">
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
        className="max-w-5xl text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl lg:text-7xl"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="mt-6 max-w-3xl text-base leading-8 text-[var(--color-text-muted)] sm:text-lg"
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
          {primaryAction && (
            <Button>
              <Link href={primaryAction.href}>{primaryAction.label}</Link>
            </Button>
          )}

          {secondaryAction && (
            <Button variant="secondary">
              <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
            </Button>
          )}
        </motion.div>
      )}
    </div>
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
