"use client";

import SectionBadge from "@/components/shared/page/SectionBadge";
import ExpandedButton from "@/components/ui/button/ExpandedButton";
import ListBox from "@/components/ui/listbox/ListBox";
import { apiGet } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import UserDashboardCharts from "./components/UserDashboardCharts";
import UserInformationCard from "./components/UserInformationCard";
import UserQuickActionsCard from "./components/UserQuickActionsCard";
import UserTopCards from "./components/UserTopCards";
import type { RecentPrintJob, UserDashboardData } from "./types";

const dashboardPeriods = ["Last 7 days", "Last 30 days", "Last 90 days", "This year"];

const getPeriodSummaryText = (periodLabel: string) => {
  const normalizedPeriod = periodLabel.toLowerCase();

  if (normalizedPeriod === "last 7 days") {
    return `Showing this week's KPI summary (${periodLabel})`;
  }

  if (normalizedPeriod === "last 30 days") {
    return `Showing monthly KPI summary (${periodLabel})`;
  }

  if (normalizedPeriod === "last 90 days") {
    return `Showing quarterly KPI summary (${periodLabel})`;
  }

  if (normalizedPeriod === "this year") {
    return `Showing annual KPI summary (${periodLabel})`;
  }

  return `Showing selected KPI summary window (${periodLabel})`;
};

const Page = () => {
  const [kpiRange, setKpiRange] = useState("Last 30 days");
  const [dashboard, setDashboard] = useState<UserDashboardData | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentPrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(
    async ({ showSpinner = false }: { showSpinner?: boolean } = {}) => {
      if (showSpinner) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const query = encodeURIComponent(kpiRange);
        const [dashboardData, recentJobsData] = await Promise.all([
          apiGet<UserDashboardData>(`/user/dashboard?period=${query}`, "user"),
          apiGet<{ jobs: RecentPrintJob[] }>("/user/jobs/recent", "user"),
        ]);

        setDashboard(dashboardData);
        setRecentJobs(
          Array.isArray(recentJobsData?.jobs) ? recentJobsData.jobs : [],
        );
        setError("");
      } catch (requestError) {
        setDashboard(null);
        setRecentJobs([]);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load the dashboard.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [kpiRange],
  );

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadDashboard({ showSpinner: true });
    }, 0);

    return () => {
      window.clearTimeout(loadTimer);
    };
  }, [loadDashboard]);

  return (
    <div className="flex flex-col gap-10">
      <section className="relative space-y-4 pt-16">
        <SectionBadge
          title="Dashboard"
          description="Your print quota, jobs, pending releases, and recent activity."
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-full text-left text-sm font-medium text-[var(--muted)]">
            {getPeriodSummaryText(kpiRange)}
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <ExpandedButton
              id="user-dashboard-refresh"
              label={refreshing ? "Refreshing" : "Refresh"}
              icon={FiRefreshCw}
              variant="surface"
              onClick={() => loadDashboard({ showSpinner: false })}
              className="h-11 rounded-md px-1 py-0"
              iconSize={17}
              disabled={loading || refreshing}
            />

            <ListBox
              value={kpiRange}
              options={dashboardPeriods}
              onValueChange={setKpiRange}
              disabled={loading || refreshing}
              className="w-[180px]"
              triggerClassName="h-11 font-semibold"
              contentClassName="w-[180px]"
              align="right"
              ariaLabel="Dashboard period"
            />
          </div>
        </div>

        <UserTopCards cards={dashboard?.cards || []} loading={loading} />
      </section>

      {error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <UserDashboardCharts recentJobs={recentJobs} loading={loading} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <UserInformationCard
            items={dashboard?.userInformation || []}
            loading={loading}
          />
        </div>

        <div className="xl:col-span-1">
          <UserQuickActionsCard
            actions={dashboard?.quickActions || []}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
