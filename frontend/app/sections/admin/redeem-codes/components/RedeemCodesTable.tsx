"use client";

import KpiMetricCard from "@/components/shared/cards/KpiMetricCard";
import FullscreenTablePortal from "@/components/shared/table/FullscreenTablePortal";
import {
  Table,
  TableBody,
  TableCell,
  TableCheckbox,
  TableControls,
  TableEmptyState,
  TableGrid,
  TableHeader,
  TableHeaderCell,
  TableMain,
  TableSearch,
  TableTitleBlock,
  TableTop,
} from "@/components/shared/table/Table";
import StatusBadge, { type StatusTone } from "@/components/ui/badge/StatusBadge";
import Button from "@/components/ui/button/Button";
import ExpandedButton from "@/components/ui/button/ExpandedButton";
import RefreshButton from "@/components/ui/button/RefreshButton";
import ListBox, { type ListBoxOption } from "@/components/ui/listbox/ListBox";
import Modal from "@/components/ui/modal/Modal";
import { exportTableData, type TableExportFormat } from "@/lib/export";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";
import {
  Ban,
  Check,
  ClipboardList,
  Copy,
  FileOutput,
  Gift,
  Maximize2,
  Minimize2,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  TicketCheck,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

type RedeemCodeStatus = "unused" | "redeemed" | "expired" | "disabled";
type SortDir = "asc" | "desc";
type SortKey =
  | "code"
  | "quotaAmount"
  | "status"
  | "createdBy"
  | "redeemedBy"
  | "redeemedAt"
  | "expiresAt"
  | "note";
type BulkAction = "disable" | "delete";

type UserSummary = {
  id: string;
  username: string;
  fullName: string;
  email: string;
};

type RedeemCodeItem = {
  id: string;
  code: string;
  quotaAmount: number;
  status: RedeemCodeStatus;
  createdBy: UserSummary | null;
  redeemedBy: UserSummary | null;
  redeemedAt: string | null;
  redeemedAtLabel: string;
  expiresAt: string | null;
  expiresAtLabel: string;
  note: string;
  createdAt: string;
  createdAtLabel: string;
};

type RedeemCodesResponse = {
  summary: {
    total: number;
    unused: number;
    redeemed: number;
    expired: number;
    disabled: number;
  };
  codes: RedeemCodeItem[];
};

type GenerateCodesResponse = {
  generatedCodes: string[];
  codes: RedeemCodeItem[];
};

const columnsClassName =
  "gap-x-5 [grid-template-columns:72px_minmax(190px,0.9fr)_minmax(120px,0.55fr)_minmax(140px,0.7fr)_minmax(220px,1.05fr)_minmax(210px,1fr)_minmax(190px,0.9fr)_minmax(190px,0.9fr)_minmax(300px,1.25fr)]";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "unused", label: "Unused" },
  { value: "redeemed", label: "Redeemed" },
  { value: "expired", label: "Expired" },
  { value: "disabled", label: "Disabled" },
];

const expiryOptions = [
  { value: "all", label: "All expiry states" },
  { value: "no-expiry", label: "No expiry" },
  { value: "expired", label: "Expired" },
  { value: "expires-soon", label: "Expires soon" },
  { value: "active", label: "Active / not expired" },
];

const redemptionOptions = [
  { value: "all", label: "All codes" },
  { value: "redeemed", label: "Redeemed codes" },
  { value: "not-redeemed", label: "Not redeemed codes" },
];

const createdDateOptions = [
  { value: "all", label: "All dates" },
  { value: "last-7", label: "Last 7 days" },
  { value: "last-30", label: "Last 30 days" },
  { value: "this-year", label: "This year" },
];

const actionOptions: ListBoxOption[] = [
  { value: "disable", label: "Disable selected" },
  { value: "delete", label: "Delete selected" },
];
const exportFormatOptions: TableExportFormat[] = ["PDF", "Excel", "CSV"];
const toolbarExportOptions: ListBoxOption[] = exportFormatOptions.map((format) => ({
  value: format,
  label: format,
  selectedLabel: (
    <span className="inline-flex items-center gap-2">
      <FileOutput className="h-4 w-4" />
      Export
    </span>
  ),
}));

