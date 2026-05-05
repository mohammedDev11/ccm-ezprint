// "use client";

// import {
//   dashboardCardsByPeriod,
//   dashboardPeriods,
//   type DashboardPeriod,
// } from "@/lib/mock-data/Admin/dashboard/dashboard";
// import { topCardsStackData } from "@/lib/mock-data/Admin/dashboard/topCardsStack";
// import Card from "@/components/ui/card/Card";
// import {
//   Dropdown,
//   DropdownContent,
//   DropdownItem,
//   DropdownTrigger,
// } from "@/components/ui/dropdown/Dropdown";
// import { CardStack } from "@/components/ui/card/card-stack";
// import {
//   ArrowDownRight,
//   ArrowUpRight,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import { useEffect, useMemo, useRef, useState } from "react";

// const TopCards = () => {
//   const [selectedPeriod, setSelectedPeriod] =
//     useState<DashboardPeriod>("Today");

//   const scrollRef = useRef<HTMLDivElement | null>(null);
//   const [canScrollLeft, setCanScrollLeft] = useState(false);
//   const [canScrollRight, setCanScrollRight] = useState(true);

//   const cards = useMemo(() => {
//     return dashboardCardsByPeriod[selectedPeriod];
//   }, [selectedPeriod]);

//   const updateScrollState = () => {
//     const el = scrollRef.current;
//     if (!el) return;

//     setCanScrollLeft(el.scrollLeft > 4);
//     setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
//   };

//   useEffect(() => {
//     updateScrollState();

//     const el = scrollRef.current;
//     if (!el) return;

//     const onScroll = () => updateScrollState();
//     el.addEventListener("scroll", onScroll);

//     window.addEventListener("resize", updateScrollState);

//     return () => {
//       el.removeEventListener("scroll", onScroll);
//       window.removeEventListener("resize", updateScrollState);
//     };
//   }, [selectedPeriod]);

//   const scrollByCard = (direction: "prev" | "next") => {
//     const el = scrollRef.current;
//     if (!el) return;

//     const firstCard = el.querySelector(
//       "[data-card-item]"
//     ) as HTMLElement | null;
//     const gap = 16;
//     const cardWidth = firstCard?.offsetWidth ?? 280;
//     const amount = cardWidth + gap;

//     el.scrollBy({
//       left: direction === "next" ? amount : -amount,
//       behavior: "smooth",
//     });
//   };

//   return (
//     <section id="top-cards" className="space-y-4">
//       <div className="flex  flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
//         <div>
//           <p className="paragraph mt-1">
//             Quick system statistics for {selectedPeriod.toLowerCase()}.
//           </p>
//         </div>

//         <Dropdown
//           value={selectedPeriod}
//           onValueChange={(value) => setSelectedPeriod(value as DashboardPeriod)}
//         >
//           <DropdownTrigger className="min-w-[170px] rounded-xl px-3 py-2.5">
//             <div className="flex flex-col items-start">
//               <span
//                 className="text-sm font-semibold"
//                 style={{ color: "var(--title)" }}
//               >
//                 {selectedPeriod}
//               </span>
//             </div>
//           </DropdownTrigger>

//           <DropdownContent align="right" widthClassName="w-48">
//             {dashboardPeriods.map((period) => (
//               <DropdownItem key={period} value={period}>
//                 <span
//                   className="text-sm font-medium"
//                   style={{ color: "var(--paragraph)" }}
//                 >
//                   {period}
//                 </span>
//               </DropdownItem>
//             ))}
//           </DropdownContent>
//         </Dropdown>
//       </div>

//       <div className="space-y-3 ">
//         <div
//           ref={scrollRef}
//           className="
//             flex gap-4  overflow-x-auto overflow-y-hidden
//             pb-2 scroll-smooth snap-x snap-mandatory
//             scrollbar-none
//             pt-8
//             pb-10

