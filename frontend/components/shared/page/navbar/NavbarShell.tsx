"use client";

import Logo from "@/components/shared/page/Logo";
import { cn } from "@/lib/cn";
import {
  getSidebarSectionsForRole,
  type NavbarRole,
} from "@/lib/mock-data/Navbar";
import { getRoutingRole } from "@/lib/role-access";
import {
  dispatchThemeModeChange,
  getNextManualThemeMode,
  getThemePreferencesPath,
  isThemeMode,
  readStoredThemeMode,
  type ThemeMode,
} from "@/lib/theme-mode";
import useIsClient from "@/lib/useIsClient";
import { apiGet, apiPatch, getSession, logoutAllSessions } from "@/services/api";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  LogOut,
  Settings,
  UserRound,
  View,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import DockNavbarBottom from "./DockNavbar/DockNavbarBottom";
import DockNavbarTop from "./DockNavbar/DockNavbarTop";
import GlobalSearch from "./GlobalSearch";
import MobileNavbar from "./MobileNavbar";
import NavbarModeSwitcher, { type NavbarMode } from "./NavbarModeSwitcher";
import SidebarNavbar from "./SidebarNavbar";

const STORAGE_KEY = "ezprint-navbar-mode";
let sidebarPointerInsideSnapshot = false;

const readStoredMode = (): NavbarMode | null => {
  if (typeof window === "undefined") return null;

  const saved = window.localStorage.getItem(STORAGE_KEY);

  return saved === "left" ||
    saved === "right" ||
    saved === "bottom" ||
    saved === "top"
    ? saved
    : null;
};

const isNavbarMode = (value: unknown): value is NavbarMode =>
  value === "left" || value === "right" || value === "bottom" || value === "top";

type ShellSettingsResponse = {
  preferences?: {
    ui?: {
      theme?: string;
      navbarMode?: string;
    };
  };
};

const persistThemeMode = async (scope: NavbarRole, themeMode: ThemeMode) => {
  try {
    await apiPatch(
      getThemePreferencesPath(scope),
      {
        preferences: {
          ui: {
            theme: themeMode,
          },
        },
      },
      scope,
    );
  } catch {
    // Local theme choice still persists through next-themes if the API is unavailable.
  }
};

const persistNavbarMode = async (scope: NavbarRole, navbarMode: NavbarMode) => {
  try {
    await apiPatch(
      getThemePreferencesPath(scope),
      {
        preferences: {
          ui: {
            navbarMode,
          },
        },
      },
      scope,
    );
  } catch {
    // Local navbar choice still persists through localStorage if the API is unavailable.
  }
};

function FrameUserBadge({
  role,
  isClient,
  placement = "down",
}: {
  role: NavbarRole;
  isClient: boolean;
  placement?: "up" | "down";
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const session = isClient ? getSession(role) : null;
  const fullName =
    session?.user.fullName ||
    (role === "admin" ? "Admin Operator" : "Print User");
  const roleLabel = session?.user.role || (role === "admin" ? "Admin" : "User");
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
  const profileHref = role === "admin" ? "/sections/user/profile" : "/sections/user/profile";
  const notificationHref = `/sections/${role}/notifications`;
  const settingsHref = `/sections/${role}/settings`;
  const actions = [
    {
      label: "Profile",
      href: profileHref,
      icon: <UserRound className="h-4 w-4" />,
    },
    {
      label: "Notifications",
      href: notificationHref,
      icon: <Bell className="h-4 w-4" />,
    },
    {
      label: "Settings",
      href: settingsHref,
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleLogout = () => {
    logoutAllSessions();
    setOpen(false);
    router.push("/");
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300"
        style={{
          color: "var(--color-brand-500)",
          background: "rgba(201, 106, 90, 0.12)",
          boxShadow: open
            ? "0 0 0 4px rgba(var(--brand-rgb),0.12), inset 0 1px 0 rgba(255,255,255,0.06)"
            : "inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open profile menu"
      >
        {initials}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{
              opacity: 0,
              y: placement === "up" ? 8 : -8,
              scale: 0.96,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: placement === "up" ? 8 : -8,
              scale: 0.96,
            }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={cn(
              "absolute right-0 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border p-2 text-sm shadow-2xl backdrop-blur-xl",
              placement === "up"
                ? "bottom-[calc(100%+0.65rem)] origin-bottom-right"
                : "top-[calc(100%+0.65rem)] origin-top-right",
            )}
            style={{
              borderColor: "var(--border)",
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
              boxShadow:
                "0 18px 42px rgba(var(--shadow-color), 0.18), inset 0 1px 0 rgba(255,255,255,0.07)",
            }}
            role="menu"
          >
            <div className="flex items-center gap-3 rounded-lg px-3 py-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                style={{
                  color: "var(--color-brand-500)",
                  background: "rgba(var(--brand-rgb), 0.12)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
              >
                {initials}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--title)]">
                  {fullName}
                </p>
                <p className="mt-1 text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  {roleLabel}
                </p>
              </div>
            </div>

            <div className="my-2 h-px bg-[var(--border)]" />

            <div className="space-y-1">
              {actions.map((action) => {
                const active =
                  pathname === action.href ||
                  (action.href !== "/" && pathname.startsWith(`${action.href}/`));

                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    onClick={() => setOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition hover:bg-[var(--surface-2)] hover:text-[var(--color-brand-500)]"
                    style={{
                      background: active ? "rgba(var(--brand-rgb), 0.1)" : "transparent",
                      color: active ? "var(--color-brand-600)" : "var(--paragraph)",
                    }}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)]">
                      {action.icon}
                    </span>
                    <span>{action.label}</span>
                  </Link>
                );
              })}

              {role === "admin" ? (
                <Link
                  href="/sections/user/dashboard"
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-[var(--paragraph)] transition hover:bg-[var(--surface-2)] hover:text-[var(--color-brand-500)]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)]">
                    <View className="h-4 w-4" />
                  </span>
                  <span>Switch to User View</span>
                </Link>
              ) : null}
            </div>

            <div className="my-2 h-px bg-[var(--border)]" />

            <button
              type="button"
              onClick={handleLogout}
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-medium text-[var(--paragraph)] transition hover:bg-[var(--surface-2)] hover:text-[var(--color-brand-500)]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)]">
                <LogOut className="h-4 w-4" />
              </span>
              <span>Log out</span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ShellThemeButton({ role }: { role: NavbarRole }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useIsClient();

  if (!mounted) return null;

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";
  const handleToggleTheme = () => {
    const nextThemeMode = getNextManualThemeMode(theme, resolvedTheme);

    setTheme(nextThemeMode);
    dispatchThemeModeChange(nextThemeMode);
    void persistThemeMode(role, nextThemeMode);
  };

  return (
    <button
      type="button"
      onClick={handleToggleTheme}
      className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] transition-all duration-300 text-[var(--muted)] hover:text-[var(--color-brand-500)]"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
        boxShadow:
          "0 10px 24px rgba(var(--shadow-color), 0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
}

