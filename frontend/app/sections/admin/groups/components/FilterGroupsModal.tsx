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

// type FilterGroupsModalProps = {
//   open: boolean;
//   onClose: () => void;
// };

// const restrictedOptions = ["All", "Unlocked", "Locked"];
// const periodOptions = ["All", "None", "Daily", "Weekly", "Monthly"];
// const memberScopeOptions = ["All Groups", "Empty Groups", "Has Members"];

// const FilterGroupsModal = ({ open, onClose }: FilterGroupsModalProps) => {
//   const [restricted, setRestricted] = useState("All");
//   const [period, setPeriod] = useState("All");
//   const [memberScope, setMemberScope] = useState("All Groups");
//   const [minCredit, setMinCredit] = useState("");
//   const [maxCredit, setMaxCredit] = useState("");

//   const resetFilters = () => {
//     setRestricted("All");
//     setPeriod("All");
//     setMemberScope("All Groups");
//     setMinCredit("");
//     setMaxCredit("");
//   };

//   return (
//     <Modal open={open} onClose={onClose}>
//       <div className="pr-8">
//         <div className="mb-6 space-y-2">
//           <h3 className="title-md">Filter Groups</h3>
//           <p className="paragraph">
//             Filter groups by restriction state, quota schedule, membership, and
//             credit range.
//           </p>
//         </div>

//         <div className="space-y-5">
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//             <div className="space-y-2">
//               <label className="paragraph font-medium">
//                 Restriction Status
//               </label>
//               <Dropdown value={restricted} onValueChange={setRestricted}>
//                 <DropdownTrigger className="input h-[52px] px-4">
//                   {restricted}
//                 </DropdownTrigger>
//                 <DropdownContent widthClassName="w-full">
//                   {restrictedOptions.map((option) => (
//                     <DropdownItem key={option} value={option}>
//                       {option}
//                     </DropdownItem>
//                   ))}
//                 </DropdownContent>
//               </Dropdown>
//             </div>

//             <div className="space-y-2">
//               <label className="paragraph font-medium">Schedule Period</label>
//               <Dropdown value={period} onValueChange={setPeriod}>
//                 <DropdownTrigger className="input h-[52px] px-4">
//                   {period}
//                 </DropdownTrigger>
//                 <DropdownContent widthClassName="w-full">
//                   {periodOptions.map((option) => (
//                     <DropdownItem key={option} value={option}>
//                       {option}
//                     </DropdownItem>
//                   ))}
//                 </DropdownContent>
//               </Dropdown>
//             </div>

//             <div className="space-y-2 md:col-span-2">
//               <label className="paragraph font-medium">Member Scope</label>
//               <Dropdown value={memberScope} onValueChange={setMemberScope}>
//                 <DropdownTrigger className="input h-[52px] px-4">
//                   {memberScope}
//                 </DropdownTrigger>
//                 <DropdownContent widthClassName="w-full">
//                   {memberScopeOptions.map((option) => (
//                     <DropdownItem key={option} value={option}>
//                       {option}
//                     </DropdownItem>
//                   ))}
//                 </DropdownContent>
//               </Dropdown>
//             </div>

//             <div className="space-y-2">
//               <label className="paragraph font-medium">
//                 Min Initial Credit
//               </label>
//               <Input
//                 type="number"
//                 value={minCredit}
//                 onChange={(e) => setMinCredit(e.target.value)}
//                 placeholder="0.00"
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="paragraph font-medium">
//                 Max Initial Credit
//               </label>
//               <Input
//                 type="number"
//                 value={maxCredit}
//                 onChange={(e) => setMaxCredit(e.target.value)}
//                 placeholder="0.00"
//               />
//             </div>
//           </div>

//           <div className="flex items-center justify-end gap-3 pt-2">
//             <Button
//               variant="outline"
//               className="h-12 px-5"
//               onClick={resetFilters}
//             >
//               Reset
//             </Button>
//             <Button variant="primary" className="h-12 px-5" onClick={onClose}>
//               Apply Filters
//             </Button>
//           </div>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// export default FilterGroupsModal;

//==========NEW=============
// FilterGroupsModal.tsx
"use client";

import {
  GroupFilterRestriction,
  GroupFilters,
  groupPeriodOptions,
  initialGroupFilters,
} from "@/lib/mock-data/Admin/groups";
import SegmentToggle, {
  SegmentOption,
} from "@/components/shared/actions/SegmentToggle";
import RangeSlider from "@/components/ui/Range/RangeSlider";
import Button from "@/components/ui/button/Button";
import ListBox from "@/components/ui/listbox/ListBox";
import Modal from "@/components/ui/modal/Modal";
import { Lock, LockOpen } from "lucide-react";
import { useEffect, useState } from "react";

type FilterGroupsModalProps = {
  open: boolean;
  onClose: () => void;
  value: GroupFilters;
  onApply: (filters: GroupFilters) => void;
  onReset: () => void;
  maxQuota: number;
};

const restrictionOptions: SegmentOption[] = [
  { value: "All", label: "All" },
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
const periodFilterOptions = ["All", ...groupPeriodOptions];

const FilterGroupsModal = ({
  open,
  onClose,
  value,
  onApply,
  onReset,
  maxQuota,
}: FilterGroupsModalProps) => {
  const [localFilters, setLocalFilters] = useState<GroupFilters>(value);

  useEffect(() => {
    if (!open) return;

    let isActive = true;
    queueMicrotask(() => {
      if (isActive) {
        setLocalFilters(value);
      }
    });

    return () => {
      isActive = false;
    };
  }, [open, value]);

  const resetFilters = () => {
    setLocalFilters(initialGroupFilters);
    onReset();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[min(100%,980px)] pr-2 sm:pr-4">
        <div className="mb-6 space-y-2">
          <h3 className="title-md">Filter Groups</h3>
          <p className="paragraph">
            Filter groups by restriction state, schedule period, and quota
            range.
          </p>
        </div>

        <div className="space-y-6">
          <div className="card space-y-5 p-5">
            <div className="space-y-2">
              <label className="paragraph font-medium">
                Restriction Status
              </label>
              <SegmentToggle
                value={localFilters.restriction}
                onChange={(value) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    restriction: value as GroupFilterRestriction,
                  }))
                }
                options={restrictionOptions}
                className="w-full justify-start rounded-2xl"
                buttonClassName="rounded-md"
              />
            </div>

            <div className="space-y-2">
              <label className="paragraph font-medium">Schedule Period</label>
              <ListBox
                options={periodFilterOptions}
                value={localFilters.period}
                onValueChange={(value) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    period: value as GroupFilters["period"],
                  }))
                }
                triggerClassName="h-[52px] w-full px-4"
                contentClassName="w-full"
                ariaLabel="Schedule period"
              />
            </div>
          </div>

          <RangeSlider
            label="Quota Range"
            min={0}
            max={maxQuota}
            step={10}
            value={localFilters.quotaRange}
            onChange={(quotaRange) =>
              setLocalFilters((prev) => ({ ...prev, quotaRange }))
            }
            minLabel="Minimum quota"
            maxLabel="Maximum quota"
            formatValue={(value) => `${value}`}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              className="h-12 px-5"
              onClick={resetFilters}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              className="h-12 px-5"
              onClick={() => onApply(localFilters)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FilterGroupsModal;