//           "
//         >
//           {/* CardStack */}
//           <div
//             data-card-item
//             className="
//               snap-start flex-shrink-0
//               min-w-[280px] sm:min-w-[320px]
//               py-0
//               pl-3
//             "
//           >
//             <CardStack
//               items={topCardsStackData}
//               offset={10}
//               scaleFactor={0.06}
//               className="mt-0"
//             />
//           </div>

//           {/* Normal Cards */}
//           {cards.map((card) => {
//             const Icon = card.icon;
//             const isPositive = !card.change.startsWith("-");

//             return (
//               <Card
//                 key={card.id}
//                 data-card-item
//                 className="
//                   snap-start flex-shrink-0
//                   min-w-[260px] sm:min-w-[280px]
//                   min-h-[135px]
//                   group relative overflow-hidden rounded-[24px]
//                   transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
//                 "
//               >
//                 <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand-500/10 blur-2xl transition-all duration-300 group-hover:bg-brand-500/20" />

//                 <div className="relative z-10 flex h-full flex-col justify-between">
//                   <div className="flex items-start justify-between gap-3">
//                     <div className="min-w-0">
//                       <p className="text-muted text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-[12px]">
//                         {card.title}
//                       </p>

//                       <div
//                         className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
//                           isPositive ? "bg-brand-50 text-brand-600" : ""
//                         }`}
//                         style={
//                           isPositive
//                             ? {}
//                             : {
//                                 background: "var(--color-danger-50)",
//                                 color: "var(--color-danger-600)",
//                               }
//                         }
//                       >
//                         {isPositive ? (
//                           <ArrowUpRight size={12} />
//                         ) : (
//                           <ArrowDownRight size={12} />
//                         )}
//                         {card.change}
//                       </div>
//                     </div>

//                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-brand-500 text-white shadow-md transition-transform duration-300 group-hover:scale-105">
//                       <Icon size={22} />
//                     </div>
//                   </div>

//                   <div className="mt-5">
//                     <h2
//                       className="text-[30px] font-bold leading-none sm:text-[36px]"
//                       style={{ color: "var(--title)" }}
//                     >
//                       {card.value}
//                     </h2>
//                   </div>
//                 </div>
//               </Card>
//             );
//           })}
//         </div>

//         <div className="-mt-5 flex items-center justify-center gap-3">
//           <button
//             type="button"
//             onClick={() => scrollByCard("prev")}
//             disabled={!canScrollLeft}
//             className="
//               flex h-11 w-11 items-center justify-center rounded-full border
//               transition-all duration-200
//               disabled:cursor-not-allowed disabled:opacity-40
//               hover:-translate-y-0.5
//             "
//             style={{
//               background: "var(--surface)",
//               borderColor: "var(--border)",
//               color: "var(--title)",
//             }}
//             aria-label="Previous card"
//           >
//             <ChevronLeft size={18} />
//           </button>

//           <button
//             type="button"
//             onClick={() => scrollByCard("next")}
//             disabled={!canScrollRight}
//             className="
//               flex h-11 w-11 items-center justify-center rounded-full border
//               transition-all duration-200
//               disabled:cursor-not-allowed disabled:opacity-40
//               hover:-translate-y-0.5
//             "
//             style={{
//               background: "var(--surface)",
//               borderColor: "var(--border)",
//               color: "var(--title)",
//             }}
//             aria-label="Next card"
//           >
//             <ChevronRight size={18} />
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default TopCards;

"use client";

