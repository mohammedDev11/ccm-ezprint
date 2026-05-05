"use client";

import Card from "@/components/ui/card/Card";
import { Clock3, CreditCard, Upload, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { UserDashboardQuickAction } from "../types";

type UserQuickActionsProps = {
  actions: UserDashboardQuickAction[];
  loading?: boolean;
};

const iconMap: Record<string, LucideIcon> = {
  upload: Upload,
  "credit-card": CreditCard,
  "clock-3": Clock3,
};

const UserQuickActions = ({
  actions,
  loading = false,
}: UserQuickActionsProps) => {
  return (
    <Card className="rounded-[1.35rem] p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="title-md">Quick Actions</h2>
      </div>

      <div className="space-y-4">
        {loading && actions.length === 0 ? (
          <p className="text-sm font-medium text-[var(--muted)]">
            Loading actions...
          </p>
        ) : null}

        {!loading && actions.length === 0 ? (
          <p className="text-sm font-medium text-[var(--muted)]">
            No quick actions were returned.
          </p>
        ) : null}

        {actions.map((action) => {
          const Icon = iconMap[action.iconKey || ""] || Upload;
          const isPrimary = action.variant === "primary";

          return (
            <Link
              key={action.id}
              href={action.href}
              className="group block rounded-md"
            >
              <div
                className="flex items-center gap-4 rounded-md px-5 py-5 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: isPrimary
                    ? "var(--color-brand-500)"
                    : "var(--surface-2)",
                  color: isPrimary ? "#ffffff" : "var(--title)",
                  border: isPrimary
                    ? "1px solid transparent"
                    : "1px solid var(--border)",
                }}
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-md transition"
                  style={{
                    background: isPrimary
                      ? "rgba(255,255,255,0.14)"
                      : "var(--surface)",
                    color: isPrimary ? "#ffffff" : "var(--color-brand-500)",
                    border: isPrimary
                      ? "1px solid rgba(255,255,255,0.12)"
                      : "1px solid var(--border)",
                  }}
                >
                  <Icon size={22} />
                </span>

                <span
                  className="text-lg font-semibold"
                  style={{
                    color: isPrimary ? "#ffffff" : "var(--title)",
                  }}
                >
                  {action.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
};

export default UserQuickActions;
