// "use client";

// import { useEffect, useState } from "react";
// import { useTheme } from "next-themes";
// import { FiMoon, FiSun } from "react-icons/fi";

// export default function ThemeToggle() {
//   const { theme, setTheme, resolvedTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) return null;

//   const currentTheme = theme === "system" ? resolvedTheme : theme;

//   const isDark = currentTheme === "dark";

//   return (
//     <button
//       onClick={() => setTheme(isDark ? "light" : "dark")}
//       className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition text-muted hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
//     >
//       {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
//     </button>
//   );
// }

"use client";

import { useTheme } from "next-themes";
import { FiMoon, FiSun } from "react-icons/fi";
import IconLabelButton from "../../ui/button/IconLabelButton";
import useIsClient from "@/lib/useIsClient";
import {
  dispatchThemeModeChange,
  getNextManualThemeMode,
  getThemePreferencesPath,
} from "@/lib/theme-mode";
import { apiPatch, getCurrentSession } from "@/services/api";

const persistCurrentSessionThemeMode = async (themeMode: "light" | "dark") => {
  const session = getCurrentSession();

  if (!session) {
    return;
  }

  try {
    await apiPatch(
      getThemePreferencesPath(session.scope),
      {
        preferences: {
          ui: {
            theme: themeMode,
          },
        },
      },
      session.scope,
    );
  } catch {
    // Public pages and offline API states still keep the local theme override.
  }
};

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useIsClient();

  if (!mounted) return null;

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";
  const handleToggle = () => {
    const nextThemeMode = getNextManualThemeMode(theme, resolvedTheme);

    setTheme(nextThemeMode);
    dispatchThemeModeChange(nextThemeMode);
    void persistCurrentSessionThemeMode(nextThemeMode);
  };

  return (
    <IconLabelButton
      icon={isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
      label={isDark ? "Light" : "Dark"}
      onClick={handleToggle}
      className={className}
    />
  );
}
