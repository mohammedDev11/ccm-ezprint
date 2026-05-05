import Link from "next/link";
import Image from "next/image";
import favicon from "@/app/favicon.ico";
import { cn } from "@/lib/cn";

type BrandMarkProps = {
  className?: string;
  compact?: boolean;
};

type LogoProps = {
  className?: string;
  href?: string;
  showName?: boolean;
  showTagline?: boolean;
  tagline?: string;
  markClassName?: string;
  nameClassName?: string;
};

export function BrandMark({
  className,
  compact = false,
}: BrandMarkProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[1.05rem]",
        compact ? "h-10 w-10" : "h-11 w-11",
        className,
      )}
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--surface-raised) 92%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
        boxShadow:
          "0 12px 26px rgba(var(--shadow-color), 0.12), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <span
        className="pointer-events-none absolute inset-[1px] rounded-[calc(1.05rem-1px)]"
        style={{
          background:
            "linear-gradient(180deg, rgba(var(--brand-rgb), 0.08), rgba(var(--support-rgb), 0.04))",
        }}
      />

      <Image
        src={favicon}
        alt=""
        aria-hidden="true"
        className={cn(
          "relative z-10 object-contain",
          compact ? "h-5 w-5" : "h-6 w-6",
        )}
        sizes={compact ? "20px" : "24px"}
      />

      <span
        className="pointer-events-none absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
        style={{
          background: "rgba(var(--support-rgb), 0.9)",
          boxShadow: "0 0 0 4px rgba(var(--support-rgb), 0.12)",
        }}
      />
    </span>
  );
}

const Logo = ({
  className,
  href = "/",
  showName = true,
  showTagline = false,
  tagline = "Print Command Center",
  markClassName,
  nameClassName,
}: LogoProps) => {
  const content = (
    <span className={cn("flex items-center gap-3", className)}>
      <BrandMark className={markClassName} />

      {showName ? (
        <span className="min-w-0">
          <span
            className={cn(
              "block truncate text-[1.125rem] leading-none sm:text-[1.5rem]",
              nameClassName,
            )}
            style={{
              color: "var(--title)",
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
                color: "var(--title)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Print
            </span>
          </span>

          {showTagline ? (
            <span
              className="mt-0.5 block truncate text-[0.66rem] font-semibold uppercase tracking-[0.24em]"
              style={{ color: "var(--muted)" }}
            >
              {tagline}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );

  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  );
};

export default Logo;
