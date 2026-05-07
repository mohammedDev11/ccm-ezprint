"use client";

import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import ListBox from "@/components/ui/listbox/ListBox";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock3,
  Gauge,
  ListChecks,
  Mail,
  Printer,
  Save,
  ServerCog,
  ShieldAlert,
  SlidersHorizontal,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  formatRoleLabel,
  type NotificationSettingsType,
  type NotifyRoles,
} from "@/lib/mock-data/Admin/notifications";

const notifyRoleOptions: Array<{ value: NotifyRoles; label: string }> = [
  { value: "admin_only", label: "Admin Only" },
  { value: "sub_admin_only", label: "Sub-Admin Only" },
  { value: "admin_and_sub_admin", label: "Admin & Sub-Admin" },
  { value: "all_users", label: "All Users" },
];

type BooleanSettingKey =
  | "enabled"
  | "email_enabled"
  | "critical_alerts_only"
  | "alert_printer_offline"
  | "alert_toner_low"
  | "alert_device_error"
  | "alert_queue_pending"
  | "alert_maintenance"
  | "alert_job_issues"
  | "alert_system_warnings";

type AlertToggle = {
  key: BooleanSettingKey;
  title: string;
  description: string;
};

const alertGroups: Array<{
  title: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  items: AlertToggle[];
}> = [
  {
    title: "Queue/job alerts",
    eyebrow: "Workload",
    description: "Watch queue buildup and failed print work before it affects release desks.",
    icon: ListChecks,
    items: [
      {
        key: "alert_queue_pending",
        title: "Queue threshold",
        description: "Notify when pending jobs cross the configured queue limit.",
      },
      {
        key: "alert_job_issues",
        title: "Job failure alerts",
        description: "Notify when jobs fail, stall, or need admin attention.",
      },
    ],
  },
  {
    title: "Printer/device alerts",
    eyebrow: "Devices",
    description: "Surface device offline, toner, and hardware problems in one place.",
    icon: Printer,
    items: [
      {
        key: "alert_printer_offline",
        title: "Device offline alerts",
        description: "Notify when a printer stops responding to health checks.",
      },
      {
        key: "alert_toner_low",
        title: "Toner threshold",
        description: "Notify when toner drops below the configured percentage.",
      },
      {
        key: "alert_device_error",
        title: "Hardware errors",
        description: "Notify on device faults, jams, or blocked printer states.",
      },
    ],
  },
  {
    title: "System warnings",
    eyebrow: "Platform",
    description: "Keep system-level warnings visible without making every event noisy.",
    icon: ServerCog,
    items: [
      {
        key: "alert_system_warnings",
        title: "System warnings",
        description: "Notify on backend warnings, delayed schedulers, and service health.",
      },
    ],
  },
  {
    title: "Maintenance reminders",
    eyebrow: "Preventive",
    description: "Create useful reminders before devices drift into urgent repair work.",
    icon: Wrench,
    items: [
      {
        key: "alert_maintenance",
        title: "Maintenance alerts",
        description: "Notify before scheduled maintenance windows and service deadlines.",
      },
    ],
  },
];

type Props = {
  settings: NotificationSettingsType;
  updateSettings: <K extends keyof NotificationSettingsType>(
    key: K,
    value: NotificationSettingsType[K]
  ) => void;
};

