// "use client";

// import React, { useEffect, useState } from "react";
// import { motion } from "motion/react";

// export type CardStackItem = {
//   id: number;
//   name: string;
//   designation: string;
//   content: React.ReactNode;
// };

// type CardStackProps = {
//   items: CardStackItem[];
//   offset?: number;
//   scaleFactor?: number;
//   className?: string;
// };

// export const CardStack = ({
//   items,
//   offset = 10,
//   scaleFactor = 0.06,
//   className = "",
// }: CardStackProps) => {
//   const [cards, setCards] = useState<CardStackItem[]>(items);

//   useEffect(() => {
//     if (!items.length) return;

//     setCards(items);

//     const interval = setInterval(() => {
//       setCards((prevCards) => {
//         if (prevCards.length <= 1) return prevCards;
//         const newArray = [...prevCards];
//         newArray.unshift(newArray.pop()!);
//         return newArray;
//       });
//     }, 5000);

//     return () => clearInterval(interval);
//   }, [items]);

//   return (
//     <div
//       className={`relative h-[160px] w-[280px] sm:h-[170px] sm:w-[320px] ${className}`}
//     >
//       {cards.map((card, index) => (
//         <motion.div
//           key={card.id}
//           className="
//             absolute flex h-[160px] w-[280px] flex-col justify-between rounded-[24px]
//             border border-white/10 bg-[var(--surface)] p-4 shadow-xl
//             sm:h-[170px] sm:w-[320px]
//           "
//           style={{ transformOrigin: "top center" }}
//           animate={{
//             top: index * -offset,
//             scale: 1 - index * scaleFactor,
//             zIndex: cards.length - index,
//           }}
//           transition={{ duration: 0.35, ease: "easeOut" }}
//         >
//           <div className="text-sm leading-6 text-[var(--paragraph)]">
//             {card.content}
//           </div>

//           <div className="mt-4">
//             <p className="text-sm font-semibold text-[var(--title)]">
//               {card.name}
//             </p>
//             <p className="text-xs text-[var(--muted)]">{card.designation}</p>
//           </div>
//         </motion.div>
//       ))}
//     </div>
//   );
// };

// ===========NEW===========
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

export type CardStackItem = {
  id: number;
  name: string;
  designation: string;
  content: React.ReactNode;
};

type CardStackProps = {
  items: CardStackItem[];
  offset?: number;
  scaleFactor?: number;
  className?: string;
  autoRotateMs?: number;
};

export const CardStack = ({
  items,
  offset = 10,
  scaleFactor = 0.06,
  className = "",
  autoRotateMs = 5000,
}: CardStackProps) => {
  const [cards, setCards] = useState<CardStackItem[]>(items);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCards(items);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [items]);

  const goNext = useCallback(() => {
    setCards((prev) => {
      if (prev.length <= 1) return prev;
      const arr = [...prev];
      arr.unshift(arr.pop()!);
      return arr;
    });
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      goNext();
    }, autoRotateMs);
  }, [goNext, autoRotateMs]);

  const pauseTimer = useCallback(() => {
    if (!timerRef.current) return;

    clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const resumeTimer = useCallback(() => {
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    startTimer();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  return (
    <div
      className={cn(
        "relative h-[220px] w-[280px] sm:h-[240px] sm:w-[320px]",
        className
      )}
      onMouseEnter={() => {
        pauseTimer();
      }}
      onMouseLeave={() => {
        resumeTimer();
      }}
      onTouchStart={() => {
        pauseTimer();
      }}
      onTouchEnd={() => {
        resumeTimer();
      }}
    >
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          className="
            absolute flex h-[220px] w-[280px] flex-col justify-between rounded-[24px]
            border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xl
            sm:h-[240px] sm:w-[320px]
          "
          style={{ transformOrigin: "top center" }}
          animate={{
            top: index * -offset,
            scale: 1 - index * scaleFactor,
            zIndex: cards.length - index,
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="text-sm leading-6 text-[var(--paragraph)] overflow-y-auto">
            {card.content}
          </div>

          <div className="mt-4">
            <p className="text-sm font-semibold text-[var(--title)]">
              {card.name}
            </p>
            <p className="text-xs text-[var(--muted)]">{card.designation}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