const emptySummary: RedeemCodesResponse["summary"] = {
  total: 0,
  unused: 0,
  redeemed: 0,
  expired: 0,
  disabled: 0,
};

const formatQuota = (value: number) => Number(value || 0).toFixed(2);
const formatCode = (code: string) =>
  code.length <= 6 ? code : code.replace(/(.{4})/g, "$1 ").trim();
const getExportTimestamp = () =>
  new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
const dayMs = 24 * 60 * 60 * 1000;
const expiresSoonWindowMs = 7 * dayMs;
const filterReferenceNow = Date.now();

const compareValues = (a: string | number, b: string | number, direction: SortDir) => {
  if (typeof a === "number" && typeof b === "number") {
    return direction === "asc" ? a - b : b - a;
  }

  return direction === "asc"
    ? String(a).localeCompare(String(b))
    : String(b).localeCompare(String(a));
};

const timestampValue = (value: string | null) => {
  if (!value) return 0;

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const dateValue = (value: string | null) => timestampValue(value);

const hasExpired = (code: RedeemCodeItem, now: number) => {
  const expiryTimestamp = timestampValue(code.expiresAt);

  return code.status === "expired" || Boolean(expiryTimestamp && expiryTimestamp < now);
};

const isRedeemed = (code: RedeemCodeItem) =>
  code.status === "redeemed" || Boolean(code.redeemedAt || code.redeemedBy);

const getPersonLabel = (person: UserSummary | null) => {
  if (!person) return "System";

  return person.fullName || person.username || person.email || "User";
};

const getStatusTone = (status: RedeemCodeStatus): StatusTone => {
  switch (status) {
    case "unused":
      return "success";
    case "redeemed":
      return "inactive";
    case "expired":
      return "warning";
    case "disabled":
    default:
      return "danger";
  }
};

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  type = "text",
  min,
  max,
  step,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      min={min}
      max={max}
      step={step}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="h-12 w-full rounded-md border px-4 text-sm font-medium outline-none transition focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[rgba(var(--brand-rgb),0.14)]"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
        color: "var(--title)",
      }}
    />
  );
}

