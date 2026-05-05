// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { X, Plus, ChevronsUpDown } from "lucide-react";
// import {
//   RiAddLine,
//   RiDeleteBin6Line,
//   RiFileList3Line,
//   RiLock2Line,
//   RiPrinterLine,
//   RiShieldUserLine,
// } from "react-icons/ri";
// import { cn } from "@/lib/cn";
// import Button from "@/components/ui/button/Button";
// import FormFieldInput from "@/components/ui/input/FormFieldInput";
// import Modal from "@/components/ui/modal/Modal";
// import StatusBadge from "@/components/ui/badge/StatusBadge";
// import SegmentToggle from "@/components/shared/actions/SegmentToggle";
// import {
//   Dropdown,
//   DropdownContent,
//   DropdownItem,
//   DropdownTrigger,
// } from "@/components/ui/dropdown/Dropdown";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableCheckbox,
//   TableControls,
//   TableEmptyState,
//   TableGrid,
//   TableHeader,
//   TableHeaderCell,
//   TableMain,
//   TableSearch,
//   TableTitleBlock,
//   TableTop,
// } from "@/components/shared/table/Table";
// import {
//   queueDepartmentOptions,
//   queueFormDefaults,
//   queueGroupOptions,
//   queueModalTabs,
//   queuePrinterOptions,
//   queueRestrictedUserSuggestions,
//   queueRoleOptions,
//   queuesData,
//   queueStatusMeta,
//   queueTableColumns,
//   queueTypeMeta,
//   type QueueModalTab,
//   type QueueSortKey,
//   type QueueStatus,
//   type QueueTableItem,
//   type QueueType,
// } from "@/lib/mock-data/Admin/queues";

// type SortDir = "asc" | "desc";

// const columnsClassName =
//   "[grid-template-columns:72px_minmax(250px,1.5fr)_minmax(170px,1fr)_minmax(230px,1.2fr)_minmax(200px,1.1fr)_minmax(150px,0.8fr)_minmax(130px,0.7fr)_minmax(120px,0.7fr)_minmax(150px,0.9fr)]";

// const typeOptions: QueueType[] = [
//   "Secure Release",
//   "Department-based",
//   "Faculty",
//   "General",
// ];

// const statusOptions: QueueStatus[] = ["Active", "Inactive", "Disabled"];

// const formatRetention = (hours: number) => `${hours}h`;

// function QueueTypeBadge({ type }: { type: QueueType }) {
//   const meta = queueTypeMeta[type];

//   return (
//     <span
//       className={cn(
//         "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium",
//         meta.className
//       )}
//     >
//       {meta.label}
//     </span>
//   );
// }

// function QueueStatusBadge({
//   status,
//   className = "",
// }: {
//   status: QueueStatus;
//   className?: string;
// }) {
//   const meta = queueStatusMeta[status];

//   return (
//     <StatusBadge label={meta.label} tone={meta.tone} className={className} />
//   );
// }

// function EditField({
//   label,
//   children,
// }: {
//   label: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="space-y-2">
//       <label className="text-sm font-medium text-[var(--paragraph)]">
//         {label}
//       </label>
//       {children}
//     </div>
//   );
// }

// function ToggleSwitch({
//   checked,
//   onChange,
// }: {
//   checked: boolean;
//   onChange: () => void;
// }) {
//   return (
//     <button
//       type="button"
//       onClick={onChange}
//       aria-pressed={checked}
//       className={cn(
//         "relative inline-flex h-8 w-14 items-center rounded-full transition",
//         checked ? "bg-brand-500" : "bg-[var(--surface-2)]"
//       )}
//     >
//       <span
//         className={cn(
//           "absolute left-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
//           checked ? "translate-x-6" : "translate-x-0"
//         )}
//       />
//     </button>
//   );
// }

// function AccessRuleField({
//   label,
//   value,
//   onValueChange,
//   onAdd,
//   options,
//   items,
//   onRemove,
//   placeholder,
// }: {
//   label: string;
//   value: string;
//   onValueChange: (value: string) => void;
//   onAdd: () => void;
//   options: string[];
//   items: string[];
//   onRemove: (item: string) => void;
//   placeholder: string;
// }) {
//   return (
//     <div className="space-y-3">
//       <label className="text-sm font-medium text-[var(--paragraph)]">
//         {label}
//       </label>

//       <div className="flex gap-3">
//         <Dropdown value={value} onValueChange={onValueChange}>
//           <DropdownTrigger className="h-14 w-full px-4 text-left">
//             {value || placeholder}
//           </DropdownTrigger>

//           <DropdownContent widthClassName="w-full">
//             {options.map((option) => (
//               <DropdownItem key={option} value={option}>
//                 {option}
//               </DropdownItem>
//             ))}
//           </DropdownContent>
//         </Dropdown>

//         <button
//           type="button"
//           onClick={onAdd}
//           className="flex h-14 w-14 items-center justify-center rounded-md border transition"
//           style={{
//             background: "var(--surface)",
//             borderColor: "var(--border)",
//             color: "var(--foreground)",
//           }}
//         >
//           <Plus className="h-5 w-5" />
//         </button>
//       </div>

//       {items.length > 0 ? (
//         <div className="flex flex-wrap gap-2">
//           {items.map((item) => (
//             <span
//               key={item}
//               className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-2)] px-3 py-1 text-sm text-[var(--paragraph)]"
//             >
//               {item}
//               <button
//                 type="button"
//                 onClick={() => onRemove(item)}
//                 className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
//               >
//                 <X className="h-3.5 w-3.5" />
//               </button>
//             </span>
//           ))}
//         </div>
//       ) : null}
//     </div>
//   );
// }
// function AccessRuleFieldInput({
//   label,
//   value,
//   onValueChange,
//   onAdd,
//   items,
//   onRemove,
//   placeholder,
// }: {
//   label: string;
//   value: string;
//   onValueChange: (value: string) => void;
//   onAdd: () => void;
//   items: string[];
//   onRemove: (item: string) => void;
//   placeholder: string;
// }) {
//   return (
//     <div className="space-y-3">
//       <label className="text-sm font-medium text-[var(--paragraph)]">
//         {label}
//       </label>

//       <div className="flex gap-3">
//         <input
//           value={value}
//           onChange={(e) => onValueChange(e.target.value)}
//           placeholder={placeholder}
//           className="h-14 flex-1 rounded-md border bg-[var(--surface)] px-4 text-sm outline-none transition"
//           style={{
//             borderColor: "var(--border)",
//             color: "var(--foreground)",
//           }}
//         />

//         <button
//           type="button"
//           onClick={onAdd}
//           className="flex h-14 w-14 items-center justify-center rounded-md border transition"
//           style={{
//             background: "var(--surface)",
//             borderColor: "var(--border)",
//             color: "var(--foreground)",
//           }}
//         >
//           <Plus className="h-5 w-5" />
//         </button>
//       </div>

//       {items.length > 0 ? (
//         <div className="flex flex-wrap gap-2">
//           {items.map((item) => (
//             <span
//               key={item}
//               className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-2)] px-3 py-1 text-sm text-[var(--paragraph)]"
//             >
//               {item}
//               <button
//                 type="button"
//                 onClick={() => onRemove(item)}
//                 className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
//               >
//                 <X className="h-3.5 w-3.5" />
//               </button>
//             </span>
//           ))}
//         </div>
//       ) : null}
//     </div>
//   );
// }

