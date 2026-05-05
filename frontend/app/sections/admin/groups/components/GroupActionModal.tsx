// "use client";

// import React, { useState } from "react";
// import Modal from "@/components/ui/modal/Modal";
// import Button from "@/components/ui/button/Button";
// import {
//   Dropdown,
//   DropdownContent,
//   DropdownItem,
//   DropdownTrigger,
// } from "@/components/ui/dropdown/Dropdown";
// import Input from "@/components/ui/input/Input";

// export type GroupActionValue =
//   | "delete-selected"
//   | "export-groups"
//   | "assign-credits"
//   | "set-fixed-credit"
//   | "change-restriction"
//   | "group-summary-report";

// type GroupActionModalProps = {
//   open: boolean;
//   onClose: () => void;
//   action: GroupActionValue | null;
//   selectedCount: number;
// };

// const exportFormatOptions = ["PDF", "CSV", "Excel"];
// const restrictionOptions = ["Unlocked", "Locked"];

// const actionTitleMap: Record<GroupActionValue, string> = {
//   "delete-selected": "Delete Selected Groups",
//   "export-groups": "Export Groups",
//   "assign-credits": "Adjust Credits",
//   "set-fixed-credit": "Set Fixed Credit",
//   "change-restriction": "Change Restriction",
//   "group-summary-report": "Generate Group Summary Report",
// };

// const GroupActionModal = ({
//   open,
//   onClose,
//   action,
//   selectedCount,
// }: GroupActionModalProps) => {
//   const [amount, setAmount] = useState("");
//   const [comment, setComment] = useState("");
//   const [format, setFormat] = useState("PDF");
//   const [restriction, setRestriction] = useState("Unlocked");

//   if (!action) return null;

//   return (
//     <Modal open={open} onClose={onClose}>
//       <div className="space-y-5 pr-8">
//         <div className="space-y-2">
//           <h3 className="title-md">{actionTitleMap[action]}</h3>
//           <p className="paragraph">
//             Selected groups:{" "}
//             <span className="font-semibold text-[var(--foreground)]">
//               {selectedCount}
//             </span>
//           </p>
//         </div>

//         {(action === "assign-credits" || action === "set-fixed-credit") && (
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <label className="paragraph font-medium">
//                 {action === "assign-credits"
//                   ? "Adjust Credit By"
//                   : "Set Credit To"}
//               </label>
//               <Input
//                 type="number"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 placeholder="0.00"
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="paragraph font-medium">
//                 Transaction Comment
//               </label>
//               <Input
//                 value={comment}
//                 onChange={(e) => setComment(e.target.value)}
//                 placeholder="Optional comment"
//               />
//             </div>
//           </div>
//         )}

//         {action === "change-restriction" && (
//           <div className="space-y-2">
//             <label className="paragraph font-medium">Restriction Status</label>
//             <Dropdown value={restriction} onValueChange={setRestriction}>
//               <DropdownTrigger className="input h-[52px] px-4">
//                 {restriction}
//               </DropdownTrigger>
//               <DropdownContent widthClassName="w-full">
//                 {restrictionOptions.map((option) => (
//                   <DropdownItem key={option} value={option}>
//                     {option}
//                   </DropdownItem>
//                 ))}
//               </DropdownContent>
//             </Dropdown>
//           </div>
//         )}

//         {(action === "export-groups" || action === "group-summary-report") && (
//           <div className="space-y-2">
//             <label className="paragraph font-medium">Output Format</label>
//             <Dropdown value={format} onValueChange={setFormat}>
//               <DropdownTrigger className="input h-[52px] px-4">
//                 {format}
//               </DropdownTrigger>
//               <DropdownContent widthClassName="w-full">
//                 {exportFormatOptions.map((option) => (
//                   <DropdownItem key={option} value={option}>
//                     {option}
//                   </DropdownItem>
//                 ))}
//               </DropdownContent>
//             </Dropdown>
//           </div>
//         )}

//         {action === "delete-selected" && (
//           <div className="rounded-md border border-[var(--color-danger-100)] bg-[var(--color-danger-50)] p-4">
//             <p className="paragraph text-[var(--color-danger-600)]">
//               This action will permanently remove the selected groups.
//             </p>
//           </div>
//         )}

//         <div className="flex items-center justify-end gap-3">
//           <Button variant="outline" className="h-12 px-5" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button variant="primary" className="h-12 px-5" onClick={onClose}>
//             Confirm
//           </Button>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// export default GroupActionModal;

// ==========new===========
// GroupActionModal.tsx
"use client";

