import React from 'react';
import RestrictedBadge from '../../ui/badge/RestrictedBadge';

type UserAccount = {
  id: string;
  username?: string;
  full_name?: string;
  balance?: number;
  restricted?: boolean;
  pages?: number;
  jobs?: number;
};

type UsersTableRowProps = {
  user: UserAccount;
  isSelected: boolean;
  onToggle: (id: string) => void;
};

export default function UsersTableRow({
  user,
  isSelected,
  onToggle,
}: UsersTableRowProps) {
  return (
    <tr
      onClick={() => onToggle(user.id)}
      className={`group cursor-pointer transition-colors duration-150 ${
        isSelected
          ? 'bg-brand-50/60 dark:bg-brand-500/10'
          : 'hover:bg-slate-50/60 dark:hover:bg-slate-900'
      }`}
    >
      <td className="px-6 py-3.5">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(user.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-slate-300 dark:border-white/10 cursor-pointer accent-[var(--color-brand-500)]"
        />
      </td>

      <td className="px-4 py-3.5">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {user.username}
        </span>
      </td>

      <td className="px-4 py-3.5">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {user.full_name}
        </span>
      </td>

      <td className="px-4 py-3.5">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {(user.balance ?? 0).toFixed(2)}
        </span>
      </td>

      <td className="px-4 py-3.5">
        <RestrictedBadge restricted={user.restricted} />
      </td>

      <td className="px-4 py-3.5">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {user.pages ?? 0}
        </span>
      </td>

      <td className="px-4 py-3.5">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {user.jobs ?? 0}
        </span>
      </td>
    </tr>
  );
}