import {
  dashboardCardsByPeriod,
  dashboardPeriods,
  type DashboardPeriod,
} from "@/lib/mock-data/Admin/dashboard/dashboard";
import { topCardsStackData } from "@/lib/mock-data/Admin/dashboard/topCardsStack";
import Card from "@/components/ui/card/Card";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/dropdown/Dropdown";
import { CardStack } from "@/components/ui/card/card-stack";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const TopCards = () => {
  const [selectedPeriod, setSelectedPeriod] =
    useState<DashboardPeriod>("Today");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const cards = useMemo(() => {
    return dashboardCardsByPeriod[selectedPeriod];
  }, [selectedPeriod]);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();

    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll);

    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [selectedPeriod]);

  const scrollByCard = (direction: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;

    const firstCard = el.querySelector(
      "[data-card-item]"
    ) as HTMLElement | null;
    const gap = 16;
    const cardWidth = firstCard?.offsetWidth ?? 280;
    const amount = cardWidth + gap;

    el.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section id="top-cards" className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="paragraph mt-1">
            Quick system statistics for {selectedPeriod.toLowerCase()}.
          </p>
        </div>

        <Dropdown
          value={selectedPeriod}
          onValueChange={(value) => setSelectedPeriod(value as DashboardPeriod)}
        >
          <DropdownTrigger className="min-w-[170px] rounded-xl px-3 py-2.5">
            <div className="flex flex-col items-start">
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--title)" }}
              >
                {selectedPeriod}
              </span>
            </div>
          </DropdownTrigger>

          <DropdownContent align="right" widthClassName="w-48">
            {dashboardPeriods.map((period) => (
              <DropdownItem key={period} value={period}>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--paragraph)" }}
                >
                  {period}
                </span>
              </DropdownItem>
            ))}
          </DropdownContent>
        </Dropdown>
      </div>

      <div className="space-y-3">
        <div
          ref={scrollRef}
          className="
            flex gap-4 overflow-x-auto overflow-y-hidden
            scroll-smooth snap-x snap-mandatory
            scrollbar-none
            pt-8 pb-10 px-4
          "
        >
          <div
            data-card-item
            className="
              snap-start flex-shrink-0
              py-0
            "
          >
            <CardStack
              items={topCardsStackData}
              offset={10}
              scaleFactor={0.06}
              className="mt-0"
            />
          </div>

          {cards.map((card) => {
            const Icon = card.icon;
            const isPositive = !card.change.startsWith("-");

            return (
              <Card
                key={card.id}
                data-card-item
                className="
                  snap-start flex-shrink-0
                  min-w-[260px] sm:min-w-[280px] lg:min-w-[340px] xl:min-w-[380px]
                  min-h-[135px] lg:min-h-[155px]
                  group relative overflow-hidden rounded-[24px]
                  transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
                "
              >
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand-500/10 blur-2xl transition-all duration-300 group-hover:bg-brand-500/20" />

                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-muted text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-[12px]">
                        {card.title}
                      </p>

                      <div
                        className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          isPositive ? "bg-brand-50 text-brand-600" : ""
                        }`}
                        style={
                          isPositive
                            ? {}
                            : {
                                background: "var(--color-danger-50)",
                                color: "var(--color-danger-600)",
                              }
                        }
                      >
                        {isPositive ? (
                          <ArrowUpRight size={12} />
                        ) : (
                          <ArrowDownRight size={12} />
                        )}
                        {card.change}
                      </div>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-brand-500 text-white shadow-md transition-transform duration-300 group-hover:scale-105 lg:h-14 lg:w-14">
                      <Icon size={24} />
                    </div>
                  </div>

                  <div className="mt-5">
                    <h2
                      className="text-[30px] font-bold leading-none sm:text-[36px] lg:text-[42px]"
                      style={{ color: "var(--title)" }}
                    >
                      {card.value}
                    </h2>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="-mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => scrollByCard("prev")}
            disabled={!canScrollLeft}
            className="
              flex h-11 w-11 items-center justify-center rounded-full border
              transition-all duration-200
              disabled:cursor-not-allowed disabled:opacity-40
              hover:-translate-y-0.5
            "
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--title)",
            }}
            aria-label="Previous card"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => scrollByCard("next")}
            disabled={!canScrollRight}
            className="
              flex h-11 w-11 items-center justify-center rounded-full border
              transition-all duration-200
              disabled:cursor-not-allowed disabled:opacity-40
              hover:-translate-y-0.5
            "
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--title)",
            }}
            aria-label="Next card"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TopCards;
