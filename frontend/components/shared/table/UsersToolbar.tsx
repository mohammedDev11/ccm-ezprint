import React from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import Input from '@/components/ui/input/Input';
import Button from '@/components/ui/button/Button';

type UsersToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export default function UsersToolbar({
  search,
  onSearchChange,
}: UsersToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-5 border-b border-slate-100 dark:border-slate-800">
      <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
        User Accounts
      </h2>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search users by name or ID..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-sm rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 w-full sm:w-64"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-slate-200 dark:border-slate-700 h-9 px-3"
        >
          <SlidersHorizontal className="w-4 h-4 mr-1.5" />
          Filter
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-slate-200 dark:border-slate-700 h-9 px-3"
        >
          Actions
          <ChevronDown className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}
