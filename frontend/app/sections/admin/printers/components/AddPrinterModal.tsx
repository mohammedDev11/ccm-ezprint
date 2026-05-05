"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  Activity,
  FileText,
  Info,
  MapPin,
  Pencil,
  Printer,
  Settings2,
  Trash2,
} from "lucide-react";
import Button from "@/components/ui/button/Button";
import FloatingInput from "@/components/ui/input/FloatingInput";
import Modal from "@/components/ui/modal/Modal";
import type { PrinterItem, PrinterStatus } from "@/lib/mock-data/Admin/printers";

export type PrinterUpdatePayload = {
  name: string;
  model: string;
  building: string;
  room: string;
  department: string;
  queueName: string;
  costPerPage: number;
  ipAddress: string;
  serialNumber: string;
  notes: string;
};

type PrinterDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  printer: PrinterItem | null;
  onSave: (printerId: string, payload: PrinterUpdatePayload) => Promise<void>;
  onDelete: (printer: PrinterItem) => void | Promise<void>;
  busy?: boolean;
  error?: string;
};

type PrinterEditForm = Omit<PrinterUpdatePayload, "costPerPage"> & {
  costPerPage: string;
};

const statusToneStyles: Record<PrinterStatus, CSSProperties> = {
  Online: {
    borderColor: "color-mix(in srgb, var(--color-support-500) 24%, transparent)",
    background: "color-mix(in srgb, var(--color-support-500) 12%, var(--surface))",
    color: "color-mix(in srgb, var(--color-support-700) 76%, var(--title))",
  },
  Offline: {
    borderColor: "var(--border)",
    background: "color-mix(in srgb, var(--surface-3) 44%, var(--surface))",
    color: "var(--muted)",
  },
  "Low Toner": {
    borderColor: "color-mix(in srgb, var(--color-warning-500) 24%, transparent)",
    background: "color-mix(in srgb, var(--color-warning-500) 12%, var(--surface))",
    color: "color-mix(in srgb, var(--color-warning-600) 78%, var(--title))",
  },
  "Paper Jam": {
    borderColor: "color-mix(in srgb, var(--color-brand-600) 24%, transparent)",
    background: "color-mix(in srgb, var(--color-brand-500) 13%, var(--surface))",
    color: "color-mix(in srgb, var(--color-brand-700) 82%, var(--title))",
  },
};

const buildPrinterForm = (printer: PrinterItem): PrinterEditForm => ({
  name: printer.name || "",
  model: printer.model || "",
  building: printer.building || "",
  room: printer.room || "",
  department: printer.department || "",
  queueName: printer.queueName || "",
  costPerPage: String(printer.costPerPage ?? 0),
  ipAddress: printer.ipAddress || "",
  serialNumber: printer.serialNumber || "",
  notes: printer.notes || "",
});

const deleteButtonStyle = {
  borderColor: "color-mix(in srgb, rgb(239, 68, 68) 24%, var(--border))",
  background: "color-mix(in srgb, rgb(239, 68, 68) 7%, var(--surface))",
  color: "color-mix(in srgb, rgb(185, 28, 28) 72%, var(--foreground))",
};

const Chip = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <span
    className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold"
    style={{
      borderColor: "var(--border)",
      color: "var(--paragraph)",
      ...style,
    }}
  >
    {children}
  </span>
);

const SectionCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) => (
  <section
    className="rounded-2xl border p-5"
    style={{
      background: "var(--surface-2)",
      borderColor: "var(--border)",
    }}
  >
    <div className="mb-4 flex items-center gap-2">
      <span className="text-[var(--color-brand-500)]">{icon}</span>
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {title}
      </h3>
    </div>
    {children}
  </section>
);

const Field = ({ label, value }: { label: string; value?: ReactNode }) => {
  if (!value && value !== 0) return null;

  return (
    <div className="min-w-0 rounded-xl bg-[var(--surface)] px-4 py-3">
      <span className="text-sm font-medium text-[var(--muted)]">{label}</span>
      <p className="mt-1 break-words text-sm font-semibold text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
};

const EditField = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  min,
  step,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: string;
  step?: string;
}) => (
  <FloatingInput
    id={id}
    label={label}
    type={type}
    min={min}
    step={step}
    value={value}
    onChange={(event) => onChange(event.target.value)}
  />
);

