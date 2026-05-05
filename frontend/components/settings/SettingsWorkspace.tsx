"use client";

import PageIntro from "@/components/shared/page/Text/PageIntro";
import Button from "@/components/ui/button/Button";
import ListBox, { type ListBoxOption } from "@/components/ui/listbox/ListBox";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";
import { cn } from "@/lib/cn";
import {
  dispatchThemeModeChange,
  isThemeMode,
  readStoredThemeMode,
  THEME_MODE_CHANGE_EVENT,
  type ThemeMode,
} from "@/lib/theme-mode";
import { apiDelete, apiGet, apiPatch, type Scope } from "@/services/api";
import {
  Bell,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  HardDrive,
  Info,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  Monitor,
  Palette,
  Printer,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UserRound,
} from "lucide-react";
import { useTheme } from "next-themes";
import type { ComponentType, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

type ThemePreference = ThemeMode;
type NavbarModePreference = "left" | "right" | "bottom" | "top";
type PrintSidePreference = "Simplex" | "Duplex";

const NAVBAR_MODE_STORAGE_KEY = "ezprint-navbar-mode";

const isNavbarModePreference = (value: unknown): value is NavbarModePreference =>
  value === "left" || value === "right" || value === "bottom" || value === "top";

const readStoredNavbarMode = (): NavbarModePreference | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(NAVBAR_MODE_STORAGE_KEY);
  return isNavbarModePreference(storedValue) ? storedValue : null;
};

type SettingsProfile = {
  id: string;
  displayName: string;
  username: string;
  email: string;
  role: string;
  department: string;
  editable: {
    displayName: boolean;
    email: boolean;
    password: boolean;
  };
};

type UserPreferences = {
  ui: {
    theme: ThemePreference;
    navbarMode: NavbarModePreference;
  };
  printing: {
    defaultPaperSize: string;
    defaultColorMode: string;
    defaultSides: PrintSidePreference;
    preferredQueueId: string;
  };
  drafts: {
    showSavedDrafts: boolean;
    autoSaveDrafts: boolean;
  };
  notifications: {
    printSuccess: boolean;
    printFailure: boolean;
    lowQuota: boolean;
    quotaUpdates: boolean;
  };
};

type QueueOption = {
  id: string;
  name: string;
  description: string;
  type: string;
  secureRelease: boolean;
};

type AccessSection = {
  label: string;
  path: string;
  reason: string;
};

type SystemSettings = {
  general: {
    systemName: string;
    defaultLanguage: string;
    defaultTheme: ThemePreference;
    supportMessage: string;
  };
  printing: {
    defaultPaperSize: string;
    defaultColorMode: string;
    defaultSides: PrintSidePreference;
    pendingJobRetentionHours: number;
    defaultCostPerPage: number;
  };
  security?: {
    jwtExpiresIn: string;
    inactivityLogoutSupported: boolean;
    adminOnlySections: AccessSection[];
    subAdminAllowedSections: AccessSection[];
  };
  fileDrafts: {
    allowedUploadTypes: string[];
    officeConversionEnabled: boolean;
    draftRetentionDays: number;
    maxFileSize: string;
  };
  notifications?: {
    printerIssueNotifications: boolean;
    jobFailureNotifications: boolean;
    lowQuotaNotifications: boolean;
  };
  metadata?: {
    updatedAt: string;
    readOnly: boolean;
  };
};

type SettingsResponse = {
  scope: Scope;
  role: string;
  capabilities: {
    canUpdateSystemSettings: boolean;
    canUpdateOwnPreferences: boolean;
    canClearDrafts: boolean;
  };
  profile: SettingsProfile;
  preferences: UserPreferences;
  printOptions: {
    queues: QueueOption[];
    defaults: UserPreferences["printing"];
    acceptedMimeTypes: string[];
    maxFiles: number;
  };
  drafts: {
    count: number;
    clearSupported: boolean;
  };
  system: SystemSettings;
  systemInfo?: {
    appName: string;
    apiName: string;
    version: string;
    nodeEnv: string;
    backendStatus: string;
    databaseStatus: string;
    uploadLimit: string;
    officeConversionStatus: string;
    lastUpdatedAt: string;
  };
  accessOverview?: {
    adminOnlySections: AccessSection[];
    subAdminAllowedSections: AccessSection[];
  };
  featureSupport: {
    passwordChange: boolean;
    emailNotifications: boolean;
    officeConversion: boolean;
    clearDrafts: boolean;
  };
};

type SettingsTab =
  | "general"
  | "profile"
  | "printing"
  | "access"
  | "files"
  | "drafts"
  | "notifications"
  | "account"
  | "system";

type DirtySection =
  | "profile"
  | "printing"
  | "drafts"
  | "notifications"
  | "system-general"
  | "system-printing"
  | "system-files"
  | "system-notifications";

