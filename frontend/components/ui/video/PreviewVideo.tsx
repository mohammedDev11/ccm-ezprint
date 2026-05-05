// "use client";

// import React from "react";
// import { cn } from "@/lib/cn";

// type PreviewVideoProps = {
//   src?: string;
//   className?: string;
// };

// const PreviewVideo: React.FC<PreviewVideoProps> = ({ src, className }) => {
//   if (!src) {
//     return (
//       <div
//         className={cn(
//           "flex h-full w-full items-center justify-center text-xs",
//           className
//         )}
//         style={{ color: "var(--muted)" }}
//       >
//         No preview video
//       </div>
//     );
//   }

//   return (
//     <video
//       src={src}
//       muted
//       loop
//       autoPlay
//       playsInline
//       preload="metadata"
//       className={cn("h-full w-full object-cover", className)}
//     />
//   );
// };

// export default PreviewVideo;

// ===========NEW==============
// "use client";

// import React from "react";
// import { cn } from "@/lib/cn";

// type PreviewVideoProps = {
//   lightVideoSrc?: string;
//   darkVideoSrc?: string;
//   className?: string;
// };

// const PreviewVideo: React.FC<PreviewVideoProps> = ({
//   lightVideoSrc,
//   darkVideoSrc,
//   className,
// }) => {
//   const hasAnyVideo = lightVideoSrc || darkVideoSrc;

//   if (!hasAnyVideo) {
//     return (
//       <div
//         className={cn(
//           "flex h-full w-full items-center justify-center text-xs",
//           className
//         )}
//         style={{ color: "var(--muted)" }}
//       >
//         No preview video
//       </div>
//     );
//   }

//   return (
//     <div className={cn("relative h-full w-full", className)}>
//       {lightVideoSrc && (
//         <video
//           src={lightVideoSrc}
//           muted
//           loop
//           autoPlay
//           playsInline
//           preload="metadata"
//           className="h-full w-full object-cover dark:hidden"
//         />
//       )}

//       {darkVideoSrc && (
//         <video
//           src={darkVideoSrc}
//           muted
//           loop
//           autoPlay
//           playsInline
//           preload="metadata"
//           className="hidden h-full w-full object-cover dark:block"
//         />
//       )}

//       {!lightVideoSrc && darkVideoSrc && (
//         <video
//           src={darkVideoSrc}
//           muted
//           loop
//           autoPlay
//           playsInline
//           preload="metadata"
//           className="dark:hidden"
//         />
//       )}

//       {!darkVideoSrc && lightVideoSrc && (
//         <video
//           src={lightVideoSrc}
//           muted
//           loop
//           autoPlay
//           playsInline
//           preload="metadata"
//           className="hidden dark:block"
//         />
//       )}
//     </div>
//   );
// };

// export default PreviewVideo;

// ===========NEW======================
"use client";

import React, { useMemo } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/cn";
import useIsClient from "@/lib/useIsClient";

type PreviewVideoProps = {
  lightVideoSrc?: string;
  darkVideoSrc?: string;
  lightPoster?: string;
  darkPoster?: string;
  className?: string;
};

const PreviewVideo: React.FC<PreviewVideoProps> = ({
  lightVideoSrc,
  darkVideoSrc,
  lightPoster,
  darkPoster,
  className,
}) => {
  const { theme, resolvedTheme } = useTheme();
  const mounted = useIsClient();

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  const fallbackSrc = lightVideoSrc || darkVideoSrc || "";

  const videoSrc = useMemo(() => {
    if (!mounted) return "";
    if (isDark) return darkVideoSrc || fallbackSrc;
    return lightVideoSrc || fallbackSrc;
  }, [mounted, isDark, lightVideoSrc, darkVideoSrc, fallbackSrc]);

  const poster = useMemo(() => {
    if (!mounted) return undefined;
    if (isDark) return darkPoster || lightPoster;
    return lightPoster || darkPoster;
  }, [mounted, isDark, lightPoster, darkPoster]);

  if (!mounted) return null;

  if (!videoSrc) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center text-xs",
          className
        )}
        style={{ color: "var(--muted)" }}
      >
        No preview video
      </div>
    );
  }

  return (
    <video
      key={videoSrc}
      src={videoSrc}
      poster={poster}
      muted
      loop
      autoPlay
      playsInline
      preload="metadata"
      disablePictureInPicture
      className={cn("h-full w-full object-cover", className)}
    />
  );
};

export default PreviewVideo;
