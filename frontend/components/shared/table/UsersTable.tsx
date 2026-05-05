import React from 'react';
import UsersTableRow from '../../../components/shared/table/UsersTableRow';
import UsersTableSkeleton from './UsersTableSkeleton';
import UsersEmptyState from './UsersEmptyState';

type UserAccount = {
  id: string;
  username?: string;
  full_name?: string;
  balance?: number;
  restricted?: boolean;
  pages?: number;
  jobs?: number;
};

type UsersTableProps = {
  users: UserAccount[];
  isLoading: boolean;
  selected: Set<string>;
  allSelected: boolean;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
};

const columns = ['USERNAME', 'FULL NAME', 'BALANCE', 'RESTRICTED', 'PAGES', 'JOBS'];

export default function UsersTable({
  users,
  isLoading,
  selected,
  allSelected,
  onToggleAll,
  onToggleOne,
}: UsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800">
            <th className="w-12 px-6 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                className="w-4 h-4 rounded border-slate-300 dark:border-white/10 cursor-pointer accent-[var(--color-brand-500)]"
              />
            </th>

            {columns.map((col) => (
              <th
                key={col}
                className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
          {isLoading ? (
            <UsersTableSkeleton columns={columns} />
          ) : users.length === 0 ? (
            <UsersEmptyState colSpan={7} />
          ) : (
            users.map((user) => (
              <UsersTableRow
                key={user.id}
                user={user}
                isSelected={selected.has(user.id)}
                onToggle={onToggleOne}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