type TabDefinition = {
  id: SettingsTab;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const themeOptions: ListBoxOption[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const navbarOptions: ListBoxOption[] = [
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "bottom", label: "Bottom" },
  { value: "top", label: "Top" },
];

const paperOptions: ListBoxOption[] = [
  { value: "A4", label: "A4" },
  { value: "A3", label: "A3" },
  { value: "Letter", label: "Letter" },
];

const colorOptions: ListBoxOption[] = [
  { value: "Black & White", label: "Black & White" },
  { value: "Color", label: "Color" },
];

const sidesOptions: ListBoxOption[] = [
  { value: "Simplex", label: "Single-sided" },
  { value: "Duplex", label: "Duplex" },
];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const formatDateTime = (value?: string) => {
  if (!value) {
    return "Not recorded";
  }

  return new Date(value).toLocaleString();
};

const formatSides = (value: string) =>
  value === "Duplex" ? "Duplex" : "Single-sided";

const getSettingsPath = (scope: Scope) =>
  scope === "admin" ? "/admin/settings" : "/user/settings";

const getPreferencesPath = (scope: Scope) =>
  scope === "admin" ? "/admin/settings/preferences" : "/user/settings/preferences";

function StatusPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const tones = {
    neutral:
      "border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]",
    success:
      "border-[color-mix(in_srgb,var(--color-success-500)_28%,var(--border))] bg-[color-mix(in_srgb,var(--color-success-500)_10%,var(--surface))] text-[color-mix(in_srgb,var(--color-success-600)_82%,var(--foreground))]",
    warning:
      "border-[color-mix(in_srgb,var(--color-warning-500)_30%,var(--border))] bg-[color-mix(in_srgb,var(--color-warning-500)_12%,var(--surface))] text-[color-mix(in_srgb,var(--color-warning-600)_82%,var(--foreground))]",
    danger:
      "border-[color-mix(in_srgb,var(--color-danger-500)_30%,var(--border))] bg-[color-mix(in_srgb,var(--color-danger-500)_10%,var(--surface))] text-[color-mix(in_srgb,var(--color-danger-600)_82%,var(--foreground))]",
  };

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-semibold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

function SettingsPanel({
  title,
  description,
  icon: Icon,
  children,
  footer,
}: {
  title: string;
  description?: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="rounded-lg border bg-[var(--surface)] shadow-[0_14px_34px_rgba(var(--shadow-color),0.08)]" style={{ borderColor: "var(--border)" }}>
      <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-start sm:justify-between" style={{ borderColor: "var(--border)" }}>
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-brand-500)_12%,var(--surface-2))] text-[var(--color-brand-500)]">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[var(--title)]">{title}</h2>
            {description ? (
              <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--paragraph)]">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
      {footer ? (
        <div className="border-t px-5 py-4" style={{ borderColor: "var(--border)" }}>
          {footer}
        </div>
      ) : null}
    </section>
  );
}

function SettingsRow({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="grid gap-3 border-b py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(220px,340px)] sm:items-center" style={{ borderColor: "var(--border)" }}>
      <div className="min-w-0">
        <p className="font-semibold text-[var(--title)]">{title}</p>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-[var(--paragraph)]">
            {description}
          </p>
        ) : null}
        {children}
      </div>
      {action ? <div className="min-w-0 sm:justify-self-end sm:text-right">{action}</div> : null}
    </div>
  );
}

function TextField({
  value,
  onChange,
  disabled,
  placeholder,
  type = "text",
}: {
  value: string | number;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-md border px-3 text-sm font-medium outline-none transition focus:border-[color-mix(in_srgb,var(--color-brand-500)_38%,var(--border))] disabled:cursor-not-allowed disabled:opacity-65"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface-2)",
        color: "var(--title)",
      }}
    />
  );
}

function TextAreaField({
  value,
  onChange,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      rows={4}
      className="w-full resize-none rounded-md border px-3 py-3 text-sm font-medium leading-6 outline-none transition focus:border-[color-mix(in_srgb,var(--color-brand-500)_38%,var(--border))] disabled:cursor-not-allowed disabled:opacity-65"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface-2)",
        color: "var(--title)",
      }}
    />
  );
}

function ReadOnlyValue({
  value,
  align = "right",
}: {
  value: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "min-h-11 rounded-md border bg-[var(--surface-2)] px-3 py-2.5 text-sm font-semibold text-[var(--title)]",
        align === "right" ? "sm:text-right" : "text-left",
      )}
      style={{ borderColor: "var(--border)" }}
    >
      {value}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60",
        checked ? "bg-[var(--color-brand-500)]" : "bg-[var(--surface-3)]",
      )}
      aria-pressed={checked}
    >
      <span
        className={cn(
          "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
          checked ? "left-6" : "left-1",
        )}
      />
    </button>
  );
}

function SaveFooter({
  dirty,
  saving,
  disabled,
  onSave,
}: {
  dirty: boolean;
  saving: boolean;
  disabled?: boolean;
  onSave: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-[var(--muted)]">
        {dirty ? "Unsaved changes in this section." : "No unsaved changes."}
      </p>
      <Button
        variant="primary"
        className="h-11 px-4 text-sm"
        iconLeft={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        disabled={!dirty || saving || disabled}
        onClick={onSave}
      >
        {saving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-5">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-36 animate-pulse rounded-lg border bg-[var(--surface)]"
          style={{ borderColor: "var(--border)" }}
        />
      ))}
    </div>
  );
}

