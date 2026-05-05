// "use client";

// import React, { useMemo, useState } from "react";
// import Modal from "@/components/ui/modal/Modal";
// import Button from "@/components/ui/button/Button";
// import {
//   Dropdown,
//   DropdownContent,
//   DropdownItem,
//   DropdownTrigger,
// } from "@/components/ui/dropdown/Dropdown";
// import Input from "@/components/ui/input/Input";

// type AddGroupModalProps = {
//   open: boolean;
//   onClose: () => void;
// };

// const schedulePeriodOptions = ["None", "Daily", "Weekly", "Monthly"];
// const restrictionOptions = ["Unlocked", "Locked"];
// const accountSelectionOptions = [
//   "Auto Select",
//   "Prompt User",
//   "Shared Account",
// ];

// const AddGroupModal = ({ open, onClose }: AddGroupModalProps) => {
//   const [groupName, setGroupName] = useState("");
//   const [initialCredit, setInitialCredit] = useState("");
//   const [initialRestriction, setInitialRestriction] = useState("Unlocked");
//   const [initialOverdraft, setInitialOverdraft] = useState("");
//   const [accountSelection, setAccountSelection] = useState("Auto Select");

//   const [schedulePeriod, setSchedulePeriod] = useState("None");
//   const [scheduleAmount, setScheduleAmount] = useState("");
//   const [accumulationEnabled, setAccumulationEnabled] = useState(false);
//   const [accumulationLimit, setAccumulationLimit] = useState("");

//   const isScheduleEnabled = useMemo(
//     () => schedulePeriod !== "None",
//     [schedulePeriod]
//   );

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onClose();
//   };

//   return (
//     <Modal open={open} onClose={onClose}>
//       <div className="max-h-[85vh] overflow-y-auto pr-4 sm:pr-8">
//         <div className="mb-6 space-y-2">
//           <h3 className="title-md">Add Group</h3>
//           <p className="paragraph">
//             Create a group, define its quota schedule, and configure the default
//             settings applied to newly assigned users.
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="card space-y-4 p-5">
//             <h4 className="title-sm text-[var(--title)]">Basic Information</h4>

//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//               <div className="space-y-2">
//                 <label className="paragraph font-medium">Group Name</label>
//                 <Input
//                   value={groupName}
//                   onChange={(e) => setGroupName(e.target.value)}
//                   placeholder="Enter group name"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label className="paragraph font-medium">
//                   Initially Restricted
//                 </label>
//                 <Dropdown
//                   value={initialRestriction}
//                   onValueChange={setInitialRestriction}
//                 >
//                   <DropdownTrigger className="input h-[52px] px-4">
//                     {initialRestriction}
//                   </DropdownTrigger>
//                   <DropdownContent widthClassName="w-full">
//                     {restrictionOptions.map((option) => (
//                       <DropdownItem key={option} value={option}>
//                         {option}
//                       </DropdownItem>
//                     ))}
//                   </DropdownContent>
//                 </Dropdown>
//               </div>
//             </div>
//           </div>

//           <div className="card space-y-4 p-5">
//             <h4 className="title-sm text-[var(--title)]">
//               Default Settings for New Users
//             </h4>

//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//               <div className="space-y-2">
//                 <label className="paragraph font-medium">Initial Credit</label>
//                 <Input
//                   type="number"
//                   value={initialCredit}
//                   onChange={(e) => setInitialCredit(e.target.value)}
//                   placeholder="0.00"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label className="paragraph font-medium">
//                   Initial Overdraft
//                 </label>
//                 <Input
//                   type="number"
//                   value={initialOverdraft}
//                   onChange={(e) => setInitialOverdraft(e.target.value)}
//                   placeholder="0.00"
//                 />
//               </div>