// function PrinterSelectionList({
//   selectedPrinters,
//   onToggle,
// }: {
//   selectedPrinters: string[];
//   onToggle: (printerName: string) => void;
// }) {
//   return (
//     <div className="max-h-[280px] overflow-y-auto rounded-md border border-[var(--border)] p-3 scrollbar-none">
//       <div className="space-y-3">
//         {queuePrinterOptions.map((printer) => {
//           const checked = selectedPrinters.includes(printer.name);

//           return (
//             <div
//               key={printer.id}
//               onClick={() => onToggle(printer.name)}
//               className="flex w-full cursor-pointer items-center justify-between rounded-md border border-[var(--border)] px-4 py-3 text-left transition hover:bg-[var(--surface-2)]"
//             >
//               <div className="flex items-center gap-4">
//                 <TableCheckbox
//                   checked={checked}
//                   onToggle={() => onToggle(printer.name)}
//                 />

//                 <span className="text-sm font-medium text-[var(--title)]">
//                   {printer.name}
//                 </span>
//               </div>

//               <span className="text-sm text-[var(--muted)]">
//                 {printer.location}
//               </span>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// function QueueEditorModal({
//   open,
//   title,
//   queue,
//   activeTab,
//   onTabChange,
//   onClose,
//   onSave,
// }: {
//   open: boolean;
//   title: string;
//   queue: QueueTableItem | null;
//   activeTab: QueueModalTab;
//   onTabChange: (value: QueueModalTab) => void;
//   onClose: () => void;
//   onSave: (queue: QueueTableItem) => void;
// }) {
//   const [draft, setDraft] = useState<QueueTableItem | null>(queue);

//   const [selectedRole, setSelectedRole] = useState("");
//   const [selectedGroup, setSelectedGroup] = useState("");
//   const [selectedDepartment, setSelectedDepartment] = useState("");
//   const [selectedRestrictedUser, setSelectedRestrictedUser] = useState("");

//   useEffect(() => {
//     setDraft(queue);
//     setSelectedRole("");
//     setSelectedGroup("");
//     setSelectedDepartment("");
//     setSelectedRestrictedUser("");
//   }, [queue]);

//   if (!draft) return null;

//   const updateDraft = <K extends keyof QueueTableItem>(
//     key: K,
//     value: QueueTableItem[K]
//   ) => {
//     setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
//   };

//   const togglePrinter = (printerName: string) => {
//     const exists = draft.assignedPrinters.includes(printerName);
//     const nextAssigned = exists
//       ? draft.assignedPrinters.filter((item) => item !== printerName)
//       : [...draft.assignedPrinters, printerName];

//     setDraft((prev) =>
//       prev
//         ? {
//             ...prev,
//             assignedPrinters: nextAssigned,
//             defaultPrinter: nextAssigned.includes(prev.defaultPrinter)
//               ? prev.defaultPrinter
//               : nextAssigned[0] || "",
//           }
//         : prev
//     );
//   };

//   const addChip = (
//     field:
//       | "allowedRoles"
//       | "allowedGroups"
//       | "allowedDepartments"
//       | "restrictedUsers",
//     value: string,
//     clear: () => void
//   ) => {
//     const clean = value.trim();
//     if (!clean) return;

//     setDraft((prev) =>
//       prev
//         ? {
//             ...prev,
//             [field]: Array.from(new Set([...(prev[field] as string[]), clean])),
//           }
//         : prev
//     );

//     clear();
//   };

//   const removeChip = (
//     field:
//       | "allowedRoles"
//       | "allowedGroups"
//       | "allowedDepartments"
//       | "restrictedUsers",
//     value: string
//   ) => {
//     setDraft((prev) =>
//       prev
//         ? {
//             ...prev,
//             [field]: (prev[field] as string[]).filter((item) => item !== value),
//           }
//         : prev
//     );
//   };

//   return (
//     <Modal open={open} onClose={onClose}>
//       <div className="w-[min(92vw,980px)] space-y-6">
//         <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5">
//           <div className="flex flex-wrap items-center gap-3">
//             <h3 className="title-md">{draft.name || title}</h3>
//             <QueueStatusBadge
//               status={draft.status}
//               className="px-3 py-1.5 text-sm"
//             />
//           </div>

//           <div className="flex flex-wrap items-center gap-3">
//             <QueueTypeBadge type={draft.type} />
//           </div>
//         </div>

//         <SegmentToggle
//           options={queueModalTabs.map((tab) => ({
//             value: tab.value,
//             label: tab.label,
//             icon: <tab.icon className="h-4 w-4" />,
//           }))}
//           value={activeTab}
//           onChange={(value) => onTabChange(value as QueueModalTab)}
//           className="w-full overflow-x-auto scrollbar-none"
//           buttonClassName="px-4 py-3 text-sm"
//         />

//         <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5">
//           {activeTab === "basic-info" && (
//             <div className="grid gap-5">
//               <FormFieldInput
//                 label="Queue Name"
//                 value={draft.name}
//                 onChange={(value) => updateDraft("name", value)}
//                 placeholder="Enter queue name"
//               />

//               <FormFieldInput
//                 label="Description"
//                 value={draft.description}
//                 onChange={(value) => updateDraft("description", value)}
//                 placeholder="Enter queue description"
//                 multiline
//               />

//               <EditField label="Queue Type">
//                 <Dropdown
//                   value={draft.type}
//                   onValueChange={(value) =>
//                     updateDraft("type", value as QueueType)
//                   }
//                 >
//                   <DropdownTrigger className="h-14 w-full px-4 text-left">
//                     {draft.type}
//                   </DropdownTrigger>
//                   <DropdownContent widthClassName="w-full">
//                     {typeOptions.map((option) => (
//                       <DropdownItem key={option} value={option}>
//                         {option}
//                       </DropdownItem>
//                     ))}
//                   </DropdownContent>
//                 </Dropdown>
//               </EditField>

//               <EditField label="Status">
//                 <Dropdown
//                   value={draft.status}
//                   onValueChange={(value) =>
//                     updateDraft("status", value as QueueStatus)
//                   }
//                 >
//                   <DropdownTrigger className="h-14 w-full px-4 text-left">
//                     {draft.status}
//                   </DropdownTrigger>
//                   <DropdownContent widthClassName="w-full">
//                     {statusOptions.map((option) => (
//                       <DropdownItem key={option} value={option}>
//                         {option}
//                       </DropdownItem>
//                     ))}
//                   </DropdownContent>
//                 </Dropdown>
//               </EditField>
//             </div>
//           )}

//           {activeTab === "printers" && (
//             <div className="space-y-5">
//               <EditField label="Assigned Printers">
//                 <PrinterSelectionList
//                   selectedPrinters={draft.assignedPrinters}
//                   onToggle={togglePrinter}
//                 />
//               </EditField>

//               <EditField label="Default Printer">
//                 <Dropdown
//                   value={draft.defaultPrinter}
//                   onValueChange={(value) =>
//                     updateDraft("defaultPrinter", value)
//                   }
//                 >
//                   <DropdownTrigger className="h-14 w-full px-4 text-left">
//                     {draft.defaultPrinter || "Select default printer"}
//                   </DropdownTrigger>
//                   <DropdownContent widthClassName="w-full">
//                     {(draft.assignedPrinters.length > 0
//                       ? draft.assignedPrinters
//                       : queuePrinterOptions.map((printer) => printer.name)
//                     ).map((printer) => (
//                       <DropdownItem key={printer} value={printer}>
//                         {printer}
//                       </DropdownItem>
//                     ))}
//                   </DropdownContent>
//                 </Dropdown>
//               </EditField>
//             </div>
//           )}

