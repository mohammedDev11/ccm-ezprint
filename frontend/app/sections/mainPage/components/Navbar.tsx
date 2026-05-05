// "use client";
// import { cn } from "@/lib/cn";
// import { IconMenu2, IconX } from "@tabler/icons-react";
// import {
//   motion,
//   AnimatePresence,
//   useScroll,
//   useMotionValueEvent,
// } from "motion/react";

// import React, { useRef, useState } from "react";

// interface NavbarProps {
//   children: React.ReactNode;
//   className?: string;
// }

// interface NavBodyProps {
//   children: React.ReactNode;
//   className?: string;
//   visible?: boolean;
// }

// interface NavItemsProps {
//   items: {
//     name: string;
//     link: string;
//   }[];
//   className?: string;
//   onItemClick?: () => void;
// }

// interface MobileNavProps {
//   children: React.ReactNode;
//   className?: string;
//   visible?: boolean;
// }

// interface MobileNavHeaderProps {
//   children: React.ReactNode;
//   className?: string;
// }

// interface MobileNavMenuProps {
//   children: React.ReactNode;
//   className?: string;
//   isOpen: boolean;
//   onClose: () => void;
// }

// export const Navbar = ({ children, className }: NavbarProps) => {
//   const { scrollY } = useScroll();
//   const [visible, setVisible] = useState<boolean>(false);

//   useMotionValueEvent(scrollY, "change", (latest) => {
//     setVisible(latest > 100);
//   });

//   return (
//     <motion.div className={cn("fixed inset-x-0 top-0 z-40 w-full", className)}>
//       {React.Children.map(children, (child) =>
//         React.isValidElement(child)
//           ? React.cloneElement(
//               child as React.ReactElement<{ visible?: boolean }>,
//               { visible }
//             )
//           : child
//       )}
//     </motion.div>
//   );
// };

// export const NavBody = ({ children, className, visible }: NavBodyProps) => {
//   return (
//     <motion.div
//       animate={{
//         backdropFilter: visible ? "blur(10px)" : "none",
//         boxShadow: visible
//           ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
//           : "none",
//         width: visible ? "40%" : "100%",
//         y: visible ? 20 : 0,
//       }}
//       transition={{
//         type: "spring",
//         stiffness: 200,
//         damping: 50,
//       }}
//       style={{
//         minWidth: "800px",
//       }}
//       className={cn(
//         "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full bg-transparent px-4 py-2 lg:flex",
//         visible && "bg-white/80 ",
//         className
//       )}
//     >
//       {children}
//     </motion.div>
//   );
// };

// export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
//   const [hovered, setHovered] = useState<number | null>(null);

//   return (
//     <motion.div
//       onMouseLeave={() => setHovered(null)}
//       className={cn(
//         "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-[var(--muted)] transition duration-200 hover:text-[var(--color-brand-500)] lg:flex lg:space-x-2",
//         className
//       )}
//     >
//       {items.map((item, idx) => (
//         <a
//           onMouseEnter={() => setHovered(idx)}
//           onClick={onItemClick}
//           className="relative px-4 py-2 text-[var(--muted)] transition-colors duration-200 hover:text-[var(--color-brand-500)]"
//           key={`link-${idx}`}
//           href={item.link}
//         >
//           {hovered === idx && (
//             <motion.div
//               layoutId="hovered"
//               className="absolute inset-0 h-full w-full rounded-full bg-[var(--surface-2)]"
//             />
//           )}
//           <span className="relative z-20">{item.name}</span>
//         </a>
//       ))}
//     </motion.div>
//   );
// };

// export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
//   return (
//     <motion.div
//       animate={{
//         backdropFilter: visible ? "blur(10px)" : "none",
//         boxShadow: visible
//           ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
//           : "none",
//         width: visible ? "90%" : "100%",
//         paddingRight: visible ? "12px" : "0px",
//         paddingLeft: visible ? "12px" : "0px",
//         borderRadius: visible ? "4px" : "2rem",
//         y: visible ? 20 : 0,
//       }}
//       transition={{
//         type: "spring",
//         stiffness: 200,
//         damping: 50,
//       }}
//       className={cn(
//         "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden",
//         visible && "bg-white/80",
//         className
//       )}
//     >
//       {children}
//     </motion.div>
//   );
// };

// export const MobileNavHeader = ({
//   children,
//   className,
// }: MobileNavHeaderProps) => {
//   return (
//     <div
//       className={cn(
//         "flex w-full flex-row items-center justify-between",
//         className
//       )}
//     >
//       {children}
//     </div>
//   );
// };