const PrinterDetailsModal = ({
  open,
  onClose,
  printer,
  onSave,
  onDelete,
  busy = false,
  error = "",
}: PrinterDetailsModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<PrinterEditForm | null>(
    printer ? buildPrinterForm(printer) : null,
  );

  useEffect(() => {
    let isActive = true;

    queueMicrotask(() => {
      if (isActive) {
        setForm(printer ? buildPrinterForm(printer) : null);
        setIsEditing(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, [printer]);

  if (!printer || !form) return null;

  const updateField = <K extends keyof PrinterEditForm>(
    key: K,
    value: PrinterEditForm[K],
  ) => setForm((current) => (current ? { ...current, [key]: value } : current));

  const resetAndClose = () => {
    setIsEditing(false);
    setForm(buildPrinterForm(printer));
    onClose();
  };

  const cancelEdit = () => {
    setForm(buildPrinterForm(printer));
    setIsEditing(false);
  };

  const savePrinter = async () => {
    try {
      await onSave(printer.id, {
        ...form,
        costPerPage: Number(form.costPerPage || 0),
      });
      setIsEditing(false);
    } catch {
      // The parent owns the error message so the edit form can stay open.
    }
  };

  return (
    <Modal open={open} onClose={resetAndClose}>
      <div className="min-w-[320px] max-w-full space-y-6 md:min-w-[760px]">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "var(--surface-2)" }}
            >
              <Printer className="h-7 w-7 text-brand-500" />
            </div>

            <div className="min-w-0">
              <h2 className="break-words title-md">
                {isEditing ? "Edit Printer" : printer.name}
              </h2>
              <p className="paragraph mt-1 flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="break-words">{printer.location}</span>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="h-10 px-3 text-sm"
              disabled={busy}
              iconLeft={<Trash2 className="h-4 w-4" />}
              style={deleteButtonStyle}
              onClick={() => void onDelete(printer)}
            >
              Delete
            </Button>

            {!isEditing ? (
              <Button
                variant="secondary"
                className="h-10 px-3 text-sm"
                disabled={busy}
                iconLeft={<Pencil className="h-4 w-4" />}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip style={statusToneStyles[printer.status]}>{printer.status}</Chip>

          {printer.capabilities.map((capability) => (
            <Chip key={capability}>{capability}</Chip>
          ))}
        </div>

        {error ? (
          <p
            className="rounded-xl border px-4 py-3 text-sm font-medium"
            style={{
              borderColor: "rgba(239, 68, 68, 0.22)",
              background: "color-mix(in srgb, var(--surface) 84%, rgba(239,68,68,0.12))",
              color: "rgb(185, 28, 28)",
            }}
          >
            {error}
          </p>
        ) : null}

        {isEditing ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SectionCard title="Basic Info" icon={<Info className="h-4 w-4" />}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <EditField
                  id="edit-printer-name"
                  label="Printer Name"
                  value={form.name}
                  onChange={(value) => updateField("name", value)}
                />
                <EditField
                  id="edit-printer-model"
                  label="Model"
                  value={form.model}
                  onChange={(value) => updateField("model", value)}
                />
                <EditField
                  id="edit-printer-building"
                  label="Building"
                  value={form.building}
                  onChange={(value) => updateField("building", value)}
                />
                <EditField
                  id="edit-printer-room"
                  label="Room"
                  value={form.room}
                  onChange={(value) => updateField("room", value)}
                />
                <EditField
                  id="edit-printer-department"
                  label="Department"
                  value={form.department}
                  onChange={(value) => updateField("department", value)}
                />
                <EditField
                  id="edit-printer-queue"
                  label="Queue Name"
                  value={form.queueName}
                  onChange={(value) => updateField("queueName", value)}
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Connection & Cost"
              icon={<Settings2 className="h-4 w-4" />}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <EditField
                  id="edit-printer-cost"
                  label="Cost Per Page"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.costPerPage}
                  onChange={(value) => updateField("costPerPage", value)}
                />
                <EditField
                  id="edit-printer-ip"
                  label="IP Address"
                  value={form.ipAddress}
                  onChange={(value) => updateField("ipAddress", value)}
                />
                <EditField
                  id="edit-printer-serial"
                  label="Serial Number"
                  value={form.serialNumber}
                  onChange={(value) => updateField("serialNumber", value)}
                />
              </div>
            </SectionCard>

            <div
              className="rounded-2xl border p-5 lg:col-span-2"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border)",
              }}
            >
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[var(--color-brand-500)]" />
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Notes
                </h3>
              </div>
              <textarea
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                className="min-h-[110px] w-full resize-y rounded-md border bg-[var(--surface)] px-4 py-3 text-sm leading-6 text-[var(--foreground)] outline-none transition focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[rgba(var(--brand-rgb),0.14)]"
                style={{ borderColor: "var(--border)" }}
                placeholder="Optional printer notes"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SectionCard title="Basic Info" icon={<Info className="h-4 w-4" />}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Model" value={printer.model} />
                <Field label="Department" value={printer.department} />
                <Field label="Building" value={printer.building} />
                <Field label="Room" value={printer.room} />
                <Field label="Device Type" value={printer.deviceType} />
                <Field label="Queue Name" value={printer.queueName} />
              </div>
            </SectionCard>

            <SectionCard title="Usage" icon={<Activity className="h-4 w-4" />}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Pages Printed" value={printer.totalPagesPrinted} />
                <Field label="Jobs Submitted" value={printer.totalJobsSubmitted} />
                <Field
                  label="Cost Per Page"
                  value={`${printer.costPerPage.toFixed(2)} SAR`}
                />
                <Field label="IP Address" value={printer.ipAddress} />
              </div>
            </SectionCard>

            <SectionCard
              title="Device Status"
              icon={<Settings2 className="h-4 w-4" />}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Toner Level" value={`${printer.tonerLevel}%`} />
                <Field label="Paper Level" value={`${printer.paperLevel}%`} />
                <Field label="Last Used" value={printer.lastUsed} />
                <Field label="Serial Number" value={printer.serialNumber} />
              </div>
            </SectionCard>

            <div
              className="rounded-2xl border p-5"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border)",
              }}
            >
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[var(--color-brand-500)]" />
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Notes
                </h3>
              </div>
              <p className="text-sm leading-6 text-[var(--foreground)]">
                {printer.notes || "No notes recorded."}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
          {isEditing ? (
            <>
              <Button
                variant="secondary"
                className="h-12 px-5"
                disabled={busy}
                onClick={cancelEdit}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="h-12 px-5"
                disabled={busy}
                onClick={() => void savePrinter()}
              >
                {busy ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              className="h-12 px-5"
              disabled={busy}
              onClick={resetAndClose}
            >
              Done
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PrinterDetailsModal;
