"use client";

import React from "react";
import Card from "@/components/ui/card/Card";
import Button from "@/components/ui/button/Button";
import ListBox from "@/components/ui/listbox/ListBox";
import { Save } from "lucide-react";
import {
  formatRoleLabel,
  NotificationSettingsType,
  NotifyRoles,
} from "@/lib/mock-data/Admin/notifications";

const notifyRoleOptions: Array<{ value: NotifyRoles; label: string }> = [
  { value: "admin_only", label: "Admin Only" },
  { value: "sub_admin_only", label: "Sub-Admin Only" },
  { value: "admin_and_sub_admin", label: "Admin & Sub-Admin" },
  { value: "all_users", label: "All Users" },
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
  return (
    <div className="space-y-6">
      <Card className="p-6 md:p-7">
        <div className="mb-6">
          <h2 className="text-lg font-semibold uppercase tracking-[0.12em] text-muted">
            General
          </h2>
        </div>

        <div className="space-y-6">
          <div
            className="flex items-start justify-between gap-4 border-b pb-4"
            style={{ borderColor: "var(--border)" }}
          >
            <div>
              <p className="font-semibold" style={{ color: "var(--title)" }}>
                Enable Notifications
              </p>
              <p className="text-sm text-muted">
                Master switch for all notifications
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateSettings("enabled", !settings.enabled)}
              className={`relative h-7 w-12 rounded-full transition ${
                settings.enabled
                  ? "bg-brand-500"
                  : "bg-slate-300/70 dark:bg-slate-600/70"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  settings.enabled ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          <div
            className="flex items-start justify-between gap-4 border-b pb-4"
            style={{ borderColor: "var(--border)" }}
          >
            <div>
              <p className="font-semibold" style={{ color: "var(--title)" }}>
                Email Notifications
              </p>
              <p className="text-sm text-muted">Send alerts via email</p>
            </div>
            <button
              type="button"
              onClick={() =>
                updateSettings("email_enabled", !settings.email_enabled)
              }
              className={`relative h-7 w-12 rounded-full transition ${
                settings.email_enabled
                  ? "bg-brand-500"
                  : "bg-slate-300/70 dark:bg-slate-600/70"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  settings.email_enabled ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {settings.email_enabled && (
            <input
              type="text"
              placeholder="admin@kfupm.edu.sa, support@kfupm.edu.sa"
              value={settings.email_recipients}
              onChange={(e) =>
                updateSettings("email_recipients", e.target.value)
              }
              className="h-12 w-full rounded-md border px-4 outline-none"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
                color: "var(--title)",
              }}
            />
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-muted">
              Notify Roles
            </label>
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
        </div>
      </Card>

      <Card className="p-6 md:p-7">
        <div className="mb-6">
          <h2 className="text-lg font-semibold uppercase tracking-[0.12em] text-muted">
            Alert Types
          </h2>
        </div>

        <div className="space-y-6">
          {[
            {
              key: "alert_printer_offline" as const,
              title: "Printer Offline",
              desc: "Alert when a printer goes offline",
            },
            {
              key: "alert_toner_low" as const,
              title: "Toner Low",
              desc: "Alert when toner drops below threshold",
            },
            {
              key: "alert_device_error" as const,
              title: "Device Error",
              desc: "Alert on hardware errors",
            },
            {
              key: "alert_queue_pending" as const,
              title: "Queue / Job Pending",
              desc: "Alert when queue builds up",
            },
            {
              key: "alert_maintenance" as const,
              title: "Maintenance Reminders",
              desc: "Scheduled maintenance alerts",
            },
            {
              key: "alert_job_issues" as const,
              title: "Job Issues",
              desc: "Failed or stuck print jobs",
            },
            {
              key: "alert_system_warnings" as const,
              title: "System Warnings",
              desc: "General system health alerts",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-start justify-between gap-4 border-b pb-4"
              style={{ borderColor: "var(--border)" }}
            >
              <div>
                <p className="font-semibold" style={{ color: "var(--title)" }}>
                  {item.title}
                </p>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => updateSettings(item.key, !settings[item.key])}
                className={`relative h-7 w-12 rounded-full transition ${
                  settings[item.key]
                    ? "bg-brand-500"
                    : "bg-slate-300/70 dark:bg-slate-600/70"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    settings[item.key] ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          ))}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted">
                Toner Alert Threshold (%)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={settings.toner_threshold}
                onChange={(e) =>
                  updateSettings("toner_threshold", Number(e.target.value || 0))
                }
                className="h-12 w-[150px] rounded-md border px-4 outline-none"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  color: "var(--title)",
                }}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-muted">
                Queue Threshold (jobs)
              </label>
              <input
                type="number"
                min={1}
                value={settings.queue_threshold}
                onChange={(e) =>
                  updateSettings("queue_threshold", Number(e.target.value || 0))
                }
                className="h-12 w-[150px] rounded-md border px-4 outline-none"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  color: "var(--title)",
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="primary"
          className="h-12 px-5"
          iconLeft={<Save className="h-4 w-4" />}
          onClick={() => console.log("Save settings", settings)}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}
