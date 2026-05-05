"use client";

import React from "react";
import clsx from "clsx";
import { motion } from "motion/react";

type SectionHeaderProps = {
  title: string;
  description?: string;
  align?: "left" | "center";
  size?: "sm" | "md" | "lg";
  animated?: boolean; // 👈 NEW
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

const sizeStyles = {
  sm: {
    title: "title-md text-lg sm:text-xl",
    description: "paragraph text-sm sm:text-base",
    spacing: "gap-1",
    maxWidth: "max-w-xl",
  },
  md: {
    title: "title-lg text-2xl sm:text-3xl lg:text-4xl",
    description: "paragraph-lg text-base sm:text-lg",
    spacing: "gap-2",
    maxWidth: "max-w-2xl",
  },
  lg: {
    title: "title-xl text-4xl sm:text-5xl lg:text-6xl",
    description: "paragraph-lg text-base sm:text-lg lg:text-xl",
    spacing: "gap-3",
    maxWidth: "max-w-2xl",
  },
};

const SectionHeader = ({
  title,
  description,
  align = "left",
  size = "md",
  animated = true, // 👈 default TRUE
  className = "",
  titleClassName = "",
  descriptionClassName = "",
}: SectionHeaderProps) => {
  const styles = sizeStyles[size];

  const Wrapper = animated ? motion.div : "div";
  const Title = animated ? motion.h1 : "h1";
  const Description = animated ? motion.p : "p";

  return (
    <Wrapper
      className={clsx(
        "flex flex-col",
        styles.spacing,
        align === "left" && "items-start text-left",
        align === "center" && "items-center text-center",
        className
      )}
      {...(animated && {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-50px" },
        transition: { duration: 0.5 },
      })}
    >
      <Title
        className={clsx(styles.title, titleClassName)}
        {...(animated && {
          transition: { delay: 0.1 },
        })}
      >
        {title}
      </Title>

      {description && (
        <Description
          className={clsx(
            styles.description,
            styles.maxWidth,
            descriptionClassName
          )}
          {...(animated && {
            initial: { opacity: 0, y: 20 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            transition: { delay: 0.2, duration: 0.4 },
          })}
        >
          {description}
        </Description>
      )}
    </Wrapper>
  );
};

export default SectionHeader;
