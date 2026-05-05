// "use client";

// import React from "react";
// import {
//   CalendarClock,
//   CircleDollarSign,
//   Lock,
//   LockOpen,
//   Users,
//   WalletCards,
// } from "lucide-react";
// import Modal from "@/components/ui/modal/Modal";
// import Button from "@/components/ui/button/Button";
// import StatusBadge from "@/components/ui/badge/StatusBadge";
// import { GroupItem } from "@/lib/mock-data/Admin/groups";

// type GroupDetailsModalProps = {
//   open: boolean;
//   onClose: () => void;
//   group: GroupItem | null;
// };

// const formatMoney = (value: number) => value.toFixed(2);

// function InfoCard({
//   icon,
//   label,
//   value,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value: React.ReactNode;
// }) {
//   return (
//     <div className="card p-4">
//       <div className="mb-2 flex items-center gap-2">
//         {icon}
//         <p className="paragraph font-medium">{label}</p>
//       </div>
//       <p className="title-md">{value}</p>
//     </div>
//   );
// }

// const GroupDetailsModal = ({
//   open,
//   onClose,
//   group,
// }: GroupDetailsModalProps) => {
//   if (!group) return null;

//   const isUnlocked = group.restricted === "Unlocked";

//   return (
//     <Modal open={open} onClose={onClose}>
//       <div className="max-h-[85vh] overflow-y-auto pr-4 sm:pr-8">
//         <div className="mb-6 space-y-2">
//           <h3 className="title-md">{group.name}</h3>
//           <p className="paragraph">
//             View group details, quota schedule, default user settings, and quick
//             actions for members.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//           <InfoCard
//             icon={<Users className="h-5 w-5 text-[var(--color-brand-500)]" />}
//             label="Member Count"
//             value={group.members}
//           />

//           <div className="card p-4">
//             <div className="mb-2 flex items-center gap-2">
//               {isUnlocked ? (
//                 <LockOpen className="h-5 w-5 text-[var(--color-success-500)]" />
//               ) : (
//                 <Lock className="h-5 w-5 text-[var(--color-danger-500)]" />
//               )}
//               <p className="paragraph font-medium">Initially Restricted</p>
//             </div>

//             <StatusBadge
//               label={group.restricted}
//               tone={isUnlocked ? "success" : "danger"}
//             />
//           </div>

//           <InfoCard
//             icon={
//               <CircleDollarSign className="h-5 w-5 text-[var(--color-brand-500)]" />
//             }
//             label="Initial Credit"
//             value={formatMoney(group.initialCredit)}
//           />

//           <InfoCard
//             icon={
//               <CalendarClock className="h-5 w-5 text-[var(--color-brand-500)]" />
//             }
//             label="Schedule Amount"
//             value={formatMoney(group.scheduleAmount)}
//           />

//           <InfoCard
//             icon={
//               <WalletCards className="h-5 w-5 text-[var(--color-brand-500)]" />
//             }
//             label="Schedule Period"
//             value={group.period}
//           />

//           <InfoCard
//             icon={<Users className="h-5 w-5 text-[var(--color-brand-500)]" />}
//             label="Members View"
//             value="Available"
//           />
//         </div>

//         <div className="mt-4 card space-y-4 p-5">
//           <div>
//             <h4 className="title-sm text-[var(--title)]">
//               Group Member Actions
//             </h4>
//             <p className="paragraph">
//               Open members, reset usage counters, or apply bulk changes to this
//               group.
//             </p>
//           </div>

//           <div className="flex flex-wrap gap-3">
//             <Button variant="primary" className="h-12 px-5">
//               View Group Members
//             </Button>
//             <Button variant="outline" className="h-12 px-5">
//               Reset Member Statistics
//             </Button>
//             <Button variant="outline" className="h-12 px-5">
//               Bulk Adjust Balances
//             </Button>
//             <Button variant="outline" className="h-12 px-5">
//               Change Restrictions
//             </Button>
//           </div>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// export default GroupDetailsModal;

