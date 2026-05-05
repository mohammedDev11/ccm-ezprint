"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/components/ui/modal/Modal";
import Button from "@/components/ui/button/Button";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/dropdown/Dropdown";

const QUEUES = ["Secure Release", "Faculty Queue", "Student Queue"];
const COLOR_OPTIONS = ["Color", "Black & White"];
const DUPLEX_OPTIONS = [
  "Single-sided",
  "Double-sided Long Edge",
  "Double-sided Short Edge",
];

type PrintJobModalProps = {
  open: boolean;
  onClose: () => void;
  jobName: string;
  setJobName: React.Dispatch<React.SetStateAction<string>>;
  queue: string;
  setQueue: React.Dispatch<React.SetStateAction<string>>;
  onConfirm: (options: {
    copies: number;
    color: string;
    duplex: string;
  }) => void;
};

export default function PrintJobModal({
  open,
  onClose,
  jobName,
  setJobName,
  queue,
  setQueue,
  onConfirm,
}: PrintJobModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [copies, setCopies] = useState(1);
  const [color, setColor] = useState("Color");
  const [duplex, setDuplex] = useState("Single-sided");

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      setStep(1);
      setCopies(1);
      setColor("Color");
      setDuplex("Single-sided");
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-5 pr-8">
        <div>
          <h3 className="title-md">
            {step === 1 ? "Configure Print Job" : "Print Options"}
          </h3>
          <p className="paragraph mt-1">
            {step === 1
              ? "Review your job details before submission."
              : "Choose your print preferences before confirming."}
          </p>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                Job Name
              </label>
              <input
                type="text"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                placeholder="Enter job name"
                className="h-12 w-full rounded-md border px-4 outline-none"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  color: "var(--title)",
                }}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                Queue
              </label>
              <Dropdown value={queue} onValueChange={(value) => setQueue(value)}>
                <DropdownTrigger className="h-12 w-full">
                  {queue}
                </DropdownTrigger>

                <DropdownContent widthClassName="w-full min-w-[220px]">
                  {QUEUES.map((item) => (
                    <DropdownItem key={item} value={item}>
                      {item}
                    </DropdownItem>
                  ))}
                </DropdownContent>
              </Dropdown>
            </div>

            <p className="text-sm text-[var(--muted)]">
              By default, jobs are sent to Secure Release and can be released
              after user authentication at the printer.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                Copies
              </label>
              <input
                type="number"
                min={1}
                value={copies}
                onChange={(e) => setCopies(Number(e.target.value || 1))}
                className="h-12 w-full rounded-md border px-4 outline-none"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  color: "var(--title)",
                }}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                Color
              </label>
              <Dropdown value={color} onValueChange={(value) => setColor(value)}>
                <DropdownTrigger className="h-12 w-full">
                  {color}
                </DropdownTrigger>
                <DropdownContent widthClassName="w-full min-w-[220px]">
                  {COLOR_OPTIONS.map((item) => (
                    <DropdownItem key={item} value={item}>
                      {item}
                    </DropdownItem>
                  ))}
                </DropdownContent>
              </Dropdown>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                Duplex
              </label>
              <Dropdown value={duplex} onValueChange={(value) => setDuplex(value)}>
                <DropdownTrigger className="h-12 w-full">
                  {duplex}
                </DropdownTrigger>
                <DropdownContent widthClassName="w-full min-w-[220px]">
                  {DUPLEX_OPTIONS.map((item) => (
                    <DropdownItem key={item} value={item}>
                      {item}
                    </DropdownItem>
                  ))}
                </DropdownContent>
              </Dropdown>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          {step === 1 ? (
            <>
              <Button variant="outline" className="h-11 px-5" onClick={onClose}>
                Cancel
              </Button>

              <Button
                variant="primary"
                className="h-11 px-5"
                onClick={() => setStep(2)}
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="h-11 px-5"
                onClick={() => setStep(1)}
              >
                Back
              </Button>

              <Button
                variant="primary"
                className="h-11 px-5"
                onClick={() =>
                  onConfirm({
                    copies,
                    color,
                    duplex,
                  })
                }
              >
                Confirm Print
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