export default function NotificationSettingsPanel({
  settings,
  updateSettings,
}: Props) {
  const [savedAt, setSavedAt] = useState("");
  const enabledAlertCount = useMemo(
    () =>
      alertGroups.reduce(
        (total, group) =>
          total + group.items.filter((item) => settings[item.key]).length,
        0,
      ),
    [settings],
  );

  const handleSave = () => {
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    console.log("Save settings", settings);
  };

  return (
    <div className="space-y-5">
      <section className="card overflow-hidden p-0">
        <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-500)]">
              Notification rules
            </p>
            <h2 className="mt-2 text-xl font-bold text-[var(--title)]">
              Settings
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--paragraph)]">
              Tune delivery, alert categories, and operational thresholds without
              turning every event into the same noisy toggle row.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 md:min-w-[390px]">
            <StatusTile
              label="Notifications"
              value={settings.enabled ? "Enabled" : "Paused"}
              active={settings.enabled}
            />
            <StatusTile
              label="Routes"
              value={`${enabledAlertCount}/7 active`}
              active={enabledAlertCount > 0}
            />
            <StatusTile
              label="Delivery"
              value={settings.email_enabled ? "Email on" : "In-app only"}
              active={settings.email_enabled}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.75fr)]">
        <div className="space-y-5">
          <SettingsSection
            icon={BellRing}
            title="General notification settings"
            description="Set the master behavior and who should receive admin alerts."
          >
            <div className="grid gap-3 lg:grid-cols-2">
              <ToggleCard
                checked={settings.enabled}
                title="Enable notifications"
                description="Create and display live printer, queue, job, and system alerts."
                icon={BellRing}
                onChange={() => updateSettings("enabled", !settings.enabled)}
              />
              <ToggleCard
                checked={settings.critical_alerts_only}
                title="Critical alerts only"
                description="Suppress non-critical alerts when the team needs a quieter queue."
                icon={ShieldAlert}
                onChange={() =>
                  updateSettings(
                    "critical_alerts_only",
                    !settings.critical_alerts_only,
                  )
                }
              />
            </div>

            <div
              className="rounded-2xl border p-4"
              style={{
                borderColor: "var(--border)",
                background:
                  "linear-gradient(180deg, color-mix(in srgb, var(--surface-2) 86%, transparent), color-mix(in srgb, var(--surface) 96%, transparent))",
              }}
            >
              <div className="mb-3 flex items-center gap-3">
                <IconFrame icon={UsersRound} />
                <div>
                  <p className="font-semibold text-[var(--title)]">Notify roles</p>
                  <p className="text-sm text-[var(--paragraph)]">
                    Choose the audience for actionable admin notifications.
                  </p>
                </div>
              </div>
              <ListBox
                value={settings.notify_roles}
                onValueChange={(value) =>
                  updateSettings("notify_roles", value as NotifyRoles)
                }
                options={notifyRoleOptions}
                placeholder={formatRoleLabel(settings.notify_roles)}
                triggerClassName="h-[48px] w-full"
                contentClassName="w-full min-w-[220px]"
                ariaLabel="Notify roles"
              />
            </div>
          </SettingsSection>

          <SettingsSection
            icon={Mail}
            title="Delivery preferences"
            description="Keep in-app alerts as the source of truth, then add email delivery for urgent paths."
          >
            <div className="grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <ToggleCard
                checked={settings.email_enabled}
                title="Email notifications"
                description="Send selected admin alerts to configured recipients."
                icon={Mail}
                onChange={() =>
                  updateSettings("email_enabled", !settings.email_enabled)
                }
              />

              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                  opacity: settings.email_enabled ? 1 : 0.68,
                }}
              >
                <label className="text-sm font-semibold text-[var(--title)]">
                  Email recipients
                </label>
                <p className="mb-3 mt-1 text-sm text-[var(--paragraph)]">
                  Separate multiple addresses with commas.
                </p>
                <Input
                  value={settings.email_recipients}
                  disabled={!settings.email_enabled}
                  placeholder="admin@kfupm.edu.sa, support@kfupm.edu.sa"
                  onChange={(event) =>
                    updateSettings("email_recipients", event.target.value)
                  }
                />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            icon={SlidersHorizontal}
            title="Alert categories"
            description="Grouped controls keep related alerts together without repeating the same row pattern."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {alertGroups.map((group) => {
                const activeCount = group.items.filter(
                  (item) => settings[item.key],
                ).length;

                return (
                  <AlertGroupCard
                    key={group.title}
                    group={group}
                    activeCount={activeCount}
                    settings={settings}
                    updateSettings={updateSettings}
                  />
                );
              })}
            </div>
          </SettingsSection>
        </div>

        <div className="space-y-5">
          <SettingsSection
            icon={Gauge}
            title="Threshold configuration"
            description="Define when queue and device signals become actionable."
          >
            <div className="space-y-4">
              <ThresholdControl
                label="Queue threshold"
                helper="Pending jobs before queue alerts trigger."
                value={settings.queue_threshold}
                min={1}
                max={50}
                unit="jobs"
                onChange={(value) => updateSettings("queue_threshold", value)}
              />
              <ThresholdControl
                label="Toner threshold"
                helper="Remaining toner percentage before low-toner alerts trigger."
                value={settings.toner_threshold}
                min={1}
                max={100}
                unit="%"
                onChange={(value) => updateSettings("toner_threshold", value)}
              />
            </div>
          </SettingsSection>

          <SettingsSection
            icon={AlertTriangle}
            title="Operational summary"
            description="A quick read on how noisy the current rule set will be."
          >
            <div className="space-y-3">
              <SummaryLine
                icon={CheckCircle2}
                title="Signal coverage"
                value={`${enabledAlertCount} active categories`}
              />
              <SummaryLine
                icon={Clock3}
                title="Maintenance reminders"
                value={settings.alert_maintenance ? "Enabled" : "Paused"}
              />
              <SummaryLine
                icon={ShieldAlert}
                title="Escalation mode"
                value={
                  settings.critical_alerts_only
                    ? "Critical alerts only"
                    : "All enabled severities"
                }
              />
            </div>
          </SettingsSection>
        </div>
      </section>

      <div
        className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
        style={{
          borderColor: "var(--border)",
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
          boxShadow:
            "0 10px 24px rgba(var(--shadow-color), 0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <p className="text-sm text-[var(--paragraph)]">
          {savedAt
            ? `Settings saved locally at ${savedAt}.`
            : "Review notification rules, then save the current configuration."}
        </p>
        <Button
          variant="primary"
          className="h-12 px-5 sm:ml-auto"
          iconLeft={<Save className="h-4 w-4" />}
          onClick={handleSave}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5 md:p-6">
      <div className="mb-5 flex items-start gap-3">
        <IconFrame icon={Icon} />
        <div>
          <h3 className="text-lg font-bold text-[var(--title)]">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--paragraph)]">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

