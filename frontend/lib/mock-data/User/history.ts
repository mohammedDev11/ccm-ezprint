import {
  Check,
  RotateCcw,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import type { StatusTone } from "@/components/ui/badge/StatusBadge";

export type UserTransactionType =
  | "Deduction"
  | "Refund"
  | "Credit"
  | "Adjustment"
  | "Failed";

export type UserTransactionSortKey =
  | "date"
  | "type"
  | "amount"
  | "balanceAfter"
  | "comment";

export type UserTransactionItem = {
  id: string;
  date: string;
  timestamp: string;
  type: UserTransactionType;
  amount: number;
  balanceAfter: number;
  comment: string;
  reference: string;
  method: string;
  icon: LucideIcon;
};

export const userTransactionColumns: {
  key: UserTransactionSortKey;
  label: string;
  sortable: boolean;
}[] = [
  { key: "date", label: "Date", sortable: true },
  { key: "type", label: "Type", sortable: true },
  { key: "amount", label: "Amount", sortable: true },
  { key: "balanceAfter", label: "Balance After", sortable: true },
  { key: "comment", label: "Comment", sortable: true },
];

export const userTransactionData: UserTransactionItem[] = [
  {
    id: "txn-001",
    date: "2024-03-20",
    timestamp: "Mar 20, 2024 · 10:22 AM",
    type: "Deduction",
    amount: -2.4,
    balanceAfter: 24.5,
    comment: "Print: thesis_final_v3.pdf",
    reference: "TXN-2024-001",
    method: "Automatic print charge",
    icon: X,
  },
  {
    id: "txn-002",
    date: "2024-03-19",
    timestamp: "Mar 19, 2024 · 03:48 PM",
    type: "Deduction",
    amount: -1.2,
    balanceAfter: 26.9,
    comment: "Print: slides_ch4.pptx",
    reference: "TXN-2024-002",
    method: "Automatic print charge",
    icon: X,
  },
  {
    id: "txn-003",
    date: "2024-03-18",
    timestamp: "Mar 18, 2024 · 11:05 AM",
    type: "Refund",
    amount: 0.8,
    balanceAfter: 28.1,
    comment: "Failed job refund",
    reference: "TXN-2024-003",
    method: "System refund",
    icon: RotateCcw,
  },
  {
    id: "txn-004",
    date: "2024-03-17",
    timestamp: "Mar 17, 2024 · 08:10 PM",
    type: "Deduction",
    amount: -0.8,
    balanceAfter: 27.3,
    comment: "Print: report_draft.docx",
    reference: "TXN-2024-004",
    method: "Automatic print charge",
    icon: X,
  },
  {
    id: "txn-005",
    date: "2024-03-15",
    timestamp: "Mar 15, 2024 · 01:16 PM",
    type: "Credit",
    amount: 5,
    balanceAfter: 28.1,
    comment: "Card redeemed: PRNT-2024-XK9",
    reference: "TXN-2024-005",
    method: "Redeem card",
    icon: WalletCards,
  },
  {
    id: "txn-006",
    date: "2024-03-10",
    timestamp: "Mar 10, 2024 · 09:41 AM",
    type: "Deduction",
    amount: -0.6,
    balanceAfter: 23.1,
    comment: "Print: assignment_1.pdf",
    reference: "TXN-2024-006",
    method: "Automatic print charge",
    icon: X,
  },
];

export const userTransactionTypeMeta: Record<
  UserTransactionType,
  {
    label: string;
    tone: StatusTone;
  }
> = {
  Deduction: { label: "Deduction", tone: "danger" },
  Refund: { label: "Refund", tone: "success" },
  Credit: { label: "Credit", tone: "success" },
  Adjustment: { label: "Adjustment", tone: "warning" },
  Failed: { label: "Failed", tone: "inactive" },
};

export const userTransactionFilterOptions = [
  { label: "All Transactions", value: "all" },
  { label: "Deductions", value: "Deduction" },
  { label: "Refunds", value: "Refund" },
  { label: "Credits", value: "Credit" },
  { label: "Adjustments", value: "Adjustment" },
  { label: "Failed", value: "Failed" },
] as const;
