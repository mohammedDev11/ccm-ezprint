"use client";

import Modal from "@/components/ui/modal/Modal";
import {
  CircleDollarSign,
  FileOutput,
  Maximize2,
  Minimize2,
  Printer,
  ReceiptText,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
//import MainButton from "@/app/Mohammed/components/MainButton";
import FullscreenTablePortal from "@/components/shared/table/FullscreenTablePortal";
import KpiMetricCard from "@/components/shared/cards/KpiMetricCard";
import {
  TransactionBulkAction,
  TransactionItem,
  TransactionReviewStatus,
  TransactionSortKey,
  TransactionType,
  transactionBulkActionOptions,
  transactionReviewMeta,
  transactionReviewSortOrder,
  transactionTableColumns,
  transactionTypeMeta,
  transactionTypeSortOrder,
  transactionsData,
} from "@/lib/mock-data/Admin/accounts";
import { cn } from "@/lib/cn";
import { exportTableData, TableExportFormat } from "@/lib/export";
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
import StatusBadge from "@/components/ui/badge/StatusBadge";
import Button from "@/components/ui/button/Button";
import ExpandedButton from "@/components/ui/button/ExpandedButton";
import RefreshButton from "@/components/ui/button/RefreshButton";
import ListBox from "@/components/ui/listbox/ListBox";

type SortDir = "asc" | "desc";
type ExportMethod = TableExportFormat;
type TransactionTypeFilter =
  | "all"
  | Extract<TransactionType, "Top-up" | "Print Charge" | "Refund">;
type AmountDirectionFilter = "all" | "credit" | "debit";

const columnsClassName =
  "[grid-template-columns:72px_minmax(190px,1fr)_minmax(160px,0.8fr)_minmax(180px,0.8fr)_minmax(320px,1.5fr)_minmax(150px,0.8fr)_minmax(170px,0.9fr)_minmax(160px,0.8fr)]";

const transactionTypeFilterOptions: {
  value: TransactionTypeFilter;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "Top-up", label: "Top-up" },
  { value: "Print Charge", label: "Print Charge" },
  { value: "Refund", label: "Refund" },
];

const amountDirectionFilterOptions: {
  value: AmountDirectionFilter;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "credit", label: "Credit" },
  { value: "debit", label: "Debit" },
];

const visibleTransactionActionOptions = transactionBulkActionOptions.filter(
  (option) => option.value !== "export-selected"
);
const transactionExportFormatOptions: ExportMethod[] = ["PDF", "Excel", "CSV"];
const transactionToolbarExportOptions = [
  { value: "CSV", label: "CSV", selectedLabel: "Export" },
  { value: "PDF", label: "PDF", selectedLabel: "Export" },
  { value: "Excel", label: "Excel", selectedLabel: "Export" },
];
const transactionActionOptions = visibleTransactionActionOptions.map(
  (option) => ({
    value: option.value,
    label: option.label,
    selectedLabel: "Actions",
  }),
);

