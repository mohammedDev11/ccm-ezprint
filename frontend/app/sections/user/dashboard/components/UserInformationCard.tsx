"use client";

import Card from "@/components/ui/card/Card";
import { AnimatePresence, motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  IdCard,
  Sparkles,
  User2,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { UserDashboardInfoItem } from "../types";

type UserInfoItem = UserDashboardInfoItem & {
  isSensitive?: boolean;
};

type UserInformationCardProps = {
  items: UserDashboardInfoItem[];
  loading?: boolean;
};

const iconMap: Record<string, LucideIcon> = {
  "user-2": User2,
  "id-card": IdCard,
};

const maskSensitiveValue = (value: string) => {
  if (!value) return "";

  const clean = value.replace(/\s+/g, "");

  if (clean.length <= 5) {
    return `${clean[0] ?? ""}XXXXX`;
  }

  return `${clean.slice(0, 5)}XXXXX`;
};

const UserInformationCard = ({
  items,
  loading = false,
}: UserInformationCardProps) => {
  const [showSensitive, setShowSensitive] = useState(false);

  const data = useMemo<UserInfoItem[]>(() => {
    return items.map((item) => ({
      ...item,
      isSensitive: item.label.toLowerCase().includes("id"),
    }));
  }, [items]);

  return (
    <Card className="group relative overflow-hidden rounded-[1.35rem] p-0">
      <div className="relative z-10 p-5 sm:p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-500/10 text-brand-500">
                <Sparkles size={18} />
              </span>
              <h2 className="title-md">User Information</h2>
            </div>

            <p className="paragraph text-sm">
              Your account identity and primary details.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowSensitive((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border transition hover:-translate-y-0.5"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--title)",
            }}
            aria-label={showSensitive ? "Hide user ID" : "Show user ID"}
          >
            {showSensitive ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="grid gap-4">
          {loading && data.length === 0 ? (
            <div
              className="rounded-md border p-4 text-sm font-medium text-[var(--muted)]"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              Loading account details...
            </div>
          ) : null}

          {!loading && data.length === 0 ? (
            <div
              className="rounded-md border p-4 text-sm font-medium text-[var(--muted)]"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              No account details were returned.
            </div>
          ) : null}

          {data.map((item, index) => {
            const Icon = iconMap[item.iconKey || ""] || User2;
            const displayValue =
              item.isSensitive && !showSensitive
                ? maskSensitiveValue(item.value)
                : item.value;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: index * 0.06 }}
                className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-md"
                    style={{
                      background: "var(--surface-2)",
                      color: "var(--color-brand-500)",
                    }}
                  >
                    <Icon size={20} />
                  </span>

                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.16em]"
                      style={{ color: "var(--muted)" }}
                    >
                      {item.label}
                    </p>
                    <p
                      className="mt-1 text-sm"
                      style={{ color: "var(--paragraph)" }}
                    >
                      Account field
                    </p>
                  </div>
                </div>

                <div className="sm:text-right">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={displayValue}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className={`font-semibold tracking-[0.02em] ${
                        item.isSensitive ? "text-lg sm:text-xl" : "text-lg"
                      }`}
                      style={{ color: "var(--title)" }}
                    >
                      {displayValue}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default UserInformationCard;