// export const MobileNavMenu = ({
//   children,
//   className,
//   isOpen,
//   onClose,
// }: MobileNavMenuProps) => {
//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           className={cn(
//             "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-white px-4 py-8 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
//             className
//           )}
//         >
//           {children}
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// export const MobileNavToggle = ({
//   isOpen,
//   onClick,
// }: {
//   isOpen: boolean;
//   onClick: () => void;
// }) => {
//   return isOpen ? (
//     <IconX className="text-[var(--foreground)]" onClick={onClick} />
//   ) : (
//     <IconMenu2 className="text-[var(--foreground)]" onClick={onClick} />
//   );
// };

// export const NavbarLogo = () => {
//   return (
//     <a
//       href="#"
//       className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-[var(--foreground)]"
//     >
//       <img
//         src="https://assets.aceternity.com/logo-dark.png"
//         alt="logo"
//         width={30}
//         height={30}
//       />
//       <span className="font-medium text-[var(--foreground)]">Startup</span>
//     </a>
//   );
// };

// export const NavbarButton = ({
//   href,
//   as: Tag = "a",
//   children,
//   className,
//   variant = "primary",
//   ...props
// }: {
//   href?: string;
//   as?: React.ElementType;
//   children: React.ReactNode;
//   className?: string;
//   variant?: "primary" | "secondary" | "dark" | "gradient";
// } & (
//   | React.ComponentPropsWithoutRef<"a">
//   | React.ComponentPropsWithoutRef<"button">
// )) => {
//   const baseStyles =
//     "px-4 py-2 rounded-md bg-white button bg-white text-black text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

//   const variantStyles = {
//     primary:
//       "shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
//     secondary: "bg-transparent shadow-none text-[var(--foreground)]",
//     dark: "bg-black text-white shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
//     gradient:
//       "bg-gradient-to-b from-brand-400 to-brand-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.22)_inset]",
//   };

//   return (
//     <Tag
//       href={href || undefined}
//       className={cn(baseStyles, variantStyles[variant], className)}
//       {...props}
//     >
//       {children}
//     </Tag>
//   );
// };

// =============New============
"use client";
import { cn } from "@/lib/cn";
import { BrandMark } from "@/components/shared/page/Logo";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import React, { useState } from "react";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 100);
  });

  return (
    <motion.div className={cn("fixed inset-x-0 top-0 z-40 w-full", className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible }
            )
          : child
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.08) inset"
          : "none",
        width: visible ? "85%" : "100%",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      style={{
        minWidth: "800px",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-md bg-transparent px-4 py-2 mt-4 lg:flex",
        visible && " bg-[color:var(--surface)]/80 backdrop-blur-xl",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-[var(--muted)] transition duration-200 hover:text-[var(--foreground)] lg:flex lg:space-x-1",
        className
      )}
    >
      {items.map((item, idx) => (
        <a
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative px-4 py-2 text-[var(--muted)] transition-colors duration-200 hover:text-[var(--foreground)]"
          key={`link-${idx}`}
          href={item.link}
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-full bg-[var(--surface-2)]"
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </a>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.08) inset"
          : "none",
        width: visible ? "90%" : "100%",
        paddingRight: visible ? "12px" : "0px",
        paddingLeft: visible ? "12px" : "0px",
        borderRadius: visible ? "4px" : "2rem",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden",
        visible &&
          "border border-[var(--border)] bg-[color:var(--surface)]/80 backdrop-blur-xl",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              onClose();
            }
          }}
          role="dialog"
          tabIndex={-1}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-8 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.08)_inset]",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return isOpen ? (
    <IconX className="text-[var(--foreground)]" onClick={onClick} />
  ) : (
    <IconMenu2 className="text-[var(--foreground)]" onClick={onClick} />
  );
};

export const NavbarLogo = () => {
  return (
    <a
      href="#"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-[var(--foreground)]"
    >
      <BrandMark compact />
      <span
        className="whitespace-nowrap text-[1.125rem] leading-none sm:text-[1.5rem]"
        style={{
          color: "var(--foreground)",
          fontFamily: '"Sora", var(--font-sans), ui-sans-serif, sans-serif',
          fontWeight: 800,
          letterSpacing: "-0.015em",
        }}
      >
        <span
          style={{
            color: "var(--color-brand-500)",
            fontWeight: 600,
            letterSpacing: "0",
          }}
        >
          Ez
        </span>
        <span
          style={{
            color: "var(--foreground)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          Print
        </span>
      </span>
    </a>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {
  const baseStyles =
    "px-4 py-2 rounded-md text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

  const variantStyles = {
    primary:
      "bg-[var(--foreground)] text-[var(--background)] shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.08)_inset]",
    secondary: "bg-transparent shadow-none text-[var(--foreground)]",
    dark: "bg-[var(--foreground)] text-[var(--background)] shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.08)_inset]",
    gradient:
      "bg-gradient-to-b from-brand-400 to-brand-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.22)_inset]",
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};
