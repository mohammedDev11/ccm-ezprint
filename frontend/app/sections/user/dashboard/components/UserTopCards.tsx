"use client";

import KpiMetricCard from "@/components/shared/cards/KpiMetricCard";
import {
  Clock3,
  DollarSign,
  FileText,
  Layers3,
  type LucideIcon,
} from "lucide-react";
import type { UserDashboardCard } from "../types";

const iconMap: Record<string, LucideIcon> = {
  "dollar-sign": DollarSign,
  "file-text": FileText,
  "layers-3": Layers3,
  "clock-3": Clock3,
};

const loadingCards: UserDashboardCard[] = [
  {
    id: "loading-quota",
    title: "Current Quota",
    value: "...",
    change: "Loading live quota",
    iconKey: "dollar-sign",
  },
  {
    id: "loading-jobs",
    title: "Total Print Jobs",
    value: "...",
    change: "Loading job history",
    iconKey: "file-text",
  },
  {
    id: "loading-pages",
    title: "Total Pages Printed",
    value: "...",
    change: "Loading page totals",
    iconKey: "layers-3",
  },
  {
    id: "loading-pending",
    title: "Active Pending Jobs",
    value: "...",
    change: "Loading release queue",
    iconKey: "clock-3",
  },
];

type UserTopCardsProps = {
  cards: UserDashboardCard[];
  loading?: boolean;
};

const UserTopCards = ({ cards, loading = false }: UserTopCardsProps) => {
  const visibleCards = cards.length > 0 ? cards : loading ? loadingCards : [];

  if (visibleCards.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {visibleCards.map((card, index) => {
        const Icon = iconMap[card.iconKey || ""] || FileText;

        return (
          <KpiMetricCard
            key={card.id}
            title={card.title}
            value={card.value}
            helper={card.change}
            icon={<Icon className="h-5 w-5" />}
            index={index}
          />
        );
      })}
    </div>
  );
};

export default UserTopCards;
