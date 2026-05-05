"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CreditCard,
  FileText,
  Folder,
  Printer,
  Users,
} from "lucide-react";

import KpiMetricCard from "@/components/shared/cards/KpiMetricCard";
import Card from "@/components/ui/card/Card";
import RefreshButton from "@/components/ui/button/RefreshButton";
import ListBox from "@/components/ui/listbox/ListBox";
import { cn } from "@/lib/cn";
import {
  exportTableData,
  TableExportColumn,
  TableExportFormat,
} from "@/lib/export";
import { apiGet } from "@/services/api";

import ReportExportButton from "./ReportExportButton";

type ReportsSummary = {
  period: string;
  generatedAt: string;
  overviewCards: Array<{
    id: string;
    title: string;
    value: string;
    helperText: string;
  }>;
  systemSummary: {
    totalUsers: number;
    activePrinters: number;
    activeQueues: number;
    unreadNotifications: number;
    totalJobs: number;
    printedPages: number;
    pendingRelease: number;
    totalPrintCost: number;
  };
  quotaSummary: Array<{
    type: string;
    total: number;
    count: number;
  }>;
  topUsers: Array<{
    userId: string;
    username: string;
    jobs: number;
    pages: number;
    cost: number;
  }>;
  topPrinters: Array<{
    printerId: string;
    printerName: string;
    jobs: number;
    pages: number;
    cost: number;
  }>;
  jobStatusBreakdown: Array<{
    status: string;
    count: number;
    pages: number;
    cost: number;
  }>;
  groupSummary: Array<{
    id: string;
    name: string;
    members: number;
    jobs: number;
    pages: number;
    cost: number;
  }>;
};

type ReportCategoryId = "summary" | "printer" | "user" | "group" | "account";

type ReportDefinition<T> = {
  id: string;
  title: string;
  description: string;
  rows: T[];
  columns: TableExportColumn<T>[];
  filename: string;
};

type ReportRowData = Record<string, string | number | undefined>;
type ReportsCatalog = Record<ReportCategoryId, ReportDefinition<ReportRowData>[]>;

type CategoryDefinition = {
  id: ReportCategoryId;
  label: string;
  panelTitle: string;
  panelDescription: string;
  Icon: typeof BarChart3;
};

const periods = ["Last 7 days", "Last 30 days", "Last 90 days", "This year"];

const categoryDefinitions: CategoryDefinition[] = [
  {
    id: "summary",
    label: "Summary",
    panelTitle: "Operational Summary Reports",
    panelDescription:
      "Review the live report snapshot for system totals and job status from the selected reporting window.",
    Icon: BarChart3,
  },
  {
    id: "printer",
    label: "Printers",
    panelTitle: "Printer Activity Reports",
    panelDescription:
      "Compare printer output and cost using the same live metrics powering the admin dashboard.",
    Icon: Printer,
  },
  {
    id: "user",
    label: "Users",
    panelTitle: "User Activity Reports",
    panelDescription:
      "Export the current top-user activity summary without relying on mock report rows.",
    Icon: Users,
  },
  {
    id: "group",
    label: "Groups",
    panelTitle: "Group Usage Reports",
    panelDescription:
      "Track group printing volume, membership, and cost from the backend group summary.",
    Icon: Folder,
  },
  {
    id: "account",
    label: "Accounts",
    panelTitle: "Quota And Account Reports",
    panelDescription:
      "Review quota transaction totals and counts for the selected period.",
    Icon: CreditCard,
  },
];