export default function NavbarShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: NavbarRole;
}) {
  const { setTheme } = useTheme();
  const [manualMode, setManualMode] = useState<NavbarMode | null>(null);
  const [isPointerInsideSidebar, setIsPointerInsideSidebar] = useState(
    () => sidebarPointerInsideSnapshot,
  );
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isClient = useIsClient();
  const session = isClient ? getSession(role) : null;
  const routingRole = session
    ? getRoutingRole(session.user)
    : role === "admin"
      ? "SubAdmin"
      : "User";

  const sections = useMemo(
    () => getSidebarSectionsForRole(role, routingRole),
    [role, routingRole],
  );
  const resolvedMode = manualMode ?? (isClient ? readStoredMode() : null) ?? "left";
  const isSidebarExpanded = isPointerInsideSidebar;

  const handleSidebarMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    sidebarPointerInsideSnapshot = true;
    setIsPointerInsideSidebar(true);
  };

  const handleSidebarMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      sidebarPointerInsideSnapshot = false;
      setIsPointerInsideSidebar(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.ezprintNavbarMode = resolvedMode;
    window.dispatchEvent(
      new CustomEvent("ezprint-navbar-mode-change", { detail: resolvedMode }),
    );
  }, [resolvedMode]);

  useEffect(() => {
    if (!isClient) return;

    const session = getSession(role);

    if (!session?.token) return;

    let isActive = true;
    const settingsPath = role === "admin" ? "/admin/settings" : "/user/settings";

    apiGet<ShellSettingsResponse>(settingsPath, role)
      .then((data) => {
        if (!isActive) return;

        const themePreference = data.preferences?.ui?.theme;
        const navbarPreference = data.preferences?.ui?.navbarMode;

        const storedThemeMode = readStoredThemeMode();
        const nextThemeMode = storedThemeMode || themePreference;

        if (isThemeMode(nextThemeMode)) {
          setTheme(nextThemeMode);
          dispatchThemeModeChange(nextThemeMode);
        }

        if (
          storedThemeMode &&
          isThemeMode(themePreference) &&
          storedThemeMode !== themePreference
        ) {
          void persistThemeMode(role, storedThemeMode);
        }

        const storedNavbarMode = readStoredMode();

        if (storedNavbarMode) {
          setManualMode(storedNavbarMode);

          if (
            isNavbarMode(navbarPreference) &&
            navbarPreference !== storedNavbarMode
          ) {
            void persistNavbarMode(role, storedNavbarMode);
          }
        } else if (isNavbarMode(navbarPreference)) {
          setManualMode(navbarPreference);
          window.localStorage.setItem(STORAGE_KEY, navbarPreference);
        }
      })
      .catch(() => {
        // Settings should not block navigation if the preference endpoint is unavailable.
      });

    return () => {
      isActive = false;
    };
  }, [isClient, role, setTheme]);

  useEffect(() => {
    if (!isClient) return;

    const handlePreferenceApply = (event: Event) => {
      const mode = (event as CustomEvent).detail;

      if (!isNavbarMode(mode)) {
        return;
      }

      setManualMode(mode);
      window.localStorage.setItem(STORAGE_KEY, mode);
    };

    window.addEventListener("ezprint-navbar-mode-apply", handlePreferenceApply);

    return () => {
      window.removeEventListener("ezprint-navbar-mode-apply", handlePreferenceApply);
    };
  }, [isClient]);

  const handleModeChange = (nextMode: NavbarMode) => {
    setManualMode(nextMode);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextMode);
    }

    void persistNavbarMode(role, nextMode);
  };

  const renderContentPanel = () => (
    <main
      className={cn(
        "app-panel flex min-h-0 flex-1 flex-col rounded-none",
        resolvedMode === "left" &&
          "rounded-tl-[1.8rem] sm:rounded-tl-[2rem]",
        resolvedMode === "right" &&
          "rounded-tr-[1.8rem] sm:rounded-tr-[2rem]",
      )}
    >
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="min-h-full">{children}</div>
        </div>
      </div>
    </main>
  );

  const renderShellBar = (placement: "top" | "bottom") => {
    const isDockMode = resolvedMode === "top" || resolvedMode === "bottom";

    return (
      <header
        className={cn(
          "z-20 hidden md:flex items-center justify-between overflow-visible",
          isDockMode
            ? "self-center rounded-[2rem] px-3 py-2 shadow-2xl backdrop-blur-md"
            : "gap-3 px-4 py-3 backdrop-blur-sm",
          isDockMode && placement === "top" && "mt-1.5",
          isDockMode && placement === "bottom" && "mb-3",
          !isDockMode && (placement === "top" ? "border-b" : "border-t"),
        )}
        style={{
          width: isDockMode ? "100%" : undefined,
          gap: isDockMode ? "clamp(0.5rem, 0.9vw, 0.9rem)" : undefined,
          background: isDockMode
            ? "linear-gradient(180deg, var(--background), color-mix(in srgb, var(--background) 88%, var(--surface)))"
            : "var(--background)",
          borderColor: isDockMode
            ? "var(--border)"
            : "transparent",
          boxShadow: isDockMode
            ? "0 18px 48px rgba(var(--shadow-color), 0.18), inset 0 1px 0 rgba(255,255,255,0.06)"
            : undefined,
        }}
      >
        <Logo />

        <div
          className={cn(
            "min-w-0 flex-1",
            isDockMode ? "px-1 lg:px-2" : "px-4",
          )}
        >
          {resolvedMode === "left" || resolvedMode === "right" ? (
            <GlobalSearch mode="full" role={role} sections={sections} />
          ) : null}
          {resolvedMode === "top" ? (
            <DockNavbarTop sections={sections} inFrame />
          ) : null}
          {resolvedMode === "bottom" ? (
            <DockNavbarBottom sections={sections} inFrame className="mx-auto" />
          ) : null}
        </div>

        <div
          className={cn(
            "flex shrink-0 items-center",
            isDockMode ? "gap-1.5" : "gap-2",
          )}
        >
          {resolvedMode !== "left" && resolvedMode !== "right" ? (
            <GlobalSearch
              mode="compact"
              role={role}
              sections={sections}
              placement={placement === "bottom" ? "up" : "down"}
            />
          ) : null}
          <NavbarModeSwitcher
            value={resolvedMode}
            onChange={handleModeChange}
            placement={placement === "bottom" ? "up" : "down"}
          />
          <ShellThemeButton role={role} />
          <FrameUserBadge
            role={role}
            isClient={isClient}
            placement={placement === "bottom" ? "up" : "down"}
          />
        </div>
      </header>
    );
  };

  return (
    <>
      <MobileNavbar sections={sections} />

      <div className="fixed inset-0 flex h-dvh flex-col bg-[var(--background)]">
        {resolvedMode !== "bottom" ? renderShellBar("top") : null}

        <div className="flex min-h-0 flex-1 overflow-hidden">
          {resolvedMode === "left" ? (
            <SidebarNavbar
              sections={sections}
              isExpanded={isSidebarExpanded}
              onMouseEnter={handleSidebarMouseEnter}
              onMouseLeave={handleSidebarMouseLeave}
              inFrame
              showBrand={false}
              className={cn(
                "hidden md:flex",
                isSidebarExpanded ? "w-[320px]" : "w-[112px]",
              )}
            />
          ) : null}

          <div className="flex min-h-0 flex-1 overflow-hidden">
            {renderContentPanel()}
          </div>

          {resolvedMode === "right" ? (
            <SidebarNavbar
              sections={sections}
              isExpanded={isSidebarExpanded}
              onMouseEnter={handleSidebarMouseEnter}
              onMouseLeave={handleSidebarMouseLeave}
              side="right"
              inFrame
              showBrand={false}
              className={cn(
                "hidden md:flex",
                isSidebarExpanded ? "w-[320px]" : "w-[112px]",
              )}
            />
          ) : null}
        </div>

        {resolvedMode === "bottom" ? renderShellBar("bottom") : null}
      </div>
    </>
  );
}
