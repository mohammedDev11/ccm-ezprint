// "use client";

// import React, { useMemo, useState } from "react";
// import {
//   Search,
//   SlidersHorizontal,
//   ChevronDown,
//   Lock,
//   LockOpen,
// } from "lucide-react";
// import { userAccounts } from "@/lib/mock-data/Admin/users";
// import PageIntro from "@/app/Mohammed/components/PageIntro";
// import FloatingInput from "@/app/Mohammed/components/FloatingInput";

// const users = userAccounts;

// function RestrictedBadge({ restricted }: { restricted: boolean }) {
//   return restricted ? (
//     <span
//       className="inline-flex items-center justify-center w-9 h-9 rounded-full"
//       style={{ background: "var(--color-danger-50)" }}
//     >
//       <Lock className="w-4 h-4" style={{ color: "var(--color-danger-500)" }} />
//     </span>
//   ) : (
//     <span
//       className="inline-flex items-center justify-center w-9 h-9 rounded-full"
//       style={{ background: "var(--color-success-100)" }}
//     >
//       <LockOpen
//         className="w-4 h-4"
//         style={{ color: "var(--color-success-600)" }}
//       />
//     </span>
//   );
// }

// export default function Users() {
//   const [search, setSearch] = useState("");
//   const [selected, setSelected] = useState<Set<string>>(new Set());

//   const filtered = useMemo(() => {
//     return users.filter(
//       (u) =>
//         u.username.toLowerCase().includes(search.toLowerCase()) ||
//         u.full_name.toLowerCase().includes(search.toLowerCase())
//     );
//   }, [search]);

//   const toggleAll = () => {
//     if (selected.size === filtered.length) {
//       setSelected(new Set());
//     } else {
//       setSelected(new Set(filtered.map((u) => u.id)));
//     }
//   };

//   const toggleOne = (id: string) => {
//     const next = new Set(selected);
//     next.has(id) ? next.delete(id) : next.add(id);
//     setSelected(next);
//   };

//   const allSelected = filtered.length > 0 && selected.size === filtered.length;

//   const columns = [
//     "USERNAME",
//     "FULL NAME",
//     "BALANCE",
//     "RESTRICTED",
//     "PAGES",
//     "JOBS",
//   ];

//   return (
//     <div>
//       <PageIntro
//         title="Users"
//         description="Manage users, track printing activity, and control access to the system."
//       />
//       <div className="mt-5 w-full px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
//         <div className="card w-full overflow-hidden">
//           {/* Header */}
//           <div
//             className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5"
//             style={{ borderBottom: "1px solid var(--border)" }}
//           >
//             <h2
//               className="text-base sm:text-lg font-bold tracking-tight"
//               style={{ color: "var(--title)" }}
//             >
//               User Accounts
//             </h2>

//             <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
//               <div className="relative w-full sm:flex-1 lg:w-auto">
//                 <FloatingInput
//                   id="search-printers"
//                   label="Search printers"
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   icon={<Search className="h-4 w-4" />}
//                   wrapperClassName="h-14"
//                 />
//               </div>

//               <div className="grid grid-cols-2 sm:flex gap-2">
//                 <button
//                   type="button"
//                   className="btn-secondary h-10 sm:h-9 px-3"
//                 >
//                   <SlidersHorizontal className="w-4 h-4 mr-1.5" />
//                   Filter
//                 </button>

//                 <button
//                   type="button"
//                   className="btn-secondary h-10 sm:h-9 px-3"
//                 >
//                   Actions
//                   <ChevronDown className="w-4 h-4 ml-1.5" />
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Table */}
//           <div className="w-full overflow-x-auto">
//             <table className="w-full min-w-[760px]">
//               <thead>
//                 <tr style={{ borderBottom: "1px solid var(--border)" }}>
//                   <th className="w-12 px-4 sm:px-6 py-3">
//                     <input
//                       type="checkbox"
//                       checked={allSelected}
//                       onChange={toggleAll}
//                       className="w-4 h-4 rounded cursor-pointer accent-[var(--color-brand-500)]"
//                     />
//                   </th>

//                   {columns.map((col) => (
//                     <th
//                       key={col}
//                       className="text-left px-3 sm:px-4 py-3 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
//                       style={{ color: "var(--muted)" }}
//                     >
//                       {col}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>

//               <tbody>
//                 {filtered.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={7}
//                       className="text-center py-10 sm:py-12 text-sm"
//                       style={{ color: "var(--muted)" }}
//                     >
//                       No users found
//                     </td>
//                   </tr>
//                 ) : (
//                   filtered.map((user) => {
//                     const isSelected = selected.has(user.id);

//                     return (
//                       <tr
//                         key={user.id}
//                         onClick={() => toggleOne(user.id)}
//                         className="cursor-pointer transition-colors duration-150"
//                         style={{
//                           borderBottom: "1px solid var(--border)",
//                           background: isSelected
//                             ? "var(--surface-2)"
//                             : "transparent",
//                         }}
//                         onMouseEnter={(e) => {
//                           if (!isSelected) {
//                             e.currentTarget.style.background =
//                               "var(--surface-2)";
//                           }
//                         }}
//                         onMouseLeave={(e) => {
//                           if (!isSelected) {
//                             e.currentTarget.style.background = "transparent";
//                           }
//                         }}
//                       >
//                         <td className="px-4 sm:px-6 py-3.5">
//                           <input
//                             type="checkbox"
//                             checked={isSelected}
//                             onChange={() => toggleOne(user.id)}
//                             onClick={(e) => e.stopPropagation()}
//                             className="w-4 h-4 rounded cursor-pointer accent-[var(--color-brand-500)]"
//                           />
//                         </td>

//                         <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap">
//                           <span
//                             className="text-sm font-medium"
//                             style={{ color: "var(--foreground)" }}
//                           >
//                             {user.username}
//                           </span>
//                         </td>

//                         <td className="px-3 sm:px-4 py-3.5 min-w-[180px]">
//                           <span
//                             className="text-sm"
//                             style={{ color: "var(--paragraph)" }}
//                           >
//                             {user.full_name}
//                           </span>
//                         </td>

//                         <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap">
//                           <span
//                             className="text-sm font-semibold"
//                             style={{ color: "var(--foreground)" }}
//                           >
//                             {user.balance.toFixed(2)}
//                           </span>
//                         </td>

//                         <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap">
//                           <RestrictedBadge restricted={user.restricted} />
//                         </td>

//                         <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap">
//                           <span
//                             className="text-sm"
//                             style={{ color: "var(--foreground)" }}
//                           >
//                             {user.pages}
//                           </span>
//                         </td>

//                         <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap">
//                           <span
//                             className="text-sm"
//                             style={{ color: "var(--foreground)" }}
//                           >
//                             {user.jobs}
//                           </span>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Footer */}
//           <div
//             className="px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
//             style={{ borderTop: "1px solid var(--border)" }}
//           >
//             <p className="text-xs" style={{ color: "var(--muted)" }}>
//               {selected.size > 0
//                 ? `${selected.size} selected`
//                 : `${filtered.length} users`}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

//===========New==========
import PageIntro from "@/components/shared/page/Text/PageIntro";
import UserAccountsTable from "./components/UserAccountsTable";

const page = () => {
  return (
    <main className="">
      <div className="flex flex-col gap-10">
        <PageIntro
          title="Users"
          description="Manage users, track printing activity, and control access to the system."
        />
        <UserAccountsTable />
      </div>
    </main>
  );
};

export default page;
