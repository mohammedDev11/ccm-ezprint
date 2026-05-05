import React from 'react';

type UsersTableSkeletonProps = {
  columns: string[];
  rows?: number;
};

export default function UsersTableSkeleton({
  columns,
  rows = 6,
}: UsersTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-6 py-4">
            <div className="w-4 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
          </td>
          {columns.map((col) => (
            <td key={col} className="px-4 py-4">
              <div className="h-4 w-20 rounded-md bg-slate-100 dark:bg-slate-800" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}