//           {activeTab === "access-rules" && (
//             <div className="space-y-6">
//               <AccessRuleField
//                 label="Allowed Roles"
//                 placeholder="Select role"
//                 value={selectedRole}
//                 onValueChange={setSelectedRole}
//                 onAdd={() =>
//                   addChip("allowedRoles", selectedRole, () =>
//                     setSelectedRole("")
//                   )
//                 }
//                 options={queueRoleOptions}
//                 items={draft.allowedRoles}
//                 onRemove={(item) => removeChip("allowedRoles", item)}
//               />

//               <AccessRuleField
//                 label="Allowed Groups"
//                 placeholder="Select group"
//                 value={selectedGroup}
//                 onValueChange={setSelectedGroup}
//                 onAdd={() =>
//                   addChip("allowedGroups", selectedGroup, () =>
//                     setSelectedGroup("")
//                   )
//                 }
//                 options={queueGroupOptions}
//                 items={draft.allowedGroups}
//                 onRemove={(item) => removeChip("allowedGroups", item)}
//               />

//               <AccessRuleField
//                 label="Allowed Departments"
//                 placeholder="Select department"
//                 value={selectedDepartment}
//                 onValueChange={setSelectedDepartment}
//                 onAdd={() =>
//                   addChip("allowedDepartments", selectedDepartment, () =>
//                     setSelectedDepartment("")
//                   )
//                 }
//                 options={queueDepartmentOptions}
//                 items={draft.allowedDepartments}
//                 onRemove={(item) => removeChip("allowedDepartments", item)}
//               />

//               <AccessRuleFieldInput
//                 label="Restricted Users"
//                 placeholder="user@example.com"
//                 value={selectedRestrictedUser}
//                 onValueChange={setSelectedRestrictedUser}
//                 onAdd={() =>
//                   addChip("restrictedUsers", selectedRestrictedUser, () =>
//                     setSelectedRestrictedUser("")
//                   )
//                 }
//                 items={draft.restrictedUsers}
//                 onRemove={(item) => removeChip("restrictedUsers", item)}
//               />
//             </div>
//           )}

//           {activeTab === "release-settings" && (
//             <div className="space-y-4">
//               {[
//                 {
//                   key: "secureRelease",
//                   label: "Secure Release",
//                   description: "Jobs are held until the user releases them.",
//                 },
//                 {
//                   key: "manualReleaseRequired",
//                   label: "Manual Release Required",
//                   description: "Admin approval is required before release.",
//                 },
//                 {
//                   key: "allowReleaseAllJobs",
//                   label: "Allow ‘Release All Jobs’",
//                   description: "Users can release all of their jobs at once.",
//                 },
//                 {
//                   key: "requirePrinterAuthentication",
//                   label: "Require Printer Authentication",
//                   description:
//                     "User must authenticate at printer before release.",
//                 },
//               ].map((item) => (
//                 <div
//                   key={item.key}
//                   className="flex items-center justify-between gap-5 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4"
//                 >
//                   <div>
//                     <p className="font-medium text-[var(--title)]">
//                       {item.label}
//                     </p>
//                     <p className="mt-1 text-sm text-[var(--muted)]">
//                       {item.description}
//                     </p>
//                   </div>

//                   <ToggleSwitch
//                     checked={Boolean(draft[item.key as keyof QueueTableItem])}
//                     onChange={() =>
//                       setDraft((prev) =>
//                         prev
//                           ? {
//                               ...prev,
//                               [item.key]:
//                                 !prev[item.key as keyof QueueTableItem],
//                             }
//                           : prev
//                       )
//                     }
//                   />
//                 </div>
//               ))}
//             </div>
//           )}

//           {activeTab === "retention" && (
//             <div className="space-y-5">
//               <FormFieldInput
//                 label="Retention Period (hours)"
//                 type="number"
//                 value={String(draft.retentionHours)}
//                 onChange={(value) =>
//                   updateDraft("retentionHours", Number(value) || 0)
//                 }
//                 placeholder="Enter retention period"
//               />

//               <div className="flex items-center justify-between gap-5 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
//                 <div>
//                   <p className="font-medium text-[var(--title)]">
//                     Auto-delete Expired Jobs
//                   </p>
//                   <p className="mt-1 text-sm text-[var(--muted)]">
//                     Automatically remove jobs after retention period.
//                   </p>
//                 </div>

//                 <ToggleSwitch
//                   checked={draft.autoDeleteExpiredJobs}
//                   onChange={() =>
//                     updateDraft(
//                       "autoDeleteExpiredJobs",
//                       !draft.autoDeleteExpiredJobs
//                     )
//                   }
//                 />
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="flex justify-end gap-3">
//           <Button variant="outline" onClick={onClose}>
//             Cancel
//           </Button>

//           <Button variant="primary" onClick={() => onSave(draft)}>
//             Save Changes
//           </Button>
//         </div>
//       </div>
//     </Modal>
//   );
// }

// const PrintQueuesTable = () => {
//   const [queues, setQueues] = useState<QueueTableItem[]>(queuesData);
//   const [search, setSearch] = useState("");

//   const [sortKey, setSortKey] = useState<QueueSortKey>("name");
//   const [sortDir, setSortDir] = useState<SortDir>("asc");

//   const [selectedIds, setSelectedIds] = useState<string[]>([]);

//   const [openQueue, setOpenQueue] = useState<QueueTableItem | null>(null);
//   const [openQueueTab, setOpenQueueTab] = useState<QueueModalTab>("basic-info");

//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [addQueueTab, setAddQueueTab] = useState<QueueModalTab>("basic-info");
//   const [newQueue, setNewQueue] = useState<QueueTableItem | null>(null);

//   const handleSort = (key: QueueSortKey) => {
//     if (sortKey === key) {
//       setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
//       return;
//     }

//     setSortKey(key);
//     setSortDir("asc");
//   };

//   const filteredQueues = useMemo(() => {
//     const term = search.trim().toLowerCase();

//     return [...queues]
//       .filter((queue) => {
//         if (!term) return true;

//         return (
//           queue.name.toLowerCase().includes(term) ||
//           queue.type.toLowerCase().includes(term) ||
//           queue.status.toLowerCase().includes(term) ||
//           queue.assignedPrinters.join(" ").toLowerCase().includes(term) ||
//           queue.allowedGroups.join(" ").toLowerCase().includes(term)
//         );
//       })
//       .sort((a, b) => {
//         const getSortValue = (item: QueueTableItem) => {
//           switch (sortKey) {
//             case "name":
//               return item.name.toLowerCase();
//             case "type":
//               return item.type.toLowerCase();
//             case "assignedPrinters":
//               return item.assignedPrinters.join(", ").toLowerCase();
//             case "allowedGroups":
//               return item.allowedGroups.join(", ").toLowerCase();
//             case "status":
//               return item.status.toLowerCase();
//             case "pendingJobs":
//               return item.pendingJobs;
//             case "retentionHours":
//               return item.retentionHours;
//             case "secureRelease":
//               return Number(item.secureRelease);
//             default:
//               return item.name.toLowerCase();
//           }
//         };

//         const aValue = getSortValue(a);
//         const bValue = getSortValue(b);

//         if (typeof aValue === "number" && typeof bValue === "number") {
//           return sortDir === "asc" ? aValue - bValue : bValue - aValue;
//         }

//         return sortDir === "asc"
//           ? String(aValue).localeCompare(String(bValue))
//           : String(bValue).localeCompare(String(aValue));
//       });
//   }, [queues, search, sortDir, sortKey]);

//   const visibleIds = filteredQueues.map((queue) => queue.id);

//   const isAllSelected =
//     visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

//   const toggleSelectAll = () => {
//     if (isAllSelected) {
//       setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
//       return;
//     }

//     setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
//   };

//   const toggleRowSelection = (id: string) => {
//     setSelectedIds((prev) =>
//       prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
//     );
//   };