import { GroupItem } from "@/lib/mock-data/Admin/groups";
import Button from "@/components/ui/button/Button";
import ExpandedButton from "@/components/ui/button/ExpandedButton";
import Input from "@/components/ui/input/Input";
import ListBox from "@/components/ui/listbox/ListBox";
import Modal from "@/components/ui/modal/Modal";
import { FileOutput, Trash2, WalletCards, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type GroupActionValue =
  | "delete-selected"
  | "export-groups"
  | "assign-quota";

type ExportFormat = "PDF" | "CSV" | "Excel";

type GroupActionModalProps = {
  open: boolean;
  onClose: () => void;
  action: GroupActionValue | null;
  selectedGroups: GroupItem[];
  onDelete: (ids: string[]) => void;
  onExport: (ids: string[], format: ExportFormat) => void;
  onAssignQuota: (ids: string[], quota: number, note: string) => void;
};

const exportFormatOptions: ExportFormat[] = ["PDF", "CSV", "Excel"];

const GroupActionModal = ({
  open,
  onClose,
  action,
  selectedGroups,
  onDelete,
  onExport,
  onAssignQuota,
}: GroupActionModalProps) => {
  const [workingIds, setWorkingIds] = useState<string[]>([]);
  const [format, setFormat] = useState<ExportFormat>("PDF");
  const [quota, setQuota] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;

    let isActive = true;
    queueMicrotask(() => {
      if (!isActive) return;

      setWorkingIds(selectedGroups.map((group) => group.id));
      setFormat("PDF");
      setQuota("");
      setNote("");
    });

    return () => {
      isActive = false;
    };
  }, [open, selectedGroups]);

  const workingGroups = useMemo(
    () => selectedGroups.filter((group) => workingIds.includes(group.id)),
    [selectedGroups, workingIds]
  );

  if (!action) return null;

  const removeGroup = (id: string) => {
    setWorkingIds((prev) => prev.filter((item) => item !== id));
  };

  const handleConfirm = () => {
    if (action === "delete-selected") {
      onDelete(workingIds);
      return;
    }

    if (action === "export-groups") {
      onExport(workingIds, format);
      return;
    }

    if (action === "assign-quota") {
      onAssignQuota(workingIds, Number(quota || 0), note);
    }
  };

  const renderHeader = () => {
    if (action === "delete-selected") {
      return {
        icon: <Trash2 className="h-9 w-9 text-[var(--color-danger-500)]" />,
        title: "Delete selected groups",
        description:
          "This action will remove the selected groups from the table. Review the list below and remove any row you do not want to delete.",
        buttonLabel: "Delete",
      };
    }

    if (action === "export-groups") {
      return {
        icon: <FileOutput className="h-9 w-9 text-brand-500" />,
        title: "Export selected groups",
        description:
          "Review the groups to export, remove any row if needed, then choose the export format.",
        buttonLabel: "Export",
      };
    }

    return {
      icon: <WalletCards className="h-9 w-9 text-brand-500" />,
      title: "Assign quota",
      description:
        "Set a new quota value for the selected groups. You can also leave a short note for this update.",
      buttonLabel: "Assign Quota",
    };
  };

  const header = renderHeader();

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[min(100%,1200px)] pr-2 sm:pr-4">
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              {header.icon}
              <h3 className="text-[34px] font-bold leading-none text-[var(--title)]">
                {header.title}
              </h3>
            </div>

            <p className="paragraph max-w-[1100px] text-[17px] sm:text-[18px]">
              {header.description}
            </p>

            <p className="paragraph text-[18px] font-medium">
              Total selected:{" "}
              <span className="font-bold text-[var(--title)]">
                {workingGroups.length}
              </span>
            </p>
          </div>

          <div className="h-px w-full bg-[var(--border)]" />

          <div
            className={`grid gap-6 ${
              action === "delete-selected"
                ? "grid-cols-1"
                : "grid-cols-1 xl:grid-cols-[1.25fr_0.75fr]"
            }`}
          >
            <div
              className="rounded-[32px] border p-5"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border)",
              }}
            >
              {workingGroups.length === 0 ? (
                <div className="paragraph rounded-[24px] px-4 py-8 text-[17px] text-[var(--muted)]">
                  No groups selected.
                </div>
              ) : (
                <div className="max-h-[320px] space-y-3 overflow-y-auto pr-2">
                  {workingGroups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border px-4 py-4"
                      style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-[var(--title)]">
                          {group.name}
                        </p>
                        <p className="text-sm text-[var(--muted)]">
                          {group.members} members · Initial quota{" "}
                          {group.initialQuota}
                        </p>
                      </div>

                      <ExpandedButton
                        id={`remove-${group.id}`}
                        label="Remove"
                        icon={X}
                        variant="danger"
                        onClick={() => removeGroup(group.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {action !== "delete-selected" ? (
              <div
                className="rounded-[32px] border p-5"
                style={{
                  background: "var(--surface-2)",
                  borderColor: "var(--border)",
                }}
              >
                {action === "export-groups" ? (
                  <div className="space-y-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Export Method
                    </p>

                    <ListBox
                      options={exportFormatOptions}
                      value={format}
                      onValueChange={(value) =>
                        setFormat(value as ExportFormat)
                      }
                      triggerClassName="h-[96px] w-full rounded-[24px] px-8 text-[22px] font-medium [&>span]:text-[22px]"
                      contentClassName="w-full"
                      optionClassName="py-4 text-lg"
                      ariaLabel="Export method"
                    />

                    <p className="paragraph text-[18px]">
                      Selected format:{" "}
                      <span className="font-bold text-[var(--title)]">
                        {format}
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        New Quota
                      </p>
                      <Input
                        type="number"
                        value={quota}
                        onChange={(e) => setQuota(e.target.value)}
                        placeholder="Enter new quota"
                        className="h-[88px] px-7 text-[22px]"
                        wrapperClassName="rounded-[24px]"
                      />
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        Comment
                      </p>
                      <Input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Optional note for this quota update"
                        className="h-[88px] px-7 text-[22px]"
                        wrapperClassName="rounded-[24px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-4 pt-2">
            <Button
              variant="outline"
              className="h-14 min-w-[160px] px-8 text-base"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="h-14 min-w-[190px] px-8 text-base"
              onClick={handleConfirm}
            >
              {header.buttonLabel}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GroupActionModal;