//               <div className="space-y-2 md:col-span-2">
//                 <label className="paragraph font-medium">
//                   Initial Account Selection Behavior
//                 </label>
//                 <Dropdown
//                   value={accountSelection}
//                   onValueChange={setAccountSelection}
//                 >
//                   <DropdownTrigger className="input h-[52px] px-4">
//                     {accountSelection}
//                   </DropdownTrigger>
//                   <DropdownContent widthClassName="w-full">
//                     {accountSelectionOptions.map((option) => (
//                       <DropdownItem key={option} value={option}>
//                         {option}
//                       </DropdownItem>
//                     ))}
//                   </DropdownContent>
//                 </Dropdown>
//               </div>
//             </div>
//           </div>

//           <div className="card space-y-4 p-5">
//             <h4 className="title-sm text-[var(--title)]">Quota Schedule</h4>

//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//               <div className="space-y-2">
//                 <label className="paragraph font-medium">Schedule Period</label>
//                 <Dropdown
//                   value={schedulePeriod}
//                   onValueChange={setSchedulePeriod}
//                 >
//                   <DropdownTrigger className="input h-[52px] px-4">
//                     {schedulePeriod}
//                   </DropdownTrigger>
//                   <DropdownContent widthClassName="w-full">
//                     {schedulePeriodOptions.map((option) => (
//                       <DropdownItem key={option} value={option}>
//                         {option}
//                       </DropdownItem>
//                     ))}
//                   </DropdownContent>
//                 </Dropdown>
//               </div>

//               <div className="space-y-2">
//                 <label className="paragraph font-medium">
//                   Scheduled Quota Amount
//                 </label>
//                 <Input
//                   type="number"
//                   value={scheduleAmount}
//                   onChange={(e) => setScheduleAmount(e.target.value)}
//                   placeholder="0.00"
//                   disabled={!isScheduleEnabled}
//                 />
//               </div>
//             </div>

//             <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-4">
//               <label className="flex cursor-pointer items-start gap-3">
//                 <input
//                   type="checkbox"
//                   checked={accumulationEnabled}
//                   onChange={(e) => setAccumulationEnabled(e.target.checked)}
//                   className="mt-1 h-4 w-4 rounded border-[var(--border)]"
//                 />
//                 <div className="space-y-1">
//                   <p className="paragraph font-medium">
//                     Only allow accumulation up to X amount
//                   </p>
//                   <p className="paragraph text-sm text-[var(--muted)]">
//                     Prevent user balances from exceeding a configured maximum.
//                   </p>
//                 </div>
//               </label>

//               {accumulationEnabled ? (
//                 <div className="mt-4 max-w-sm space-y-2">
//                   <label className="paragraph font-medium">
//                     Accumulation Limit
//                   </label>
//                   <Input
//                     type="number"
//                     value={accumulationLimit}
//                     onChange={(e) => setAccumulationLimit(e.target.value)}
//                     placeholder="0.00"
//                   />
//                 </div>
//               ) : null}
//             </div>
//           </div>

//           <div className="flex items-center justify-end gap-3 pt-2">
//             <Button variant="outline" className="h-12 px-5" onClick={onClose}>
//               Cancel
//             </Button>
//             <Button type="submit" variant="primary" className="h-12 px-5">
//               Create Group
//             </Button>
//           </div>
//         </form>
//       </div>
//     </Modal>
//   );
// };

// export default AddGroupModal;

// =========NEW================
// AddGroupModal.tsx
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
import React, { useMemo, useState } from "react";

type AddGroupModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (group: GroupItem) => void;
  maxQuota?: number;
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