const formatMoney = (value: number) => {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toFixed(2)}`;
};

const formatQuotaValue = (value: number) => value.toFixed(2);

const getAmountColor = (value: number) => {
  if (value > 0) {
    return "color-mix(in srgb, var(--color-support-700) 72%, var(--title))";
  }

  if (value < 0) {
    return "color-mix(in srgb, var(--color-brand-700) 78%, var(--title))";
  }

  return "var(--title)";
};

{
  /*function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-secondary h-14 rounded-md px-6 text-base"
    >
      {children}
    </button>
  );
}*/
}

function TransactionTypeBadge({ type }: { type: TransactionType }) {
  const meta = transactionTypeMeta[type];

  return (
    <StatusBadge
      label={meta.label}
      tone={meta.tone}
      className="rounded-full px-3 py-1.5 text-xs"
    />
  );
}

function TransactionReviewBadge({
  status,
}: {
  status: TransactionReviewStatus;
}) {
  const meta = transactionReviewMeta[status];

  return (
    <StatusBadge
      label={meta.label}
      tone={meta.tone}
      className="rounded-full px-3 py-1.5 text-xs"
    />
  );
}

function AmountValue({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      className={cn("font-semibold", className)}
      style={{ color: getAmountColor(value) }}
    >
      {formatMoney(value)}
    </span>
  );
}

const TransactionsTable = () => {
  const [transactions, setTransactions] =
    useState<TransactionItem[]>(transactionsData);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<TransactionSortKey>("time");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [transactionTypeFilter, setTransactionTypeFilter] =
    useState<TransactionTypeFilter>("all");
  const [amountDirectionFilter, setAmountDirectionFilter] =
    useState<AmountDirectionFilter>("all");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportMethod, setExportMethod] = useState<ExportMethod>("PDF");
  const [openTransactionModal, setOpenTransactionModal] =
    useState<TransactionItem | null>(null);

  const handleSort = (key: TransactionSortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir("asc");
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredTransactions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...transactions]
      .filter((transaction) => {
        const matchesSearch =
          !term ||
          transaction.user.toLowerCase().includes(term) ||
          transaction.type.toLowerCase().includes(term) ||
          transaction.description.toLowerCase().includes(term) ||
          transaction.time.toLowerCase().includes(term) ||
          transaction.reviewStatus.toLowerCase().includes(term);

        if (!matchesSearch) return false;

        const matchesType =
          transactionTypeFilter === "all" ||
          transaction.type === transactionTypeFilter;
        const matchesAmountDirection =
          amountDirectionFilter === "all" ||
          (amountDirectionFilter === "credit" && transaction.amount > 0) ||
          (amountDirectionFilter === "debit" && transaction.amount < 0);

        return matchesType && matchesAmountDirection;
      })
      .sort((a, b) => {
        const getSortValue = (item: TransactionItem) => {
          switch (sortKey) {
            case "time":
              return item.time.toLowerCase();
            case "user":
              return item.user.toLowerCase();
            case "type":
              return transactionTypeSortOrder[item.type];
            case "description":
              return item.description.toLowerCase();
            case "amount":
              return item.amount;
            case "quotaAfter":
              return item.quotaAfter;
            case "reviewStatus":
              return transactionReviewSortOrder[item.reviewStatus];
            default:
              return item.time.toLowerCase();
          }
        };

        const aValue = getSortValue(a);
        const bValue = getSortValue(b);

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDir === "asc" ? aValue - bValue : bValue - aValue;
        }

        return sortDir === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
  }, [
    transactions,
    amountDirectionFilter,
    search,
    sortDir,
    sortKey,
    transactionTypeFilter,
  ]);

  const allVisibleIds = filteredTransactions.map(
    (transaction) => transaction.id
  );
  const isAllSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !allVisibleIds.includes(id))
      );
      return;
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
  };

  const handleBulkAction = (action: TransactionBulkAction) => {
    if (action === "export-selected") {
      if (selectedIds.length === 0) return;

      setIsExportModalOpen(true);
      return;
    }

    if (selectedIds.length === 0) return;

    if (action === "mark-reviewed") {
      setTransactions((prev) =>
        prev.map((transaction) =>
          selectedIds.includes(transaction.id)
            ? { ...transaction, reviewStatus: "Reviewed" }
            : transaction
        )
      );

      setOpenTransactionModal((prev) =>
        prev && selectedIds.includes(prev.id)
          ? { ...prev, reviewStatus: "Reviewed" }
          : prev
      );
    }
  };

  const selectedTransactions = useMemo(
    () =>
      transactions.filter((transaction) =>
        selectedIds.includes(transaction.id)
      ),
    [selectedIds, transactions]
  );

  const removeSelectedTransactionFromExport = (id: string) => {
    setSelectedIds((current) => current.filter((item) => item !== id));
  };

  const activeFilterCount =
    (transactionTypeFilter === "all" ? 0 : 1) +
    (amountDirectionFilter === "all" ? 0 : 1);

  const transactionStats = useMemo(() => {
    const topUps = transactions.filter(
      (transaction) => transaction.type === "Top-up"
    );
    const charges = transactions.filter(
      (transaction) => transaction.type === "Print Charge"
    );
    const totalTopUps = topUps.reduce(
      (sum, transaction) => sum + Math.max(transaction.amount, 0),
      0
    );
    const totalCharges = charges.reduce(
      (sum, transaction) => sum + Math.abs(Math.min(transaction.amount, 0)),
      0
    );
    const netMovement = transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    return {
      totalTransactions: transactions.length,
      topUpCount: topUps.length,
      chargeCount: charges.length,
      totalTopUps,
      totalCharges,
      netMovement,
    };
  }, [transactions]);

  const kpiCards = [
    {
      title: "Total Transactions",
      value: transactionStats.totalTransactions.toLocaleString(),
      helper: `${filteredTransactions.length.toLocaleString()} visible in current view`,
      icon: <ReceiptText className="h-5 w-5" />,
    },
    {
      title: "Total Top-ups",
      value: formatQuotaValue(transactionStats.totalTopUps),
      helper: `${transactionStats.topUpCount.toLocaleString()} quota top-up records`,
      icon: <CircleDollarSign className="h-5 w-5" />,
    },
    {
      title: "Total Charges",
      value: formatQuotaValue(transactionStats.totalCharges),
      helper: "Quota consumed by print charges",
      icon: <Printer className="h-5 w-5" />,
    },
    {
      title: "Net Movement",
      value: formatQuotaValue(transactionStats.netMovement),
      helper: "Net quota movement across loaded records",
      icon: <RotateCcw className="h-5 w-5" />,
    },
  ];

  const refreshTransactions = () => {
    setTransactions([...transactionsData]);
    setSelectedIds([]);
    setOpenTransactionModal(null);
  };

  const exportTransactions = (format: TableExportFormat) => {
    if (selectedTransactions.length === 0) return;

    exportTableData({
      title: "Transaction History",
      filename: "alpha-queue-transactions",
      format,
      columns: [
        { label: "Time", value: (row: TransactionItem) => row.time },
        { label: "User", value: (row) => row.user },
        { label: "Type", value: (row) => row.type },
        { label: "Description", value: (row) => row.description },
        { label: "Amount", value: (row) => formatMoney(row.amount) },
        { label: "Quota After", value: (row) => row.quotaAfter.toFixed(2) },
        { label: "Review", value: (row) => row.reviewStatus },
      ],
      rows: selectedTransactions,
    });
  };

  const handleExportChange = (value: string) => {
    if (selectedTransactions.length === 0) return;

    setExportMethod(value as ExportMethod);
    setIsExportModalOpen(true);
  };

  const handleExportConfirmed = () => {
    exportTransactions(exportMethod);
    setIsExportModalOpen(false);
  };

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
          <div className="border-b pb-4" style={{ borderColor: "var(--border)" }}>
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
              <span className="font-semibold">{selectedTransactions.length}</span>
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
                        {transaction.user}
                      </p>
                      <p className="truncate text-sm text-[var(--muted)]">
                        {transaction.type} • {transaction.time}
                      </p>
                    </div>

                    <ExpandedButton
                      id={`remove-export-transactions-${transaction.id}`}
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
                options={transactionExportFormatOptions}
                value={exportMethod}
                onValueChange={(value) =>
                  setExportMethod(value as ExportMethod)
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
              onClick={handleExportConfirmed}
              className="px-8"
              disabled={selectedTransactions.length === 0}
            >
              Export
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(openTransactionModal)}
        onClose={() => setOpenTransactionModal(null)}
      >
        <div className="space-y-5 pr-8">
          <div>
            <h3 className="title-md">{openTransactionModal?.id}</h3>
            <p className="paragraph mt-1">
              Review the selected transaction details.
            </p>
          </div>

          <div
            className="grid gap-4 rounded-2xl border p-4 sm:grid-cols-2"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface-2)",
            }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                User
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                {openTransactionModal?.user ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Time
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                {openTransactionModal?.time ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Type
              </p>
              <div className="mt-2">
                {openTransactionModal ? (
                  <TransactionTypeBadge type={openTransactionModal.type} />
                ) : null}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Review Status
              </p>
              <div className="mt-2">
                {openTransactionModal ? (
                  <TransactionReviewBadge
                    status={openTransactionModal.reviewStatus}
                  />
                ) : null}
              </div>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Description
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                {openTransactionModal?.description ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Amount
              </p>
              {openTransactionModal ? (
                <AmountValue
                  value={openTransactionModal.amount}
                  className="mt-2 block text-sm"
                />
              ) : (
                <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                  -
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Balance After
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                {openTransactionModal
                  ? openTransactionModal.quotaAfter.toFixed(2)
                  : "-"}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            {/*{openTransactionModal?.reviewStatus === "Pending" ? (
              <MainButton
                label="Mark as Reviewed"
                onClick={() => {
                  if (!openTransactionModal) return;

                  setTransactions((prev) =>
                    prev.map((transaction) =>
                      transaction.id === openTransactionModal.id
                        ? { ...transaction, reviewStatus: "Reviewed" }
                        : transaction
                    )
                  );

                  setOpenTransactionModal((prev) =>
                    prev ? { ...prev, reviewStatus: "Reviewed" } : prev
                  );
                }}
              />
            ) : (
              <MainButton
                label="Close"
                onClick={() => setOpenTransactionModal(null)}
              />
            )}*/}

            {openTransactionModal?.reviewStatus === "Pending" ? (
              <Button
                variant="primary"
                onClick={() => {
                  if (!openTransactionModal) return;

                  setTransactions((prev) =>
                    prev.map((transaction) =>
                      transaction.id === openTransactionModal.id
                        ? { ...transaction, reviewStatus: "Reviewed" }
                        : transaction
                    )
                  );

                  setOpenTransactionModal((prev) =>
                    prev ? { ...prev, reviewStatus: "Reviewed" } : prev
                  );
                }}
              >
                Mark as Reviewed
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => setOpenTransactionModal(null)}
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );

  function renderTransactionsTable(expanded = false) {
    return (
      <Table
        className={`flex min-h-[520px] flex-col ${
          expanded ? "h-dvh !rounded-none" : "max-h-[calc(100vh-20rem)]"
        }`}
      >
        <TableTop className={`shrink-0 ${expanded ? "bg-[var(--surface)]" : ""}`}>
          <TableTitleBlock title="Transaction History" />

          <TableControls>
            <TableSearch
              value={search}
              onChange={setSearch}
              label="Search transactions..."
              id={
                expanded
                  ? "transactions-search-expanded"
                  : "transactions-search"
              }
              wrapperClassName="w-full md:w-[320px]"
            />

            <RefreshButton
              className="h-14"
              onClick={refreshTransactions}
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
              contentClassName="w-[340px]"
              maxHeightClassName=""
              align="right"
              ariaLabel="Filter transactions"
            >
                <div className="space-y-4 p-2">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Transaction Type
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      {transactionTypeFilterOptions.map((option) => {
                        const isSelected =
                          transactionTypeFilter === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setTransactionTypeFilter(option.value)
                            }
                            className="rounded-md border px-3 py-2 text-left text-sm font-semibold transition"
                            style={{
                              background: isSelected
                                ? "rgba(var(--brand-rgb), 0.1)"
                                : "var(--surface-2)",
                              borderColor: isSelected
                                ? "color-mix(in srgb, var(--color-brand-500) 36%, var(--border))"
                                : "var(--border)",
                              color: isSelected
                                ? "var(--color-brand-600)"
                                : "var(--paragraph)",
                            }}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Amount Direction
                    </p>

                    <div className="grid grid-cols-3 gap-2">
                      {amountDirectionFilterOptions.map((option) => {
                        const isSelected =
                          amountDirectionFilter === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setAmountDirectionFilter(option.value)
                            }
                            className="rounded-md border px-3 py-2 text-left text-sm font-semibold transition"
                            style={{
                              background: isSelected
                                ? "rgba(var(--brand-rgb), 0.1)"
                                : "var(--surface-2)",
                              borderColor: isSelected
                                ? "color-mix(in srgb, var(--color-brand-500) 36%, var(--border))"
                                : "var(--border)",
                              color: isSelected
                                ? "var(--color-brand-600)"
                                : "var(--paragraph)",
                            }}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {activeFilterCount > 0 ? (
                    <Button
                      variant="outline"
                      className="h-11 w-full text-sm"
                      onClick={() => {
                        setTransactionTypeFilter("all");
                        setAmountDirectionFilter("all");
                      }}
                    >
                      Reset Filters
                    </Button>
                  ) : null}
                </div>
            </ListBox>

            <ListBox
              options={transactionToolbarExportOptions}
              onValueChange={handleExportChange}
              placeholder={
                <span className="text-[var(--foreground)]">Export</span>
              }
              disabled={selectedTransactions.length === 0}
              className="w-auto"
              triggerClassName="h-14 min-w-[160px] px-6 text-base [&>span]:text-base"
              contentClassName="w-[220px]"
              optionClassName="py-4 text-lg"
              align="right"
              ariaLabel="Export selected transactions"
            />

            <ListBox
              options={transactionActionOptions}
              onValueChange={(value) =>
                handleBulkAction(value as TransactionBulkAction)
              }
              placeholder={
                <span className="text-[var(--foreground)]">Actions</span>
              }
              disabled={selectedTransactions.length === 0}
              className="w-auto"
              triggerClassName="h-14 min-w-[170px] rounded-md px-6 text-base [&>span]:text-base"
              contentClassName="w-[240px]"
              optionClassName="py-4 text-lg"
              align="right"
              ariaLabel="Transaction actions"
            />

            <button
              type="button"
              onClick={() => setIsTableExpanded(!expanded)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-transparent text-[var(--muted)] transition hover:text-[var(--color-brand-500)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)]"
              aria-label={
                expanded
                  ? "Collapse transactions table"
                  : "Expand transactions table"
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

        <TableMain className="min-h-0 flex-1">
          <TableGrid minWidthClassName="flex h-full min-w-[1710px] flex-col">
            <TableHeader columnsClassName={columnsClassName}>
              <TableCell className="justify-center">
                <TableCheckbox
                  checked={isAllSelected}
                  onToggle={toggleSelectAll}
                />
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
                {filteredTransactions.length === 0 ? (
                  <TableEmptyState text="No transactions found" />
                ) : (
                  filteredTransactions.map((transaction) => {
                    const isSelected = selectedIds.includes(transaction.id);

                    return (
                      <div
                        key={transaction.id}
                        onClick={() => setOpenTransactionModal(transaction)}
                        className={cn(
                          "grid w-full cursor-pointer border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30",
                          columnsClassName
                        )}
                      >
                        <TableCell className="justify-center">
                          <TableCheckbox
                            checked={isSelected}
                            onToggle={() => toggleRowSelection(transaction.id)}
                          />
                        </TableCell>

                        <TableCell className="text-base font-medium text-[var(--paragraph)]">
                          {transaction.time}
                        </TableCell>

                        <TableCell className="text-base font-semibold text-[var(--title)]">
                          {transaction.user}
                        </TableCell>

                        <TableCell>
                          <TransactionTypeBadge type={transaction.type} />
                        </TableCell>

                        <TableCell className="paragraph">
                          {transaction.description}
                        </TableCell>

                        <TableCell>
                          <AmountValue
                            value={transaction.amount}
                            className="text-base"
                          />
                        </TableCell>

                        <TableCell className="text-base font-semibold text-[var(--title)]">
                          {transaction.quotaAfter.toFixed(2)}
                        </TableCell>

                        <TableCell>
                          <TransactionReviewBadge
                            status={transaction.reviewStatus}
                          />
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
  }
};

export default TransactionsTable;