//   const openAddModal = () => {
//     setNewQueue({
//       ...queueFormDefaults,
//       id: `queue-${Date.now()}`,
//     });
//     setAddQueueTab("basic-info");
//     setIsAddModalOpen(true);
//   };

//   const handleSaveQueueChanges = (updatedQueue: QueueTableItem) => {
//     setQueues((prev) =>
//       prev.map((queue) => (queue.id === updatedQueue.id ? updatedQueue : queue))
//     );
//     setOpenQueue(updatedQueue);
//   };

//   const handleSaveNewQueue = (createdQueue: QueueTableItem) => {
//     const normalized: QueueTableItem = {
//       ...createdQueue,
//       id: createdQueue.id || `queue-${Date.now()}`,
//       name: createdQueue.name.trim() || "Untitled Queue",
//       description: createdQueue.description.trim() || "No description provided",
//       defaultPrinter:
//         createdQueue.defaultPrinter || createdQueue.assignedPrinters[0] || "",
//     };

//     setQueues((prev) => [normalized, ...prev]);
//     setIsAddModalOpen(false);
//     setNewQueue(null);
//   };

//   return (
//     <>
//       <Table>
//         <TableTop>
//           <TableTitleBlock
//             title="Print Queues"
//             description={`${filteredQueues.length} queues configured`}
//           />

//           <TableControls>
//             <TableSearch
//               id="search-print-queues"
//               label="Search queues..."
//               value={search}
//               onChange={setSearch}
//             />

//             <Button
//               variant="primary"
//               className="h-14 px-6 text-base"
//               iconLeft={<RiAddLine className="h-5 w-5" />}
//               onClick={openAddModal}
//             >
//               Add Queue
//             </Button>
//           </TableControls>
//         </TableTop>

//         <TableMain>
//           <TableGrid minWidthClassName="min-w-[1350px]">
//             <TableHeader columnsClassName={columnsClassName}>
//               <TableCell className="justify-center">
//                 <TableCheckbox
//                   checked={isAllSelected}
//                   onToggle={toggleSelectAll}
//                 />
//               </TableCell>

//               {queueTableColumns.map((column) => (
//                 <TableHeaderCell
//                   key={column.key}
//                   label={column.label}
//                   sortable={column.sortable}
//                   active={sortKey === column.key}
//                   direction={sortDir}
//                   onClick={() => handleSort(column.key)}
//                 />
//               ))}
//             </TableHeader>

//             <TableBody>
//               {filteredQueues.length === 0 ? (
//                 <TableEmptyState text="No queues found" />
//               ) : (
//                 filteredQueues.map((queue) => {
//                   const isSelected = selectedIds.includes(queue.id);

//                   return (
//                     <div
//                       key={queue.id}
//                       onClick={() => {
//                         setOpenQueue(queue);
//                         setOpenQueueTab("basic-info");
//                       }}
//                       className={cn(
//                         "grid cursor-pointer border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30",
//                         columnsClassName
//                       )}
//                     >
//                       <TableCell className="justify-center">
//                         <TableCheckbox
//                           checked={isSelected}
//                           onToggle={() => toggleRowSelection(queue.id)}
//                         />
//                       </TableCell>

//                       <TableCell className="text-base font-semibold text-[var(--title)]">
//                         {queue.name}
//                       </TableCell>

//                       <TableCell>
//                         <QueueTypeBadge type={queue.type} />
//                       </TableCell>

//                       <TableCell className="paragraph">
//                         {queue.assignedPrinters.join(", ")}
//                       </TableCell>

//                       <TableCell className="paragraph">
//                         {queue.allowedGroups.length > 0
//                           ? queue.allowedGroups.join(", ")
//                           : "—"}
//                       </TableCell>

//                       <TableCell>
//                         <QueueStatusBadge
//                           status={queue.status}
//                           className="px-3 py-1.5 text-sm"
//                         />
//                       </TableCell>

//                       <TableCell className="text-base font-medium text-[var(--paragraph)]">
//                         {queue.pendingJobs}
//                       </TableCell>

//                       <TableCell className="text-base font-medium text-[var(--paragraph)]">
//                         {formatRetention(queue.retentionHours)}
//                       </TableCell>

//                       <TableCell>
//                         <StatusBadge
//                           label={queue.secureRelease ? "Enabled" : "Disabled"}
//                           tone={queue.secureRelease ? "success" : "inactive"}
//                           className="px-3 py-1.5 text-sm"
//                         />
//                       </TableCell>
//                     </div>
//                   );
//                 })
//               )}
//             </TableBody>
//           </TableGrid>
//         </TableMain>
//       </Table>

//       <QueueEditorModal
//         open={Boolean(openQueue)}
//         title="Edit Queue"
//         queue={openQueue}
//         activeTab={openQueueTab}
//         onTabChange={setOpenQueueTab}
//         onClose={() => setOpenQueue(null)}
//         onSave={handleSaveQueueChanges}
//       />

//       <QueueEditorModal
//         open={isAddModalOpen && Boolean(newQueue)}
//         title="Add Queue"
//         queue={newQueue}
//         activeTab={addQueueTab}
//         onTabChange={setAddQueueTab}
//         onClose={() => {
//           setIsAddModalOpen(false);
//           setNewQueue(null);
//         }}
//         onSave={handleSaveNewQueue}
//       />
//     </>
//   );
// };

// export default PrintQueuesTable;

// =========NEW===========
"use client";

import { cn } from "@/lib/cn";
import SegmentToggle from "@/components/shared/actions/SegmentToggle";
import KpiMetricCard from "@/components/shared/cards/KpiMetricCard";
import FullscreenTablePortal from "@/components/shared/table/FullscreenTablePortal";
import {
  Table,
  TableBody,
  TableCell,
  TableCheckbox,
  TableControls,
  TableEmptyState,
  TableGrid,
  TableHeader,
  TableHeaderCell,
  TableMain,
  TableSearch,
  TableTitleBlock,
  TableTop,
} from "@/components/shared/table/Table";
import StatusBadge from "@/components/ui/badge/StatusBadge";
import Button from "@/components/ui/button/Button";
import RefreshButton from "@/components/ui/button/RefreshButton";
import FloatingInput from "@/components/ui/input/FloatingInput";
import FormFieldInput from "@/components/ui/input/FormFieldInput";
import ListBox from "@/components/ui/listbox/ListBox";
import Modal from "@/components/ui/modal/Modal";
import {
  queueDepartmentOptions,
  queueFormDefaults,
  queueModalTabs,
  queueRoleOptions,
  queueTableColumns,
  type QueueModalTab,
  type QueueSortKey,
  type QueueStatus,
  type QueueTableItem,
} from "@/lib/mock-data/Admin/queues";
import { apiGet } from "@/services/api";
import {
  CheckCircle2,
  Clock3,
  ListChecks,
  Maximize2,
  Minimize2,
  PauseCircle,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RiAddLine } from "react-icons/ri";

type SortDir = "asc" | "desc";
type QueueStatusFilter = "all" | "active" | "paused";
type QueueTypeFilter = "all" | "managed" | "secure-release";
type PendingJobsFilter = "all" | "has-pending" | "no-pending";

const columnsClassName =
  "[grid-template-columns:72px_minmax(250px,1.5fr)_minmax(170px,1fr)_minmax(230px,1.2fr)_minmax(200px,1.1fr)_minmax(150px,0.8fr)_minmax(130px,0.7fr)_minmax(120px,0.7fr)_minmax(150px,0.9fr)]";

type QueuePrinterOption = {
  id: string;
  name: string;
  location: string;
};

