"use client";

import {
  AlertTriangle,
  BriefcaseBusiness,
  Columns2,
  Columns3,
  FileStack,
  Maximize2,
  Minimize2,
  Plus,
  Printer,
  SlidersHorizontal,
  Wifi,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
//import MainButton from "@/app/Mohammed/components/MainButton";
import SegmentToggle from "@/components/shared/actions/SegmentToggle";
import KpiMetricCard from "@/components/shared/cards/KpiMetricCard";
import FullscreenTablePortal from "@/components/shared/table/FullscreenTablePortal";
import {
  Table,
  TableControls,
  TableSearch,
  TableTitleBlock,
  TableTop,
} from "@/components/shared/table/Table";
import Button from "@/components/ui/button/Button";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";
import ListBox from "@/components/ui/listbox/ListBox";
import RefreshButton from "@/components/ui/button/RefreshButton";
import {
  type PrinterCapability,
  type PrinterItem,
  type PrinterStatus,
} from "@/lib/mock-data/Admin/printers";
import { apiDelete, apiGet, apiPatch } from "@/services/api";
import PrinterDetailsModal, { type PrinterUpdatePayload } from "./AddPrinterModal";
import PrinterCard from "./PrinterCard";
import AddPrinterModal from "./PrinterDetailsModal";

type PrinterStatusFilter = "all" | "online" | "offline" | "error";
type PrinterFeatureFilter = Extract<
  PrinterCapability,
  "Color" | "B&W" | "Duplex" | "Secure Release"
>;

const statusFilterOptions: {
  value: PrinterStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "error", label: "Error" },
];

const featureFilterOptions: {
  value: PrinterFeatureFilter;
  label: string;
}[] = [
  { value: "Color", label: "Color" },
  { value: "B&W", label: "B&W" },
  { value: "Duplex", label: "Duplex" },
  { value: "Secure Release", label: "Secure Release" },
];

const errorStatuses: PrinterStatus[] = ["Low Toner", "Paper Jam"];