const AddGroupModal = ({ open, onClose, onCreate }: AddGroupModalProps) => {
  const [groupName, setGroupName] = useState("");
  const [initialQuota, setInitialQuota] = useState("");
  const [initialRestriction, setInitialRestriction] =
    useState<GroupRestrictedStatus>("Unrestricted");
  const [initialOverdraft, setInitialOverdraft] = useState("");
  const [schedulePeriod, setSchedulePeriod] =
    useState<GroupItem["period"]>("None");
  const [scheduleAmount, setScheduleAmount] = useState("");
  const [accumulationEnabled, setAccumulationEnabled] = useState(false);
  const [accumulationLimit, setAccumulationLimit] = useState("");
  const [notes, setNotes] = useState("");

  const isScheduleEnabled = useMemo(
    () => schedulePeriod !== "None",
    [schedulePeriod]
  );

  const resetForm = () => {
    setGroupName("");
    setInitialQuota("");
    setInitialRestriction("Unrestricted");
    setInitialOverdraft("");
    setSchedulePeriod("None");
    setScheduleAmount("");
    setAccumulationEnabled(false);
    setAccumulationLimit("");
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const id =
      groupName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || `group-${Date.now()}`;

    onCreate({
      id,
      name: groupName.trim() || "New Group",
      members: 0,
      initialQuota: Number(initialQuota || 0),
      restricted: initialRestriction,
      scheduleAmount: Number(scheduleAmount || 0),
      period: schedulePeriod,
      notes,
      accumulationEnabled,
      accumulationLimit: Number(accumulationLimit || 0),
      initialOverdraft: Number(initialOverdraft || 0),
    });

    resetForm();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="max-h-[85vh] overflow-y-auto pr-2 sm:pr-4">
        <div className="mb-6 space-y-2">
          <h3 className="title-md">Add Group</h3>
          <p className="paragraph">
            Create a group, define its quota schedule, and configure the default
            settings applied to newly assigned users.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card space-y-4 p-5">
            <h4
              className="text-xl font-semibold"
              style={{ color: "var(--title)" }}
            >
              Basic Information
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="paragraph font-medium">Group Name</label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                />
              </div>

              <div className="space-y-2">
                <label className="paragraph font-medium">
                  Initially Restricted
                </label>
                <SegmentToggle
                  value={initialRestriction}
                  onChange={(value) =>
                    setInitialRestriction(value as GroupRestrictedStatus)
                  }
                  options={restrictionOptions}
                  className="w-full justify-start rounded-2xl p-2"
                  buttonClassName="rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="card space-y-4 p-5">
            <h4
              className="text-xl font-semibold"
              style={{ color: "var(--title)" }}
            >
              Default Settings for New Users
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="paragraph font-medium">Initial Quota</label>
                <Input
                  type="number"
                  value={initialQuota}
                  onChange={(e) => setInitialQuota(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label className="paragraph font-medium">
                  Initial Overdraft
                </label>
                <Input
                  type="number"
                  value={initialOverdraft}
                  onChange={(e) => setInitialOverdraft(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="paragraph font-medium">Notes</label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional note"
                />
              </div>
            </div>
          </div>

          <div className="card space-y-4 p-5">
            <h4
              className="text-xl font-semibold"
              style={{ color: "var(--title)" }}
            >
              Quota Schedule
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="paragraph font-medium">Schedule Period</label>
                <ListBox
                  options={groupPeriodOptions}
                  value={schedulePeriod}
                  onValueChange={(value) =>
                    setSchedulePeriod(value as GroupItem["period"])
                  }
                  triggerClassName="h-[52px] w-full px-4"
                  contentClassName="w-full"
                  ariaLabel="Schedule period"
                />
              </div>

              <div className="space-y-2">
                <label className="paragraph font-medium">
                  Scheduled Quota Amount
                </label>
                <Input
                  type="number"
                  value={scheduleAmount}
                  onChange={(e) => setScheduleAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={!isScheduleEnabled}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={accumulationEnabled}
                  onChange={(e) => setAccumulationEnabled(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[var(--border)]"
                />
                <div className="space-y-1">
                  <p className="paragraph font-medium">
                    Only allow accumulation up to X amount
                  </p>
                  <p className="paragraph text-sm text-[var(--muted)]">
                    Prevent user quotas from exceeding a configured maximum.
                  </p>
                </div>
              </label>

              {accumulationEnabled ? (
                <div className="mt-4 max-w-sm space-y-2">
                  <label className="paragraph font-medium">
                    Accumulation Limit
                  </label>
                  <Input
                    type="number"
                    value={accumulationLimit}
                    onChange={(e) => setAccumulationLimit(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" className="h-12 px-5" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="h-12 px-5">
              Create Group
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddGroupModal;
