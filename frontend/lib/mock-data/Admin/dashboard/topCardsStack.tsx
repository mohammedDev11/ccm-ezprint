// import { CardStackItem } from "@/app/sections/admin/dashboard/TopCards";
import { CardStackItem } from "@/components/ui/card/card-stack";
import React from "react";

export const topCardsStackData: CardStackItem[] = [
  {
    id: 1,
    name: "Secure Release",
    designation: "Authentication Layer",
    content: (
      <p>
        Users release jobs only after authentication at the printer, reducing
        misuse and improving document privacy.
      </p>
    ),
  },
  {
    id: 2,
    name: "Quota Control",
    designation: "Usage Governance",
    content: (
      <p>
        Department-based quotas help manage printing costs, prevent waste, and
        keep usage aligned with campus policies.
      </p>
    ),
  },
  {
    id: 3,
    name: "Live Monitoring",
    designation: "Admin Visibility",
    content: (
      <p>
        Administrators can track active printers, queued jobs, and recent print
        activity from one centralized dashboard.
      </p>
    ),
  },
  {
    id: 4,
    name: "Detailed Logs",
    designation: "Reporting System",
    content: (
      <p>
        Every job is logged with user, device, time, and status details to
        support auditing and issue resolution.
      </p>
    ),
  },
];