function FilterOptionGroup({
  title,
  value,
  options,
  onChange,
}: {
  title: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {title}
      </p>

      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className="rounded-md border px-3 py-2 text-left text-sm font-semibold transition"
              style={{
                background: isSelected
                  ? "rgba(var(--brand-rgb), 0.1)"
                  : "var(--surface-2)",
                borderColor: isSelected
                  ? "color-mix(in srgb, var(--color-brand-500) 36%, var(--border))"
                  : "var(--border)",
                color: isSelected ? "var(--color-brand-600)" : "var(--paragraph)",
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function RedeemCodesTable() {
  const [codes, setCodes] = useState<RedeemCodeItem[]>([]);
  const [summary, setSummary] =
    useState<RedeemCodesResponse["summary"]>(emptySummary);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState("all");
  const [redemptionFilter, setRedemptionFilter] = useState("all");
  const [createdDateFilter, setCreatedDateFilter] = useState("all");
  const [minimumQuotaFilter, setMinimumQuotaFilter] = useState("");
  const [maximumQuotaFilter, setMaximumQuotaFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdBy");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [quotaAmount, setQuotaAmount] = useState("10");
  const [expiresAt, setExpiresAt] = useState("");
  const [note, setNote] = useState("");
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [copiedCodeId, setCopiedCodeId] = useState("");
  const [copiedGenerated, setCopiedGenerated] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [generateBusy, setGenerateBusy] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportMethod, setExportMethod] = useState<TableExportFormat>("PDF");

  const loadCodes = async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const data = await apiGet<RedeemCodesResponse>(
        "/admin/redeem-codes",
        "admin",
      );
      const nextCodes = Array.isArray(data?.codes) ? data.codes : [];
      setCodes(nextCodes);
      setSummary(data?.summary || emptySummary);
      setSelectedIds((current) =>
        current.filter((id) => nextCodes.some((code) => code.id === id)),
      );
      setError("");
    } catch (requestError) {
      setCodes([]);
      setSummary(emptySummary);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load redeem codes.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadCodes(true);
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir(
      key === "quotaAmount" || key === "redeemedAt" || key === "expiresAt"
        ? "desc"
        : "asc",
    );
  };

  const filteredCodes = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    const now = filterReferenceNow;
    const minQuota =
      minimumQuotaFilter.trim() === "" ? null : Number(minimumQuotaFilter);
    const maxQuota =
      maximumQuotaFilter.trim() === "" ? null : Number(maximumQuotaFilter);

    return [...codes]
      .filter((code) => {
        const matchesSearch =
          !searchTerm ||
          [
            code.code,
            code.note,
            getPersonLabel(code.createdBy),
            getPersonLabel(code.redeemedBy),
            code.status,
          ]
            .join(" ")
            .toLowerCase()
            .includes(searchTerm);

        const matchesStatus =
          statusFilter === "all" || code.status === statusFilter;

        const expiryTimestamp = timestampValue(code.expiresAt);
        const codeHasExpired = hasExpired(code, now);
        const matchesExpiry =
          expiryFilter === "all" ||
          (expiryFilter === "no-expiry" && !code.expiresAt) ||
          (expiryFilter === "expired" && codeHasExpired) ||
          (expiryFilter === "expires-soon" &&
            Boolean(
              expiryTimestamp &&
                expiryTimestamp >= now &&
                expiryTimestamp <= now + expiresSoonWindowMs,
            )) ||
          (expiryFilter === "active" && !codeHasExpired);

        const codeIsRedeemed = isRedeemed(code);
        const matchesRedemption =
          redemptionFilter === "all" ||
          (redemptionFilter === "redeemed" && codeIsRedeemed) ||
          (redemptionFilter === "not-redeemed" && !codeIsRedeemed);

        const matchesMinQuota =
          minQuota === null || Number.isNaN(minQuota) || code.quotaAmount >= minQuota;
        const matchesMaxQuota =
          maxQuota === null || Number.isNaN(maxQuota) || code.quotaAmount <= maxQuota;

        const createdTimestamp = timestampValue(code.createdAt);
        const matchesCreatedDate =
          createdDateFilter === "all" ||
          (createdDateFilter === "last-7" &&
            Boolean(createdTimestamp && createdTimestamp >= now - 7 * dayMs)) ||
          (createdDateFilter === "last-30" &&
            Boolean(createdTimestamp && createdTimestamp >= now - 30 * dayMs)) ||
          (createdDateFilter === "this-year" &&
            Boolean(
              createdTimestamp &&
                new Date(createdTimestamp).getFullYear() === new Date(now).getFullYear(),
            ));

        return (
          matchesSearch &&
          matchesStatus &&
          matchesExpiry &&
          matchesRedemption &&
          matchesMinQuota &&
          matchesMaxQuota &&
          matchesCreatedDate
        );
      })
      .sort((a, b) => {
        switch (sortKey) {
          case "quotaAmount":
            return compareValues(a.quotaAmount, b.quotaAmount, sortDir);
          case "createdBy":
            return compareValues(
              getPersonLabel(a.createdBy),
              getPersonLabel(b.createdBy),
              sortDir,
            );
          case "redeemedBy":
            return compareValues(
              getPersonLabel(a.redeemedBy),
              getPersonLabel(b.redeemedBy),
              sortDir,
            );
          case "redeemedAt":
            return compareValues(dateValue(a.redeemedAt), dateValue(b.redeemedAt), sortDir);
          case "expiresAt":
            return compareValues(dateValue(a.expiresAt), dateValue(b.expiresAt), sortDir);
          case "note":
            return compareValues(a.note, b.note, sortDir);
          case "status":
            return compareValues(a.status, b.status, sortDir);
          case "code":
          default:
            return compareValues(a.code, b.code, sortDir);
        }
      });
  }, [
    codes,
    createdDateFilter,
    expiryFilter,
    maximumQuotaFilter,
    minimumQuotaFilter,
    redemptionFilter,
    search,
    sortDir,
    sortKey,
    statusFilter,
  ]);

  const visibleIds = filteredCodes.map((code) => code.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const selectedCodes = useMemo(
    () => codes.filter((code) => selectedIds.includes(code.id)),
    [codes, selectedIds],
  );
  const activeFilterCount = [
    statusFilter !== "all",
    expiryFilter !== "all",
    redemptionFilter !== "all",
    createdDateFilter !== "all",
    minimumQuotaFilter.trim() !== "",
    maximumQuotaFilter.trim() !== "",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setStatusFilter("all");
    setExpiryFilter("all");
    setRedemptionFilter("all");
    setCreatedDateFilter("all");
    setMinimumQuotaFilter("");
    setMaximumQuotaFilter("");
  };

  const kpiCards = [
    {
      title: "Total Codes",
      value: summary.total.toLocaleString(),
      helper: "All generated voucher codes",
      icon: <TicketCheck className="h-4 w-4" />,
    },
    {
      title: "Unused",
      value: summary.unused.toLocaleString(),
      helper: "Available for redemption",
      icon: <ShieldCheck className="h-4 w-4" />,
    },
    {
      title: "Redeemed",
      value: summary.redeemed.toLocaleString(),
      helper: "Already claimed by users",
      icon: <Gift className="h-4 w-4" />,
    },
    {
      title: "Expired/Disabled",
      value: (summary.expired + summary.disabled).toLocaleString(),
      helper: "No longer redeemable",
      icon: <Ban className="h-4 w-4" />,
    },
  ];

  const toggleSelectedId = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !visibleIds.includes(id)),
      );
      return;
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...visibleIds])));
  };

  const copyText = async (value: string, id: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedCodeId(id);
      window.setTimeout(() => setCopiedCodeId(""), 1400);
    } catch {
      setCopiedCodeId("");
    }
  };

  const copyGeneratedCodes = async () => {
    if (generatedCodes.length === 0) return;

    try {
      await navigator.clipboard.writeText(generatedCodes.join("\n"));
      setCopiedGenerated(true);
      window.setTimeout(() => setCopiedGenerated(false), 1400);
    } catch {
      setCopiedGenerated(false);
    }
  };

  const runBulkAction = async (action: BulkAction) => {
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(
      action === "disable"
        ? `Disable ${selectedIds.length} selected code${selectedIds.length === 1 ? "" : "s"}? Redeemed codes will be skipped.`
        : `Delete ${selectedIds.length} selected code${selectedIds.length === 1 ? "" : "s"}?`,
    );

    if (!confirmed) return;

    setBusy(true);
    setError("");

    try {
      if (action === "disable") {
        await apiPatch("/admin/redeem-codes/bulk/disable", { ids: selectedIds }, "admin");
      } else {
        await apiPost("/admin/redeem-codes/bulk/delete", { ids: selectedIds }, "admin");
      }

      setSelectedIds([]);
      await loadCodes(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Redeem code action failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  const disableSingleCode = async (code: RedeemCodeItem) => {
    setBusy(true);
    setError("");

    try {
      await apiPatch(`/admin/redeem-codes/${code.id}/disable`, {}, "admin");
      await loadCodes(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to disable redeem code.",
      );
    } finally {
      setBusy(false);
    }
  };

  const deleteSingleCode = async (code: RedeemCodeItem) => {
    const confirmed = window.confirm(`Delete redeem code ${formatCode(code.code)}?`);

    if (!confirmed) return;

    setBusy(true);
    setError("");

    try {
      await apiDelete(`/admin/redeem-codes/${code.id}`, "admin");
      setSelectedIds((current) => current.filter((id) => id !== code.id));
      await loadCodes(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete redeem code.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGenerateBusy(true);
    setGenerateError("");

    try {
      const expiryIso = expiresAt ? `${expiresAt}T23:59:59.000` : "";
      const data = await apiPost<GenerateCodesResponse>(
        "/admin/redeem-codes/generate",
        {
          quotaAmount: Number(quotaAmount),
          count: 1,
          numberOfCodes: 1,
          expiresAt: expiryIso,
          note,
        },
        "admin",
      );

      setGeneratedCodes(Array.isArray(data?.generatedCodes) ? data.generatedCodes : []);
      await loadCodes(false);
    } catch (requestError) {
      setGenerateError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to generate redeem codes.",
      );
    } finally {
      setGenerateBusy(false);
    }
  };

  const exportCodes = (format: TableExportFormat) => {
    if (selectedCodes.length === 0) return;

    exportTableData({
      title: "Redeem Codes",
      filename: `redeem-codes-export-${getExportTimestamp()}`,
      format,
      columns: [
        { label: "Code", value: (row: RedeemCodeItem) => formatCode(row.code) },
        { label: "Quota", value: (row) => formatQuota(row.quotaAmount) },
        { label: "Status", value: (row) => row.status },
        { label: "Created By", value: (row) => getPersonLabel(row.createdBy) },
        { label: "Redeemed By", value: (row) => getPersonLabel(row.redeemedBy) },
        { label: "Redeemed Date", value: (row) => row.redeemedAtLabel },
        { label: "Expiry Date", value: (row) => row.expiresAtLabel || "No expiry" },
        { label: "Note", value: (row) => row.note },
      ],
      rows: selectedCodes,
    });
  };

  const handleExportChange = (format: TableExportFormat) => {
    setExportMethod(format);
    setIsExportModalOpen(true);
  };

  const renderTable = (expanded = false) => (
    <Table
      className={`flex min-h-[560px] flex-col ${
        expanded ? "h-dvh !rounded-none" : "max-h-[calc(100vh-20rem)]"
      }`}
    >
      <TableTop
        className={`shrink-0 ${expanded ? "bg-[var(--surface)]" : ""}`}
      >
        <TableTitleBlock title="Redeem Codes" />

        <TableControls>
          <TableSearch
            id={expanded ? "search-redeem-codes-expanded" : "search-redeem-codes"}
            label="Search codes"
            value={search}
            onChange={setSearch}
          />

          <RefreshButton
            className="h-14"
            disabled={busy}
            onClick={() => loadCodes(false)}
          />

          <ListBox
            options={[]}
            placeholder={
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filter</span>
                {activeFilterCount > 0 ? (
                  <span
                    className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold"
                    style={{
                      background: "rgba(var(--brand-rgb), 0.12)",
                      color: "var(--color-brand-600)",
                    }}
                  >
                    {activeFilterCount}
                  </span>
                ) : null}
              </span>
            }
            className="w-auto"
            triggerClassName="h-14 min-w-[150px] px-6 text-base [&>span]:text-base"
            contentClassName="w-[min(92vw,520px)]"
            maxHeightClassName="max-h-[calc(100vh-8rem)]"
            align="right"
            ariaLabel="Filter redeem codes"
          >
            <div className="space-y-4 p-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <FilterOptionGroup
                  title="Status"
                  value={statusFilter}
                  options={statusOptions}
                  onChange={setStatusFilter}
                />

                <FilterOptionGroup
                  title="Expiry"
                  value={expiryFilter}
                  options={expiryOptions}
                  onChange={setExpiryFilter}
                />

                <FilterOptionGroup
                  title="Redemption"
                  value={redemptionFilter}
                  options={redemptionOptions}
                  onChange={setRedemptionFilter}
                />

                <FilterOptionGroup
                  title="Date Range"
                  value={createdDateFilter}
                  options={createdDateOptions}
                  onChange={setCreatedDateFilter}
                />
              </div>

              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Quota range
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[var(--title)]">
                      Minimum quota
                    </p>
                    <TextInput
                      type="number"
                      min="0"
                      step="0.01"
                      value={minimumQuotaFilter}
                      onChange={setMinimumQuotaFilter}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[var(--title)]">
                      Maximum quota
                    </p>
                    <TextInput
                      type="number"
                      min="0"
                      step="0.01"
                      value={maximumQuotaFilter}
                      onChange={setMaximumQuotaFilter}
                      placeholder="100.00"
                    />
                  </div>
                </div>
              </div>

              {activeFilterCount > 0 ? (
                <Button
                  variant="outline"
                  className="h-11 w-full text-sm"
                  onClick={clearFilters}
                >
                  Clear all filters
                </Button>
              ) : null}
            </div>
          </ListBox>

          <ListBox
            options={toolbarExportOptions}
            onValueChange={(value) => handleExportChange(value as TableExportFormat)}
            placeholder={
              <span className="inline-flex items-center gap-2 text-[var(--foreground)]">
                <FileOutput className="h-4 w-4" />
                Export
              </span>
            }
            disabled={selectedIds.length === 0}
            className="w-auto"
            triggerClassName="h-14 min-w-[160px] px-6 text-base [&>span]:text-base"
            contentClassName="w-[220px]"
            optionClassName="py-4 text-base"
            align="right"
            ariaLabel="Export selected redeem codes"
          />

          <ListBox
            value=""
            onValueChange={(value) => void runBulkAction(value as BulkAction)}
            options={actionOptions}
            placeholder={
              <span className="inline-flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Actions
              </span>
            }
            disabled={selectedIds.length === 0 || busy}
            className="w-full md:w-[180px]"
            triggerClassName="h-14 px-5"
            align="right"
            ariaLabel="Redeem code bulk actions"
          />

          <Button
            className="h-14 px-5 text-base"
            iconLeft={<Plus className="relative z-10 h-4 w-4" />}
            onClick={() => {
              setIsGenerateOpen(true);
              setGeneratedCodes([]);
              setGenerateError("");
            }}
          >
            Generate Code
          </Button>

          <button
            type="button"
            onClick={() => setIsTableExpanded(!expanded)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-transparent text-[var(--muted)] transition hover:text-[var(--color-brand-500)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)]"
            aria-label={
              expanded ? "Collapse redeem codes table" : "Expand redeem codes table"
            }
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </button>
        </TableControls>
      </TableTop>

      {error ? (
        <div className="px-6 pb-2">
          <p
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
          </p>
        </div>
      ) : null}

      <TableMain className="min-h-0 flex-1">
        <TableGrid minWidthClassName="flex h-full min-w-[1800px] flex-col">
          <TableHeader columnsClassName={columnsClassName}>
            <TableCell className="justify-center">
              <TableCheckbox
                checked={allVisibleSelected}
                onToggle={toggleSelectAllVisible}
              />
            </TableCell>
            <TableHeaderCell
              label="Code"
              sortable
              active={sortKey === "code"}
              direction={sortDir}
              onClick={() => handleSort("code")}
            />
            <TableHeaderCell
              label="Quota"
              sortable
              active={sortKey === "quotaAmount"}
              direction={sortDir}
              onClick={() => handleSort("quotaAmount")}
            />
            <TableHeaderCell
              label="Status"
              sortable
              active={sortKey === "status"}
              direction={sortDir}
              onClick={() => handleSort("status")}
            />
            <TableHeaderCell
              label="Created By"
              sortable
              active={sortKey === "createdBy"}
              direction={sortDir}
              onClick={() => handleSort("createdBy")}
            />
            <TableHeaderCell
              label="Redeemed By"
              sortable
              active={sortKey === "redeemedBy"}
              direction={sortDir}
              onClick={() => handleSort("redeemedBy")}
            />
            <TableHeaderCell
              label="Redeemed Date"
              sortable
              active={sortKey === "redeemedAt"}
              direction={sortDir}
              onClick={() => handleSort("redeemedAt")}
            />
            <TableHeaderCell
              label="Expiry Date"
              sortable
              active={sortKey === "expiresAt"}
              direction={sortDir}
              onClick={() => handleSort("expiresAt")}
            />
            <TableHeaderCell
              label="Note"
              sortable
              active={sortKey === "note"}
              direction={sortDir}
              onClick={() => handleSort("note")}
            />
          </TableHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <TableBody>
              {loading ? (
                <TableEmptyState text="Loading redeem codes..." />
              ) : filteredCodes.length === 0 ? (
                <TableEmptyState text="No redeem codes found." />
              ) : (
                filteredCodes.map((code) => {
                  const isSelected = selectedIds.includes(code.id);

                  return (
                    <div
                      key={code.id}
                      className={`grid w-full border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                    >
                      <TableCell className="justify-center">
                        <TableCheckbox
                          checked={isSelected}
                          onToggle={() => toggleSelectedId(code.id)}
                        />
                      </TableCell>

                      <TableCell className="gap-2 font-mono font-semibold text-[var(--title)]">
                        <span>{formatCode(code.code)}</span>
                        <button
                          type="button"
                          onClick={() => void copyText(code.code, code.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] transition hover:text-[var(--color-brand-500)]"
                          aria-label="Copy redeem code"
                          title="Copy code"
                        >
                          {copiedCodeId === code.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </TableCell>

                      <TableCell className="font-semibold text-[var(--title)]">
                        {formatQuota(code.quotaAmount)}
                      </TableCell>

                      <TableCell>
                        <StatusBadge
                          label={code.status}
                          tone={getStatusTone(code.status)}
                          className="px-3 py-2 text-xs capitalize"
                        />
                      </TableCell>

                      <TableCell className="flex-col items-start">
                        <p className="w-full truncate font-semibold text-[var(--title)]">
                          {getPersonLabel(code.createdBy)}
                        </p>
                        <p className="mt-1 w-full truncate text-sm text-[var(--muted)]">
                          {code.createdAtLabel}
                        </p>
                      </TableCell>

                      <TableCell className="text-[var(--title)]">
                        <span className="w-full truncate">
                          {code.redeemedBy
                            ? getPersonLabel(code.redeemedBy)
                            : "-"}
                        </span>
                      </TableCell>

                      <TableCell className="text-[var(--title)]">
                        <span className="w-full truncate">
                          {code.redeemedAtLabel || "-"}
                        </span>
                      </TableCell>

                      <TableCell className="text-[var(--title)]">
                        <span className="w-full truncate">
                          {code.expiresAtLabel || "No expiry"}
                        </span>
                      </TableCell>

                      <TableCell className="justify-between gap-3 text-[var(--title)]">
                        <span className="line-clamp-2 min-w-0">
                          {code.note || "-"}
                        </span>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            disabled={busy || code.status === "redeemed" || code.status === "disabled"}
                            onClick={() => void disableSingleCode(code)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] transition hover:text-[var(--color-brand-500)] disabled:pointer-events-none disabled:opacity-35"
                            aria-label="Disable redeem code"
                            title="Disable"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void deleteSingleCode(code)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] transition hover:text-[var(--color-brand-500)] disabled:pointer-events-none disabled:opacity-35"
                            aria-label="Delete redeem code"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </div>
                  );
                })
              )}
            </TableBody>
          </div>
        </TableGrid>
      </TableMain>
    </Table>
  );

  return (
    <div className="space-y-6">
      <FullscreenTablePortal open={isTableExpanded}>
        {renderTable(true)}
      </FullscreenTablePortal>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card, index) => (
          <KpiMetricCard
            key={card.title}
            title={card.title}
            value={card.value}
            helper={card.helper}
            icon={card.icon}
            index={index}
          />
        ))}
      </div>

      {renderTable()}

      <Modal open={isExportModalOpen} onClose={() => setIsExportModalOpen(false)}>
        <div className="w-[min(92vw,760px)] space-y-5 pr-4">
          <div className="border-b pb-4" style={{ borderColor: "var(--border)" }}>
            <h3 className="title-md flex items-center gap-2">
              <FileOutput className="h-5 w-5 text-brand-500" />
              Export selected redeem codes
            </h3>
            <p className="paragraph mt-2">
              Review the redeem codes to export, remove any row if needed, then
              choose the export format.
            </p>
            <p className="paragraph mt-2">
              Total selected:{" "}
              <span className="font-semibold">{selectedCodes.length}</span>
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
            <div
              className="max-h-[320px] space-y-3 overflow-y-auto pr-2"
              style={{ scrollbarWidth: "thin" }}
            >
              {selectedCodes.length === 0 ? (
                <div
                  className="rounded-2xl border p-5 text-sm"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                    color: "var(--muted)",
                  }}
                >
                  Select rows to export.
                </div>
              ) : (
                selectedCodes.map((code) => (
                  <div
                    key={code.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border p-4"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                    }}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--title)]">
                        {formatCode(code.code)}
                      </p>
                      <p className="truncate text-sm text-[var(--muted)]">
                        {formatQuota(code.quotaAmount)} quota - {code.status}
                      </p>
                    </div>

                    <ExpandedButton
                      id={`remove-export-redeem-codes-${code.id}`}
                      label="Remove"
                      icon={Trash2}
                      variant="danger"
                      onClick={() =>
                        setSelectedIds((current) =>
                          current.filter((item) => item !== code.id),
                        )
                      }
                    />
                  </div>
                ))
              )}
            </div>

            <div
              className="rounded-2xl border p-4"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Export Method
              </p>

              <ListBox
                options={exportFormatOptions}
                value={exportMethod}
                onValueChange={(value) =>
                  setExportMethod(value as TableExportFormat)
                }
                triggerClassName="h-12 w-full"
                contentClassName="w-full"
                ariaLabel="Export method"
              />

              <p className="mt-4 text-sm text-[var(--muted)]">
                Selected format:{" "}
                <span className="font-semibold text-[var(--title)]">
                  {exportMethod}
                </span>
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                exportCodes(exportMethod);
                setIsExportModalOpen(false);
              }}
              className="px-8"
              disabled={selectedCodes.length === 0}
            >
              Export
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={isGenerateOpen}
        onClose={() => {
          setIsGenerateOpen(false);
          setGenerateError("");
        }}
      >
        <form onSubmit={handleGenerate} className="w-[min(92vw,860px)] space-y-6">
          <div>
            <h3 className="title-md">Generate Redeem Code</h3>
            <p className="paragraph mt-1">
              Create secure one-time voucher codes that add quota when redeemed.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel>Quota Amount</FieldLabel>
              <TextInput
                type="number"
                min="0.01"
                step="0.01"
                value={quotaAmount}
                onChange={setQuotaAmount}
                placeholder="10.00"
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Expiry Date</FieldLabel>
              <TextInput type="date" value={expiresAt} onChange={setExpiresAt} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <FieldLabel>Note</FieldLabel>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Optional note for admin context or campaign name"
                rows={3}
                className="w-full resize-none rounded-md border px-4 py-3 text-sm font-medium outline-none transition focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[rgba(var(--brand-rgb),0.14)]"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  color: "var(--title)",
                }}
              />
            </div>
          </div>

          {generateError ? (
            <p
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
              {generateError}
            </p>
          ) : null}

          {generatedCodes.length > 0 ? (
            <div
              className="rounded-2xl border p-4"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--title)]">
                    Generated Code
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Copy it now or export it from the table later.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="h-11"
                  iconLeft={
                    copiedGenerated ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )
                  }
                  onClick={() => void copyGeneratedCodes()}
                >
                  {copiedGenerated ? "Copied" : "Copy Code"}
                </Button>
              </div>

              <div className="mt-4 grid max-h-[220px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {generatedCodes.map((code) => (
                  <div
                    key={code}
                    className="rounded-xl border px-3 py-2 font-mono text-sm font-semibold text-[var(--title)]"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface)",
                    }}
                  >
                    {formatCode(code)}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="h-12"
              onClick={() => setIsGenerateOpen(false)}
            >
              Close
            </Button>
            <Button
              type="submit"
              className="h-12"
              disabled={generateBusy}
              iconLeft={<Plus className="relative z-10 h-4 w-4" />}
            >
              {generateBusy ? "Generating..." : "Generate"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
