"use client";

import React, { useMemo } from "react";
import Card from "@/components/ui/card/Card";
import { AlertTriangle, Bell, XCircle } from "lucide-react";
import { Notification } from "@/lib/mock-data/Admin/notifications";

type Props = {
  notifications: Notification[];
};

export default function NotificationSummaryCards({ notifications }: Props) {
  const stats = useMemo(() => {
    return {
      total: notifications.length,
      unread: notifications.filter((item) => item.status === "unread").length,
      warnings: notifications.filter((item) => item.severity === "warning").length,
      critical: notifications.filter((item) => item.severity === "critical").length,
    };
  }, [notifications]);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-md border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--muted)",
            }}
          >
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <div className="text-3xl font-bold" style={{ color: "var(--title)" }}>
              {stats.total}
            </div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              Total
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-brand-50 p-6">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-md border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--muted)",
            }}
          >
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <div className="text-3xl font-bold" style={{ color: "var(--title)" }}>
              {stats.unread}
            </div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              Unread
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-warning-50 p-6">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-md border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--muted)",
            }}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-3xl font-bold" style={{ color: "var(--title)" }}>
              {stats.warnings}
            </div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              Warnings
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-danger-50 p-6">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-md border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--muted)",
            }}
          >
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-3xl font-bold" style={{ color: "var(--title)" }}>
              {stats.critical}
            </div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              Critical
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}