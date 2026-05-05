"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/modal/Modal";
import FloatingInput from "@/components/ui/input/FloatingInput";
import ListBox from "@/components/ui/listbox/ListBox";
import { printerStatusOptions } from "@/lib/mock-data/Admin/printers";
//import MainButton from "@/app/Mohammed/components/MainButton";
//import SecondaryButton from "@/app/Mohammed/components/SecondaryButton";
import Button from "@/components/ui/button/Button";

type AddPrinterModalProps = {
  open: boolean;
  onClose: () => void;
};

const AddPrinterModal = ({ open, onClose }: AddPrinterModalProps) => {
  const [status, setStatus] = useState("Online");

  return (
    <Modal open={open} onClose={onClose}>
      <div className="min-w-[320px] space-y-6 md:min-w-[760px]">
        <div>
          <h2 className="title-md">Add Printer</h2>
          <p className="paragraph mt-1">
            Add a new printer to the printing management system.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FloatingInput id="printer-name" label="Printer Name" />
          <FloatingInput id="printer-model" label="Model" />
          <FloatingInput id="printer-location" label="Location" />
          <FloatingInput id="printer-building" label="Building" />
          <FloatingInput id="printer-room" label="Room" />
          <FloatingInput id="printer-department" label="Department" />
          <FloatingInput id="printer-ip" label="IP Address" />
          <FloatingInput id="printer-queue" label="Queue Name" />
          <FloatingInput id="printer-cost" label="Cost Per Page" />
          <FloatingInput id="printer-serial" label="Serial Number" />
          <FloatingInput id="printer-toner" label="Toner Level %" />
          <FloatingInput id="printer-paper" label="Paper Level %" />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Status
          </p>

          <ListBox
            options={printerStatusOptions}
            value={status}
            onValueChange={setStatus}
            triggerClassName="w-full"
            contentClassName="w-full"
            ariaLabel="Printer status"
          />
        </div>

        {/*<div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <SecondaryButton
            label="Cancel"
            className="rounded-md bg-brand-500"
            onClick={onClose}
          />
          <MainButton label="Save Printer" onClick={onClose} />
        </div>*/}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            className="rounded-md"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onClose}
          >
            Save Printer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddPrinterModal;