//=============new===================
// GroupDetailsModal.tsx
"use client";

import {
  GroupItem,
  GroupRestrictedStatus,
  groupPeriodOptions,
} from "@/lib/mock-data/Admin/groups";
import SegmentToggle, {
  SegmentOption,
} from "@/components/shared/actions/SegmentToggle";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import ListBox from "@/components/ui/listbox/ListBox";
import Modal from "@/components/ui/modal/Modal";
import { Lock, LockOpen } from "lucide-react";
import { useEffect, useState } from "react";

type GroupDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  group: GroupItem | null;
  onSave: (group: GroupItem) => void;
};

const restrictionOptions: SegmentOption[] = [
  {
    value: "Unrestricted",
    label: "Unrestricted",
    icon: <LockOpen className="h-4 w-4" />,
  },
  {
    value: "Restricted",
    label: "Restricted",
    icon: <Lock className="h-4 w-4" />,
  },
];

const GroupDetailsModal = ({
  open,
  onClose,
  group,
  onSave,
}: GroupDetailsModalProps) => {
  const [form, setForm] = useState<GroupItem | null>(group);

  useEffect(() => {
    let isActive = true;
    queueMicrotask(() => {
      if (isActive) {
        setForm(group);
      }
    });

    return () => {
      isActive = false;
    };
  }, [group]);

  if (!form) return null;

  const updateField = <K extends keyof GroupItem>(
    key: K,
    value: GroupItem[K]
  ) => setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleSave = () => {
    if (!form) return;
    onSave(form);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[min(100%,1040px)] pr-2 sm:pr-4">
        <div className="mb-6 space-y-2">
          <h3 className="title-md">Group Details</h3>
          <p className="paragraph">
            Update the group information, quota schedule, and restriction state.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="card space-y-4 p-5">
            <h4
              className="text-xl font-semibold"
              style={{ color: "var(--title)" }}
            >
              Basic Information
            </h4>

            <div className="space-y-2">
              <label className="paragraph font-medium">Group Name</label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Enter group name"
              />
            </div>

            <div className="space-y-2">
              <label className="paragraph font-medium">Members</label>
              <Input
                type="number"
                min={0}
                value={form.members}
                onChange={(e) => updateField("members", Number(e.target.value))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <label className="paragraph font-medium">
                Initially Restricted
              </label>
              <SegmentToggle
                value={form.restricted}
                onChange={(value) =>
                  updateField("restricted", value as GroupRestrictedStatus)
                }
                options={restrictionOptions}
                className="w-full justify-start rounded-2xl p-2"
                buttonClassName="rounded-md px-5 py-3"
              />
            </div>
          </div>

          <div className="card space-y-4 p-5">
            <h4
              className="text-xl font-semibold"
              style={{ color: "var(--title)" }}
            >
              Quota Settings
            </h4>

            <div className="space-y-2">
              <label className="paragraph font-medium">Initial Quota</label>
              <Input
                type="number"
                min={0}
                value={form.initialQuota}
                onChange={(e) =>
                  updateField("initialQuota", Number(e.target.value))
                }
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <label className="paragraph font-medium">
                Scheduled Quota Amount
              </label>
              <Input
                type="number"
                min={0}
                value={form.scheduleAmount}
                onChange={(e) =>
                  updateField("scheduleAmount", Number(e.target.value))
                }
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <label className="paragraph font-medium">Schedule Period</label>
              <ListBox
                options={groupPeriodOptions}
                value={form.period}
                onValueChange={(value) =>
                  updateField("period", value as GroupItem["period"])
                }
                triggerClassName="h-[52px] w-full px-4"
                contentClassName="w-full"
                ariaLabel="Schedule period"
              />
            </div>

            <div className="space-y-2">
              <label className="paragraph font-medium">Notes</label>
              <Input
                value={form.notes ?? ""}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Optional note"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="outline" className="h-12 px-6" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" className="h-12 px-6" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GroupDetailsModal;
