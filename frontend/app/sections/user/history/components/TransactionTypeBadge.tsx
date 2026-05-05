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
import StatusBadge, {
  type StatusTone,
} from "@/components/ui/badge/StatusBadge";
import Button from "@/components/ui/button/Button";
import ExpandedButton from "@/components/ui/button/ExpandedButton";
import RefreshButton from "@/components/ui/button/RefreshButton";
import ListBox, { type ListBoxOption } from "@/components/ui/listbox/ListBox";
import Modal from "@/components/ui/modal/Modal";
import { exportTableData, TableExportFormat } from "@/lib/export";
import { apiGet } from "@/services/api";
import {
  Check,
  CreditCard,
  FileOutput,
  FileText,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
  WalletCards,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type SortDir = "asc" | "desc";
type TransactionDirection = "in" | "out";
type TransactionFilterType =
  | "all"
  | "Credit Addition"
  | "Print Deduction"
  | "Refund"
  | "Adjustment"
  | "Manual Override"
  | "Group Allocation";
type DirectionFilter = "all" | "in" | "out";
type TransactionSortKey =
  | "date"
  | "description"
  | "type"
  | "amount"
  | "balanceAfter"
  | "status";

type TransactionItem = {
  id: string;
  description: string;
  type: string;
  amount: number;
  date: string;
  dateOrder: number;
  status: string;
  direction: TransactionDirection;
  balanceAfter: number;
  method: string;
  note: string;
};

type TransactionsResponse = {
  transactions: TransactionItem[];
};

const columnsClassName =
  "[grid-template-columns:72px_minmax(150px,0.8fr)_minmax(280px,1.4fr)_minmax(180px,0.9fr)_minmax(140px,0.7fr)_minmax(170px,0.8fr)_minmax(160px,0.8fr)]";

const transactionTableColumns: {
  key: TransactionSortKey;
  label: string;
  sortable: boolean;
}[] = [
  { key: "date", label: "Date", sortable: true },
  { key: "description", label: "Description", sortable: true },
  { key: "type", label: "Type", sortable: true },
  { key: "amount", label: "Amount", sortable: true },
  { key: "balanceAfter", label: "Balance After", sortable: true },
  { key: "status", label: "Status", sortable: true },
];

const typeFilterOptions: ListBoxOption[] = [
  { label: "All Types", value: "all" },
  { label: "Top-up", value: "Credit Addition" },
  { label: "Print Deduction", value: "Print Deduction" },
  { label: "Refund", value: "Refund" },
  { label: "Adjustment", value: "Adjustment" },
  { label: "Manual Override", value: "Manual Override" },
  { label: "Group Allocation", value: "Group Allocation" },
];

const directionFilterOptions: ListBoxOption[] = [
  { label: "All Directions", value: "all" },
  { label: "Credit", value: "in" },
  { label: "Debit", value: "out" },
];

const exportFormatOptions: ListBoxOption[] = [
  { label: "PDF", value: "PDF" },
  { label: "Excel", value: "Excel" },
  { label: "CSV", value: "CSV" },
];

const numberFormatter = new Intl.NumberFormat("en-US");

const formatQuotaValue = (value: number) => value.toFixed(2);

const formatSignedAmount = (transaction: TransactionItem) =>
  `${transaction.direction === "in" ? "+" : "-"}${formatQuotaValue(transaction.amount)}`;

const getSignedAmount = (transaction: TransactionItem) =>
  transaction.direction === "in" ? transaction.amount : -transaction.amount;

const getTypeLabel = (type: string) =>
  type === "Credit Addition" ? "Top-up" : type || "Transaction";

const compareValues = (
  a: string | number,
  b: string | number,
  direction: SortDir,
) => {
  if (typeof a === "number" && typeof b === "number") {
    return direction === "asc" ? a - b : b - a;
  }

  return direction === "asc"
    ? String(a).localeCompare(String(b))
    : String(b).localeCompare(String(a));
};

function TransactionTypeBadge({ transaction }: { transaction: TransactionItem }) {
  const meta: Record<
    string,
    { tone: StatusTone; icon: ReactNode; label: string }
  > = {
    "Credit Addition": {
      tone: "success",
      icon: <Plus className="h-4 w-4" strokeWidth={2.6} />,
      label: "Top-up",
    },
    Refund: {
      tone: "success",
      icon: <RotateCcw className="h-4 w-4" strokeWidth={2.4} />,
      label: "Refund",
    },
    "Print Deduction": {
      tone: "danger",
      icon: <Minus className="h-4 w-4" strokeWidth={2.6} />,
      label: "Print Deduction",
    },
    Adjustment: {
      tone: "warning",
      icon: <SlidersHorizontal className="h-4 w-4" strokeWidth={2.4} />,
      label: "Adjustment",
    },
    "Manual Override": {
      tone: "inactive",
      icon: <SlidersHorizontal className="h-4 w-4" strokeWidth={2.4} />,
      label: "Manual Override",
    },
    "Group Allocation": {
      tone: "success",
      icon: <Plus className="h-4 w-4" strokeWidth={2.6} />,
      label: "Group Allocation",
    },
  };

  const fallback =
    transaction.direction === "in"
      ? meta["Credit Addition"]
      : meta["Print Deduction"];
  const item = meta[transaction.type] || fallback;

  return (
    <StatusBadge
      label={item.label}
      tone={item.tone}
      icon={item.icon}
      className="px-4 py-2 text-sm"
    />
  );
}

function TransactionStatusBadge({ status }: { status: string }) {
  return (
    <StatusBadge
      label={status || "Completed"}
      tone={status === "Completed" ? "success" : "inactive"}
      icon={<Check className="h-4 w-4" strokeWidth={2.8} />}
      className="px-4 py-2 text-sm"
    />
  );
}

export default function UserTransactionHistoryTable() {
  const isMountedRef = useRef(true);

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionFilterType>("all");
  const [directionFilter, setDirectionFilter] =
    useState<DirectionFilter>("all");
  const [sortKey, setSortKey] = useState<TransactionSortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionItem | null>(null);
  const [exportMethod, setExportMethod] = useState<TableExportFormat>("PDF");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isTableExpanded, setIsTableExpanded] = useState(false);

  const loadTransactions = useCallback(
    async (mode: "initial" | "refresh" = "refresh") => {
      if (mode === "initial") {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const data = await apiGet<TransactionsResponse>(
          "/user/quota/transactions",
          "user",
        );

        if (!isMountedRef.current) return;

        const nextTransactions = Array.isArray(data?.transactions)
          ? data.transactions
          : [];

        setTransactions(nextTransactions);
        setSelectedIds((current) =>
          current.filter((id) =>
            nextTransactions.some((transaction) => transaction.id === id),
          ),
        );
        setError("");
      } catch (requestError) {
        if (!isMountedRef.current) return;

        setTransactions([]);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load transaction history.",
        );
      } finally {
        if (!isMountedRef.current) return;

        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    isMountedRef.current = true;
    const timer = window.setTimeout(() => {
      void loadTransactions("initial");
    }, 0);

    return () => {
      window.clearTimeout(timer);
      isMountedRef.current = false;
    };
  }, [loadTransactions]);

  const handleSort = (key: TransactionSortKey) => {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir(key === "date" ? "desc" : "asc");
  };

  const filteredTransactions = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return [...transactions]
      .filter((item) => {
        const searchableText = [
          item.date,
          item.description,
          getTypeLabel(item.type),
          item.type,
          item.status,
          item.method,
          item.note,
          formatSignedAmount(item),
          formatQuotaValue(item.balanceAfter),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
        const matchesType = typeFilter === "all" || item.type === typeFilter;
        const matchesDirection =
          directionFilter === "all" || item.direction === directionFilter;

        return matchesSearch && matchesType && matchesDirection;
      })
      .sort((a, b) => {
        switch (sortKey) {
          case "amount":
            return compareValues(getSignedAmount(a), getSignedAmount(b), sortDir);
          case "balanceAfter":
            return compareValues(a.balanceAfter, b.balanceAfter, sortDir);
          case "date":
            return compareValues(a.dateOrder, b.dateOrder, sortDir);
          case "type":
            return compareValues(getTypeLabel(a.type), getTypeLabel(b.type), sortDir);
          default:
            return compareValues(a[sortKey], b[sortKey], sortDir);
        }
      });
  }, [directionFilter, search, sortDir, sortKey, transactions, typeFilter]);

  const allVisibleIds = filteredTransactions.map((item) => item.id);
  const isAllSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedIds.includes(id));
  const selectedVisibleCount = allVisibleIds.filter((id) =>
    selectedIds.includes(id),
  ).length;
  const selectedTransactions = transactions.filter((item) =>
    selectedIds.includes(item.id),
  );

  const activeFilterCount = [
    typeFilter !== "all",
    directionFilter !== "all",
  ].filter(Boolean).length;
  const hasActiveFilters =
    Boolean(search.trim()) || typeFilter !== "all" || directionFilter !== "all";

  const totalTopUps = transactions
    .filter((item) => item.direction === "in")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalCharges = transactions
    .filter((item) => item.direction === "out")
    .reduce((sum, item) => sum + item.amount, 0);
  const netMovement = totalTopUps - totalCharges;

  const kpiCards = [
    {
      title: "Total Transactions",
      value: numberFormatter.format(transactions.length),
      helper: `${numberFormatter.format(filteredTransactions.length)} visible after filters`,
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: "Total Top-ups",
      value: formatQuotaValue(totalTopUps),
      helper: "Credits added to your quota",
      icon: <Plus className="h-4 w-4" />,
    },
    {
      title: "Total Charges",
      value: formatQuotaValue(totalCharges),
      helper: "Debits from print activity",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      title: "Net Movement",
      value: `${netMovement >= 0 ? "+" : "-"}${formatQuotaValue(Math.abs(netMovement))}`,
      helper: "Credits minus debits",
      icon: <WalletCards className="h-4 w-4" />,
    },
  ];

  const toggleRowSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !allVisibleIds.includes(id)),
      );
      return;
    }

    setSelectedIds((current) =>
      Array.from(new Set([...current, ...allVisibleIds])),
    );
  };

  const handleExportChange = (value: string) => {
    if (selectedTransactions.length === 0) return;

    setExportMethod(value as TableExportFormat);
    setIsExportModalOpen(true);
  };

  const removeSelectedTransactionFromExport = (id: string) => {
    setSelectedIds((current) => current.filter((item) => item !== id));
  };

  const exportTransactions = () => {
    if (selectedTransactions.length === 0) return;

    exportTableData({
      title: "User Transaction History",
      filename: "alpha-queue-transaction-history",
      format: exportMethod,
      columns: [
        { label: "Date", value: (row: TransactionItem) => row.date },
        { label: "Description", value: (row) => row.description },
        { label: "Type", value: (row) => getTypeLabel(row.type) },
        { label: "Amount", value: (row) => formatSignedAmount(row) },
        {
          label: "Balance After",
          value: (row) => formatQuotaValue(row.balanceAfter),
        },
        { label: "Status", value: (row) => row.status },
        { label: "Method", value: (row) => row.method },
        { label: "Reference", value: (row) => row.note },
      ],
      rows: selectedTransactions,
    });

    setIsExportModalOpen(false);
  };

  const renderTransactionsTable = (expanded = false) => (
    <Table
      className={`flex min-h-[540px] flex-col ${
        expanded ? "h-dvh !rounded-none" : "max-h-[calc(100vh-20rem)]"
      }`}
    >
      <TableTop className={`shrink-0 ${expanded ? "bg-[var(--surface)]" : ""}`}>
        <TableTitleBlock title="Transaction History" />

        <TableControls>
          <TableSearch
            id={
              expanded
                ? "search-transactions-expanded"
                : "search-transactions"
            }
            label="Search transactions"
            value={search}
            onChange={setSearch}
            wrapperClassName="w-full md:w-[360px]"
          />

          <RefreshButton
            label={refreshing ? "Refreshing" : "Refresh"}
            className="h-14"
            disabled={loading || refreshing}
            onClick={() => void loadTransactions("refresh")}
          />

          <ListBox
            value=""
            options={[]}
            className="w-auto shrink-0 self-start md:self-auto"
            placeholder={
              <span className="flex items-center gap-2 text-[var(--foreground)]">
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
            triggerClassName="h-14 w-auto min-w-[150px] px-6 text-base"
            contentClassName="w-[380px] !overflow-visible"
            maxHeightClassName="max-h-none !overflow-visible"
            align="right"
            ariaLabel="Filter transaction history"
          >
            <div className="space-y-4 p-2">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Type
                  </p>
                  <ListBox
                    value={typeFilter}
                    onValueChange={(value) =>
                      setTypeFilter(value as TransactionFilterType)
                    }
                    options={typeFilterOptions}
                    triggerClassName="h-11 px-3"
                    maxHeightClassName="max-h-52"
                    ariaLabel="Filter by transaction type"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Direction
                  </p>
                  <ListBox
                    value={directionFilter}
                    onValueChange={(value) =>
                      setDirectionFilter(value as DirectionFilter)
                    }
                    options={directionFilterOptions}
                    triggerClassName="h-11 px-3"
                    maxHeightClassName="max-h-52"
                    ariaLabel="Filter by transaction direction"
                  />
                </div>
              </div>

              {activeFilterCount > 0 ? (
                <Button
                  variant="outline"
                  className="h-11 w-full text-sm"
                  onClick={() => {
                    setTypeFilter("all");
                    setDirectionFilter("all");
                  }}
                >
                  Reset Filters
                </Button>
              ) : null}
            </div>
          </ListBox>

          <ListBox
            value=""
            options={exportFormatOptions}
            className="w-auto shrink-0 self-start md:self-auto"
            disabled={selectedTransactions.length === 0}
            onValueChange={handleExportChange}
            placeholder={
              <span className="inline-flex items-center gap-2 text-[var(--foreground)]">
                <FileOutput className="h-4 w-4" />
                Export
              </span>
            }
            triggerClassName="h-14 w-auto min-w-[160px] px-6 text-base"
            contentClassName="w-[220px]"
            optionClassName="py-4 text-base"
            align="right"
            ariaLabel="Export transaction history"
          />

          <button
            type="button"
            onClick={() => setIsTableExpanded(!expanded)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-transparent text-[var(--muted)] transition hover:text-[var(--color-brand-500)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)]"
            aria-label={
              expanded
                ? "Collapse transaction history table"
                : "Expand transaction history table"
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

      {selectedVisibleCount > 0 ? (
        <div className="shrink-0 border-b border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--muted)]">
          {selectedVisibleCount} visible transaction
          {selectedVisibleCount === 1 ? "" : "s"} selected
        </div>
      ) : null}

      {error ? (
        <div className="shrink-0 px-6 pb-2 pt-4">
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        </div>
      ) : null}

      <TableMain className="min-h-0 flex-1">
        <TableGrid minWidthClassName="flex h-full min-w-[1320px] flex-col">
          <TableHeader columnsClassName={columnsClassName}>
            <TableCell className="justify-center">
              <TableCheckbox checked={isAllSelected} onToggle={toggleSelectAll} />
            </TableCell>

            {transactionTableColumns.map((column) => (
              <TableHeaderCell
                key={column.key}
                label={column.label}
                sortable={column.sortable}
                active={sortKey === column.key}
                direction={sortDir}
                onClick={() => handleSort(column.key)}
              />
            ))}
          </TableHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <TableBody>
              {loading ? (
                <TableEmptyState text="Loading transactions..." />
              ) : filteredTransactions.length === 0 ? (
                <TableEmptyState
                  text={
                    hasActiveFilters
                      ? "No transactions match these filters"
                      : "No transactions found"
                  }
                />
              ) : (
                filteredTransactions.map((transaction) => {
                  const isSelected = selectedIds.includes(transaction.id);

                  return (
                    <div
                      key={transaction.id}
                      onClick={() => setSelectedTransaction(transaction)}
                      className={`grid w-full cursor-pointer items-center border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30 ${columnsClassName}`}
                    >
                      <TableCell className="justify-center">
                        <TableCheckbox
                          checked={isSelected}
                          onToggle={() => toggleRowSelection(transaction.id)}
                        />
                      </TableCell>

                      <TableCell className="text-base font-medium text-[var(--paragraph)]">
                        {transaction.date}
                      </TableCell>

                      <TableCell className="min-w-0 gap-3">
                        <FileText className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                        <div className="min-w-0">
                          <p className="truncate text-base font-medium text-[var(--title)]">
                            {transaction.description}
                          </p>
                          <p className="mt-1 truncate text-sm text-[var(--muted)]">
                            {transaction.method}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <TransactionTypeBadge transaction={transaction} />
                      </TableCell>

                      <TableCell className="text-base font-semibold text-[var(--title)]">
                        {formatSignedAmount(transaction)}
                      </TableCell>

                      <TableCell className="text-base font-medium text-[var(--title)]">
                        {formatQuotaValue(transaction.balanceAfter)}
                      </TableCell>

                      <TableCell>
                        <TransactionStatusBadge status={transaction.status} />
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
    <>
      <FullscreenTablePortal open={isTableExpanded}>
        {renderTransactionsTable(true)}
      </FullscreenTablePortal>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

        {renderTransactionsTable()}
      </div>

      <Modal
        open={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      >
        <div className="w-[min(92vw,760px)] space-y-5 pr-4">
          <div
            className="border-b pb-4"
            style={{ borderColor: "var(--border)" }}
          >
            <h3 className="title-md flex items-center gap-2">
              <FileOutput className="h-5 w-5 text-brand-500" />
              Export selected transactions
            </h3>
            <p className="paragraph mt-2">
              Review the transactions to export, remove any row if needed, then
              choose the export format.
            </p>
            <p className="paragraph mt-2">
              Total selected:{" "}
              <span className="font-semibold">
                {selectedTransactions.length}
              </span>
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
            <div
              className="max-h-[320px] space-y-3 overflow-y-auto pr-2"
              style={{ scrollbarWidth: "thin" }}
            >
              {selectedTransactions.length === 0 ? (
                <div
                  className="rounded-2xl border p-5 text-sm"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                    color: "var(--muted)",
                  }}
                >
                  No transactions selected.
                </div>
              ) : (
                selectedTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border p-4"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                    }}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--title)]">
                        {transaction.description}
                      </p>
                      <p className="truncate text-sm text-[var(--muted)]">
                        {transaction.date} • {getTypeLabel(transaction.type)} •{" "}
                        {formatSignedAmount(transaction)}
                      </p>
                    </div>

                    <ExpandedButton
                      id={`remove-export-transaction-${transaction.id}`}
                      label="Remove"
                      icon={Trash2}
                      variant="danger"
                      onClick={() =>
                        removeSelectedTransactionFromExport(transaction.id)
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
              onClick={exportTransactions}
              className="px-8"
              disabled={selectedTransactions.length === 0}
            >
              Export
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(selectedTransaction)}
        onClose={() => setSelectedTransaction(null)}
      >
        <div className="w-[min(92vw,760px)] space-y-5 pr-4">
          <div>
            <h3 className="title-md">{selectedTransaction?.description}</h3>
            <p className="paragraph mt-1">{selectedTransaction?.date}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["Type", selectedTransaction ? getTypeLabel(selectedTransaction.type) : "-"],
              [
                "Amount",
                selectedTransaction ? formatSignedAmount(selectedTransaction) : "-",
              ],
              [
                "Direction",
                selectedTransaction?.direction === "in" ? "Credit" : "Debit",
              ],
              [
                "Balance After",
                selectedTransaction
                  ? formatQuotaValue(selectedTransaction.balanceAfter)
                  : "-",
              ],
              ["Status", selectedTransaction?.status || "-"],
              ["Method", selectedTransaction?.method || "-"],
              ["Reference", selectedTransaction?.note || "-"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border p-4"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {label}
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                  {String(value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
