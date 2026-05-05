"use client";

import React, { useState } from "react";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/dropdown/Dropdown";
import Button from "@/components/ui/button/Button";
import { webPrintPrinterOptions } from "@/lib/mock-data/User/print";

const SelectPrinterCard = () => {
  const [selectedPrinter, setSelectedPrinter] = useState("");

  const selectedPrinterLabel = webPrintPrinterOptions.find(
    (printer) => printer.value === selectedPrinter
  )?.label;

  return (
    <div className="mx-auto w-full lg:w-[90%] xl:w-[90%] 2xl:w-[90%] space-y-4 sm:space-y-5">
      <div className="card rounded-2xl px-4 py-5 sm:px-6 sm:py-6 md:px-8">
        <div className="space-y-4 sm:space-y-5">
          <div>
            <h2 className="title-md text-base sm:text-lg md:text-xl">
              Select Printer
            </h2>
          </div>

          <Dropdown
            value={selectedPrinter}
            onValueChange={(value) => setSelectedPrinter(value)}
          >
            <DropdownTrigger
              placeholder={
                <span style={{ color: "var(--muted)" }}>Choose a printer</span>
              }
              className="h-12 w-full rounded-md px-4 text-sm sm:h-13 sm:px-4 sm:text-base md:h-14"
            >
              {selectedPrinter ? (
                <span
                  className="block truncate text-left"
                  style={{ color: "var(--foreground)" }}
                >
                  {selectedPrinterLabel}
                </span>
              ) : (
                <span
                  className="block truncate text-left"
                  style={{ color: "var(--muted)" }}
                >
                  Choose a printer
                </span>
              )}
            </DropdownTrigger>

            <DropdownContent
              className="w-full"
              widthClassName="w-[min(100vw-2rem,var(--radix-dropdown-trigger-width))] max-w-[var(--radix-dropdown-trigger-width)] min-w-[var(--radix-dropdown-trigger-width)]"
            >
              {webPrintPrinterOptions.map((printer) => (
                <DropdownItem key={printer.value} value={printer.value}>
                  <span className="block truncate text-sm font-medium sm:text-base">
                    {printer.label}
                  </span>
                </DropdownItem>
              ))}
            </DropdownContent>
          </Dropdown>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full rounded-md py-3 text-sm font-semibold sm:py-3.5 sm:text-base md:py-4"
        disabled={!selectedPrinter}
      >
        Submit Print Job
      </Button>
    </div>
  );
};

export default SelectPrinterCard;