const PrintersGrid = () => {
  const [printers, setPrinters] = useState<PrinterItem[]>([]);
  const [search, setSearch] = useState("");
  const [columns, setColumns] = useState<"2" | "3">("2");
  const [statusFilter, setStatusFilter] = useState<PrinterStatusFilter>("all");
  const [featureFilters, setFeatureFilters] = useState<PrinterFeatureFilter[]>(
    [],
  );
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [printerActionBusy, setPrinterActionBusy] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterItem | null>(
    null,
  );
  const [printerPendingDelete, setPrinterPendingDelete] =
    useState<PrinterItem | null>(null);

  const loadPrinters = useCallback(() => {
    apiGet<{ printers: PrinterItem[] }>("/admin/printers", "admin")
      .then((data) => {
        setPrinters(Array.isArray(data?.printers) ? data.printers : []);
        setLoadError("");
      })
      .catch((requestError) => {
        setPrinters([]);
        setLoadError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load printers.",
        );
      });
  }, []);

  useEffect(() => {
    loadPrinters();
  }, [loadPrinters]);

  const filteredPrinters = useMemo(() => {
    const term = search.trim().toLowerCase();

    return printers.filter((printer) => {
      const haystack = [
        printer.name,
        printer.model,
        printer.location,
        printer.building,
        printer.room,
        printer.department,
        printer.status,
        printer.queueName,
        printer.ipAddress,
        printer.serialNumber,
        printer.deviceType,
        printer.notes,
        printer.lastUsed,
        ...printer.capabilities,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !term || haystack.includes(term);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "online" && printer.status === "Online") ||
        (statusFilter === "offline" && printer.status === "Offline") ||
        (statusFilter === "error" && errorStatuses.includes(printer.status));
      const matchesFeatures =
        featureFilters.length === 0 ||
        featureFilters.every((feature) => printer.capabilities.includes(feature));

      return matchesSearch && matchesStatus && matchesFeatures;
    });
  }, [featureFilters, printers, search, statusFilter]);

  const gridClassName =
    columns === "2"
      ? "grid grid-cols-1 gap-6 xl:grid-cols-2"
      : "grid grid-cols-1 gap-6 xl:grid-cols-2 2xl:grid-cols-3";

  const activeFilterCount =
    (statusFilter === "all" ? 0 : 1) + featureFilters.length;

  const printerStats = useMemo(() => {
    const onlinePrinters = printers.filter(
      (printer) => printer.status === "Online",
    ).length;
    const issuePrinters = printers.filter(
      (printer) =>
        printer.status === "Offline" || errorStatuses.includes(printer.status),
    ).length;
    const totalPagesPrinted = printers.reduce(
      (sum, printer) => sum + printer.totalPagesPrinted,
      0,
    );
    const totalJobsSubmitted = printers.reduce(
      (sum, printer) => sum + printer.totalJobsSubmitted,
      0,
    );

    return {
      totalPrinters: printers.length,
      onlinePrinters,
      issuePrinters,
      totalPagesPrinted,
      totalJobsSubmitted,
    };
  }, [printers]);

  const kpiCards = [
    {
      title: "Total Printers",
      value: printerStats.totalPrinters.toLocaleString(),
      helper: `${filteredPrinters.length.toLocaleString()} visible in current view`,
      icon: <Printer className="h-5 w-5" />,
    },
    {
      title: "Online Printers",
      value: printerStats.onlinePrinters.toLocaleString(),
      helper: "Devices currently reporting online",
      icon: <Wifi className="h-5 w-5" />,
    },
    {
      title: "Offline / Issues",
      value: printerStats.issuePrinters.toLocaleString(),
      helper: "Offline, low toner, or paper jam devices",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      title: "Pages Printed",
      value: printerStats.totalPagesPrinted.toLocaleString(),
      helper: `${printerStats.totalJobsSubmitted.toLocaleString()} jobs submitted`,
      icon: <FileStack className="h-5 w-5" />,
    },
    {
      title: "Jobs Submitted",
      value: printerStats.totalJobsSubmitted.toLocaleString(),
      helper: "Total jobs across loaded printers",
      icon: <BriefcaseBusiness className="h-5 w-5" />,
    },
  ];

  const toggleFeatureFilter = (feature: PrinterFeatureFilter) => {
    setFeatureFilters((current) =>
      current.includes(feature)
        ? current.filter((item) => item !== feature)
        : [...current, feature],
    );
  };

  const savePrinter = async (
    printerId: string,
    payload: PrinterUpdatePayload,
  ) => {
    setPrinterActionBusy("save");
    setActionError("");
    setActionSuccess("");

    try {
      const data = await apiPatch<{ printer: PrinterItem }>(
        `/admin/printers/${printerId}`,
        payload,
        "admin",
      );
      const updatedPrinter = data.printer;

      setPrinters((current) =>
        current.map((printer) =>
          printer.id === printerId ? updatedPrinter : printer,
        ),
      );
      setSelectedPrinter(updatedPrinter);
      setActionSuccess("Printer updated successfully.");
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update printer.",
      );
      throw requestError;
    } finally {
      setPrinterActionBusy("");
    }
  };

  const requestDeletePrinter = (printer: PrinterItem) => {
    setActionError("");
    setActionSuccess("");
    setPrinterPendingDelete(printer);
  };

  const confirmDeletePrinter = async () => {
    if (!printerPendingDelete) return;

    const printer = printerPendingDelete;
    setPrinterActionBusy("delete");
    setActionError("");
    setActionSuccess("");

    try {
      await apiDelete(`/admin/printers/${printer.id}`, "admin");
      setPrinters((current) => current.filter((item) => item.id !== printer.id));
      setSelectedPrinter((current) =>
        current?.id === printer.id ? null : current,
      );
      setPrinterPendingDelete(null);
      setActionSuccess("Printer deleted successfully.");
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete printer.",
      );
    } finally {
      setPrinterActionBusy("");
    }
  };

  const renderPrintersSection = (expanded = false) => (
    <Table
      className={`flex flex-col ${
        expanded ? "h-dvh !rounded-none" : "min-h-[520px]"
      }`}
    >
      <TableTop className={`shrink-0 ${expanded ? "bg-[var(--surface)]" : ""}`}>
        <TableTitleBlock
          title="Printers"
          description={`${filteredPrinters.length} printers`}
        />

        <TableControls>
          <SegmentToggle
            value={columns}
            onChange={(value) => setColumns(value as "2" | "3")}
            showLabels={false}
            buttonClassName="h-11 w-11 px-0 py-0"
            options={[
              {
                value: "2",
                label: "Two-column view",
                ariaLabel: "Two-column view",
                title: "Two-column view",
                icon: <Columns2 className="h-5 w-5" />,
              },
              {
                value: "3",
                label: "Three-column view",
                ariaLabel: "Three-column view",
                title: "Three-column view",
                icon: <Columns3 className="h-5 w-5" />,
              },
            ]}
          />

          <TableSearch
            value={search}
            onChange={setSearch}
            label="Search printers..."
            id={expanded ? "printers-search-expanded" : "printers-search"}
            wrapperClassName="w-full md:w-[320px]"
          />

          <RefreshButton className="h-14" onClick={loadPrinters} />

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
            contentClassName="w-[360px]"
            maxHeightClassName=""
            align="right"
            ariaLabel="Filter printers"
          >
              <div className="space-y-4 p-2">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Status
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {statusFilterOptions.map((option) => {
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
                    Features
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {featureFilterOptions.map((option) => {
                      const isSelected = featureFilters.includes(option.value);

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleFeatureFilter(option.value)}
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
                      setFeatureFilters([]);
                    }}
                  >
                    Reset Filters
                  </Button>
                ) : null}
              </div>
          </ListBox>

          {/*<MainButton
            label="Add Printer"
            icon={<Plus className="h-5 w-5" />}
            onClick={() => setAddOpen(true)}
          />*/}
          <Button
            variant="primary"
            iconLeft={<Plus className="h-5 w-5" />}
            className="h-14 rounded-md px-6 text-base"
            onClick={() => setAddOpen(true)}
          >
            Add Printer
          </Button>

          <button
            type="button"
            onClick={() => setIsExpanded(!expanded)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-transparent text-[var(--muted)] transition hover:text-[var(--color-brand-500)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)]"
            aria-label={
              expanded ? "Collapse printers section" : "Expand printers section"
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

      <div className={expanded ? "min-h-0 flex-1 overflow-y-auto p-6" : "p-6"}>
        {loadError ? (
          <div className="pb-4">
            <p
              className="rounded-2xl border px-4 py-3 text-sm"
              style={{
                borderColor: "rgba(239, 68, 68, 0.2)",
                background: "rgba(254, 242, 242, 1)",
                color: "rgb(185, 28, 28)",
              }}
            >
              {loadError}
            </p>
          </div>
        ) : null}

        {actionError ? (
          <div className="pb-4">
            <p
              className="rounded-2xl border px-4 py-3 text-sm"
              style={{
                borderColor: "rgba(239, 68, 68, 0.2)",
                background: "rgba(254, 242, 242, 1)",
                color: "rgb(185, 28, 28)",
              }}
            >
              {actionError}
            </p>
          </div>
        ) : null}

        {actionSuccess ? (
          <div className="pb-4">
            <p
              className="rounded-2xl border px-4 py-3 text-sm"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--color-support-500) 24%, transparent)",
                background:
                  "color-mix(in srgb, var(--color-support-500) 12%, var(--surface))",
                color:
                  "color-mix(in srgb, var(--color-support-700) 76%, var(--title))",
              }}
            >
              {actionSuccess}
            </p>
          </div>
        ) : null}

        {filteredPrinters.length === 0 ? (
          <div
            className="rounded-2xl border border-dashed px-6 py-12 text-center text-sm"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}
          >
            No printers found.
          </div>
        ) : (
          <div className={gridClassName}>
            {filteredPrinters.map((printer) => (
              <PrinterCard
                key={printer.id}
                printer={printer}
                columns={columns === "2" ? 2 : 3}
                onClick={() => setSelectedPrinter(printer)}
                onConfigure={(item) => setSelectedPrinter(item)}
                onDelete={requestDeletePrinter}
              />
            ))}
          </div>
        )}
      </div>
    </Table>
  );

  return (
    <>
      <FullscreenTablePortal open={isExpanded}>
        {renderPrintersSection(true)}
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

        {renderPrintersSection()}
      </div>

      <AddPrinterModal open={addOpen} onClose={() => setAddOpen(false)} />

      <PrinterDetailsModal
        open={Boolean(selectedPrinter)}
        onClose={() => setSelectedPrinter(null)}
        printer={selectedPrinter}
        onSave={savePrinter}
        onDelete={requestDeletePrinter}
        busy={Boolean(printerActionBusy)}
        error={actionError}
      />

      <ConfirmDialog
        open={Boolean(printerPendingDelete)}
        title="Delete printer"
        description={
          <>
            Are you sure you want to delete printer{" "}
            <span className="font-semibold text-[var(--foreground)]">
              “{printerPendingDelete?.name ?? "this printer"}”
            </span>
            ? This action cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        loadingText="Deleting..."
        variant="danger"
        loading={printerActionBusy === "delete"}
        onClose={() => setPrinterPendingDelete(null)}
        onConfirm={confirmDeletePrinter}
      />
    </>
  );
};

export default PrintersGrid;
