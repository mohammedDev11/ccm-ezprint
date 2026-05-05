import React from "react";
import { Lock, LockOpen } from "lucide-react";

type RestrictedBadgeProps = {
  restricted?: boolean;
};

export default function RestrictedBadge({ restricted }: RestrictedBadgeProps) {
  return restricted ? (
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-red-100 dark:bg-red-500/10">
      <Lock className="w-4 h-4 text-red-400 dark:text-red-300" />
    </span>
  ) : (
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-green-100 dark:bg-green-500/10">
      {/* <LockOpen className="w-4 h-4 text-green-500 dark:text-green-300" /> */}
      <LockOpen className="w-4 h-4 text-neutral-900 dark:text-green-300" />
    </span>
  );
}