type AdminQueuesResponse = {
  queues: QueueTableItem[];
};

type AdminPrintersResponse = {
  printers: Array<{
    id: string;
    name: string;
    location: string;
    building?: string;
    room?: string;
  }>;
};

type AdminGroupsResponse = {
  groups: Array<{
    id: string;
    name: string;
  }>;
};

const typeOptions = [
  "Secure Release Queue",
  "Secure Release",
  "Direct Print",
  "Faculty",
  "Department-based",
  "General",
];

const statusOptions: QueueStatus[] = ["Active", "Inactive", "Disabled"];

const queueStatusFilterOptions: Array<{
  value: QueueStatusFilter;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
];

const queueTypeFilterOptions: Array<{
  value: QueueTypeFilter;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "managed", label: "Managed Queue" },
  { value: "secure-release", label: "Secure Release" },
];

const pendingJobsFilterOptions: Array<{
  value: PendingJobsFilter;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "has-pending", label: "Has Pending Jobs" },
  { value: "no-pending", label: "No Pending Jobs" },
];

const formatRetention = (hours: number) => `${hours}h`;

const isSecureReleaseQueue = (queue: QueueTableItem) =>
  queue.secureRelease || queue.type.toLowerCase().includes("secure release");

const queueTypeBadgeStyle = (secureRelease: boolean): React.CSSProperties =>
  secureRelease
    ? {
        borderColor:
          "color-mix(in srgb, var(--color-brand-600) 24%, transparent)",
        background:
          "color-mix(in srgb, var(--color-brand-500) 11%, var(--surface))",
        color: "color-mix(in srgb, var(--color-brand-700) 82%, var(--title))",
      }
    : {
        borderColor:
          "color-mix(in srgb, var(--color-support-500) 22%, transparent)",
        background:
          "color-mix(in srgb, var(--color-support-500) 10%, var(--surface))",
        color: "color-mix(in srgb, var(--color-support-700) 76%, var(--title))",
      };

const getQueueStatusMeta = (status: string) => {
  if (status === "Active") {
    return { label: "Active", tone: "success" as const };
  }

  if (status === "Inactive") {
    return { label: "Paused", tone: "warning" as const };
  }

  if (status === "Disabled") {
    return { label: "Disabled", tone: "inactive" as const };
  }

  return {
    label: status || "Unknown",
    tone: "inactive" as const,
  };
};

function QueueTypeBadge({
  type,
  compact = false,
  secureRelease,
}: {
  type: string;
  compact?: boolean;
  secureRelease?: boolean;
}) {
  const isSecure =
    secureRelease ?? type.toLowerCase().includes("secure release");
  const label = compact
    ? isSecure
      ? "Secure Release"
      : "Managed Queue"
    : type;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border font-semibold",
        compact
          ? "max-w-[150px] px-3 py-1 text-xs leading-5"
          : "max-w-[220px] px-3 py-1.5 text-sm",
      )}
      style={queueTypeBadgeStyle(isSecure)}
      title={type}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}

function QueueStatusBadge({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  const meta = getQueueStatusMeta(status);

  return (
    <StatusBadge label={meta.label} tone={meta.tone} className={className} />
  );
}

function EditField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[var(--paragraph)]">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={cn(
        "relative inline-flex h-8 w-14 items-center rounded-full transition",
        checked ? "bg-brand-500" : "bg-[var(--surface-2)]",
      )}
    >
      <span
        className={cn(
          "absolute left-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-6" : "translate-x-0",
        )}
      />
    </button>
  );
}

