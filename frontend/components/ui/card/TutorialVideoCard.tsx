"use client";

import React, { useMemo } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/cn";
import useIsClient from "@/lib/useIsClient";

type TutorialVideoPreviewProps = {
  title: string;
  lightVideoSrc: string;
  darkVideoSrc: string;
  lightPoster?: string;
  darkPoster?: string;
  className?: string;
};

export default function TutorialVideoPreview({
  title,
  lightVideoSrc,
  darkVideoSrc,
  lightPoster,
  darkPoster,
  className,
}: TutorialVideoPreviewProps) {
  const { theme, resolvedTheme } = useTheme();
  const mounted = useIsClient();

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  const videoSrc = useMemo(() => {
    if (!mounted) return "";
    return isDark ? darkVideoSrc : lightVideoSrc;
  }, [mounted, isDark, darkVideoSrc, lightVideoSrc]);

  const poster = useMemo(() => {
    if (!mounted) return undefined;
    return isDark ? darkPoster : lightPoster;
  }, [mounted, isDark, darkPoster, lightPoster]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "pointer-events-none overflow-hidden rounded-[28px] border",
        "bg-[var(--surface)] border-[var(--border)] shadow-surface-lg",
        className
      )}
    >
      <div className="relative flex items-start justify-between border-b border-[var(--border)] px-5 pb-4 pt-5">
        <div>
          <h3 className="text-[1.9rem] font-bold leading-none text-[var(--title)]">
            {title}
          </h3>
          <p className="mt-2 text-[0.95rem] font-medium text-[var(--paragraph)]">
            Live page preview
          </p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <span className="h-4 w-4 rounded-full bg-[#ef4444]" />
          <span className="h-4 w-4 rounded-full bg-[#f59e0b]" />
          <span className="h-4 w-4 rounded-full bg-[#22c55e]" />
        </div>

        <div className="absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-t border-[var(--border)] bg-[var(--surface)]" />
      </div>

      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--surface-2)]">
        <video
          key={videoSrc}
          src={videoSrc}
          poster={poster}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
        />
      </div>
    </div>
  );
}
