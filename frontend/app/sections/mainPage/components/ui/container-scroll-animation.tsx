"use client";

import React, { useRef } from "react";
import { motion, MotionValue, useScroll, useTransform } from "motion/react";

type ContainerScrollProps = {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export const ContainerScroll = ({
  titleComponent,
  children,
  className = "",
}: ContainerScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const rotateX = useTransform(
    scrollYProgress,
    [0, 1],
    isMobile ? [14, 0] : [18, 0]
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    isMobile ? [0.92, 1] : [0.98, 1]
  );
  const translateY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const cardTranslateY = useTransform(scrollYProgress, [0, 1], [0, -36]);

  return (
    <section
      ref={containerRef}
      className={`relative flex min-h-[900px] items-center justify-center overflow-hidden py-16 sm:py-24 lg:min-h-[1100px] lg:py-32 ${className}`}
    >
      <div
        className="container relative z-10"
        style={{
          perspective: "1400px",
        }}
      >
        <Header translate={translateY} titleComponent={titleComponent} />

        <Card rotate={rotateX} scale={scale} translate={cardTranslateY}>
          {children}
        </Card>
      </div>
    </section>
  );
};

const Header = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>;
  titleComponent: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="mx-auto max-w-5xl text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

const Card = ({
  rotate,
  scale,
  translate,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        translateY: translate,
        transformStyle: "preserve-3d",
      }}
      className="relative mx-auto mt-10 w-full max-w-6xl"
    >
      {/* outer glow */}

      {/* device frame */}
      <div
        className="relative rounded-[2rem] border p-2 md:p-3"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: `
            0 10px 30px rgba(var(--shadow-color), 0.08),
            0 24px 60px rgba(var(--shadow-color), 0.16),
            0 60px 120px rgba(var(--shadow-color), 0.18)
          `,
        }}
      >
        {/* top bar */}
        <div
          className="mb-2 flex h-9 items-center gap-2 rounded-[1rem] border px-4 md:mb-3"
          style={{
            background: "var(--surface-2)",
            borderColor: "var(--border)",
          }}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-danger-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-success-500/80" />
          <div
            className="ml-3 h-2 flex-1 rounded-full"
            style={{ background: "var(--border)" }}
          />
        </div>

        {/* content area */}
        <div
          className="overflow-hidden rounded-[1.35rem] border"
          style={{
            background: "var(--background)",
            borderColor: "var(--border)",
          }}
        >
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
