// "use client";

// import { cn } from "@/lib/cn";
// import {
//   getDockItems,
//   type SidebarItem,
//   type SidebarSection,
// } from "@/lib/mock-data/Navbar";
// import {
//   motion,
//   useMotionValue,
//   useSpring,
//   useTransform,
//   type MotionValue,
// } from "framer-motion";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useMemo, useRef } from "react";

// type DockNavbarProps = {
//   position: "top" | "bottom";
//   sections: SidebarSection[];
// };

// type DockItemProps = {
//   item: SidebarItem;
//   mouseX: MotionValue<number>;
//   position: "top" | "bottom";
// };

// function DockItem({ item, mouseX, position }: DockItemProps) {
//   const ref = useRef<HTMLAnchorElement | null>(null);
//   const pathname = usePathname();
//   const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

//   const distance = useTransform(mouseX, (value) => {
//     const rect = ref.current?.getBoundingClientRect();
//     if (!rect) return 0;
//     return value - (rect.left + rect.width / 2);
//   });

//   const width = useTransform(
//     distance,
//     [-200, -180, 0, 180, 200],
//     [56, 56, 82, 56, 56]
//   );

//   const height = useTransform(
//     distance,
//     [-200, -180, 0, 180, 200],
//     [56, 56, 82, 56, 56]
//   );

//   const iconScale = useTransform(
//     distance,
//     [-200, -180, 0, 180, 200],
//     [1, 1, 1.2, 1, 1]
//   );

//   const widthSpring = useSpring(width, {
//     mass: 0.12,
//     stiffness: 180,
//     damping: 14,
//   });

//   const heightSpring = useSpring(height, {
//     mass: 0.12,
//     stiffness: 180,
//     damping: 14,
//   });

//   const iconSpring = useSpring(iconScale, {
//     mass: 0.12,
//     stiffness: 180,
//     damping: 14,
//   });

//   const Icon = item.icon;

//   return (
//     <motion.div className="relative flex items-center justify-center ">
//       <motion.span
//         initial={{
//           opacity: 0,
//           y: position === "bottom" ? 10 : -10,
//           scale: 0.95,
//         }}
//         whileHover={{ opacity: 1, y: 0, scale: 1 }}
//         transition={{ duration: 0.18 }}
//         className={cn(
//           "pointer-events-none absolute whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-medium shadow-sm",
//           position === "bottom" ? "-top-11" : "-bottom-11"
//         )}
//         style={{
//           background: "var(--surface)",
//           borderColor: "var(--border)",
//           color: "var(--foreground)",
//         }}
//       >
//         {item.label}
//       </motion.span>

//       <motion.div
//         style={{ width: widthSpring, height: heightSpring }}
//         className="flex items-center justify-center "
//       >
//         <Link
//           ref={ref}
//           href={item.href}
//           className={cn(
//             "relative flex h-full w-full items-center justify-center overflow-hidden rounded-md transition ",
//             active
//               ? "inverse-surface shadow-lg-inverse"
//               : "border border-foreground bg-surface text-muted backdrop-blur-2xl"
//           )}
//           style={{
//             boxShadow: active
//               ? undefined
//               : "0 8px 30px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.22)",
//           }}
//         >
//           {!active && (
//             <>
//               <span className="pointer-events-none absolute inset-[3px] rounded-md " />
//               <span className="pointer-events-none absolute -inset-3 rounded-md blur-3xl opacity-20" />
//             </>
//           )}

//           <motion.div
//             style={{ scale: iconSpring }}
//             className="relative z-[1] flex items-center justify-center"
//           >
//             <Icon
//               className={cn(
//                 "text-[1.55rem]",
//                 active ? "" : "text-[var(--foreground)]"
//               )}
//             />
//           </motion.div>
//         </Link>
//       </motion.div>
//     </motion.div>
//   );
// }

// export default function DockNavbar({ position, sections }: DockNavbarProps) {
//   const mouseX = useMotionValue<number>(-9999);
//   const dockItems = useMemo(() => getDockItems(sections), [sections]);

//   return (
//     <div
//       className={cn(
//         "fixed left-4 right-4 z-50 hidden md:block ",
//         position === "bottom" ? "bottom-4" : "top-4"
//       )}
//     >
//       <motion.div
//         onMouseMove={(event) => mouseX.set(event.pageX)}
//         onMouseLeave={() => mouseX.set(-9999)}
//         className="flex w-full items-center justify-center "
//       >
//         <div className="flex w-full max-w-[1700px] items-center justify-center gap-3 overflow-x-auto px-2 pt-2 pb-10">
//           {dockItems.map((item) => (
//             <DockItem
//               key={item.href}
//               item={item}
//               mouseX={mouseX}
//               position={position}
//             />
//           ))}
//         </div>
//       </motion.div>
//     </div>
//   );
// }

//===================New=this=is=working=======================
// "use client";

// import { cn } from "@/lib/cn";
// import {
//   getDockItems,
//   type SidebarItem,
//   type SidebarSection,
// } from "@/lib/mock-data/Navbar";
// import {
//   AnimatePresence,
//   motion,
//   useMotionValue,
//   useSpring,
//   useTransform,
//   type MotionValue,
// } from "framer-motion";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   useEffect,
//   useLayoutEffect,
//   useMemo,
//   useRef,
//   useState,
//   type ReactNode,
// } from "react";
// import { createPortal } from "react-dom";

// type DockNavbarProps = {
//   position: "top" | "bottom";
//   sections: SidebarSection[];
// };

// type DockItemProps = {
//   item: SidebarItem;
//   mouseX: MotionValue<number>;
//   position: "top" | "bottom";
// };

// type TooltipPortalProps = {
//   children: ReactNode;
//   anchorRef: React.RefObject<HTMLElement | null>;
//   visible: boolean;
//   position: "top" | "bottom";
// };

