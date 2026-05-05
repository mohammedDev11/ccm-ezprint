"use client";

import {
  type ProfileField,
  type ProfileSection,
  informationSections,
} from "@/lib/mock-data/User/profile";
import { apiGet } from "@/services/api";
import {
  BadgeCheck,
  Check,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  GraduationCap,
  History,
  IdCard,
  Mail,
  Phone,
  Printer,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

type ProfileResponse = {
  informationSections: ProfileSection[];
};

type FieldCardProps = {
  field: ProfileField;
  icon?: ReactNode;
  onCopy?: (value: string, key: string) => void;
  copied?: boolean;
  interactive?: boolean;
};

const iconMap: Record<string, ReactNode> = {
  "personal-information": <UserRound className="h-5 w-5" />,
  "university-information": <GraduationCap className="h-5 w-5" />,
  "printing-identity": <Printer className="h-5 w-5" />,
};

const fieldIconMap: Record<string, ReactNode> = {
  "Full Name": <UserRound className="h-4 w-4" />,
  Username: <IdCard className="h-4 w-4" />,
  "Email Address": <Mail className="h-4 w-4" />,
  "Phone Number": <Phone className="h-4 w-4" />,
  "University ID": <IdCard className="h-4 w-4" />,
  Role: <BadgeCheck className="h-4 w-4" />,
  Department: <GraduationCap className="h-4 w-4" />,
  College: <GraduationCap className="h-4 w-4" />,
  "Account Quota": <CreditCard className="h-4 w-4" />,
  "Printing Status": <ShieldCheck className="h-4 w-4" />,
  "Default Queue": <Printer className="h-4 w-4" />,
};

const getField = (
  sections: ProfileSection[],
  sectionId: string,
  fieldId: string,
) =>
  sections
    .find((section) => section.id === sectionId)
    ?.fields.find((field) => field.id === fieldId);

const getValue = (field?: ProfileField) => field?.value || "-";

const getInitials = (name: string, fallback: string) => {
  const source = name && name !== "-" ? name : fallback;
  const parts = source
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const isConfiguredValue = (value: string) =>
  Boolean(value && value !== "-" && value.toLowerCase() !== "not configured");

const maskValue = (value: string) => {
  if (!isConfiguredValue(value)) return "Not linked";
  if (value.length <= 4) return "••••";
  return `${"•".repeat(Math.max(value.length - 4, 8))}${value.slice(-4)}`;
};

function StatusPill({
  label,
  tone = "brand",
}: {
  label: string;
  tone?: "brand" | "success" | "muted";
}) {
  const style =
    tone === "success"
      ? {
          background:
            "color-mix(in srgb, var(--color-support-500) 12%, var(--surface))",
          borderColor:
            "color-mix(in srgb, var(--color-support-500) 24%, var(--border))",
          color: "color-mix(in srgb, var(--color-support-700) 78%, var(--title))",
        }
      : tone === "muted"
        ? {
            background: "var(--surface-2)",
            borderColor: "var(--border)",
            color: "var(--muted)",
          }
        : {
            background: "rgba(var(--brand-rgb), 0.1)",
            borderColor:
              "color-mix(in srgb, var(--color-brand-500) 28%, var(--border))",
            color: "var(--color-brand-600)",
          };

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold"
      style={style}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function FieldCard({
  field,
  icon,
  onCopy,
  copied = false,
  interactive = false,
}: FieldCardProps) {
  return (
    <div
      className="group rounded-2xl border p-4 transition hover:-translate-y-0.5"
      style={{
        borderColor: "var(--border)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--surface) 98%, transparent), color-mix(in srgb, var(--surface-2) 70%, transparent))",
        boxShadow: "0 10px 24px rgba(var(--shadow-color), 0.06)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            {icon ? (
              <span className="flex items-center justify-center text-[var(--color-brand-500)]">
                {icon}
              </span>
            ) : null}
            <span>{field.label}</span>
          </div>
          <p className="break-words text-base font-semibold text-[var(--title)]">
            {field.value}
          </p>
        </div>

        {interactive && onCopy && isConfiguredValue(field.value) ? (
          <button
            type="button"
            onClick={() => onCopy(field.value, field.id)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition hover:text-[var(--color-brand-500)]"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface-2)",
              color: copied ? "var(--color-brand-500)" : "var(--muted)",
            }}
            aria-label={`Copy ${field.label}`}
            title={`Copy ${field.label}`}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function Information() {
  const [sections, setSections] = useState<ProfileSection[]>(informationSections);
  const [showCardId, setShowCardId] = useState(false);
  const [copiedKey, setCopiedKey] = useState("");

  useEffect(() => {
    let mounted = true;

    apiGet<ProfileResponse>("/user/profile", "user")
      .then((data) => {
        if (!mounted || !data?.informationSections?.length) return;
        setSections(data.informationSections);
      })
      .catch(() => {
        // Keep mock fallback for resilience.
      });

    return () => {
      mounted = false;
    };
  }, []);

  const profile = useMemo(() => {
    const fullName = getValue(
      getField(sections, "personal-information", "full-name"),
    );
    const username = getValue(
      getField(sections, "personal-information", "username"),
    );
    const email = getValue(getField(sections, "personal-information", "email"));
    const phone = getValue(getField(sections, "personal-information", "phone"));
    const userId = getValue(
      getField(sections, "university-information", "user-id"),
    );
    const role = getValue(getField(sections, "university-information", "role"));
    const department = getValue(
      getField(sections, "university-information", "department"),
    );
    const college = getValue(
      getField(sections, "university-information", "college"),
    );
    const cardId = getValue(
      getField(sections, "printing-identity", "primary-card-id"),
    );
    const quota = getValue(
      getField(sections, "printing-identity", "account-quota"),
    );
    const printingStatus = getValue(
      getField(sections, "printing-identity", "printing-status"),
    );
    const defaultQueue = getValue(
      getField(sections, "printing-identity", "default-queue"),
    );

    return {
      fullName,
      username,
      email,
      phone,
      userId,
      role,
      department,
      college,
      cardId,
      quota,
      printingStatus,
      defaultQueue,
      initials: getInitials(fullName, username),
    };
  }, [sections]);

  const personalSection = sections.find(
    (section) => section.id === "personal-information",
  );
  const universitySection = sections.find(
    (section) => section.id === "university-information",
  );
  const printingSection = sections.find(
    (section) => section.id === "printing-identity",
  );
  const printingFields =
    printingSection?.fields.filter((field) => field.id !== "primary-card-id") || [];
  const isCardLinked = isConfiguredValue(profile.cardId);

  const copyValue = async (value: string, key: string) => {
    if (!isConfiguredValue(value)) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(""), 1400);
    } catch {
      setCopiedKey("");
    }
  };

  return (
    <div className="space-y-6">
      <section
        className="relative overflow-hidden rounded-[32px] border p-6 sm:p-8"
        style={{
          borderColor: "var(--border)",
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--surface) 96%, transparent), color-mix(in srgb, var(--surface-2) 90%, transparent))",
          boxShadow:
            "0 22px 60px rgba(var(--shadow-color), 0.13), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="absolute inset-x-8 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(var(--brand-rgb), 0.72), transparent)",
          }}
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div
              className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border text-4xl font-semibold text-[var(--color-brand-600)]"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--color-brand-500) 30%, var(--border))",
                background:
                  "radial-gradient(circle at 30% 20%, rgba(var(--brand-rgb),0.22), color-mix(in srgb, var(--surface) 86%, transparent))",
                boxShadow: "0 18px 42px rgba(var(--brand-rgb), 0.18)",
              }}
              aria-hidden="true"
            >
              {profile.initials}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill label={profile.role} />
                <StatusPill label="Active" tone="success" />
              </div>

              <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[var(--title)] sm:text-4xl">
                {profile.fullName}
              </h2>
              <p className="mt-2 text-base font-medium text-[var(--muted)]">
                {profile.username} / {profile.userId}
              </p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--paragraph)]">
                {profile.department}
              </p>
            </div>
          </div>

          <div
            className="rounded-[26px] border p-5"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-brand-500) 24%, var(--border))",
              background:
                "linear-gradient(155deg, rgba(var(--brand-rgb),0.14), color-mix(in srgb, var(--surface) 88%, transparent))",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Current Quota
            </p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="whitespace-nowrap text-4xl font-semibold leading-none text-[var(--title)]">
                {profile.quota}
              </p>
              <CreditCard className="h-7 w-7 text-[var(--color-brand-500)]" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/sections/user/redeem"
                className="rounded-xl border px-3 py-2 text-sm font-semibold transition hover:text-[var(--color-brand-500)]"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  color: "var(--title)",
                }}
              >
                Top Up
              </Link>
              <Link
                href="/sections/user/history"
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition hover:text-[var(--color-brand-500)]"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  color: "var(--title)",
                }}
              >
                <History className="h-4 w-4" />
                View History
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          {personalSection ? (
            <ProfileSectionCard
              section={personalSection}
              copiedKey={copiedKey}
              onCopy={copyValue}
            />
          ) : null}

          {universitySection ? (
            <ProfileSectionCard
              section={universitySection}
              copiedKey={copiedKey}
              onCopy={copyValue}
            />
          ) : null}
        </div>

        <div className="space-y-6">
          <section
            className="rounded-[28px] border p-6"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
              boxShadow: "0 14px 34px rgba(var(--shadow-color), 0.08)",
            }}
          >
            <div className="mb-5 flex items-start gap-4">
              <SectionIcon>{iconMap["printing-identity"]}</SectionIcon>
              <div>
                <h3 className="text-xl font-semibold text-[var(--title)]">
                  Printing Profile
                </h3>
                <p className="mt-1 text-sm leading-6 text-[var(--paragraph)]">
                  Information used for printing and secure release.
                </p>
              </div>
            </div>

            <div
              className="relative overflow-hidden rounded-[26px] border p-5"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--color-brand-500) 28%, var(--border))",
                background:
                  "linear-gradient(145deg, rgba(var(--brand-rgb),0.16), color-mix(in srgb, var(--surface-2) 82%, transparent))",
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Primary Card ID
                  </p>
                  <p className="mt-4 break-all font-mono text-2xl font-semibold tracking-[0.1em] text-[var(--title)]">
                    {showCardId ? profile.cardId : maskValue(profile.cardId)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCardId((current) => !current)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border transition hover:text-[var(--color-brand-500)]"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface)",
                      color: "var(--muted)",
                    }}
                    aria-label={showCardId ? "Hide card ID" : "Reveal card ID"}
                    title={showCardId ? "Hide" : "Reveal"}
                    disabled={!isCardLinked}
                  >
                    {showCardId ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => copyValue(profile.cardId, "primary-card-id")}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border transition hover:text-[var(--color-brand-500)] disabled:pointer-events-none disabled:opacity-45"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface)",
                      color:
                        copiedKey === "primary-card-id"
                          ? "var(--color-brand-500)"
                          : "var(--muted)",
                    }}
                    aria-label="Copy primary card ID"
                    title="Copy"
                    disabled={!isCardLinked}
                  >
                    {copiedKey === "primary-card-id" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <StatusPill
                  label={isCardLinked ? "Status: Active" : "Status: Not Linked"}
                  tone={isCardLinked ? "success" : "muted"}
                />
                <StatusPill label="Secure Release Enabled" />
                <StatusPill label="Last used: Not available" tone="muted" />
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {printingFields.map((field) => (
                <FieldCard
                  key={field.id}
                  field={field}
                  icon={fieldIconMap[field.label]}
                />
              ))}
            </div>
          </section>

          <section
            className="rounded-[28px] border p-6"
            style={{
              borderColor: "var(--border)",
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--surface) 96%, transparent), color-mix(in srgb, var(--surface-2) 88%, transparent))",
            }}
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-[var(--color-brand-500)]"
                style={{ background: "rgba(var(--brand-rgb), 0.12)" }}
              >
                <Printer className="h-8 w-8" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-[var(--title)]">
                    Printing Identity
                  </h3>
                  <StatusPill label="Secure Release" />
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--paragraph)]">
                  This identity is used to release your documents securely at
                  printers.
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                  Default queue: {profile.defaultQueue}
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function SectionIcon({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-[var(--color-brand-500)]"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface-2)",
      }}
    >
      {children}
    </div>
  );
}

function ProfileSectionCard({
  section,
  copiedKey,
  onCopy,
}: {
  section: ProfileSection;
  copiedKey: string;
  onCopy: (value: string, key: string) => void;
}) {
  return (
    <section
      className="rounded-[28px] border p-6"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
        boxShadow: "0 14px 34px rgba(var(--shadow-color), 0.08)",
      }}
    >
      <div className="mb-5 flex items-start gap-4">
        <SectionIcon>{iconMap[section.id]}</SectionIcon>
        <div>
          <h3 className="text-xl font-semibold text-[var(--title)]">
            {section.id === "personal-information" ? "Identity" : "Academic / Organization"}
          </h3>
          {section.description ? (
            <p className="mt-1 text-sm leading-6 text-[var(--paragraph)]">
              {section.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {section.fields.map((field) => (
          <FieldCard
            key={field.id}
            field={field}
            icon={fieldIconMap[field.label]}
            interactive={field.id === "email" || field.id === "phone"}
            onCopy={onCopy}
            copied={copiedKey === field.id}
          />
        ))}
      </div>
    </section>
  );
}
