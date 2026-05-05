import React from 'react';

type UsersHeaderProps = {
  title?: string;
  description?: string;
};

export default function UsersHeader({
  title = 'Users',
  description = 'Manage all user accounts and permissions',
}: UsersHeaderProps) {
  console.log('OLD UsersHeader RENDERED');

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
        {title}
      </h1>
      <p className="mt-1 text-sm text-slate-400 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}
