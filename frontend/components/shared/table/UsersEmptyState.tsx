import React from 'react';

type UsersEmptyStateProps = {
  colSpan: number;
};

export default function UsersEmptyState({ colSpan }: UsersEmptyStateProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="text-center py-12 text-sm text-slate-400 dark:text-slate-500"
      >
        No users found
      </td>
    </tr>
  );
}