function IconFrame({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
      style={{
        background: "color-mix(in srgb, var(--color-brand-500) 12%, var(--surface-2))",
        color: "var(--color-brand-500)",
        border: "1px solid color-mix(in srgb, var(--color-brand-500) 24%, var(--border))",
      }}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}

function ToggleCard({
  checked,
  title,
  description,
  icon: Icon,
  onChange,
}: {
  checked: boolean;
  title: string;
  description: string;
  icon: LucideIcon;
  onChange: () => void;
}) {
  return (
    <div
      className="flex min-h-[132px] flex-col justify-between rounded-2xl border p-4 transition"
      style={{
        borderColor: checked
          ? "color-mix(in srgb, var(--color-brand-500) 38%, var(--border))"
          : "var(--border)",
        background: checked
          ? "color-mix(in srgb, var(--color-brand-500) 9%, var(--surface))"
          : "var(--surface-2)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <IconFrame icon={Icon} />
        <Switch checked={checked} onChange={onChange} label={title} />
      </div>
      <div className="mt-4">
        <p className="font-semibold text-[var(--title)]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--paragraph)]">
          {description}
        </p>
      </div>
    </div>
  );
}

function AlertGroupCard({
  group,
  activeCount,
  settings,
  updateSettings,
}: {
  group: (typeof alertGroups)[number];
  activeCount: number;
  settings: NotificationSettingsType;
  updateSettings: <K extends keyof NotificationSettingsType>(
    key: K,
    value: NotificationSettingsType[K]
  ) => void;
}) {
  const Icon = group.icon;

  return (
    <article
      className="rounded-2xl border p-4"
      style={{
        borderColor: "var(--border)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--surface-2) 88%, transparent), color-mix(in srgb, var(--surface) 96%, transparent))",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <IconFrame icon={Icon} />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-brand-500)]">
              {group.eyebrow}
            </p>
            <h4 className="mt-1 font-bold text-[var(--title)]">{group.title}</h4>
            <p className="mt-1 text-sm leading-6 text-[var(--paragraph)]">
              {group.description}
            </p>
          </div>
        </div>
        <span
          className="shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold"
          style={{
            background: "color-mix(in srgb, var(--color-brand-500) 10%, var(--surface-2))",
            color: "var(--color-brand-500)",
          }}
        >
          {activeCount}/{group.items.length}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        {group.items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-3 rounded-xl px-3 py-3"
            style={{ background: "color-mix(in srgb, var(--surface) 84%, transparent)" }}
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--title)]">
                {item.title}
              </p>
              <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">
                {item.description}
              </p>
            </div>
            <Switch
              checked={settings[item.key]}
              onChange={() => updateSettings(item.key, !settings[item.key])}
              label={item.title}
            />
          </div>
        ))}
      </div>
    </article>
  );
}

function ThresholdControl({
  label,
  helper,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  helper: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  const safeValue = Math.min(Math.max(value, min), max);

  return (
    <div
      className="rounded-2xl border p-4"
      style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[var(--title)]">{label}</p>
          <p className="mt-1 text-sm leading-6 text-[var(--paragraph)]">
            {helper}
          </p>
        </div>
        <span
          className="rounded-lg px-3 py-1.5 text-sm font-bold"
          style={{
            background: "var(--surface)",
            color: "var(--color-brand-500)",
            border: "1px solid var(--border)",
          }}
        >
          {safeValue}
          {unit === "%" ? "%" : ` ${unit}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={safeValue}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 w-full accent-[var(--color-brand-500)]"
      />
      <div className="mt-3 flex items-center gap-3">
        <Input
          type="number"
          min={min}
          max={max}
          value={safeValue}
          onChange={(event) => onChange(Number(event.target.value || min))}
          className="text-sm"
          wrapperClassName="max-w-[140px]"
        />
        <span className="text-sm text-[var(--muted)]">
          {min} - {max} {unit}
        </span>
      </div>
    </div>
  );
}

function StatusTile({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div
      className="rounded-xl border px-3 py-2"
      style={{
        borderColor: active
          ? "color-mix(in srgb, var(--color-brand-500) 32%, var(--border))"
          : "var(--border)",
        background: active
          ? "color-mix(in srgb, var(--color-brand-500) 9%, var(--surface-2))"
          : "var(--surface-2)",
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-[var(--title)]">{value}</p>
    </div>
  );
}

function SummaryLine({
  icon: Icon,
  title,
  value,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl border px-3 py-3"
      style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
          style={{
            background: "color-mix(in srgb, var(--color-brand-500) 10%, var(--surface))",
            color: "var(--color-brand-500)",
          }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="truncate text-sm font-semibold text-[var(--title)]">
          {title}
        </span>
      </div>
      <span className="shrink-0 text-sm font-semibold text-[var(--muted)]">
        {value}
      </span>
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="relative h-7 w-12 shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)]"
      style={{
        background: checked
          ? "var(--color-brand-500)"
          : "color-mix(in srgb, var(--surface-3) 72%, var(--muted))",
      }}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}
