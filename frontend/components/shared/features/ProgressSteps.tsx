"use client";

import { useScroll, useTransform, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

interface ProgressStepsEntry {
  title: string;
  content: React.ReactNode;
}

interface ProgressStepsProps {
  data: ProgressStepsEntry[];
  title?: string;
  description?: string;
}

export const ProgressSteps = ({
  data,
  title = "",
  description = "",
}: ProgressStepsProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current) {
        setHeight(contentRef.current.getBoundingClientRect().height);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 20%", "end 75%"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], [0, height]);
  const lineOpacity = useTransform(scrollYProgress, [0, 0.08], [0, 1]);

  return (
    <section ref={containerRef} className=" w-full bg-transparent">
      <div className="container">
        <div ref={contentRef} className="relative mx-auto mt-16 max-w-6xl">
          {/* base line */}
          <div className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-transparent via-[var(--border)] to-transparent md:left-1/2 md:-translate-x-1/2" />

          {/* animated line */}
          <div className="pointer-events-none absolute left-5 top-0 h-full w-px overflow-hidden md:left-1/2 md:-translate-x-1/2">
            <motion.div
              style={{
                height: lineHeight,
                opacity: lineOpacity,
              }}
              className="w-px bg-gradient-to-b from-brand-500 via-brand-400 to-transparent"
            />
          </div>

          <div className="space-y-12 md:space-y-20">
            {data.map((item, index) => {
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={index}
                  className="relative grid grid-cols-1 md:grid-cols-2 md:gap-16"
                >
                  {/* center dot */}
                  <div className="absolute left-5 top-6 z-20 md:left-1/2 md:-translate-x-1/2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] shadow-surface">
                      <div className="h-3.5 w-3.5 rounded-full bg-brand-500" />
                    </div>
                  </div>

                  {/* left side */}
                  <div
                    className={[
                      "pl-20 md:pl-0",
                      isLeft
                        ? "md:pr-14 md:text-right"
                        : "md:col-start-2 md:pl-14 md:text-left",
                    ].join(" ")}
                  >
                    <div className="sticky top-28">
                      <h3 className="text-2xl font-bold tracking-tight text-[var(--title)] md:text-4xl">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* right side */}
                  <div
                    className={[
                      "mt-5 pl-20 md:mt-0 md:pl-0",
                      isLeft
                        ? "md:col-start-2 md:pl-14"
                        : "md:row-start-1 md:pr-14",
                    ].join(" ")}
                  >
                    {item.content}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