export default function SettingsWorkspace({ scope }: { scope: Scope }) {
  const { setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    scope === "admin" ? "general" : "profile",
  );
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [profileDraft, setProfileDraft] = useState<SettingsProfile | null>(null);
  const [preferencesDraft, setPreferencesDraft] = useState<UserPreferences | null>(null);
  const [systemDraft, setSystemDraft] = useState<SystemSettings | null>(null);
  const [dirtySections, setDirtySections] = useState<DirtySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<DirtySection | "clear-drafts" | "">("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmClearDrafts, setConfirmClearDrafts] = useState(false);

  const canUpdateSystem = settings?.capabilities.canUpdateSystemSettings === true;
  const isSubAdmin = settings?.role === "SubAdmin";
  const isAdminScope = scope === "admin";

  const applyLocalPreferences = useCallback(
    (preferences: UserPreferences) => {
      setTheme(preferences.ui.theme);
      dispatchThemeModeChange(preferences.ui.theme);

      if (typeof window === "undefined") {
        return;
      }

      window.localStorage.setItem(NAVBAR_MODE_STORAGE_KEY, preferences.ui.navbarMode);
      window.dispatchEvent(
        new CustomEvent("ezprint-navbar-mode-apply", {
          detail: preferences.ui.navbarMode,
        }),
      );
    },
    [setTheme],
  );

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiGet<SettingsResponse>(getSettingsPath(scope), scope);
      const storedThemeMode = readStoredThemeMode();
      const currentThemeMode = storedThemeMode;
      const storedNavbarMode = readStoredNavbarMode();
      const normalizedData =
        (currentThemeMode && currentThemeMode !== data.preferences.ui.theme) ||
        (storedNavbarMode && storedNavbarMode !== data.preferences.ui.navbarMode)
          ? {
              ...data,
              preferences: {
                ...data.preferences,
                ui: {
                  ...data.preferences.ui,
                  ...(currentThemeMode ? { theme: currentThemeMode } : {}),
                  ...(storedNavbarMode ? { navbarMode: storedNavbarMode } : {}),
                },
              },
            }
          : data;

      setSettings(normalizedData);
      setProfileDraft(clone(normalizedData.profile));
      setPreferencesDraft(clone(normalizedData.preferences));
      setSystemDraft(clone(normalizedData.system));
      setDirtySections([]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load settings.",
      );
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSettings();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadSettings]);

  useEffect(() => {
    const handleThemeModeChange = (event: Event) => {
      const nextThemeMode = (event as CustomEvent).detail;

      if (!isThemeMode(nextThemeMode)) {
        return;
      }

      setPreferencesDraft((current) =>
        current
          ? {
              ...current,
              ui: {
                ...current.ui,
                theme: nextThemeMode,
              },
            }
          : current,
      );
      setSettings((current) =>
        current
          ? {
              ...current,
              preferences: {
                ...current.preferences,
                ui: {
                  ...current.preferences.ui,
                  theme: nextThemeMode,
                },
              },
            }
          : current,
      );
    };

    window.addEventListener(THEME_MODE_CHANGE_EVENT, handleThemeModeChange);

    return () => {
      window.removeEventListener(THEME_MODE_CHANGE_EVENT, handleThemeModeChange);
    };
  }, []);

  const markDirty = (section: DirtySection) => {
    setDirtySections((current) =>
      current.includes(section) ? current : [...current, section],
    );
  };

  const clearDirty = (section: DirtySection) => {
    setDirtySections((current) => current.filter((item) => item !== section));
  };

  const isDirty = (section: DirtySection) => dirtySections.includes(section);

  const applySavedPreferenceSection = (
    nextSettings: SettingsResponse,
    section: DirtySection,
  ) => {
    setSettings(nextSettings);

    if (section === "profile") {
      setProfileDraft(clone(nextSettings.profile));
      setPreferencesDraft((current) =>
        current
          ? {
              ...current,
              ui: clone(nextSettings.preferences.ui),
            }
          : clone(nextSettings.preferences),
      );
      return;
    }

    setPreferencesDraft((current) =>
      current
        ? {
            ...current,
            ...(section === "printing"
              ? { printing: clone(nextSettings.preferences.printing) }
              : {}),
            ...(section === "drafts"
              ? { drafts: clone(nextSettings.preferences.drafts) }
              : {}),
            ...(section === "notifications"
              ? { notifications: clone(nextSettings.preferences.notifications) }
              : {}),
          }
        : clone(nextSettings.preferences),
    );
  };

  const applySavedSystemSection = (
    nextSettings: SettingsResponse,
    section: DirtySection,
  ) => {
    setSettings(nextSettings);
    setSystemDraft((current) =>
      current
        ? {
            ...current,
            metadata: clone(nextSettings.system.metadata),
            ...(section === "system-general"
              ? { general: clone(nextSettings.system.general) }
              : {}),
            ...(section === "system-printing"
              ? { printing: clone(nextSettings.system.printing) }
              : {}),
            ...(section === "system-files"
              ? { fileDrafts: clone(nextSettings.system.fileDrafts) }
              : {}),
            ...(section === "system-notifications"
              ? { notifications: clone(nextSettings.system.notifications) }
              : {}),
          }
        : clone(nextSettings.system),
    );
  };

  const savePreferenceSection = async (
    section: DirtySection,
    payload: Partial<{
      profile: Partial<SettingsProfile>;
      preferences: Partial<UserPreferences>;
    }>,
  ) => {
    if (!preferencesDraft || !profileDraft) {
      return;
    }

    setSaving(section);
    setError("");
    setSuccess("");

    try {
      const data = await apiPatch<SettingsResponse>(
        getPreferencesPath(scope),
        payload,
        scope,
      );
      applySavedPreferenceSection(data, section);
      clearDirty(section);
      applyLocalPreferences(data.preferences);
      setSuccess("Settings saved.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save settings.",
      );
    } finally {
      setSaving("");
    }
  };

  const saveSystemSection = async (
    section: DirtySection,
    payload: Partial<SystemSettings>,
  ) => {
    if (!canUpdateSystem) {
      return;
    }

    setSaving(section);
    setError("");
    setSuccess("");

    try {
      const data = await apiPatch<SettingsResponse>(
        "/admin/settings/system",
        payload,
        "admin",
      );
      applySavedSystemSection(data, section);
      clearDirty(section);
      setSuccess("System settings saved.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save system settings.",
      );
    } finally {
      setSaving("");
    }
  };

  const clearDrafts = async () => {
    setSaving("clear-drafts");
    setError("");
    setSuccess("");

    try {
      await apiDelete<{ deletedCount: number; drafts: [] }>("/user/jobs/drafts", scope);
      setSettings((current) =>
        current
          ? {
              ...current,
              drafts: {
                ...current.drafts,
                count: 0,
              },
            }
          : current,
      );
      setConfirmClearDrafts(false);
      setSuccess("All saved drafts were cleared.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to clear drafts.",
      );
    } finally {
      setSaving("");
    }
  };

  const tabs = useMemo<TabDefinition[]>(() => {
    if (scope === "admin") {
      return [
        { id: "general", label: "General", icon: SlidersHorizontal },
        { id: "profile", label: "Profile", icon: UserRound },
        { id: "printing", label: "Printing", icon: Printer },
        { id: "access", label: "Access", icon: ShieldCheck },
        { id: "files", label: "Files", icon: FileText },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "system", label: "System Info", icon: Database },
      ];
    }

    return [
      { id: "profile", label: "Profile", icon: UserRound },
      { id: "printing", label: "Printing", icon: Printer },
      { id: "drafts", label: "Drafts", icon: FileText },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "account", label: "Account", icon: KeyRound },
    ];
  }, [scope]);

  const queueOptions = useMemo<ListBoxOption[]>(() => {
    const options =
      settings?.printOptions.queues.map((queue) => ({
        value: queue.id,
        label: queue.name,
        searchText: `${queue.name} ${queue.description} ${queue.type}`,
      })) || [];

    return [{ value: "", label: "Use system default" }, ...options];
  }, [settings]);

  const pageTitle = isAdminScope
    ? isSubAdmin
      ? "SubAdmin Settings"
      : "Admin Settings"
    : "Settings";

  const pageDescription = isAdminScope
    ? isSubAdmin
      ? "Manage your preferences and review the quota-focused controls available to your role."
      : "Manage EzPrint defaults, access context, and your own workspace preferences."
    : "Manage your profile preferences, print defaults, drafts, notifications, and account context.";

  if (loading) {
    return (
      <div className="space-y-6">
        <PageIntro title={pageTitle} description={pageDescription} />
        <LoadingState />
      </div>
    );
  }

  if (!settings || !profileDraft || !preferencesDraft || !systemDraft) {
    return (
      <div className="space-y-6">
        <PageIntro title={pageTitle} description={pageDescription} />
        <div className="rounded-lg border p-5 text-sm text-[var(--paragraph)]" style={{ borderColor: "var(--border)" }}>
          {error || "Settings are unavailable."}
        </div>
      </div>
    );
  }

  const renderProfilePanel = () => (
    <SettingsPanel
      title="Profile Preferences"
      description="Personal identity and workspace appearance."
      icon={UserRound}
      footer={
        <SaveFooter
          dirty={isDirty("profile")}
          saving={saving === "profile"}
          disabled={!settings.capabilities.canUpdateOwnPreferences}
          onSave={() =>
            void savePreferenceSection("profile", {
              profile: {
                displayName: profileDraft.displayName,
              },
              preferences: {
                ui: preferencesDraft.ui,
              } as Partial<UserPreferences>,
            })
          }
        />
      }
    >
      <SettingsRow
        title="Display name"
        description="Used across your EzPrint workspace."
        action={
          <TextField
            value={profileDraft.displayName}
            disabled={!profileDraft.editable.displayName}
            onChange={(value) => {
              setProfileDraft((current) =>
                current ? { ...current, displayName: value } : current,
              );
              markDirty("profile");
            }}
          />
        }
      />
      <SettingsRow
        title="Email"
        description="Account email is controlled by the current identity record."
        action={<ReadOnlyValue value={profileDraft.email || "Not set"} />}
      />
      <SettingsRow
        title="Theme"
        description="Choose the visual mode for this browser and account."
        action={
          <ListBox
            value={preferencesDraft.ui.theme}
            options={themeOptions}
            onValueChange={(value) => {
              if (!isThemeMode(value)) {
                return;
              }

              setPreferencesDraft((current) =>
                current
                  ? {
                      ...current,
                      ui: { ...current.ui, theme: value },
                    }
                  : current,
              );
              setTheme(value);
              dispatchThemeModeChange(value);
              markDirty("profile");
            }}
            triggerClassName="h-11"
            ariaLabel="Theme preference"
          />
        }
      />
      <SettingsRow
        title="Navbar mode"
        description="Keep the navigation position that fits your workflow."
        action={
          <ListBox
            value={preferencesDraft.ui.navbarMode}
            options={navbarOptions}
            onValueChange={(value) => {
              setPreferencesDraft((current) =>
                current
                  ? {
                      ...current,
                      ui: {
                        ...current.ui,
                        navbarMode: value as NavbarModePreference,
                      },
                    }
                  : current,
              );
              markDirty("profile");
            }}
            triggerClassName="h-11"
            ariaLabel="Navbar mode preference"
          />
        }
      />
    </SettingsPanel>
  );

  const renderUserPrintingPanel = () => (
    <SettingsPanel
      title={isAdminScope ? "Personal Printing Preferences" : "Printing Preferences"}
      description="Defaults applied when you open the print workspace."
      icon={Printer}
      footer={
        <SaveFooter
          dirty={isDirty("printing")}
          saving={saving === "printing"}
          onSave={() =>
            void savePreferenceSection("printing", {
              preferences: {
                printing: preferencesDraft.printing,
              } as Partial<UserPreferences>,
            })
          }
        />
      }
    >
      <SettingsRow
        title="Paper size"
        action={
          <ListBox
            value={preferencesDraft.printing.defaultPaperSize}
            options={paperOptions}
            onValueChange={(value) => {
              setPreferencesDraft((current) =>
                current
                  ? {
                      ...current,
                      printing: {
                        ...current.printing,
                        defaultPaperSize: value,
                      },
                    }
                  : current,
              );
              markDirty("printing");
            }}
            triggerClassName="h-11"
            ariaLabel="Default paper size"
          />
        }
      />
      <SettingsRow
        title="Color mode"
        action={
          <ListBox
            value={preferencesDraft.printing.defaultColorMode}
            options={colorOptions}
            onValueChange={(value) => {
              setPreferencesDraft((current) =>
                current
                  ? {
                      ...current,
                      printing: {
                        ...current.printing,
                        defaultColorMode: value,
                      },
                    }
                  : current,
              );
              markDirty("printing");
            }}
            triggerClassName="h-11"
            ariaLabel="Default color mode"
          />
        }
      />
      <SettingsRow
        title="Sides"
        action={
          <ListBox
            value={preferencesDraft.printing.defaultSides}
            options={sidesOptions}
            onValueChange={(value) => {
              setPreferencesDraft((current) =>
                current
                  ? {
                      ...current,
                      printing: {
                        ...current.printing,
                        defaultSides: value as PrintSidePreference,
                      },
                    }
                  : current,
              );
              markDirty("printing");
            }}
            triggerClassName="h-11"
            ariaLabel="Default sides"
          />
        }
      />
      <SettingsRow
        title="Preferred queue"
        description={
          settings.printOptions.queues.length
            ? "Only queues available to your role and account are listed."
            : "No active queue is currently available to this account."
        }
        action={
          <ListBox
            value={preferencesDraft.printing.preferredQueueId || ""}
            options={queueOptions}
            disabled={settings.printOptions.queues.length === 0}
            searchable
            onValueChange={(value) => {
              setPreferencesDraft((current) =>
                current
                  ? {
                      ...current,
                      printing: {
                        ...current.printing,
                        preferredQueueId: value,
                      },
                    }
                  : current,
              );
              markDirty("printing");
            }}
            triggerClassName="h-11"
            ariaLabel="Preferred queue"
          />
        }
      />
    </SettingsPanel>
  );

  const renderGeneralPanel = () => (
    <SettingsPanel
      title="General System Settings"
      description={
        canUpdateSystem
          ? "Global identity and default behavior for EzPrint."
          : "Read-only system context for your role."
      }
      icon={SlidersHorizontal}
      footer={
        canUpdateSystem ? (
          <SaveFooter
            dirty={isDirty("system-general")}
            saving={saving === "system-general"}
            onSave={() =>
              void saveSystemSection("system-general", {
                general: systemDraft.general,
              } as Partial<SystemSettings>)
            }
          />
        ) : null
      }
    >
      <SettingsRow
        title="System name"
        action={
          canUpdateSystem ? (
            <TextField
              value={systemDraft.general.systemName}
              onChange={(value) => {
                setSystemDraft((current) =>
                  current
                    ? {
                        ...current,
                        general: { ...current.general, systemName: value },
                      }
                    : current,
                );
                markDirty("system-general");
              }}
            />
          ) : (
            <ReadOnlyValue value={systemDraft.general.systemName} />
          )
        }
      />
      <SettingsRow
        title="Default language"
        action={
          canUpdateSystem ? (
            <TextField
              value={systemDraft.general.defaultLanguage}
              onChange={(value) => {
                setSystemDraft((current) =>
                  current
                    ? {
                        ...current,
                        general: { ...current.general, defaultLanguage: value },
                      }
                    : current,
                );
                markDirty("system-general");
              }}
            />
          ) : (
            <ReadOnlyValue value={systemDraft.general.defaultLanguage} />
          )
        }
      />
      <SettingsRow
        title="Default theme behavior"
        action={
          canUpdateSystem ? (
            <ListBox
              value={systemDraft.general.defaultTheme}
              options={themeOptions}
              onValueChange={(value) => {
                setSystemDraft((current) =>
                  current
                    ? {
                        ...current,
                        general: {
                          ...current.general,
                          defaultTheme: value as ThemePreference,
                        },
                      }
                    : current,
                );
                markDirty("system-general");
              }}
              triggerClassName="h-11"
              ariaLabel="Default system theme"
            />
          ) : (
            <ReadOnlyValue value={systemDraft.general.defaultTheme} />
          )
        }
      />
      <SettingsRow title="Maintenance/support message">
        {canUpdateSystem ? (
          <div className="mt-3">
            <TextAreaField
              value={systemDraft.general.supportMessage}
              placeholder="Optional message shown to operators."
              onChange={(value) => {
                setSystemDraft((current) =>
                  current
                    ? {
                        ...current,
                        general: {
                          ...current.general,
                          supportMessage: value,
                        },
                      }
                    : current,
                );
                markDirty("system-general");
              }}
            />
          </div>
        ) : (
          <div className="mt-3">
            <ReadOnlyValue
              align="left"
              value={systemDraft.general.supportMessage || "No message configured"}
            />
          </div>
        )}
      </SettingsRow>
    </SettingsPanel>
  );

  const renderSystemPrintingPanel = () => (
    <SettingsPanel
      title="Printing Defaults"
      description={
        canUpdateSystem
          ? "Baseline defaults for new settings and print workflows."
          : "System print defaults are visible here without full Admin controls."
      }
      icon={Printer}
      footer={
        canUpdateSystem ? (
          <SaveFooter
            dirty={isDirty("system-printing")}
            saving={saving === "system-printing"}
            onSave={() =>
              void saveSystemSection("system-printing", {
                printing: systemDraft.printing,
              } as Partial<SystemSettings>)
            }
          />
        ) : null
      }
    >
      <SettingsRow
        title="Default paper size"
        action={
          canUpdateSystem ? (
            <ListBox
              value={systemDraft.printing.defaultPaperSize}
              options={paperOptions}
              onValueChange={(value) => {
                setSystemDraft((current) =>
                  current
                    ? {
                        ...current,
                        printing: {
                          ...current.printing,
                          defaultPaperSize: value,
                        },
                      }
                    : current,
                );
                markDirty("system-printing");
              }}
              triggerClassName="h-11"
              ariaLabel="System default paper size"
            />
          ) : (
            <ReadOnlyValue value={systemDraft.printing.defaultPaperSize} />
          )
        }
      />
      <SettingsRow
        title="Default color mode"
        action={
          canUpdateSystem ? (
            <ListBox
              value={systemDraft.printing.defaultColorMode}
              options={colorOptions}
              onValueChange={(value) => {
                setSystemDraft((current) =>
                  current
                    ? {
                        ...current,
                        printing: {
                          ...current.printing,
                          defaultColorMode: value,
                        },
                      }
                    : current,
                );
                markDirty("system-printing");
              }}
              triggerClassName="h-11"
              ariaLabel="System default color mode"
            />
          ) : (
            <ReadOnlyValue value={systemDraft.printing.defaultColorMode} />
          )
        }
      />
      <SettingsRow
        title="Default sides"
        action={
          canUpdateSystem ? (
            <ListBox
              value={systemDraft.printing.defaultSides}
              options={sidesOptions}
              onValueChange={(value) => {
                setSystemDraft((current) =>
                  current
                    ? {
                        ...current,
                        printing: {
                          ...current.printing,
                          defaultSides: value as PrintSidePreference,
                        },
                      }
                    : current,
                );
                markDirty("system-printing");
              }}
              triggerClassName="h-11"
              ariaLabel="System default sides"
            />
          ) : (
            <ReadOnlyValue value={formatSides(systemDraft.printing.defaultSides)} />
          )
        }
      />
      <SettingsRow
        title="Pending job retention"
        description="Default retention for pending jobs before cleanup policy."
        action={
          canUpdateSystem ? (
            <TextField
              type="number"
              value={systemDraft.printing.pendingJobRetentionHours}
              onChange={(value) => {
                setSystemDraft((current) =>
                  current
                    ? {
                        ...current,
                        printing: {
                          ...current.printing,
                          pendingJobRetentionHours: Number(value || 0),
                        },
                      }
                    : current,
                );
                markDirty("system-printing");
              }}
            />
          ) : (
            <ReadOnlyValue value={`${systemDraft.printing.pendingJobRetentionHours} hours`} />
          )
        }
      />
      <SettingsRow
        title="Default cost per page"
        description="Current backend default from printer provisioning configuration."
        action={<ReadOnlyValue value={`${systemDraft.printing.defaultCostPerPage.toFixed(2)} SAR`} />}
      />
    </SettingsPanel>
  );

  const renderAccessPanel = () => (
    <SettingsPanel
      title="Security & Access"
      description="Current role boundaries are shown for review only."
      icon={ShieldCheck}
    >
      <SettingsRow
        title="Current role"
        action={<StatusPill tone={settings.role === "Admin" ? "success" : "warning"}>{settings.role}</StatusPill>}
      />
      <SettingsRow
        title="Session token lifetime"
        description="Authentication expiry is configured by the backend environment."
        action={<ReadOnlyValue value={systemDraft.security?.jwtExpiresIn || "7d"} />}
      />
      <SettingsRow
        title="Inactivity logout"
        description="No separate inactivity logout endpoint is currently exposed."
        action={<StatusPill>Not configured</StatusPill>}
      />
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
          <div className="mb-3 flex items-center gap-2">
            <LockKeyhole className="h-4 w-4 text-[var(--color-brand-500)]" />
            <p className="font-semibold text-[var(--title)]">Admin-only sections</p>
          </div>
          <div className="space-y-3">
            {(settings.accessOverview?.adminOnlySections || systemDraft.security?.adminOnlySections || []).map((section) => (
              <div key={section.path} className="rounded-md bg-[var(--surface-2)] p-3">
                <p className="text-sm font-semibold text-[var(--title)]">{section.label}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--paragraph)]">{section.reason}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--color-success-500)]" />
            <p className="font-semibold text-[var(--title)]">SubAdmin allowed sections</p>
          </div>
          <div className="space-y-3">
            {(settings.accessOverview?.subAdminAllowedSections || systemDraft.security?.subAdminAllowedSections || []).map((section) => (
              <div key={section.path} className="rounded-md bg-[var(--surface-2)] p-3">
                <p className="text-sm font-semibold text-[var(--title)]">{section.label}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--paragraph)]">{section.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SettingsPanel>
  );

  const renderFilesPanel = () => (
    <SettingsPanel
      title="File & Draft Settings"
      description="Upload and draft limits currently enforced by EzPrint."
      icon={FileText}
      footer={
        canUpdateSystem ? (
          <SaveFooter
            dirty={isDirty("system-files")}
            saving={saving === "system-files"}
            onSave={() =>
              void saveSystemSection("system-files", {
                fileDrafts: systemDraft.fileDrafts,
              } as Partial<SystemSettings>)
            }
          />
        ) : null
      }
    >
      <SettingsRow
        title="Allowed upload type"
        description="The print upload API accepts PDF documents."
        action={<ReadOnlyValue value={systemDraft.fileDrafts.allowedUploadTypes.join(", ")} />}
      />
      <SettingsRow
        title="Office conversion"
        description="Office document conversion is reserved for a future backend workflow."
        action={<StatusPill tone="warning">Disabled</StatusPill>}
      />
      <SettingsRow
        title="Max file size"
        description="Upload limit enforced by the backend request parser."
        action={<ReadOnlyValue value={systemDraft.fileDrafts.maxFileSize} />}
      />
      <SettingsRow
        title="Draft retention"
        description="Stored as the cleanup policy default for saved drafts."
        action={
          canUpdateSystem ? (
            <TextField
              type="number"
              value={systemDraft.fileDrafts.draftRetentionDays}
              onChange={(value) => {
                setSystemDraft((current) =>
                  current
                    ? {
                        ...current,
                        fileDrafts: {
                          ...current.fileDrafts,
                          draftRetentionDays: Number(value || 0),
                        },
                      }
                    : current,
                );
                markDirty("system-files");
              }}
            />
          ) : (
            <ReadOnlyValue value={`${systemDraft.fileDrafts.draftRetentionDays} days`} />
          )
        }
      />
    </SettingsPanel>
  );

  const renderDraftsPanel = () => (
    <SettingsPanel
      title="Draft Preferences"
      description="Controls for your saved print drafts."
      icon={FileText}
      footer={
        <SaveFooter
          dirty={isDirty("drafts")}
          saving={saving === "drafts"}
          onSave={() =>
            void savePreferenceSection("drafts", {
              preferences: {
                drafts: {
                  showSavedDrafts: preferencesDraft.drafts.showSavedDrafts,
                  autoSaveDrafts: preferencesDraft.drafts.autoSaveDrafts,
                },
              } as Partial<UserPreferences>,
            })
          }
        />
      }
    >
      <SettingsRow
        title="Show saved drafts"
        description="Display the saved draft drawer in the print workspace."
        action={
          <ToggleSwitch
            checked={preferencesDraft.drafts.showSavedDrafts}
            onChange={(checked) => {
              setPreferencesDraft((current) =>
                current
                  ? {
                      ...current,
                      drafts: { ...current.drafts, showSavedDrafts: checked },
                    }
                  : current,
              );
              markDirty("drafts");
            }}
          />
        }
      />
      <SettingsRow
        title="Auto-save drafts"
        description="Automatic background draft capture is not active in this build."
        action={<StatusPill tone="warning">Future</StatusPill>}
      />
      <SettingsRow
        title="Saved drafts"
        description={`${settings.drafts.count} draft${settings.drafts.count === 1 ? "" : "s"} stored for this account.`}
        action={
          <Button
            variant="outline"
            className="h-11 px-4 text-sm"
            iconLeft={<Trash2 className="h-4 w-4" />}
            disabled={settings.drafts.count === 0 || !settings.capabilities.canClearDrafts}
            onClick={() => setConfirmClearDrafts(true)}
          >
            Clear Drafts
          </Button>
        }
      />
    </SettingsPanel>
  );

  const renderPersonalNotificationsPanel = () => (
    <SettingsPanel
      title={isAdminScope ? "Personal Notifications" : "Notifications"}
      description="In-app notification preferences for events tied to your account."
      icon={Bell}
      footer={
        <SaveFooter
          dirty={isDirty("notifications")}
          saving={saving === "notifications"}
          onSave={() =>
            void savePreferenceSection("notifications", {
              preferences: {
                notifications: preferencesDraft.notifications,
              } as Partial<UserPreferences>,
            })
          }
        />
      }
    >
      <SettingsRow
        title="Print success"
        description="Show notifications when a print job is released successfully."
        action={
          <ToggleSwitch
            checked={preferencesDraft.notifications.printSuccess}
            onChange={(checked) => {
              setPreferencesDraft((current) =>
                current
                  ? {
                      ...current,
                      notifications: {
                        ...current.notifications,
                        printSuccess: checked,
                      },
                    }
                  : current,
              );
              markDirty("notifications");
            }}
          />
        }
      />
      <SettingsRow
        title="Print failure"
        description="Show notifications when release or dispatch fails."
        action={
          <ToggleSwitch
            checked={preferencesDraft.notifications.printFailure}
            onChange={(checked) => {
              setPreferencesDraft((current) =>
                current
                  ? {
                      ...current,
                      notifications: {
                        ...current.notifications,
                        printFailure: checked,
                      },
                    }
                  : current,
              );
              markDirty("notifications");
            }}
          />
        }
      />
      <SettingsRow
        title="Redeem and quota updates"
        description="Show quota credit, refund, and redeem notifications."
        action={
          <ToggleSwitch
            checked={preferencesDraft.notifications.quotaUpdates}
            onChange={(checked) => {
              setPreferencesDraft((current) =>
                current
                  ? {
                      ...current,
                      notifications: {
                        ...current.notifications,
                        quotaUpdates: checked,
                      },
                    }
                  : current,
              );
              markDirty("notifications");
            }}
          />
        }
      />
      <SettingsRow
        title="Low quota"
        description="Stored for low-balance alerts when the quota event source is enabled."
        action={
          <ToggleSwitch
            checked={preferencesDraft.notifications.lowQuota}
            onChange={(checked) => {
              setPreferencesDraft((current) =>
                current
                  ? {
                      ...current,
                      notifications: {
                        ...current.notifications,
                        lowQuota: checked,
                      },
                    }
                  : current,
              );
              markDirty("notifications");
            }}
          />
        }
      />
    </SettingsPanel>
  );

  const renderSystemNotificationsPanel = () => (
    <div className="space-y-5">
      {isAdminScope && (
        <SettingsPanel
          title="System Notifications"
          description={
            canUpdateSystem
              ? "Global notification defaults for operational events."
              : "Read-only global notification defaults."
          }
          icon={Bell}
          footer={
            canUpdateSystem ? (
              <SaveFooter
                dirty={isDirty("system-notifications")}
                saving={saving === "system-notifications"}
                onSave={() =>
                  void saveSystemSection("system-notifications", {
                    notifications: systemDraft.notifications,
                  } as Partial<SystemSettings>)
                }
              />
            ) : null
          }
        >
          <SettingsRow
            title="Printer issue notifications"
            action={
              <ToggleSwitch
                checked={systemDraft.notifications?.printerIssueNotifications !== false}
                disabled={!canUpdateSystem}
                onChange={(checked) => {
                  setSystemDraft((current) =>
                    current
                      ? {
                          ...current,
                          notifications: {
                            printerIssueNotifications: checked,
                            jobFailureNotifications:
                              current.notifications?.jobFailureNotifications !== false,
                            lowQuotaNotifications:
                              current.notifications?.lowQuotaNotifications !== false,
                          },
                        }
                      : current,
                  );
                  markDirty("system-notifications");
                }}
              />
            }
          />
          <SettingsRow
            title="Job failure notifications"
            action={
              <ToggleSwitch
                checked={systemDraft.notifications?.jobFailureNotifications !== false}
                disabled={!canUpdateSystem}
                onChange={(checked) => {
                  setSystemDraft((current) =>
                    current
                      ? {
                          ...current,
                          notifications: {
                            printerIssueNotifications:
                              current.notifications?.printerIssueNotifications !== false,
                            jobFailureNotifications: checked,
                            lowQuotaNotifications:
                              current.notifications?.lowQuotaNotifications !== false,
                          },
                        }
                      : current,
                  );
                  markDirty("system-notifications");
                }}
              />
            }
          />
          <SettingsRow
            title="Low quota notifications"
            action={
              <ToggleSwitch
                checked={systemDraft.notifications?.lowQuotaNotifications !== false}
                disabled={!canUpdateSystem}
                onChange={(checked) => {
                  setSystemDraft((current) =>
                    current
                      ? {
                          ...current,
                          notifications: {
                            printerIssueNotifications:
                              current.notifications?.printerIssueNotifications !== false,
                            jobFailureNotifications:
                              current.notifications?.jobFailureNotifications !== false,
                            lowQuotaNotifications: checked,
                          },
                        }
                      : current,
                  );
                  markDirty("system-notifications");
                }}
              />
            }
          />
        </SettingsPanel>
      )}
      {renderPersonalNotificationsPanel()}
    </div>
  );

  const renderAccountPanel = () => (
    <SettingsPanel
      title="Account & Security"
      description="Account role and security capabilities for this login."
      icon={KeyRound}
    >
      <SettingsRow title="Current role" action={<StatusPill tone="success">{settings.role}</StatusPill>} />
      <SettingsRow title="Username" action={<ReadOnlyValue value={profileDraft.username} />} />
      <SettingsRow title="Department" action={<ReadOnlyValue value={profileDraft.department || "Not set"} />} />
      <SettingsRow
        title="Change password"
        description="This backend does not expose a password-change endpoint."
        action={<StatusPill tone="warning">Unavailable</StatusPill>}
      />
    </SettingsPanel>
  );

  const renderSystemInfoPanel = () => {
    const info = settings.systemInfo;

    return (
      <SettingsPanel
        title="System Info"
        description="Runtime status reported by the backend."
        icon={Database}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            {
              label: "App version",
              value: info?.version || "1.0.0",
              icon: Info,
              tone: "neutral" as const,
            },
            {
              label: "Backend status",
              value: info?.backendStatus || "Online",
              icon: Monitor,
              tone: "success" as const,
            },
            {
              label: "Database",
              value: info?.databaseStatus || "Unknown",
              icon: Database,
              tone: info?.databaseStatus === "Connected" ? "success" as const : "warning" as const,
            },
            {
              label: "Upload limit",
              value: info?.uploadLimit || systemDraft.fileDrafts.maxFileSize,
              icon: HardDrive,
              tone: "neutral" as const,
            },
            {
              label: "Office conversion",
              value: info?.officeConversionStatus || "Disabled",
              icon: FileText,
              tone: "warning" as const,
            },
            {
              label: "Last updated",
              value: formatDateTime(info?.lastUpdatedAt || systemDraft.metadata?.updatedAt),
              icon: Clock3,
              tone: "neutral" as const,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--surface-2)] text-[var(--color-brand-500)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <StatusPill tone={item.tone}>{item.value}</StatusPill>
                </div>
                <p className="text-sm font-semibold text-[var(--title)]">{item.label}</p>
              </div>
            );
          })}
        </div>
      </SettingsPanel>
    );
  };

  const renderActiveTab = () => {
    if (activeTab === "general") return renderGeneralPanel();
    if (activeTab === "profile") return renderProfilePanel();
    if (activeTab === "printing") {
      return (
        <div className="space-y-5">
          {isAdminScope ? renderSystemPrintingPanel() : null}
          {renderUserPrintingPanel()}
        </div>
      );
    }
    if (activeTab === "access") return renderAccessPanel();
    if (activeTab === "files") return renderFilesPanel();
    if (activeTab === "drafts") return renderDraftsPanel();
    if (activeTab === "notifications") return renderSystemNotificationsPanel();
    if (activeTab === "account") return renderAccountPanel();
    return renderSystemInfoPanel();
  };

  return (
    <div className="space-y-6">
      <PageIntro title={pageTitle} description={pageDescription} />

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        <div className="rounded-lg border bg-[var(--surface)] p-4" style={{ borderColor: "var(--border)" }}>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--title)]">
            <UserRound className="h-4 w-4 text-[var(--color-brand-500)]" />
            {profileDraft.displayName}
          </div>
          <p className="text-xs font-semibold uppercase text-[var(--muted)]">
            {settings.role}
          </p>
        </div>
        <div className="rounded-lg border bg-[var(--surface)] p-4" style={{ borderColor: "var(--border)" }}>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--title)]">
            <Palette className="h-4 w-4 text-[var(--color-brand-500)]" />
            {preferencesDraft.ui.theme}
          </div>
          <p className="text-xs font-semibold uppercase text-[var(--muted)]">
            Theme
          </p>
        </div>
        <div className="rounded-lg border bg-[var(--surface)] p-4" style={{ borderColor: "var(--border)" }}>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--title)]">
            <LayoutDashboard className="h-4 w-4 text-[var(--color-brand-500)]" />
            {preferencesDraft.ui.navbarMode}
          </div>
          <p className="text-xs font-semibold uppercase text-[var(--muted)]">
            Navbar
          </p>
        </div>
        <div className="rounded-lg border bg-[var(--surface)] p-4" style={{ borderColor: "var(--border)" }}>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--title)]">
            <Printer className="h-4 w-4 text-[var(--color-brand-500)]" />
            {preferencesDraft.printing.defaultPaperSize}
          </div>
          <p className="text-xs font-semibold uppercase text-[var(--muted)]">
            Paper default
          </p>
        </div>
        <div className="rounded-lg border bg-[var(--surface)] p-4" style={{ borderColor: "var(--border)" }}>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--title)]">
            <FileText className="h-4 w-4 text-[var(--color-brand-500)]" />
            {settings.drafts.count}
          </div>
          <p className="text-xs font-semibold uppercase text-[var(--muted)]">
            Saved drafts
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-[color-mix(in_srgb,var(--color-danger-500)_30%,var(--border))] bg-[color-mix(in_srgb,var(--color-danger-500)_10%,var(--surface))] p-4 text-sm font-medium text-[color-mix(in_srgb,var(--color-danger-600)_82%,var(--foreground))]">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border border-[color-mix(in_srgb,var(--color-success-500)_28%,var(--border))] bg-[color-mix(in_srgb,var(--color-success-500)_10%,var(--surface))] p-4 text-sm font-medium text-[color-mix(in_srgb,var(--color-success-600)_82%,var(--foreground))]">
          {success}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex gap-2 overflow-x-auto rounded-lg border bg-[var(--surface)] p-2 lg:flex-col lg:overflow-visible" style={{ borderColor: "var(--border)" }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex h-11 shrink-0 items-center gap-3 rounded-md px-3 text-left text-sm font-semibold transition",
                    active
                      ? "bg-[color-mix(in_srgb,var(--color-brand-500)_12%,var(--surface-2))] text-[var(--color-brand-600)]"
                      : "text-[var(--paragraph)] hover:bg-[var(--surface-2)] hover:text-[var(--title)]",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0">{renderActiveTab()}</div>
      </div>

      <ConfirmDialog
        open={confirmClearDrafts}
        title="Clear all drafts?"
        description={
          <span>
            This removes all saved print drafts for this account. Uploaded draft
            files attached to those drafts will be deleted from backend storage.
          </span>
        }
        confirmText="Clear drafts"
        loadingText="Clearing..."
        variant="danger"
        loading={saving === "clear-drafts"}
        onConfirm={() => void clearDrafts()}
        onClose={() => setConfirmClearDrafts(false)}
      />
    </div>
  );
}