function AccessRuleField({
  label,
  value,
  onValueChange,
  onAdd,
  options,
  items,
  onRemove,
  placeholder,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  onAdd: () => void;
  options: string[];
  items: string[];
  onRemove: (item: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-[var(--paragraph)]">
        {label}
      </label>

      <div className="flex items-start gap-3">
        <ListBox
          value={value}
          onValueChange={onValueChange}
          options={options}
          placeholder={placeholder}
          triggerClassName="h-14 px-4"
          maxHeightClassName="max-h-60"
          ariaLabel={label}
        />

        <button
          type="button"
          onClick={onAdd}
          className="flex h-14 w-14 items-center justify-center rounded-md border transition"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-2)] px-3 py-1 text-sm text-[var(--paragraph)]"
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(item)}
                className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AccessRuleFieldInput({
  label,
  value,
  onValueChange,
  onAdd,
  items,
  onRemove,
  placeholder,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  onAdd: () => void;
  items: string[];
  onRemove: (item: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-[var(--paragraph)]">
        {label}
      </label>

      <div className="flex gap-3">
        <input
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          className="h-14 flex-1 rounded-md border bg-[var(--surface)] px-4 text-sm outline-none transition"
          style={{
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        />

        <button
          type="button"
          onClick={onAdd}
          className="flex h-14 w-14 items-center justify-center rounded-md border transition"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-2)] px-3 py-1 text-sm text-[var(--paragraph)]"
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(item)}
                className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PrinterSelectionList({
  printerOptions,
  selectedPrinters,
  onToggle,
}: {
  printerOptions: QueuePrinterOption[];
  selectedPrinters: string[];
  onToggle: (printerName: string) => void;
}) {
  return (
    <div className="max-h-[280px] overflow-y-auto rounded-md border border-[var(--border)] p-3 scrollbar-none">
      <div className="space-y-3">
        {printerOptions.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-[var(--muted)]">
            No printers found.
          </p>
        ) : (
          printerOptions.map((printer) => {
          const checked = selectedPrinters.includes(printer.name);

          return (
            <div
              key={printer.id}
              onClick={() => onToggle(printer.name)}
              className="flex w-full cursor-pointer items-center justify-between rounded-md border border-[var(--border)] px-4 py-3 text-left transition hover:bg-[var(--surface-2)]"
            >
              <div className="flex items-center gap-4">
                <TableCheckbox
                  checked={checked}
                  onToggle={() => onToggle(printer.name)}
                />

                <span className="text-sm font-medium text-[var(--title)]">
                  {printer.name}
                </span>
              </div>

              <span className="text-sm text-[var(--muted)]">
                {printer.location}
              </span>
            </div>
          );
        }))}
      </div>
    </div>
  );
}

function QueueEditorModal({
  open,
  title,
  queue,
  activeTab,
  printerOptions,
  groupOptions,
  onTabChange,
  onClose,
  onSave,
}: {
  open: boolean;
  title: string;
  queue: QueueTableItem | null;
  activeTab: QueueModalTab;
  printerOptions: QueuePrinterOption[];
  groupOptions: string[];
  onTabChange: (value: QueueModalTab) => void;
  onClose: () => void;
  onSave: (queue: QueueTableItem) => void;
}) {
  const [draft, setDraft] = useState<QueueTableItem | null>(queue);

  const [selectedRole, setSelectedRole] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedRestrictedUser, setSelectedRestrictedUser] = useState("");
  const [printerSearch, setPrinterSearch] = useState("");
  const selectedPrinterNames = draft?.assignedPrinters;
  const filteredPrinterOptions = useMemo(() => {
    const term = printerSearch.trim().toLowerCase();
    const selectedNames = new Set(selectedPrinterNames ?? []);

    if (!term) {
      return printerOptions;
    }

    return printerOptions.filter(
      (printer) =>
        selectedNames.has(printer.name) ||
        printer.name.toLowerCase().includes(term) ||
        printer.location.toLowerCase().includes(term),
    );
  }, [printerOptions, printerSearch, selectedPrinterNames]);

  if (!draft) return null;

  const updateDraft = <K extends keyof QueueTableItem>(
    key: K,
    value: QueueTableItem[K],
  ) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const togglePrinter = (printerName: string) => {
    const exists = draft.assignedPrinters.includes(printerName);
    const nextAssigned = exists
      ? draft.assignedPrinters.filter((item) => item !== printerName)
      : [...draft.assignedPrinters, printerName];

    setDraft((prev) =>
      prev
        ? {
            ...prev,
            assignedPrinters: nextAssigned,
            defaultPrinter: nextAssigned.includes(prev.defaultPrinter)
              ? prev.defaultPrinter
              : nextAssigned[0] || "",
          }
        : prev,
    );
  };

  const addChip = (
    field:
      | "allowedRoles"
      | "allowedGroups"
      | "allowedDepartments"
      | "restrictedUsers",
    value: string,
    clear: () => void,
  ) => {
    const clean = value.trim();
    if (!clean) return;

    setDraft((prev) =>
      prev
        ? {
            ...prev,
            [field]: Array.from(new Set([...(prev[field] as string[]), clean])),
          }
        : prev,
    );

    clear();
  };

  const removeChip = (
    field:
      | "allowedRoles"
      | "allowedGroups"
      | "allowedDepartments"
      | "restrictedUsers",
    value: string,
  ) => {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            [field]: (prev[field] as string[]).filter((item) => item !== value),
          }
        : prev,
    );
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[min(92vw,980px)] space-y-6">
        <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="title-md">{draft.name || title}</h3>
            <QueueStatusBadge
              status={draft.status}
              className="px-3 py-1.5 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <QueueTypeBadge type={draft.type} />
          </div>
        </div>

        <SegmentToggle
          options={queueModalTabs.map((tab) => ({
            value: tab.value,
            label: tab.label,
            icon: <tab.icon className="h-4 w-4" />,
          }))}
          value={activeTab}
          onChange={(value) => onTabChange(value as QueueModalTab)}
          className="w-full overflow-x-auto scrollbar-none"
          buttonClassName="px-4 py-3 text-sm"
        />

        <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5">
          {activeTab === "basic-info" && (
            <div className="grid gap-5">
              <FormFieldInput
                label="Queue Name"
                value={draft.name}
                onChange={(value) => updateDraft("name", value)}
                placeholder="Enter queue name"
              />

              <FormFieldInput
                label="Description"
                value={draft.description}
                onChange={(value) => updateDraft("description", value)}
                placeholder="Enter queue description"
                multiline
              />

              <EditField label="Queue Type">
                <ListBox
                  options={typeOptions}
                  value={draft.type}
                  onValueChange={(value) =>
                    updateDraft("type", value as QueueTableItem["type"])
                  }
                  triggerClassName="h-14 w-full px-4 text-left"
                  contentClassName="w-full"
                  ariaLabel="Queue type"
                />
              </EditField>

              <EditField label="Status">
                <ListBox
                  options={statusOptions}
                  value={draft.status}
                  onValueChange={(value) =>
                    updateDraft("status", value as QueueStatus)
                  }
                  triggerClassName="h-14 w-full px-4 text-left"
                  contentClassName="w-full"
                  ariaLabel="Queue status"
                />
              </EditField>
            </div>
          )}

          {activeTab === "printers" && (
            <div className="space-y-5">
              <FloatingInput
                id={`queue-printer-search-${draft.id}`}
                label="Search printers..."
                value={printerSearch}
                onChange={(event) => setPrinterSearch(event.target.value)}
                icon={<Search className="h-5 w-5" />}
                wrapperClassName="h-14"
              />

              <EditField label="Assigned Printers">
                <PrinterSelectionList
                  printerOptions={filteredPrinterOptions}
                  selectedPrinters={draft.assignedPrinters}
                  onToggle={togglePrinter}
                />
              </EditField>
            </div>
          )}

          {activeTab === "access-rules" && (
            <div className="space-y-6">
              <AccessRuleField
                label="Allowed Roles"
                placeholder="Select role"
                value={selectedRole}
                onValueChange={setSelectedRole}
                onAdd={() =>
                  addChip("allowedRoles", selectedRole, () =>
                    setSelectedRole(""),
                  )
                }
                options={queueRoleOptions}
                items={draft.allowedRoles}
                onRemove={(item) => removeChip("allowedRoles", item)}
              />

              <AccessRuleField
                label="Allowed Groups"
                placeholder="Select group"
                value={selectedGroup}
                onValueChange={setSelectedGroup}
                onAdd={() =>
                  addChip("allowedGroups", selectedGroup, () =>
                    setSelectedGroup(""),
                  )
                }
                options={groupOptions}
                items={draft.allowedGroups}
                onRemove={(item) => removeChip("allowedGroups", item)}
              />

              <AccessRuleField
                label="Allowed Departments"
                placeholder="Select department"
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
                onAdd={() =>
                  addChip("allowedDepartments", selectedDepartment, () =>
                    setSelectedDepartment(""),
                  )
                }
                options={queueDepartmentOptions}
                items={draft.allowedDepartments}
                onRemove={(item) => removeChip("allowedDepartments", item)}
              />

              <AccessRuleFieldInput
                label="Restricted Users"
                placeholder="user@example.com"
                value={selectedRestrictedUser}
                onValueChange={setSelectedRestrictedUser}
                onAdd={() =>
                  addChip("restrictedUsers", selectedRestrictedUser, () =>
                    setSelectedRestrictedUser(""),
                  )
                }
                items={draft.restrictedUsers}
                onRemove={(item) => removeChip("restrictedUsers", item)}
              />
            </div>
          )}

          {activeTab === "retention" && (
            <div className="space-y-5">
              <FormFieldInput
                label="Retention Period (hours)"
                type="number"
                value={String(draft.retentionHours)}
                onChange={(value) =>
                  updateDraft("retentionHours", Number(value) || 0)
                }
                placeholder="Enter retention period"
              />

              <div className="flex items-center justify-between gap-5 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
                <div>
                  <p className="font-medium text-[var(--title)]">
                    Auto-delete Expired Jobs
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Automatically remove jobs after retention period.
                  </p>
                </div>

                <ToggleSwitch
                  checked={draft.autoDeleteExpiredJobs}
                  onChange={() =>
                    updateDraft(
                      "autoDeleteExpiredJobs",
                      !draft.autoDeleteExpiredJobs,
                    )
                  }
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="primary" onClick={() => onSave(draft)}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}

const PrintQueuesTable = () => {
  const [queues, setQueues] = useState<QueueTableItem[]>([]);
  const [printerOptions, setPrinterOptions] = useState<QueuePrinterOption[]>([]);
  const [groupOptions, setGroupOptions] = useState<string[]>([]);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");

  const [sortKey, setSortKey] = useState<QueueSortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [statusFilter, setStatusFilter] = useState<QueueStatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<QueueTypeFilter>("all");
  const [pendingJobsFilter, setPendingJobsFilter] =
    useState<PendingJobsFilter>("all");
  const [isTableExpanded, setIsTableExpanded] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [openQueue, setOpenQueue] = useState<QueueTableItem | null>(null);
  const [openQueueTab, setOpenQueueTab] = useState<QueueModalTab>("basic-info");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addQueueTab, setAddQueueTab] = useState<QueueModalTab>("basic-info");
  const [newQueue, setNewQueue] = useState<QueueTableItem | null>(null);

  const loadQueues = useCallback((shouldUpdate: () => boolean = () => true) => {
    Promise.allSettled([
      apiGet<AdminQueuesResponse>("/admin/queues", "admin"),
      apiGet<AdminPrintersResponse>("/admin/printers", "admin"),
      apiGet<AdminGroupsResponse>("/admin/groups", "admin"),
    ]).then(([queuesResult, printersResult, groupsResult]) => {
      if (!shouldUpdate()) {
        return;
      }

      if (queuesResult.status === "fulfilled") {
        setQueues(
          Array.isArray(queuesResult.value?.queues)
            ? queuesResult.value.queues
            : [],
        );
        setLoadError("");
      } else {
        setQueues([]);
        setLoadError("Unable to load live queue data right now.");
      }

      if (printersResult.status === "fulfilled") {
        const nextPrinterOptions = Array.isArray(printersResult.value?.printers)
          ? printersResult.value.printers.map((printer) => ({
              id: printer.id,
              name: printer.name,
              location:
                printer.location ||
                [printer.building, printer.room ? `Room ${printer.room}` : ""]
                  .filter(Boolean)
                  .join(", ") ||
                "No location set",
            }))
          : [];

        setPrinterOptions(nextPrinterOptions);
      } else {
        setPrinterOptions([]);
      }

      if (groupsResult.status === "fulfilled") {
        setGroupOptions(
          Array.isArray(groupsResult.value?.groups)
            ? groupsResult.value.groups.map((group) => group.name).filter(Boolean)
            : [],
        );
      } else {
        setGroupOptions([]);
      }
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    loadQueues(() => mounted);

    return () => {
      mounted = false;
    };
  }, [loadQueues]);

  const handleSort = (key: QueueSortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir("asc");
  };

  const filteredQueues = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...queues]
      .filter((queue) => {
        const matchesSearch =
          !term ||
          queue.name.toLowerCase().includes(term) ||
          queue.type.toLowerCase().includes(term) ||
          queue.status.toLowerCase().includes(term) ||
          queue.assignedPrinters.join(" ").toLowerCase().includes(term) ||
          queue.allowedGroups.join(" ").toLowerCase().includes(term);

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && queue.status === "Active") ||
          (statusFilter === "paused" && queue.status !== "Active");

        const matchesType =
          typeFilter === "all" ||
          (typeFilter === "secure-release" && isSecureReleaseQueue(queue)) ||
          (typeFilter === "managed" && !isSecureReleaseQueue(queue));

        const matchesPendingJobs =
          pendingJobsFilter === "all" ||
          (pendingJobsFilter === "has-pending" && queue.pendingJobs > 0) ||
          (pendingJobsFilter === "no-pending" && queue.pendingJobs === 0);

        return (
          matchesSearch &&
          matchesStatus &&
          matchesType &&
          matchesPendingJobs
        );
      })
      .sort((a, b) => {
        const getSortValue = (item: QueueTableItem) => {
          switch (sortKey) {
            case "name":
              return item.name.toLowerCase();
            case "type":
              return item.type.toLowerCase();
            case "assignedPrinters":
              return item.assignedPrinters.join(", ").toLowerCase();
            case "allowedGroups":
              return item.allowedGroups.join(", ").toLowerCase();
            case "status":
              return item.status.toLowerCase();
            case "pendingJobs":
              return item.pendingJobs;
            case "retentionHours":
              return item.retentionHours;
            case "secureRelease":
              return Number(item.secureRelease);
            default:
              return item.name.toLowerCase();
          }
        };

        const aValue = getSortValue(a);
        const bValue = getSortValue(b);

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDir === "asc" ? aValue - bValue : bValue - aValue;
        }

        return sortDir === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
  }, [
    pendingJobsFilter,
    queues,
    search,
    sortDir,
    sortKey,
    statusFilter,
    typeFilter,
  ]);

  const queueStats = useMemo(() => {
    const activeQueues = queues.filter(
      (queue) => queue.status === "Active",
    ).length;
    const pausedQueues = queues.filter(
      (queue) => queue.status !== "Active",
    ).length;
    const totalPendingJobs = queues.reduce(
      (total, queue) => total + queue.pendingJobs,
      0,
    );
    const secureReleaseQueues = queues.filter(isSecureReleaseQueue).length;

    return {
      activeQueues,
      pausedQueues,
      secureReleaseQueues,
      totalPendingJobs,
      totalQueues: queues.length,
    };
  }, [queues]);

  const activeFilterCount = [
    statusFilter !== "all",
    typeFilter !== "all",
    pendingJobsFilter !== "all",
  ].filter(Boolean).length;

  const kpiCards = [
    {
      title: "Total Queues",
      value: queueStats.totalQueues.toLocaleString(),
      helper: `${filteredQueues.length.toLocaleString()} visible in current view`,
      icon: <ListChecks className="h-4 w-4" />,
    },
    {
      title: "Active Queues",
      value: queueStats.activeQueues.toLocaleString(),
      helper: "Ready to accept jobs",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
      title: "Paused Queues",
      value: queueStats.pausedQueues.toLocaleString(),
      helper: "Inactive or disabled queues",
      icon: <PauseCircle className="h-4 w-4" />,
    },
    {
      title: "Pending Jobs",
      value: queueStats.totalPendingJobs.toLocaleString(),
      helper: "Jobs waiting across queues",
      icon: <Clock3 className="h-4 w-4" />,
    },
    {
      title: "Secure Release",
      value: queueStats.secureReleaseQueues.toLocaleString(),
      helper: "Queues requiring release controls",
      icon: <ShieldCheck className="h-4 w-4" />,
    },
  ];

  const visibleIds = filteredQueues.map((queue) => queue.id);

  const isAllSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
      return;
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const openAddModal = () => {
    setNewQueue({
      ...queueFormDefaults,
      id: `queue-${Date.now()}`,
    });
    setAddQueueTab("basic-info");
    setIsAddModalOpen(true);
  };

  const handleSaveQueueChanges = (updatedQueue: QueueTableItem) => {
    setQueues((prev) =>
      prev.map((queue) =>
        queue.id === updatedQueue.id ? updatedQueue : queue,
      ),
    );
    setOpenQueue(updatedQueue);
  };

  const handleSaveNewQueue = (createdQueue: QueueTableItem) => {
    const normalized: QueueTableItem = {
      ...createdQueue,
      id: createdQueue.id || `queue-${Date.now()}`,
      name: createdQueue.name.trim() || "Untitled Queue",
      description: createdQueue.description.trim() || "No description provided",
      defaultPrinter:
        createdQueue.defaultPrinter || createdQueue.assignedPrinters[0] || "",
      autoDeleteExpiredJobs: createdQueue.autoDeleteExpiredJobs ?? true,
    };

    setQueues((prev) => [normalized, ...prev]);
    setIsAddModalOpen(false);
    setNewQueue(null);
  };

  const renderQueuesTable = (expanded = false) => (
    <Table
      className={`flex min-h-[520px] flex-col ${
        expanded ? "h-dvh !rounded-none" : "max-h-[calc(100vh-20rem)]"
      }`}
    >
      <TableTop
        className={`shrink-0 ${expanded ? "bg-[var(--surface)]" : ""}`}
      >
        <TableTitleBlock title="Print Queues" />

        <TableControls>
          <TableSearch
            id={
              expanded ? "search-print-queues-expanded" : "search-print-queues"
            }
            label="Search queues..."
            value={search}
            onChange={setSearch}
          />

          <RefreshButton className="h-14" onClick={() => loadQueues()} />

          <ListBox
            options={[]}
            placeholder={
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filter</span>
                {activeFilterCount > 0 ? (
                  <span
                    className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold"
                    style={{
                      background: "rgba(var(--brand-rgb), 0.12)",
                      color: "var(--color-brand-600)",
                    }}
                  >
                    {activeFilterCount}
                  </span>
                ) : null}
              </span>
            }
            className="w-auto"
            triggerClassName="h-14 min-w-[150px] px-6 text-base [&>span]:text-base"
            contentClassName="w-[380px]"
            maxHeightClassName=""
            align="right"
            ariaLabel="Filter print queues"
          >
              <div className="space-y-4 p-2">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Status
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    {queueStatusFilterOptions.map((option) => {
                      const isSelected = statusFilter === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setStatusFilter(option.value)}
                          className="rounded-md border px-3 py-2 text-left text-sm font-semibold transition"
                          style={{
                            background: isSelected
                              ? "rgba(var(--brand-rgb), 0.1)"
                              : "var(--surface-2)",
                            borderColor: isSelected
                              ? "color-mix(in srgb, var(--color-brand-500) 36%, var(--border))"
                              : "var(--border)",
                            color: isSelected
                              ? "var(--color-brand-600)"
                              : "var(--paragraph)",
                          }}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Type
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {queueTypeFilterOptions.map((option) => {
                      const isSelected = typeFilter === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setTypeFilter(option.value)}
                          className="rounded-md border px-3 py-2 text-left text-sm font-semibold transition"
                          style={{
                            background: isSelected
                              ? "rgba(var(--brand-rgb), 0.1)"
                              : "var(--surface-2)",
                            borderColor: isSelected
                              ? "color-mix(in srgb, var(--color-brand-500) 36%, var(--border))"
                              : "var(--border)",
                            color: isSelected
                              ? "var(--color-brand-600)"
                              : "var(--paragraph)",
                          }}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Pending Jobs
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {pendingJobsFilterOptions.map((option) => {
                      const isSelected = pendingJobsFilter === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPendingJobsFilter(option.value)}
                          className="rounded-md border px-3 py-2 text-left text-sm font-semibold transition"
                          style={{
                            background: isSelected
                              ? "rgba(var(--brand-rgb), 0.1)"
                              : "var(--surface-2)",
                            borderColor: isSelected
                              ? "color-mix(in srgb, var(--color-brand-500) 36%, var(--border))"
                              : "var(--border)",
                            color: isSelected
                              ? "var(--color-brand-600)"
                              : "var(--paragraph)",
                          }}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {activeFilterCount > 0 ? (
                  <Button
                    variant="outline"
                    className="h-11 w-full text-sm"
                    onClick={() => {
                      setStatusFilter("all");
                      setTypeFilter("all");
                      setPendingJobsFilter("all");
                    }}
                  >
                    Reset Filters
                  </Button>
                ) : null}
              </div>
          </ListBox>

          <Button
            variant="primary"
            className="h-14 px-6 text-base"
            iconLeft={<RiAddLine className="h-5 w-5" />}
            onClick={openAddModal}
          >
            Add Queue
          </Button>

          <button
            type="button"
            onClick={() => setIsTableExpanded(!expanded)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-transparent text-[var(--muted)] transition hover:text-[var(--color-brand-500)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)]"
            aria-label={
              expanded ? "Collapse queues table" : "Expand queues table"
            }
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </button>
        </TableControls>
      </TableTop>

      {loadError ? (
        <div className="px-6 pb-2">
          <p
            className="rounded-xl border px-4 py-3 text-sm"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-brand-600) 24%, transparent)",
              background:
                "color-mix(in srgb, var(--color-brand-500) 10%, var(--surface))",
              color:
                "color-mix(in srgb, var(--color-brand-700) 82%, var(--title))",
            }}
          >
            {loadError}
          </p>
        </div>
      ) : null}

      <TableMain className="min-h-0 flex-1">
        <TableGrid minWidthClassName="flex h-full min-w-[1350px] flex-col">
          <TableHeader columnsClassName={columnsClassName}>
            <TableCell className="justify-center">
              <TableCheckbox
                checked={isAllSelected}
                onToggle={toggleSelectAll}
              />
            </TableCell>

            {queueTableColumns.map((column) => (
              <TableHeaderCell
                key={column.key}
                label={column.label}
                sortable={column.sortable}
                active={sortKey === column.key}
                direction={sortDir}
                onClick={() => handleSort(column.key)}
              />
            ))}
          </TableHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <TableBody>
              {filteredQueues.length === 0 ? (
                <TableEmptyState text="No queues found" />
              ) : (
                filteredQueues.map((queue) => {
                  const isSelected = selectedIds.includes(queue.id);

                  return (
                    <div
                      key={queue.id}
                      onClick={() => {
                        setOpenQueue(queue);
                        setOpenQueueTab("basic-info");
                      }}
                      className={cn(
                        "grid cursor-pointer border-b border-[var(--border)] px-6 py-5 transition last:border-b-0 hover:bg-brand-50/30",
                        columnsClassName,
                      )}
                    >
                      <TableCell className="justify-center">
                        <TableCheckbox
                          checked={isSelected}
                          onToggle={() => toggleRowSelection(queue.id)}
                        />
                      </TableCell>

                      <TableCell className="text-base font-semibold text-[var(--title)]">
                        {queue.name}
                      </TableCell>

                      <TableCell>
                        <QueueTypeBadge
                          type={queue.type}
                          compact
                          secureRelease={isSecureReleaseQueue(queue)}
                        />
                      </TableCell>

                      <TableCell className="paragraph">
                        {queue.assignedPrinters.join(", ")}
                      </TableCell>

                      <TableCell className="paragraph">
                        {queue.allowedGroups.length > 0
                          ? queue.allowedGroups.join(", ")
                          : "—"}
                      </TableCell>

                      <TableCell>
                        <QueueStatusBadge
                          status={queue.status}
                          className="px-3 py-1.5 text-sm"
                        />
                      </TableCell>

                      <TableCell className="text-base font-medium text-[var(--paragraph)]">
                        {queue.pendingJobs}
                      </TableCell>

                      <TableCell className="text-base font-medium text-[var(--paragraph)]">
                        {formatRetention(queue.retentionHours)}
                      </TableCell>

                      <TableCell>
                        <StatusBadge
                          label={queue.secureRelease ? "Enabled" : "Disabled"}
                          tone={queue.secureRelease ? "success" : "inactive"}
                          className="px-3 py-1.5 text-sm"
                        />
                      </TableCell>
                    </div>
                  );
                })
              )}
            </TableBody>
          </div>
        </TableGrid>
      </TableMain>
    </Table>
  );

  return (
    <>
      <FullscreenTablePortal open={isTableExpanded}>
        {renderQueuesTable(true)}
      </FullscreenTablePortal>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {kpiCards.map((card, index) => (
            <KpiMetricCard
              key={card.title}
              title={card.title}
              value={card.value}
              helper={card.helper}
              icon={card.icon}
              index={index}
            />
          ))}
        </div>

        {renderQueuesTable()}
      </div>

      <QueueEditorModal
        key={openQueue?.id ?? "edit-queue-closed"}
        open={Boolean(openQueue)}
        title="Edit Queue"
        queue={openQueue}
        activeTab={openQueueTab}
        printerOptions={printerOptions}
        groupOptions={groupOptions}
        onTabChange={setOpenQueueTab}
        onClose={() => setOpenQueue(null)}
        onSave={handleSaveQueueChanges}
      />

      <QueueEditorModal
        key={newQueue?.id ?? "add-queue-closed"}
        open={isAddModalOpen && Boolean(newQueue)}
        title="Add Queue"
        queue={newQueue}
        activeTab={addQueueTab}
        printerOptions={printerOptions}
        groupOptions={groupOptions}
        onTabChange={setAddQueueTab}
        onClose={() => {
          setIsAddModalOpen(false);
          setNewQueue(null);
        }}
        onSave={handleSaveNewQueue}
      />
    </>
  );
};

export default PrintQueuesTable;