function ReportTabs({
  value,
  onChange,
}: {
  value: ReportCategoryId;
  onChange: (value: ReportCategoryId) => void;
}) {
  return (
    <div
      className="inline-flex flex-wrap items-center gap-3 rounded-3xl border p-2"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {categoryDefinitions.map((category) => {
        const active = category.id === value;
        const Icon = category.Icon;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-200",
              active
                ? "bg-brand-500 text-white shadow-sm"
                : "text-[var(--paragraph)] hover:bg-[var(--surface-2)]",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ReportRow<T>({
  report,
  period,
  periodOptions,
  onPeriodChange,
  onExport,
}: {
  report: ReportDefinition<T>;
  period: string;
  periodOptions: string[];
  onPeriodChange: (period: string) => void;
  onExport: (report: ReportDefinition<T>, format: TableExportFormat) => void;
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-[var(--border)] px-6 py-5 last:border-b-0 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: "var(--surface-2)" }}
        >
          <FileText className="h-5 w-5 text-brand-500" />
        </div>

        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-[var(--foreground)]">
            {report.title}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{report.description}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            {report.rows.length} row{report.rows.length === 1 ? "" : "s"} in {period}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:items-end">
        <ListBox
          value={period}
          onValueChange={onPeriodChange}
          options={periodOptions}
          className="w-full sm:w-[190px]"
          triggerClassName="h-11 px-4 text-sm"
          contentClassName="min-w-[220px]"
          align="right"
          ariaLabel={`${report.title} reporting period`}
        />

        <div className="flex flex-wrap items-center gap-3">
          {(["PDF", "Excel", "CSV"] as TableExportFormat[]).map((format) => (
            <ReportExportButton
              key={format}
              format={format}
              onClick={() => onExport(report, format)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const stripCurrencyLabel = (value: string) => value.replace(/\s*SAR\b/gi, "").trim();
const toMoney = (value: number) => value.toFixed(2);

const toReportRows = <T extends object>(rows: T[] = []): ReportRowData[] =>
  rows.map((row) => ({ ...row }) as ReportRowData);

const reportValue = (row: ReportRowData, key: string) => row[key] ?? "";

const reportMoney = (row: ReportRowData, key: string) =>
  toMoney(Number(row[key] ?? 0));

const getOverviewIcon = (title: string, index: number) => {
  const normalizedTitle = title.toLowerCase();
  const fallbackIcons = [BarChart3, Printer, Users, CreditCard];
  const Icon = normalizedTitle.includes("user")
    ? Users
    : normalizedTitle.includes("printer")
      ? Printer
      : normalizedTitle.includes("queue")
        ? Folder
        : normalizedTitle.includes("cost") || normalizedTitle.includes("quota")
          ? CreditCard
          : normalizedTitle.includes("page") || normalizedTitle.includes("job")
            ? FileText
            : fallbackIcons[index % fallbackIcons.length];

  return <Icon className="h-4 w-4" />;
};

export default function ReportsPanel() {
  const [activeCategory, setActiveCategory] = useState<ReportCategoryId>("summary");
  const [period, setPeriod] = useState("Last 30 days");
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadSummary = async () => {
      setLoading(true);

      try {
        const query = encodeURIComponent(period);
        const data = await apiGet<ReportsSummary>(
          `/admin/reports/summary?period=${query}`,
          "admin",
        );

        if (!mounted) return;
        setSummary(data);
        setError("");
      } catch (requestError) {
        if (!mounted) return;
        setSummary(null);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load report summary.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadSummary();

    return () => {
      mounted = false;
    };
  }, [period, refreshTick]);

  const reportCatalog = useMemo(() => {
    const overviewRows: ReportRowData[] =
      summary?.overviewCards.map((card) => ({
        metric: card.title,
        value: stripCurrencyLabel(card.value),
        helper: card.helperText,
      })) || [];

    const reports: ReportsCatalog = {
      summary: [
        {
          id: "system-overview",
          title: "System Overview",
          description:
            "Exports the live overview cards shown on the admin dashboard.",
          rows: overviewRows,
          filename: "alpha-queue-system-overview",
          columns: [
            { label: "Metric", value: (row) => reportValue(row, "metric") },
            { label: "Value", value: (row) => reportValue(row, "value") },
            { label: "Helper", value: (row) => reportValue(row, "helper") },
          ],
        },
        {
          id: "job-status-breakdown",
          title: "Job Status Breakdown",
          description:
            "Current job volumes, pages, and cost grouped by backend job status.",
          rows: toReportRows(summary?.jobStatusBreakdown),
          filename: "alpha-queue-job-status-breakdown",
          columns: [
            { label: "Status", value: (row) => reportValue(row, "status") },
            { label: "Jobs", value: (row) => reportValue(row, "count") },
            { label: "Pages", value: (row) => reportValue(row, "pages") },
            { label: "Cost", value: (row) => reportMoney(row, "cost") },
          ],
        },
      ],
      printer: [
        {
          id: "top-printers",
          title: "Top Printers",
          description:
            "Highest-volume printers for the selected reporting period.",
          rows: toReportRows(summary?.topPrinters),
          filename: "alpha-queue-top-printers",
          columns: [
            { label: "Printer", value: (row) => reportValue(row, "printerName") },
            { label: "Jobs", value: (row) => reportValue(row, "jobs") },
            { label: "Pages", value: (row) => reportValue(row, "pages") },
            { label: "Cost", value: (row) => reportMoney(row, "cost") },
          ],
        },
      ],
      user: [
        {
          id: "top-users",
          title: "Top Users",
          description:
            "Users with the highest activity based on the live print job records.",
          rows: toReportRows(summary?.topUsers),
          filename: "alpha-queue-top-users",
          columns: [
            { label: "Username", value: (row) => reportValue(row, "username") },
            { label: "Jobs", value: (row) => reportValue(row, "jobs") },
            { label: "Pages", value: (row) => reportValue(row, "pages") },
            { label: "Cost", value: (row) => reportMoney(row, "cost") },
          ],
        },
      ],
      group: [
        {
          id: "group-activity",
          title: "Group Activity",
          description:
            "Group activity totals from the backend group summary.",
          rows: toReportRows(summary?.groupSummary),
          filename: "alpha-queue-group-activity",
          columns: [
            { label: "Group", value: (row) => reportValue(row, "name") },
            { label: "Members", value: (row) => reportValue(row, "members") },
            { label: "Jobs", value: (row) => reportValue(row, "jobs") },
            { label: "Pages", value: (row) => reportValue(row, "pages") },
            { label: "Cost", value: (row) => reportMoney(row, "cost") },
          ],
        },
      ],
      account: [
        {
          id: "quota-summary",
          title: "Quota Summary",
          description:
            "Quota transaction totals and counts grouped by transaction type.",
          rows: toReportRows(summary?.quotaSummary),
          filename: "alpha-queue-quota-summary",
          columns: [
            { label: "Type", value: (row) => reportValue(row, "type") },
            { label: "Transactions", value: (row) => reportValue(row, "count") },
            { label: "Total", value: (row) => reportMoney(row, "total") },
          ],
        },
      ],
    };

    return reports;
  }, [summary]);

  const currentCategoryDefinition =
    categoryDefinitions.find((item) => item.id === activeCategory) ||
    categoryDefinitions[0];
  const currentReports = reportCatalog[activeCategory];
  const quickExportReport = currentReports[0];
  const CategoryIcon = currentCategoryDefinition.Icon;

  const handleExport = <T,>(report: ReportDefinition<T>, format: TableExportFormat) => {
    exportTableData({
      title: `${report.title} (${period})`,
      filename: report.filename,
      format,
      columns: report.columns,
      rows: report.rows,
    });
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <ReportTabs value={activeCategory} onChange={setActiveCategory} />

        <div className="flex flex-wrap items-center gap-3">
          <ListBox
            value={period}
            onValueChange={setPeriod}
            options={periods}
            className="w-full sm:w-[190px]"
            triggerClassName="h-12 px-4 text-sm"
            contentClassName="min-w-[220px]"
            align="right"
            ariaLabel="Reporting period"
          />

          <RefreshButton
            className="h-12"
            onClick={() => setRefreshTick((current) => current + 1)}
          />
        </div>
      </div>

      {error ? (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{
            borderColor:
              "color-mix(in srgb, var(--color-brand-600) 24%, transparent)",
            background:
              "color-mix(in srgb, var(--color-brand-500) 10%, var(--surface))",
            color:
              "color-mix(in srgb, var(--color-brand-700) 82%, var(--title))",
          }}
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(summary?.overviewCards || []).map((card, index) => (
          <KpiMetricCard
            key={card.id}
            title={card.title}
            value={stripCurrencyLabel(card.value)}
            helper={card.helperText}
            icon={getOverviewIcon(card.title, index)}
            index={index}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="h-fit rounded-[28px]">
          <div className="space-y-6">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "var(--surface-2)" }}
            >
              <CategoryIcon className="h-8 w-8 text-brand-500" />
            </div>

            <div>
              <h2 className="title-md">{currentCategoryDefinition.panelTitle}</h2>
              <p className="paragraph mt-3">
                {currentCategoryDefinition.panelDescription}
              </p>
            </div>

            <div
              className="border-t pt-5"
              style={{ borderColor: "var(--border)" }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: "var(--muted)" }}
              >
                Quick export
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                {(["PDF", "Excel", "CSV"] as TableExportFormat[]).map((format) => (
                  <ReportExportButton
                    key={format}
                    format={format}
                    className="hover:scale-100"
                    onClick={() => {
                      if (quickExportReport) {
                        handleExport(quickExportReport, format);
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            <div
              className="border-t pt-5"
              style={{ borderColor: "var(--border)" }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: "var(--muted)" }}
              >
                Current state
              </p>

              <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                <p>
                  Period:{" "}
                  <span className="font-semibold text-[var(--title)]">{period}</span>
                </p>
                <p>
                  Generated:{" "}
                  <span className="font-semibold text-[var(--title)]">
                    {summary?.generatedAt
                      ? new Date(summary.generatedAt).toLocaleString()
                      : "Waiting for backend data"}
                  </span>
                </p>
                <p>
                  Reports in category:{" "}
                  <span className="font-semibold text-[var(--title)]">
                    {currentReports.length}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden rounded-[28px] p-0">
          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-[var(--muted)]">
              Loading report definitions...
            </div>
          ) : currentReports.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-[var(--muted)]">
              No report data is available for this category yet.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {currentReports.map((report) => (
                <ReportRow
                  key={report.id}
                  report={report}
                  period={period}
                  periodOptions={periods}
                  onPeriodChange={setPeriod}
                  onExport={handleExport}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