// function TooltipPortal({
//   children,
//   anchorRef,
//   visible,
//   position,
// }: TooltipPortalProps) {
//   const [mounted, setMounted] = useState(false);
//   const [coords, setCoords] = useState({ left: 0, top: 0 });

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useLayoutEffect(() => {
//     if (!visible || !anchorRef.current) return;

//     const updatePosition = () => {
//       const rect = anchorRef.current?.getBoundingClientRect();
//       if (!rect) return;

//       const gap = 60; // smaller gap so label stays close to icon

//       setCoords({
//         left: rect.left + rect.width / 2,
//         top: position === "bottom" ? rect.top - gap : rect.bottom + gap / 2,
//       });
//     };

//     updatePosition();

//     window.addEventListener("scroll", updatePosition, true);
//     window.addEventListener("resize", updatePosition);

//     return () => {
//       window.removeEventListener("scroll", updatePosition, true);
//       window.removeEventListener("resize", updatePosition);
//     };
//   }, [visible, anchorRef, position]);

//   if (!mounted) return null;

//   return createPortal(
//     <AnimatePresence>
//       {visible && (
//         <motion.div
//           initial={{
//             opacity: 0,
//             y: position === "bottom" ? 6 : -6,
//             scale: 0.96,
//           }}
//           animate={{
//             opacity: 1,
//             y: 0,
//             scale: 1,
//           }}
//           exit={{
//             opacity: 0,
//             y: position === "bottom" ? 4 : -4,
//             scale: 0.98,
//           }}
//           transition={{ duration: 0.14 }}
//           className="pointer-events-none fixed z-[99999]"
//           style={{
//             left: coords.left,
//             top: coords.top,
//             transform:
//               position === "bottom"
//                 ? "translate(-50%, -100%)"
//                 : "translate(-50%, 0)",
//           }}
//         >
//           <div className="relative">
//             <div
//               className="whitespace-nowrap rounded-2xl border px-4 py-2 text-sm font-semibold shadow-xl backdrop-blur-xl"
//               style={{
//                 background:
//                   "color-mix(in srgb, var(--surface) 96%, transparent)",
//                 borderColor: "var(--border)",
//                 color: "var(--foreground)",
//                 boxShadow:
//                   "0 10px 30px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
//               }}
//             >
//               {children}
//             </div>

//             {/* small pointer */}
//             <span
//               className={cn(
//                 "absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border",
//                 position === "bottom" ? "-bottom-1.5" : "-top-1.5"
//               )}
//               style={{
//                 background:
//                   "color-mix(in srgb, var(--surface) 96%, transparent)",
//                 borderColor: "var(--border)",
//               }}
//             />
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>,
//     document.body
//   );
// }

// function DockItem({ item, mouseX, position }: DockItemProps) {
//   const ref = useRef<HTMLAnchorElement | null>(null);
//   const pathname = usePathname();
//   const [hovered, setHovered] = useState(false);

//   const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
//   const Icon = item.icon;

//   const distance = useTransform(mouseX, (value) => {
//     const rect = ref.current?.getBoundingClientRect();
//     if (!rect) return 0;
//     return value - (rect.left + rect.width / 2);
//   });

//   const widthTransform = useTransform(distance, [-160, 0, 160], [52, 76, 52]);
//   const heightTransform = useTransform(distance, [-160, 0, 160], [52, 76, 52]);
//   const iconScaleTransform = useTransform(
//     distance,
//     [-160, 0, 160],
//     [1, 1.18, 1]
//   );

//   const width = useSpring(widthTransform, {
//     mass: 0.1,
//     stiffness: 170,
//     damping: 14,
//   });

//   const height = useSpring(heightTransform, {
//     mass: 0.1,
//     stiffness: 170,
//     damping: 14,
//   });

//   const iconScale = useSpring(iconScaleTransform, {
//     mass: 0.1,
//     stiffness: 170,
//     damping: 14,
//   });

//   return (
//     <div className="relative flex shrink-0 items-center justify-center">
//       <TooltipPortal anchorRef={ref} visible={hovered} position={position}>
//         {item.label}
//       </TooltipPortal>

//       <motion.div
//         style={{ width, height }}
//         className="relative flex aspect-square items-center justify-center"
//       >
//         <Link
//           ref={ref}
//           href={item.href}
//           onMouseEnter={() => setHovered(true)}
//           onMouseLeave={() => setHovered(false)}
//           className={cn(
//             "relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border transition-colors duration-200",
//             active
//               ? "inverse-surface shadow-lg-inverse"
//               : "bg-surface text-foreground"
//           )}
//           style={{
//             borderColor: active ? "transparent" : "var(--border)",
//             boxShadow: active
//               ? undefined
//               : "0 8px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.10)",
//             backdropFilter: "blur(18px)",
//           }}
//         >
//           {!active && (
//             <span
//               className="pointer-events-none absolute inset-[1px] rounded-[calc(1rem-2px)]"
//               style={{
//                 background:
//                   "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
//               }}
//             />
//           )}

//           <motion.div
//             style={{ scale: iconScale }}
//             className="relative z-[1] flex items-center justify-center"
//           >
//             <Icon
//               className={cn(
//                 "text-[1.45rem]",
//                 active ? "" : "text-[var(--foreground)]"
//               )}
//             />
//           </motion.div>
//         </Link>
//       </motion.div>
//     </div>
//   );
// }

// export default function DockNavbar({ position, sections }: DockNavbarProps) {
//   const mouseX = useMotionValue<number>(Infinity);
//   const dockItems = useMemo(() => getDockItems(sections), [sections]);

//   return (
//     <div
//       className={cn(
//         "fixed left-4 right-4 z-50 hidden md:block",
//         position === "bottom" ? "bottom-4" : "top-4"
//       )}
//     >
//       <motion.div
//         onMouseMove={(event) => mouseX.set(event.pageX)}
//         onMouseLeave={() => mouseX.set(Infinity)}
//         className="flex w-full items-center justify-center"
//       >
//         <div
//           className={cn(
//             "flex w-fit max-w-[calc(100vw-2rem)] items-end gap-3 overflow-x-auto rounded-[1.75rem] border px-4",
//             position === "bottom" ? "pt-4 pb-3" : "pt-3 pb-4"
//           )}
//           style={{
//             background: "color-mix(in srgb, var(--surface) 85%, transparent)",
//             borderColor: "var(--border)",
//             boxShadow:
//               "0 18px 50px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
//             backdropFilter: "blur(18px)",
//           }}
//         >
//           {dockItems.map((item) => (
//             <DockItem
//               key={item.href}
//               item={item}
//               mouseX={mouseX}
//               position={position}
//             />
//           ))}
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// ============================This is Working=============================
// "use client";

// import { cn } from "@/lib/cn";
// import {
//   getDockItems,
//   type SidebarItem,
//   type SidebarSection,
// } from "@/lib/mock-data/Navbar";
// import {
//   AnimatePresence,
//   motion,
//   useMotionValue,
//   useSpring,
//   useTransform,
//   type MotionValue,
// } from "framer-motion";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   useEffect,
//   useLayoutEffect,
//   useMemo,
//   useRef,
//   useState,
//   type ReactNode,
// } from "react";
// import { createPortal } from "react-dom";

// type DockNavbarProps = {
//   position: "top" | "bottom";
//   sections: SidebarSection[];
// };

// type DockItemProps = {
//   item: SidebarItem;
//   mouseX: MotionValue<number>;
//   position: "top" | "bottom";
// };

// type PreviewPortalProps = {
//   item: SidebarItem;
//   anchorRef: React.RefObject<HTMLElement | null>;
//   visible: boolean;
//   position: "top" | "bottom";
//   active: boolean;
//   onPreviewEnter: () => void;
//   onPreviewLeave: () => void;
// };

// function SurfaceBox({
//   children,
//   className = "",
// }: {
//   children: ReactNode;
//   className?: string;
// }) {
//   return (
//     <div
//       className={cn("rounded-2xl border", className)}
//       style={{
//         background: "color-mix(in srgb, var(--surface) 82%, transparent)",
//         borderColor: "var(--border)",
//       }}
//     >
//       {children}
//     </div>
//   );
// }

// function MiniLine({
//   width = "w-full",
//   opacity = 0.18,
//   height = "h-2.5",
// }: {
//   width?: string;
//   opacity?: number;
//   height?: string;
// }) {
//   return (
//     <div
//       className={cn(height, width, "rounded-full")}
//       style={{
//         background: "var(--foreground)",
//         opacity,
//       }}
//     />
//   );
// }

// function MiniBadge({
//   label,
//   active = false,
// }: {
//   label: string;
//   active?: boolean;
// }) {
//   return (
//     <div
//       className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
//       style={{
//         background: active
//           ? "var(--inverse-surface)"
//           : "color-mix(in srgb, var(--surface-3) 80%, transparent)",
//         color: active ? "var(--inverse-foreground)" : "var(--foreground)",
//       }}
//     >
//       {label}
//     </div>
//   );
// }

// function WindowChrome({
//   title,
//   subtitle,
//   active,
// }: {
//   title: string;
//   subtitle?: string;
//   active?: boolean;
// }) {
//   return (
//     <div className="mb-3 flex items-start justify-between gap-3">
//       <div className="min-w-0">
//         <div
//           className="truncate text-sm font-semibold"
//           style={{ color: "var(--foreground)" }}
//         >
//           {title}
//         </div>
//         {subtitle ? (
//           <div className="truncate text-xs" style={{ color: "var(--muted)" }}>
//             {subtitle}
//           </div>
//         ) : null}
//       </div>

//       <div className="flex shrink-0 items-center gap-1.5">
//         <span
//           className="h-2.5 w-2.5 rounded-full"
//           style={{ background: "var(--muted)" }}
//         />
//         <span
//           className="h-2.5 w-2.5 rounded-full"
//           style={{ background: "var(--muted)" }}
//         />
//         <span
//           className="h-2.5 w-2.5 rounded-full"
//           style={{
//             background: active ? "var(--inverse-surface)" : "var(--border)",
//           }}
//         />
//       </div>
//     </div>
//   );
// }

// function AdminDashboardPreview({ active }: { active: boolean }) {
//   return (
//     <div className="space-y-3">
//       <SurfaceBox className="p-3">
//         <div className="mb-3 flex items-center justify-between">
//           <div className="space-y-1">
//             <MiniLine width="w-24" opacity={0.95} />
//             <MiniLine width="w-16" height="h-2" opacity={0.28} />
//           </div>
//           <MiniBadge label={active ? "Current" : "Overview"} active={active} />
//         </div>

//         <div className="grid grid-cols-3 gap-2">
//           {[1, 2, 3].map((i) => (
//             <div
//               key={i}
//               className="rounded-xl border p-2"
//               style={{
//                 background:
//                   i === 2
//                     ? "color-mix(in srgb, var(--surface-3) 78%, transparent)"
//                     : "color-mix(in srgb, var(--surface) 72%, transparent)",
//                 borderColor: "var(--border)",
//               }}
//             >
//               <MiniLine width="w-8" opacity={0.25} />
//               <div className="mt-2">
//                 <MiniLine width="w-10" height="h-3" opacity={0.92} />
//               </div>
//             </div>
//           ))}
//         </div>
//       </SurfaceBox>

//       <SurfaceBox className="p-3">
//         <div className="mb-2 flex items-end gap-1">
//           {[28, 40, 24, 52, 36, 48, 30].map((h, i) => (
//             <div
//               key={i}
//               className="flex-1 rounded-t-lg"
//               style={{
//                 height: `${h}px`,
//                 background:
//                   i === 3
//                     ? "var(--inverse-surface)"
//                     : "color-mix(in srgb, var(--surface-3) 82%, transparent)",
//               }}
//             />
//           ))}
//         </div>
//         <div className="flex justify-between">
//           <MiniLine width="w-10" height="h-2" opacity={0.18} />
//           <MiniLine width="w-10" height="h-2" opacity={0.18} />
//           <MiniLine width="w-10" height="h-2" opacity={0.18} />
//         </div>
//       </SurfaceBox>
//     </div>
//   );
// }

// function AdminUsersPreview() {
//   return (
//     <div className="space-y-3">
//       <SurfaceBox className="p-3">
//         <div className="mb-3 flex items-center justify-between">
//           <MiniLine width="w-20" opacity={0.92} />
//           <div
//             className="h-8 w-20 rounded-xl"
//             style={{
//               background:
//                 "color-mix(in srgb, var(--surface-3) 82%, transparent)",
//             }}
//           />
//         </div>

//         <div className="space-y-2">
//           {[1, 2, 3].map((row) => (
//             <div
//               key={row}
//               className="grid grid-cols-[1fr_68px_56px] items-center gap-2 rounded-xl border p-2.5"
//               style={{
//                 background:
//                   "color-mix(in srgb, var(--surface) 74%, transparent)",
//                 borderColor: "var(--border)",
//               }}
//             >
//               <div className="flex items-center gap-2">
//                 <div
//                   className="h-8 w-8 rounded-full"
//                   style={{
//                     background:
//                       "color-mix(in srgb, var(--surface-3) 82%, transparent)",
//                   }}
//                 />
//                 <div className="space-y-1.5">
//                   <MiniLine width="w-20" opacity={0.88} />
//                   <MiniLine width="w-12" height="h-2" opacity={0.2} />
//                 </div>
//               </div>

//               <div
//                 className="h-5 rounded-full"
//                 style={{
//                   background:
//                     row === 1
//                       ? "var(--inverse-surface)"
//                       : "color-mix(in srgb, var(--surface-3) 78%, transparent)",
//                 }}
//               />
//               <div
//                 className="h-8 rounded-lg"
//                 style={{
//                   background:
//                     "color-mix(in srgb, var(--surface-3) 78%, transparent)",
//                 }}
//               />
//             </div>
//           ))}
//         </div>
//       </SurfaceBox>
//     </div>
//   );
// }

// function AdminPrintersPreview() {
//   return (
//     <div className="grid grid-cols-2 gap-3">
//       {[1, 2, 3, 4].map((card) => (
//         <SurfaceBox key={card} className="p-3">
//           <div className="mb-3 flex items-center justify-between">
//             <div
//               className="h-9 w-9 rounded-xl"
//               style={{
//                 background:
//                   "color-mix(in srgb, var(--surface-3) 78%, transparent)",
//               }}
//             />
//             <div
//               className="h-2.5 w-2.5 rounded-full"
//               style={{
//                 background:
//                   card % 2 === 0 ? "var(--inverse-surface)" : "var(--muted)",
//               }}
//             />
//           </div>

//           <div className="space-y-1.5">
//             <MiniLine width="w-16" opacity={0.88} />
//             <MiniLine width="w-12" height="h-2" opacity={0.22} />
//           </div>

//           <div
//             className="mt-3 h-2.5 rounded-full"
//             style={{
//               background:
//                 "color-mix(in srgb, var(--surface-3) 72%, transparent)",
//             }}
//           >
//             <div
//               className="h-full rounded-full"
//               style={{
//                 width: `${card * 20}%`,
//                 background: "var(--inverse-surface)",
//               }}
//             />
//           </div>
//         </SurfaceBox>
//       ))}
//     </div>
//   );
// }

// function QueueManagerPreview() {
//   return (
//     <div className="space-y-3">
//       <SurfaceBox className="p-3">
//         <div className="mb-3 flex items-center justify-between">
//           <MiniLine width="w-24" opacity={0.9} />
//           <MiniBadge label="Queue" />
//         </div>

//         <div className="space-y-2">
//           {[1, 2, 3, 4].map((row) => (
//             <div
//               key={row}
//               className="grid grid-cols-[44px_1fr_70px] items-center gap-2 rounded-xl border p-2"
//               style={{
//                 background:
//                   "color-mix(in srgb, var(--surface) 72%, transparent)",
//                 borderColor: "var(--border)",
//               }}
//             >
//               <div
//                 className="flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold"
//                 style={{
//                   background:
//                     row === 1
//                       ? "var(--inverse-surface)"
//                       : "color-mix(in srgb, var(--surface-3) 80%, transparent)",
//                   color:
//                     row === 1
//                       ? "var(--inverse-foreground)"
//                       : "var(--foreground)",
//                 }}
//               >
//                 {row}
//               </div>

//               <div className="space-y-1.5">
//                 <MiniLine width="w-24" opacity={0.85} />
//                 <MiniLine width="w-16" height="h-2" opacity={0.2} />
//               </div>

//               <div
//                 className="h-5 rounded-full"
//                 style={{
//                   background:
//                     row <= 2
//                       ? "var(--inverse-surface)"
//                       : "color-mix(in srgb, var(--surface-3) 78%, transparent)",
//                 }}
//               />
//             </div>
//           ))}
//         </div>
//       </SurfaceBox>
//     </div>
//   );
// }

// function ReportsPreview() {
//   return (
//     <div className="space-y-3">
//       <SurfaceBox className="p-3">
//         <div className="mb-3 flex items-center justify-between">
//           <MiniLine width="w-20" opacity={0.92} />
//           <MiniBadge label="Analytics" />
//         </div>

//         <div
//           className="rounded-xl border p-3"
//           style={{ borderColor: "var(--border)" }}
//         >
//           <div className="mb-3 flex items-end gap-1">
//             {[24, 38, 32, 48, 28, 42].map((h, i) => (
//               <div
//                 key={i}
//                 className="flex-1 rounded-t-md"
//                 style={{
//                   height: `${h}px`,
//                   background:
//                     i === 3
//                       ? "var(--inverse-surface)"
//                       : "color-mix(in srgb, var(--surface-3) 78%, transparent)",
//                 }}
//               />
//             ))}
//           </div>
//           <div className="space-y-1.5">
//             <MiniLine width="w-full" height="h-2" opacity={0.12} />
//             <MiniLine width="w-10/12" height="h-2" opacity={0.12} />
//           </div>
//         </div>
//       </SurfaceBox>
//     </div>
//   );
// }

// function NotificationsPreview() {
//   return (
//     <div className="space-y-2">
//       {[1, 2, 3].map((n) => (
//         <SurfaceBox key={n} className="p-3">
//           <div className="flex items-start gap-3">
//             <div
//               className="mt-0.5 h-8 w-8 rounded-full"
//               style={{
//                 background:
//                   n === 1
//                     ? "var(--inverse-surface)"
//                     : "color-mix(in srgb, var(--surface-3) 78%, transparent)",
//               }}
//             />
//             <div className="min-w-0 flex-1 space-y-1.5">
//               <MiniLine width="w-24" opacity={0.9} />
//               <MiniLine width="w-full" height="h-2" opacity={0.16} />
//               <MiniLine width="w-8/12" height="h-2" opacity={0.12} />
//             </div>
//           </div>
//         </SurfaceBox>
//       ))}
//     </div>
//   );
// }

// function SettingsPreview() {
//   return (
//     <div className="space-y-2">
//       {[1, 2, 3].map((row) => (
//         <SurfaceBox key={row} className="p-3">
//           <div className="flex items-center justify-between gap-3">
//             <div className="space-y-1.5">
//               <MiniLine width="w-20" opacity={0.9} />
//               <MiniLine width="w-14" height="h-2" opacity={0.18} />
//             </div>

//             <div
//               className="h-6 w-11 rounded-full p-1"
//               style={{
//                 background:
//                   row === 2
//                     ? "var(--inverse-surface)"
//                     : "color-mix(in srgb, var(--surface-3) 78%, transparent)",
//               }}
//             >
//               <div
//                 className={cn(
//                   "h-4 w-4 rounded-full transition-all",
//                   row === 2 ? "ml-auto" : "ml-0"
//                 )}
//                 style={{
//                   background:
//                     row === 2
//                       ? "var(--inverse-foreground)"
//                       : "var(--foreground)",
//                 }}
//               />
//             </div>
//           </div>
//         </SurfaceBox>
//       ))}
//     </div>
//   );
// }

// function UserDashboardPreview({ active }: { active: boolean }) {
//   return (
//     <div className="space-y-3">
//       <SurfaceBox className="p-3">
//         <div className="mb-3 flex items-center justify-between">
//           <div className="space-y-1">
//             <MiniLine width="w-24" opacity={0.95} />
//             <MiniLine width="w-16" height="h-2" opacity={0.24} />
//           </div>
//           <MiniBadge label={active ? "Current" : "Summary"} active={active} />
//         </div>

//         <div className="grid grid-cols-2 gap-2">
//           {[1, 2].map((i) => (
//             <div
//               key={i}
//               className="rounded-xl border p-3"
//               style={{
//                 background:
//                   i === 1
//                     ? "color-mix(in srgb, var(--surface-3) 78%, transparent)"
//                     : "color-mix(in srgb, var(--surface) 72%, transparent)",
//                 borderColor: "var(--border)",
//               }}
//             >
//               <MiniLine width="w-14" opacity={0.2} />
//               <div className="mt-2">
//                 <MiniLine width="w-10" height="h-3" opacity={0.92} />
//               </div>
//             </div>
//           ))}
//         </div>
//       </SurfaceBox>

//       <SurfaceBox className="p-3">
//         <MiniLine width="w-20" opacity={0.9} />
//         <div className="mt-3 space-y-2">
//           {[1, 2, 3].map((r) => (
//             <div
//               key={r}
//               className="grid grid-cols-[42px_1fr] items-center gap-2 rounded-xl border p-2"
//               style={{
//                 background:
//                   "color-mix(in srgb, var(--surface) 74%, transparent)",
//                 borderColor: "var(--border)",
//               }}
//             >
//               <div
//                 className="h-8 w-8 rounded-lg"
//                 style={{
//                   background:
//                     "color-mix(in srgb, var(--surface-3) 80%, transparent)",
//                 }}
//               />
//               <div className="space-y-1.5">
//                 <MiniLine width="w-24" opacity={0.85} />
//                 <MiniLine width="w-16" height="h-2" opacity={0.16} />
//               </div>
//             </div>
//           ))}
//         </div>
//       </SurfaceBox>
//     </div>
//   );
// }

// function UserPrintPreview() {
//   return (
//     <div className="space-y-3">
//       <SurfaceBox className="p-3">
//         <div
//           className="rounded-2xl border border-dashed p-5"
//           style={{
//             borderColor: "var(--border)",
//             background: "color-mix(in srgb, var(--surface) 70%, transparent)",
//           }}
//         >
//           <div
//             className="mx-auto mb-3 h-11 w-11 rounded-2xl"
//             style={{
//               background:
//                 "color-mix(in srgb, var(--surface-3) 80%, transparent)",
//             }}
//           />
//           <div className="mx-auto flex w-fit flex-col items-center space-y-1.5">
//             <MiniLine width="w-24" opacity={0.88} />
//             <MiniLine width="w-16" height="h-2" opacity={0.18} />
//           </div>
//         </div>
//       </SurfaceBox>

//       <SurfaceBox className="p-3">
//         <div className="mb-2 flex items-center justify-between">
//           <MiniLine width="w-16" opacity={0.88} />
//           <MiniBadge label="A4" />
//         </div>

//         <div className="space-y-2">
//           {[1, 2].map((row) => (
//             <div
//               key={row}
//               className="flex items-center justify-between rounded-xl border p-2.5"
//               style={{
//                 background:
//                   "color-mix(in srgb, var(--surface) 74%, transparent)",
//                 borderColor: "var(--border)",
//               }}
//             >
//               <div className="space-y-1.5">
//                 <MiniLine width="w-20" opacity={0.84} />
//                 <MiniLine width="w-12" height="h-2" opacity={0.16} />
//               </div>
//               <div
//                 className="h-8 w-16 rounded-xl"
//                 style={{
//                   background:
//                     row === 1
//                       ? "var(--inverse-surface)"
//                       : "color-mix(in srgb, var(--surface-3) 80%, transparent)",
//                 }}
//               />
//             </div>
//           ))}
//         </div>
//       </SurfaceBox>
//     </div>
//   );
// }

// function RecentJobsPreview() {
//   return (
//     <div className="space-y-2">
//       {[1, 2, 3].map((row) => (
//         <SurfaceBox key={row} className="p-3">
//           <div className="grid grid-cols-[1fr_70px] items-center gap-2">
//             <div className="space-y-1.5">
//               <MiniLine width="w-24" opacity={0.86} />
//               <MiniLine width="w-14" height="h-2" opacity={0.16} />
//             </div>
//             <div
//               className="h-5 rounded-full"
//               style={{
//                 background:
//                   row === 1
//                     ? "var(--inverse-surface)"
//                     : "color-mix(in srgb, var(--surface-3) 78%, transparent)",
//               }}
//             />
//           </div>
//         </SurfaceBox>
//       ))}
//     </div>
//   );
// }

// function PendingJobsPreview() {
//   return (
//     <div className="space-y-2">
//       {[1, 2, 3].map((row) => (
//         <SurfaceBox key={row} className="p-3">
//           <div className="grid grid-cols-[36px_1fr_54px] items-center gap-2">
//             <div
//               className="flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-semibold"
//               style={{
//                 background:
//                   row === 1
//                     ? "var(--inverse-surface)"
//                     : "color-mix(in srgb, var(--surface-3) 80%, transparent)",
//                 color:
//                   row === 1 ? "var(--inverse-foreground)" : "var(--foreground)",
//               }}
//             >
//               {row}
//             </div>
//             <div className="space-y-1.5">
//               <MiniLine width="w-20" opacity={0.84} />
//               <MiniLine width="w-12" height="h-2" opacity={0.16} />
//             </div>
//             <div
//               className="h-8 rounded-xl"
//               style={{
//                 background:
//                   "color-mix(in srgb, var(--surface-3) 80%, transparent)",
//               }}
//             />
//           </div>
//         </SurfaceBox>
//       ))}
//     </div>
//   );
// }

// function RedeemPreview() {
//   return (
//     <div className="space-y-3">
//       <SurfaceBox className="p-3">
//         <div className="mb-3 flex items-center justify-between">
//           <MiniLine width="w-16" opacity={0.88} />
//           <MiniBadge label="Code" />
//         </div>

//         <div
//           className="rounded-2xl border p-4"
//           style={{
//             borderColor: "var(--border)",
//             background: "color-mix(in srgb, var(--surface) 74%, transparent)",
//           }}
//         >
//           <div className="space-y-2">
//             <MiniLine width="w-full" opacity={0.12} />
//             <MiniLine width="w-10/12" opacity={0.12} />
//             <MiniLine width="w-8/12" opacity={0.12} />
//           </div>

//           <div
//             className="mt-4 h-9 w-24 rounded-xl"
//             style={{ background: "var(--inverse-surface)" }}
//           />
//         </div>
//       </SurfaceBox>
//     </div>
//   );
// }

// function ProfilePreview() {
//   return (
//     <SurfaceBox className="p-4">
//       <div className="flex items-start gap-3">
//         <div
//           className="h-14 w-14 rounded-2xl"
//           style={{
//             background: "color-mix(in srgb, var(--surface-3) 80%, transparent)",
//           }}
//         />
//         <div className="flex-1 space-y-2">
//           <MiniLine width="w-24" opacity={0.9} />
//           <MiniLine width="w-16" height="h-2" opacity={0.18} />
//           <MiniLine width="w-full" height="h-2" opacity={0.12} />
//           <MiniLine width="w-8/12" height="h-2" opacity={0.12} />
//         </div>
//       </div>
//     </SurfaceBox>
//   );
// }

// function AboutPreview() {
//   return (
//     <SurfaceBox className="p-4">
//       <div
//         className="mb-3 h-24 rounded-2xl"
//         style={{
//           background:
//             "linear-gradient(135deg, color-mix(in srgb, var(--surface-3) 80%, transparent), color-mix(in srgb, var(--surface) 80%, transparent))",
//           border: "1px solid var(--border)",
//         }}
//       />
//       <div className="space-y-2">
//         <MiniLine width="w-20" opacity={0.9} />
//         <MiniLine width="w-full" height="h-2" opacity={0.14} />
//         <MiniLine width="w-10/12" height="h-2" opacity={0.14} />
//         <MiniLine width="w-7/12" height="h-2" opacity={0.14} />
//       </div>
//     </SurfaceBox>
//   );
// }

// function DefaultPreview({
//   item,
//   active,
// }: {
//   item: SidebarItem;
//   active: boolean;
// }) {
//   const Icon = item.icon;

//   return (
//     <div className="space-y-3">
//       <SurfaceBox className="p-4">
//         <div className="mb-4 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div
//               className="flex h-11 w-11 items-center justify-center rounded-2xl"
//               style={{
//                 background:
//                   "color-mix(in srgb, var(--surface-3) 80%, transparent)",
//               }}
//             >
//               <Icon
//                 className="text-[1.15rem]"
//                 style={{ color: "var(--foreground)" }}
//               />
//             </div>
//             <div>
//               <div
//                 className="text-sm font-semibold"
//                 style={{ color: "var(--foreground)" }}
//               >
//                 {item.label}
//               </div>
//               <div className="text-xs" style={{ color: "var(--muted)" }}>
//                 {item.href}
//               </div>
//             </div>
//           </div>

//           <MiniBadge label={active ? "Current" : "Preview"} active={active} />
//         </div>

//         <div className="space-y-2">
//           <MiniLine width="w-full" opacity={0.12} />
//           <MiniLine width="w-11/12" opacity={0.12} />
//           <MiniLine width="w-8/12" opacity={0.12} />
//         </div>
//       </SurfaceBox>
//     </div>
//   );
// }

// function RoutePreview({
//   item,
//   active,
// }: {
//   item: SidebarItem;
//   active: boolean;
// }) {
//   switch (item.href) {
//     case "/sections/admin/dashboard":
//       return <AdminDashboardPreview active={active} />;

//     case "/sections/admin/users":
//       return <AdminUsersPreview />;

//     case "/sections/admin/printers":
//       return <AdminPrintersPreview />;

//     case "/sections/admin/queue-manger":
//       return <QueueManagerPreview />;

//     case "/sections/admin/reports":
//       return <ReportsPreview />;

//     case "/sections/admin/notifications":
//     case "/sections/user/notifications":
//       return <NotificationsPreview />;

//     case "/sections/admin/settings":
//     case "/sections/user/settings":
//       return <SettingsPreview />;

//     case "/sections/user/dashboard":
//       return <UserDashboardPreview active={active} />;

//     case "/sections/user/print":
//       return <UserPrintPreview />;

//     case "/sections/user/recent-print-jobs":
//     case "/sections/user/history":
//       return <RecentJobsPreview />;

//     case "/sections/user/pending-jobs":
//       return <PendingJobsPreview />;

//     case "/sections/user/redeem":
//       return <RedeemPreview />;

//     case "/sections/user/profile":
//       return <ProfilePreview />;

//     case "/sections/about":
//       return <AboutPreview />;

//     default:
//       return <DefaultPreview item={item} active={active} />;
//   }
// }

// function PreviewPortal({
//   item,
//   anchorRef,
//   visible,
//   position,
//   active,
//   onPreviewEnter,
//   onPreviewLeave,
// }: PreviewPortalProps) {
//   const [mounted, setMounted] = useState(false);
//   const [coords, setCoords] = useState({ left: 0, top: 0 });

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useLayoutEffect(() => {
//     if (!visible || !anchorRef.current) return;

//     const updatePosition = () => {
//       const rect = anchorRef.current?.getBoundingClientRect();
//       if (!rect) return;

//       const gap = 16;

//       setCoords({
//         left: rect.left + rect.width / 2,
//         top: position === "bottom" ? rect.top - gap : rect.bottom + gap,
//       });
//     };

//     updatePosition();

//     window.addEventListener("scroll", updatePosition, true);
//     window.addEventListener("resize", updatePosition);

//     return () => {
//       window.removeEventListener("scroll", updatePosition, true);
//       window.removeEventListener("resize", updatePosition);
//     };
//   }, [visible, anchorRef, position]);

//   if (!mounted) return null;

//   return createPortal(
//     <AnimatePresence>
//       {visible && (
//         <motion.div
//           initial={{
//             opacity: 0,
//             y: position === "bottom" ? 12 : -12,
//             scale: 0.96,
//           }}
//           animate={{
//             opacity: 1,
//             y: 0,
//             scale: 1,
//           }}
//           exit={{
//             opacity: 0,
//             y: position === "bottom" ? 8 : -8,
//             scale: 0.98,
//           }}
//           transition={{ duration: 0.18, ease: "easeOut" }}
//           className="fixed z-[99999]"
//           style={{
//             left: coords.left,
//             top: coords.top,
//             transform:
//               position === "bottom"
//                 ? "translate(-50%, -100%)"
//                 : "translate(-50%, 0)",
//           }}
//           onMouseEnter={onPreviewEnter}
//           onMouseLeave={onPreviewLeave}
//         >
//           <div className="relative">
//             <div
//               className="w-[340px] overflow-hidden rounded-[1.6rem] border p-3 shadow-2xl backdrop-blur-2xl"
//               style={{
//                 background:
//                   "color-mix(in srgb, var(--surface) 92%, transparent)",
//                 borderColor: "var(--border)",
//                 boxShadow:
//                   "0 22px 60px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
//               }}
//             >
//               <WindowChrome
//                 title={item.label}
//                 subtitle="Live page preview"
//                 active={active}
//               />

//               <RoutePreview item={item} active={active} />
//             </div>

//             <span
//               className={cn(
//                 "absolute left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border",
//                 position === "bottom" ? "-bottom-1.5" : "-top-1.5"
//               )}
//               style={{
//                 background:
//                   "color-mix(in srgb, var(--surface) 92%, transparent)",
//                 borderColor: "var(--border)",
//               }}
//             />
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>,
//     document.body
//   );
// }

// function DockItem({ item, mouseX, position }: DockItemProps) {
//   const ref = useRef<HTMLAnchorElement | null>(null);
//   const pathname = usePathname();

//   const [hoveredIcon, setHoveredIcon] = useState(false);
//   const [hoveredPreview, setHoveredPreview] = useState(false);

//   const closeTimeoutRef = useRef<number | null>(null);

//   const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
//   const Icon = item.icon;

//   const isOpen = hoveredIcon || hoveredPreview;

//   const clearCloseTimeout = () => {
//     if (closeTimeoutRef.current) {
//       window.clearTimeout(closeTimeoutRef.current);
//       closeTimeoutRef.current = null;
//     }
//   };

//   const openPreview = () => {
//     clearCloseTimeout();
//     setHoveredIcon(true);
//   };

//   const closePreviewWithDelay = () => {
//     clearCloseTimeout();
//     closeTimeoutRef.current = window.setTimeout(() => {
//       setHoveredIcon(false);
//       setHoveredPreview(false);
//     }, 120);
//   };

//   useEffect(() => {
//     return () => clearCloseTimeout();
//   }, []);

//   const distance = useTransform(mouseX, (value) => {
//     const rect = ref.current?.getBoundingClientRect();
//     if (!rect) return 0;
//     return value - (rect.left + rect.width / 2);
//   });

//   const widthTransform = useTransform(distance, [-160, 0, 160], [52, 76, 52]);
//   const heightTransform = useTransform(distance, [-160, 0, 160], [52, 76, 52]);
//   const iconScaleTransform = useTransform(
//     distance,
//     [-160, 0, 160],
//     [1, 1.18, 1]
//   );

//   const width = useSpring(widthTransform, {
//     mass: 0.1,
//     stiffness: 170,
//     damping: 14,
//   });

//   const height = useSpring(heightTransform, {
//     mass: 0.1,
//     stiffness: 170,
//     damping: 14,
//   });

//   const iconScale = useSpring(iconScaleTransform, {
//     mass: 0.1,
//     stiffness: 170,
//     damping: 14,
//   });

//   return (
//     <div className="relative flex shrink-0 items-center justify-center">
//       <PreviewPortal
//         item={item}
//         anchorRef={ref}
//         visible={isOpen}
//         position={position}
//         active={active}
//         onPreviewEnter={() => {
//           clearCloseTimeout();
//           setHoveredPreview(true);
//         }}
//         onPreviewLeave={() => {
//           setHoveredPreview(false);
//           closePreviewWithDelay();
//         }}
//       />

//       <motion.div
//         style={{ width, height }}
//         className="relative flex aspect-square items-center justify-center"
//       >
//         <Link
//           ref={ref}
//           href={item.href}
//           onMouseEnter={openPreview}
//           onMouseLeave={() => {
//             setHoveredIcon(false);
//             closePreviewWithDelay();
//           }}
//           className={cn(
//             "relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border transition-colors duration-200",
//             active
//               ? "inverse-surface shadow-lg-inverse"
//               : "bg-surface text-foreground"
//           )}
//           style={{
//             borderColor: active ? "transparent" : "var(--border)",
//             boxShadow: active
//               ? undefined
//               : "0 8px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.10)",
//             backdropFilter: "blur(18px)",
//           }}
//         >
//           {!active && (
//             <span
//               className="pointer-events-none absolute inset-[1px] rounded-[calc(1rem-2px)]"
//               style={{
//                 background:
//                   "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
//               }}
//             />
//           )}

//           <motion.div
//             style={{ scale: iconScale }}
//             className="relative z-[1] flex items-center justify-center"
//           >
//             <Icon
//               className={cn(
//                 "text-[1.45rem]",
//                 active ? "" : "text-[var(--foreground)]"
//               )}
//             />
//           </motion.div>
//         </Link>
//       </motion.div>
//     </div>
//   );
// }

// export default function DockNavbar({ position, sections }: DockNavbarProps) {
//   const mouseX = useMotionValue<number>(Infinity);
//   const dockItems = useMemo(() => getDockItems(sections), [sections]);

//   return (
//     <div
//       className={cn(
//         "fixed left-4 right-4 z-50 hidden md:block",
//         position === "bottom" ? "bottom-4" : "top-4"
//       )}
//     >
//       <motion.div
//         onMouseMove={(event) => mouseX.set(event.pageX)}
//         onMouseLeave={() => mouseX.set(Infinity)}
//         className="flex w-full items-center justify-center"
//       >
//         <div
//           className={cn(
//             "flex w-fit max-w-[calc(100vw-2rem)] items-end gap-3 overflow-x-auto rounded-[1.75rem] border px-4",
//             position === "bottom" ? "pt-4 pb-3" : "pt-3 pb-4"
//           )}
//           style={{
//             background: "color-mix(in srgb, var(--surface) 85%, transparent)",
//             borderColor: "var(--border)",
//             boxShadow:
//               "0 18px 50px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
//             backdropFilter: "blur(18px)",
//           }}
//         >
//           {dockItems.map((item) => (
//             <DockItem
//               key={item.href}
//               item={item}
//               mouseX={mouseX}
//               position={position}
//             />
//           ))}
//         </div>
//       </motion.div>
//     </div>
//   );
// }
//============================NEW====================================
// "use client";

// import { cn } from "@/lib/cn";
// import {
//   getDockItems,
//   type SidebarItem,
//   type SidebarSection,
// } from "@/lib/mock-data/Navbar";
// import PreviewVideo from "@/components/ui/video/PreviewVideo";
// import {
//   AnimatePresence,
//   motion,
//   useMotionValue,
//   useSpring,
//   useTransform,
//   type MotionValue,
// } from "framer-motion";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
// import { createPortal } from "react-dom";

// type DockNavbarTopProps = {
//   position: "top" | "bottom";
//   sections: SidebarSection[];
// };

// type DockItemProps = {
//   item: SidebarItem;
//   mouseX: MotionValue<number>;
//   position: "top" | "bottom";
// };

// type PreviewPortalProps = {
//   item: SidebarItem;
//   anchorRef: React.RefObject<HTMLElement | null>;
//   visible: boolean;
//   position: "top" | "bottom";
//   active: boolean;
//   onPreviewEnter: () => void;
//   onPreviewLeave: () => void;
// };

// function WindowChrome({
//   title,
//   subtitle,
//   active,
// }: {
//   title: string;
//   subtitle?: string;
//   active?: boolean;
// }) {
//   return (
//     <div className="mb-3 flex items-start justify-between gap-3">
//       <div className="min-w-0">
//         <div
//           className="truncate text-sm font-semibold"
//           style={{ color: "var(--foreground)" }}
//         >
//           {title}
//         </div>

//         {subtitle ? (
//           <div className="truncate text-xs" style={{ color: "var(--muted)" }}>
//             {subtitle}
//           </div>
//         ) : null}
//       </div>

//       <div className="flex shrink-0 items-center gap-1.5">
//         <span
//           className="h-2.5 w-2.5 rounded-full"
//           style={{ background: "var(--muted)" }}
//         />
//         <span
//           className="h-2.5 w-2.5 rounded-full"
//           style={{ background: "var(--muted)" }}
//         />
//         <span
//           className="h-2.5 w-2.5 rounded-full"
//           style={{
//             background: active ? "var(--inverse-surface)" : "var(--border)",
//           }}
//         />
//       </div>
//     </div>
//   );
// }

// function VideoPreview({
//   item,
//   active,
// }: {
//   item: SidebarItem;
//   active: boolean;
// }) {
//   return (
//     <div className="space-y-3">
//       <div
//         className="overflow-hidden rounded-2xl border"
//         style={{
//           background: "color-mix(in srgb, var(--surface) 84%, transparent)",
//           borderColor: "var(--border)",
//         }}
//       >
//         <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
//           <PreviewVideo src={item.video} />

//           <div
//             className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
//             style={{
//               background:
//                 "linear-gradient(to top, color-mix(in srgb, var(--surface) 92%, transparent), transparent)",
//             }}
//           />
//         </div>
//       </div>

//       <div className="flex items-center justify-between gap-2">
//         <div className="min-w-0">
//           <div
//             className="truncate text-xs font-medium"
//             style={{ color: "var(--foreground)" }}
//           >
//             {item.label}
//           </div>
//           <div
//             className="truncate text-[11px]"
//             style={{ color: "var(--muted)" }}
//           >
//             {item.href}
//           </div>
//         </div>

//         <div
//           className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold"
//           style={{
//             background: active
//               ? "var(--inverse-surface)"
//               : "color-mix(in srgb, var(--surface-3) 80%, transparent)",
//             color: active ? "var(--inverse-foreground)" : "var(--foreground)",
//           }}
//         >
//           {active ? "Current" : "Preview"}
//         </div>
//       </div>
//     </div>
//   );
// }

// function PreviewPortal({
//   item,
//   anchorRef,
//   visible,
//   position,
//   active,
//   onPreviewEnter,
//   onPreviewLeave,
// }: PreviewPortalProps) {
//   const [mounted, setMounted] = useState(false);
//   const [coords, setCoords] = useState({ left: 0, top: 0 });

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useLayoutEffect(() => {
//     if (!visible || !anchorRef.current) return;

//     const updatePosition = () => {
//       const rect = anchorRef.current?.getBoundingClientRect();
//       if (!rect) return;

//       const gap = 16;

//       setCoords({
//         left: rect.left + rect.width / 2,
//         top: position === "bottom" ? rect.top - gap : rect.bottom + gap,
//       });
//     };

//     updatePosition();

//     window.addEventListener("scroll", updatePosition, true);
//     window.addEventListener("resize", updatePosition);

//     return () => {
//       window.removeEventListener("scroll", updatePosition, true);
//       window.removeEventListener("resize", updatePosition);
//     };
//   }, [visible, anchorRef, position]);

//   if (!mounted) return null;

//   return createPortal(
//     <AnimatePresence>
//       {visible && (
//         <motion.div
//           initial={{
//             opacity: 0,
//             y: position === "bottom" ? 12 : -12,
//             scale: 0.96,
//           }}
//           animate={{
//             opacity: 1,
//             y: 0,
//             scale: 1,
//           }}
//           exit={{
//             opacity: 0,
//             y: position === "bottom" ? 8 : -8,
//             scale: 0.98,
//           }}
//           transition={{ duration: 0.18, ease: "easeOut" }}
//           className="fixed z-[99999]"
//           style={{
//             left: coords.left,
//             top: coords.top,
//             transform:
//               position === "bottom"
//                 ? "translate(-50%, -100%)"
//                 : "translate(-50%, 0)",
//           }}
//           onMouseEnter={onPreviewEnter}
//           onMouseLeave={onPreviewLeave}
//         >
//           <div className="relative">
//             <div
//               className="w-[340px] overflow-hidden rounded-[1.6rem] border p-3 shadow-2xl backdrop-blur-2xl"
//               style={{
//                 background:
//                   "color-mix(in srgb, var(--surface) 92%, transparent)",
//                 borderColor: "var(--border)",
//                 boxShadow:
//                   "0 22px 60px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
//               }}
//             >
//               <WindowChrome
//                 title={item.label}
//                 subtitle="Live page preview"
//                 active={active}
//               />

//               <VideoPreview item={item} active={active} />
//             </div>

//             <span
//               className={cn(
//                 "absolute left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border",
//                 position === "bottom" ? "-bottom-1.5" : "-top-1.5"
//               )}
//               style={{
//                 background:
//                   "color-mix(in srgb, var(--surface) 92%, transparent)",
//                 borderColor: "var(--border)",
//               }}
//             />
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>,
//     document.body
//   );
// }

// function DockItem({ item, mouseX, position }: DockItemProps) {
//   const ref = useRef<HTMLAnchorElement | null>(null);
//   const pathname = usePathname();

//   const [hoveredIcon, setHoveredIcon] = useState(false);
//   const [hoveredPreview, setHoveredPreview] = useState(false);

//   const closeTimeoutRef = useRef<number | null>(null);

//   const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
//   const Icon = item.icon;

//   const isOpen = hoveredIcon || hoveredPreview;

//   const clearCloseTimeout = () => {
//     if (closeTimeoutRef.current) {
//       window.clearTimeout(closeTimeoutRef.current);
//       closeTimeoutRef.current = null;
//     }
//   };

//   const openPreview = () => {
//     clearCloseTimeout();
//     setHoveredIcon(true);
//   };

//   const closePreviewWithDelay = () => {
//     clearCloseTimeout();
//     closeTimeoutRef.current = window.setTimeout(() => {
//       setHoveredIcon(false);
//       setHoveredPreview(false);
//     }, 120);
//   };

//   useEffect(() => {
//     return () => clearCloseTimeout();
//   }, []);

//   const distance = useTransform(mouseX, (value) => {
//     const rect = ref.current?.getBoundingClientRect();
//     if (!rect) return 0;
//     return value - (rect.left + rect.width / 2);
//   });

//   const widthTransform = useTransform(distance, [-160, 0, 160], [52, 76, 52]);
//   const heightTransform = useTransform(distance, [-160, 0, 160], [52, 76, 52]);
//   const iconScaleTransform = useTransform(
//     distance,
//     [-160, 0, 160],
//     [1, 1.18, 1]
//   );

//   const width = useSpring(widthTransform, {
//     mass: 0.1,
//     stiffness: 170,
//     damping: 14,
//   });

//   const height = useSpring(heightTransform, {
//     mass: 0.1,
//     stiffness: 170,
//     damping: 14,
//   });

//   const iconScale = useSpring(iconScaleTransform, {
//     mass: 0.1,
//     stiffness: 170,
//     damping: 14,
//   });

//   return (
//     <div className="relative flex shrink-0 items-center justify-center">
//       <PreviewPortal
//         item={item}
//         anchorRef={ref}
//         visible={isOpen}
//         position={position}
//         active={active}
//         onPreviewEnter={() => {
//           clearCloseTimeout();
//           setHoveredPreview(true);
//         }}
//         onPreviewLeave={() => {
//           setHoveredPreview(false);
//           closePreviewWithDelay();
//         }}
//       />

//       <motion.div
//         style={{ width, height }}
//         className="relative flex aspect-square items-center justify-center"
//       >
//         <Link
//           ref={ref}
//           href={item.href}
//           onMouseEnter={openPreview}
//           onMouseLeave={() => {
//             setHoveredIcon(false);
//             closePreviewWithDelay();
//           }}
//           className={cn(
//             "relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border transition-colors duration-200",
//             active
//               ? "inverse-surface shadow-lg-inverse"
//               : "bg-surface text-foreground"
//           )}
//           style={{
//             borderColor: active ? "transparent" : "var(--border)",
//             boxShadow: active
//               ? undefined
//               : "0 8px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.10)",
//             backdropFilter: "blur(18px)",
//           }}
//         >
//           {!active && (
//             <span
//               className="pointer-events-none absolute inset-[1px] rounded-[calc(1rem-2px)]"
//               style={{
//                 background:
//                   "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
//               }}
//             />
//           )}

//           <motion.div
//             style={{ scale: iconScale }}
//             className="relative z-[1] flex items-center justify-center"
//           >
//             <Icon
//               className={cn(
//                 "text-[1.45rem]",
//                 active ? "" : "text-[var(--foreground)]"
//               )}
//             />
//           </motion.div>
//         </Link>
//       </motion.div>
//     </div>
//   );
// }

// export default function DockNavbarTop({
//   position,
//   sections,
// }: DockNavbarTopProps) {
//   const mouseX = useMotionValue<number>(Infinity);
//   const dockItems = useMemo(() => getDockItems(sections), [sections]);

//   return (
//     <div
//       className={cn(
//         "fixed left-4 right-4 z-50 hidden md:block",
//         position === "bottom" ? "bottom-4" : "top-4"
//       )}
//     >
//       <motion.div
//         onMouseMove={(event) => mouseX.set(event.pageX)}
//         onMouseLeave={() => mouseX.set(Infinity)}
//         className="flex w-full items-center justify-center"
//       >
//         <div
//           className={cn(
//             "flex w-fit max-w-[calc(100vw-2rem)] items-end gap-3 overflow-x-auto rounded-[1.75rem] border px-4",
//             position === "bottom" ? "pt-4 pb-3" : "pt-3 pb-4"
//           )}
//           style={{
//             background: "color-mix(in srgb, var(--surface) 85%, transparent)",
//             borderColor: "var(--border)",
//             boxShadow:
//               "0 18px 50px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
//             backdropFilter: "blur(18px)",
//           }}
//         >
//           {dockItems.map((item) => (
//             <DockItem
//               key={item.href}
//               item={item}
//               mouseX={mouseX}
//               position={position}
//             />
//           ))}
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// ================NEW===================
"use client";

import PreviewVideo from "@/components/ui/video/PreviewVideo";
import { cn } from "@/lib/cn";
import {
  getDockItems,
  type SidebarItem,
  type SidebarSection,
} from "@/lib/mock-data/Navbar";
import useIsClient from "@/lib/useIsClient";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type DockNavbarTopProps = {
  sections: SidebarSection[];
  inFrame?: boolean;
  className?: string;
};

type DockItemProps = {
  item: SidebarItem;
  index: number;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
};

type PreviewPortalProps = {
  item: SidebarItem;
  anchorRef: React.RefObject<HTMLElement | null>;
  visible: boolean;
  active: boolean;
  onPreviewEnter: () => void;
  onPreviewLeave: () => void;
};

const DOCK_ITEM_SIZE = "clamp(2.4rem, 3.4vw, 3rem)";

const getDockItemTransform = (hoveredIndex: number | null, index: number) => {
  if (hoveredIndex === null) return { scale: 1, y: 0 };

  const distance = Math.abs(hoveredIndex - index);
  if (distance === 0) return { scale: 1.25, y: 10 };
  if (distance === 1) return { scale: 1.12, y: 5 };
  if (distance === 2) return { scale: 1.05, y: 2 };

  return { scale: 1, y: 0 };
};

function WindowChrome({
  title,
  subtitle,
  active,
}: {
  title: string;
  subtitle?: string;
  active?: boolean;
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div
          className="truncate text-sm font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          {title}
        </div>

        {subtitle ? (
          <div className="truncate text-xs" style={{ color: "var(--muted)" }}>
            {subtitle}
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: "var(--muted)" }}
        />
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: "var(--muted)" }}
        />
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{
            background: active ? "var(--inverse-surface)" : "var(--border)",
          }}
        />
      </div>
    </div>
  );
}

function VideoPreview({
  item,
  active,
}: {
  item: SidebarItem;
  active: boolean;
}) {
  return (
    <div className="space-y-3">
      <div
        className="overflow-hidden rounded-2xl border"
        style={{
          background: "color-mix(in srgb, var(--surface) 84%, transparent)",
          borderColor: "var(--border)",
        }}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
          <PreviewVideo
            lightVideoSrc={item.lightVideoSrc}
            darkVideoSrc={item.darkVideoSrc}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
            style={{
              background:
                "linear-gradient(to top, color-mix(in srgb, var(--surface) 92%, transparent), transparent)",
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div
            className="truncate text-xs font-medium"
            style={{ color: "var(--foreground)" }}
          >
            {item.label}
          </div>
          <div
            className="truncate text-[11px]"
            style={{ color: "var(--muted)" }}
          >
            {item.href}
          </div>
        </div>

        <div
          className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold"
          style={{
            background: active
              ? "var(--inverse-surface)"
              : "color-mix(in srgb, var(--surface-3) 80%, transparent)",
            color: active ? "var(--inverse-foreground)" : "var(--foreground)",
          }}
        >
          {active ? "Current" : "Preview"}
        </div>
      </div>
    </div>
  );
}

function PreviewPortal({
  item,
  anchorRef,
  visible,
  active,
  onPreviewEnter,
  onPreviewLeave,
}: PreviewPortalProps) {
  const mounted = useIsClient();
  const [coords, setCoords] = useState({ left: 0, top: 0 });

  useLayoutEffect(() => {
    if (!visible || !anchorRef.current) return;

    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;

      const gap = 16;

      setCoords({
        left: rect.left + rect.width / 2,
        top: rect.bottom + gap,
      });
    };

    updatePosition();

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [visible, anchorRef]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed z-[99999]"
          style={{
            left: coords.left,
            top: coords.top,
            transform: "translate(-50%, 0)",
          }}
          onMouseEnter={onPreviewEnter}
          onMouseLeave={onPreviewLeave}
        >
          <div className="relative">
            <div
              className="w-[340px] overflow-hidden rounded-[1.6rem] border p-3 shadow-2xl backdrop-blur-2xl"
              style={{
                background:
                  "color-mix(in srgb, var(--surface) 92%, transparent)",
                borderColor: "var(--border)",
                boxShadow:
                  "0 22px 60px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <WindowChrome
                title={item.label}
                subtitle="Live page preview"
                active={active}
              />
              <VideoPreview item={item} active={active} />
            </div>

            <span
              className="absolute -top-1.5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border"
              style={{
                background:
                  "color-mix(in srgb, var(--surface) 92%, transparent)",
                borderColor: "var(--border)",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function DockItem({
  item,
  index,
  hoveredIndex,
  setHoveredIndex,
}: DockItemProps) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const pathname = usePathname();

  const [hoveredIcon, setHoveredIcon] = useState(false);
  const [hoveredPreview, setHoveredPreview] = useState(false);

  const closeTimeoutRef = useRef<number | null>(null);

  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;
  const isOpen = hoveredIcon || hoveredPreview;

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openPreview = () => {
    clearCloseTimeout();
    setHoveredIndex(index);
    setHoveredIcon(true);
  };

  const closePreviewWithDelay = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = window.setTimeout(() => {
      setHoveredIcon(false);
      setHoveredPreview(false);
    }, 120);
  };

  useEffect(() => {
    return () => clearCloseTimeout();
  }, []);

  return (
    <div className="relative flex shrink-0 items-center justify-center">
      <PreviewPortal
        item={item}
        anchorRef={ref}
        visible={isOpen}
        active={active}
        onPreviewEnter={() => {
          clearCloseTimeout();
          setHoveredPreview(true);
        }}
        onPreviewLeave={() => {
          setHoveredPreview(false);
          closePreviewWithDelay();
        }}
      />

      <motion.div
        animate={getDockItemTransform(hoveredIndex, index)}
        transition={{ type: "spring", stiffness: 260, damping: 20, mass: 0.22 }}
        style={{
          width: DOCK_ITEM_SIZE,
          height: DOCK_ITEM_SIZE,
          transformOrigin: "top center",
          willChange: "transform",
        }}
        className="relative flex aspect-square items-center justify-center"
      >
        <Link
          ref={ref}
          href={item.href}
          onMouseEnter={openPreview}
          onMouseLeave={() => {
            setHoveredIcon(false);
            closePreviewWithDelay();
          }}
          className={cn(
            "relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border transition-colors duration-200",
            active
              ? "text-[var(--color-brand-500)]"
              : "text-[var(--foreground)]",
          )}
          style={{
            background: active
              ? "linear-gradient(180deg, color-mix(in srgb, var(--color-brand-500) 16%, var(--surface)), color-mix(in srgb, var(--color-brand-500) 10%, var(--surface-2)))"
              : undefined,
            borderColor: active
              ? "color-mix(in srgb, var(--color-brand-500) 30%, var(--border))"
              : "var(--border)",
            boxShadow: active
              ? "0 10px 24px rgba(var(--shadow-color), 0.10), inset 0 1px 0 rgba(255,255,255,0.08)"
              : "0 8px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.10)",
            backdropFilter: "blur(18px)",
          }}
        >
          {!active && (
            <span
              className="pointer-events-none absolute inset-[1px] rounded-[calc(1rem-2px)]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
              }}
            />
          )}

          <div className="relative z-[1] flex items-center justify-center">
            <Icon
              className="text-[1.28rem] 2xl:text-[1.38rem]"
              style={{
                color: active
                  ? "color-mix(in srgb, var(--color-brand-500) 72%, var(--foreground))"
                  : "var(--foreground)",
              }}
            />
          </div>
        </Link>
      </motion.div>
    </div>
  );
}

export default function DockNavbarTop({
  sections,
  inFrame = false,
  className,
}: DockNavbarTopProps) {
  const dockItems = useMemo(() => getDockItems(sections), [sections]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "hidden md:block",
        inFrame ? "relative" : "fixed top-4 right-4 left-4 z-50",
        className,
      )}
    >
      <div
        onMouseLeave={() => setHoveredIndex(null)}
        className="flex h-[76px] w-full items-center justify-center overflow-visible"
      >
        <div
          className={cn(
            "flex w-fit items-center overflow-visible rounded-[2rem] border px-2.5 py-2 shadow-2xl backdrop-blur-md",
            inFrame ? "max-w-full" : "max-w-[calc(100vw-2rem)]",
          )}
          style={{
            gap: "clamp(0.45rem, 0.75vw, 0.75rem)",
            background:
              "linear-gradient(180deg, var(--surface), color-mix(in srgb, var(--surface) 92%, var(--background)))",
            borderColor: "var(--border)",
            boxShadow:
              "0 16px 38px rgba(var(--shadow-color), 0.16), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {dockItems.map((item, index) => (
            <DockItem
              key={item.href}
              item={item}
              index={index}
              hoveredIndex={hoveredIndex}
              setHoveredIndex={setHoveredIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
