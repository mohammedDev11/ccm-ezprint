"use client";

import PageIntro from "@/components/shared/page/Text/PageIntro";
import Button from "@/components/ui/button/Button";
import { FileUpload } from "@/components/ui/button/file-upload";
import Input from "@/components/ui/input/Input";
import ListBox, { type ListBoxOption } from "@/components/ui/listbox/ListBox";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";
import {
  apiDelete,
  apiDownload,
  apiGet,
  apiUpload,
  apiUploadBatch,
} from "@/services/api";
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Clock3,
  FileText,
  LayoutGrid,
  List,
  Loader2,
  MonitorUp,
  Printer,
  RotateCcw,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { type ComponentType, useCallback, useEffect, useMemo, useState } from "react";

type PrintQueueOption = {
  id: string;
  name: string;
  description: string;
  type: string;
  secureRelease: boolean;
  printerId: string;
  printerName: string;
  assignedPrinters?: PrintQueuePrinterTarget[];
  targetPrinterCount?: number;
};

type PrintQueuePrinterTarget = {
  id: string;
  name: string;
  status: string;
  online?: boolean;
  isActive?: boolean;
  ipAddress?: string;
};

type PrintOptionsResponse = {
  queues: PrintQueueOption[];
  defaultQueueId: string;
  acceptedMimeTypes: string[];
  maxFiles: number;
};

type UserSettingsForPrint = {
  preferences?: {
    printing?: {
      defaultPaperSize?: string;
      defaultColorMode?: string;
      defaultSides?: string;
      preferredQueueId?: string;
    };
  };
};

type UploadedJobResponse = {
  job: {
    id: string;
    jobId: string;
    documentName: string;
    printerName: string;
    queueName: string;
    status: string;
    releaseCode: string;
    releaseCodeExpiry: string | null;
    fileCount?: number;
  };
  dispatch?: {
    method: string;
    destinationName: string;
    bytesSent: number;
    destinationCount?: number;
    documentsDispatched?: number;
    failureCount?: number;
  };
};

type PrintDraftItem = {
  id: string;
  name: string;
  documentName: string;
  fileCount: number;
  lastSavedAt: string;
  settings: {
    queueId: string;
    queueName: string;
    documentName: string;
    copies: number;
    colorMode: string;
    mode: string;
    paperSize: string;
    quality: string;
  };
  files: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    pages: number;
  }>;
};

type PrintDraftListResponse = {
  drafts: PrintDraftItem[];
};

type PrintDraftSaveResponse = {
  draft: PrintDraftItem;
};

type WorkflowTab = "upload" | "drafts";
type UploadStep = 1 | 2 | 3;
type StepState = "complete" | "current" | "pending";
type DraftViewMode = "list" | "grid";
type FilePreviewKind = "pdf" | "image" | "unsupported";

type FilePreviewItem = {
  key: string;
  file: File;
  url: string;
  kind: FilePreviewKind;
  typeLabel: string;
};

const COLOR_OPTIONS = ["Black & White", "Color"];
const DUPLEX_OPTIONS = [
  { value: "Simplex", label: "Single-sided" },
  { value: "Duplex", label: "Double-sided" },
];
const PAPER_SIZE_OPTIONS = ["A4", "A3", "Letter"];
const DEFAULT_MAX_FILES = 10;

const isSecureReleaseQueue = (queue: PrintQueueOption) =>
  queue.secureRelease ||
  queue.type === "Secure Release Queue" ||
  /secure release/i.test(queue.name);

const getQueuePrinterTargets = (
  queue: PrintQueueOption | null,
): PrintQueuePrinterTarget[] => {
  if (!queue) return [];

  if (queue.assignedPrinters?.length) {
    return queue.assignedPrinters;
  }

  if (queue.printerName || queue.printerId) {
    return [
      {
        id: queue.printerId,
        name: queue.printerName || "Assigned printer",
        status: "",
      },
    ];
  }

  return [];
};

const getPrinterTargetMeta = (printer: PrintQueuePrinterTarget) =>
  [printer.status || (printer.online ? "Online" : ""), printer.ipAddress]
    .filter(Boolean)
    .join(" - ");

const getPrinterTargetValue = (printer: PrintQueuePrinterTarget) =>
  printer.id || printer.name;

const isPdfFile = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

const isImageFile = (file: File) =>
  file.type.startsWith("image/") ||
  /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(file.name);

const getFilePreviewKind = (file: File): FilePreviewKind => {
  if (isPdfFile(file)) return "pdf";
  if (isImageFile(file)) return "image";
  return "unsupported";
};

const getFilePreviewTypeLabel = (file: File) => {
  if (file.type) return file.type;
  const extension = file.name.split(".").pop();
  return extension ? `.${extension.toLowerCase()} file` : "Unknown type";
};

const getFilePreviewKey = (file: File, index: number) =>
  `${file.name}-${file.size}-${file.lastModified}-${file.type || "unknown"}-${index}`;

const getFileBaseName = (file: File) => file.name.replace(/\.[^.]+$/, "");

const getDefaultJobName = (nextFiles: File[]) =>
  nextFiles.length > 1 ? "Multiple documents" : getFileBaseName(nextFiles[0]);

const formatFileSize = (size: number) => {
  if (!size) return "0 MB";
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDraftDate = (value: string) => {
  if (!value) return "Not saved yet";
  return new Date(value).toLocaleString();
};

const formatPrintMode = (mode: string) =>
  mode === "Duplex" ? "Double-sided" : "Single-sided";

const getDraftFileCount = (draft: PrintDraftItem) =>
  draft.fileCount || draft.files.length;

const getDraftTotalSize = (draft: PrintDraftItem) =>
  draft.files.reduce((total, file) => total + (file.size || 0), 0);

const getDraftFileSummary = (draft: PrintDraftItem) => {
  const count = getDraftFileCount(draft);
  return `${count} file${count === 1 ? "" : "s"} - ${formatFileSize(getDraftTotalSize(draft))}`;
};

const getDraftSettingsSummary = (draft: PrintDraftItem) =>
  `${draft.settings.copies || 1}x, ${draft.settings.colorMode}, ${formatPrintMode(
    draft.settings.mode,
  )}, ${draft.settings.paperSize || "A4"}`;

function WorkflowSegment({
  activeTab,
  draftCount,
  onChange,
}: {
  activeTab: WorkflowTab;
  draftCount: number;
  onChange: (tab: WorkflowTab) => void;
}) {
  const options: Array<{
    id: WorkflowTab;
    label: string;
  }> = [
    { id: "upload", label: "Upload" },
    { id: "drafts", label: "Drafts" },
  ];

  return (
    <div className="flex w-full items-end gap-10 border-b border-[var(--border)]">
      {options.map((option) => {
        const active = activeTab === option.id;

        return (
          <button
            key={option.id}
            type="button"
            aria-label={
              option.id === "drafts"
                ? `Drafts, ${draftCount} saved`
                : option.label
            }
            onClick={() => onChange(option.id)}
            className={`relative flex h-12 items-center justify-center px-1 text-base font-bold transition sm:min-w-28 sm:px-3 ${
              active
                ? "text-[var(--color-brand-500)]"
                : "text-[var(--muted)] hover:text-[var(--title)]"
            }`}
          >
            <span>{option.label}</span>
            {active ? (
              <span className="absolute -bottom-px left-0 h-0.5 w-full rounded-full bg-[var(--color-brand-500)]" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function DraftViewToggle({
  value,
  onChange,
}: {
  value: DraftViewMode;
  onChange: (nextView: DraftViewMode) => void;
}) {
  const options: Array<{
    id: DraftViewMode;
    label: string;
    icon: ComponentType<{ className?: string }>;
  }> = [
    { id: "list", label: "List view", icon: List },
    { id: "grid", label: "Grid view", icon: LayoutGrid },
  ];

  return (
    <div
      aria-label="Draft view mode"
      className="inline-flex rounded-lg border p-1"
      role="group"
      style={{
        borderColor: "color-mix(in srgb, var(--border) 82%, transparent)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--surface-2) 92%, #090909), color-mix(in srgb, var(--surface) 88%, #090909))",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const active = value === option.id;

        return (
          <button
            key={option.id}
            type="button"
            aria-label={option.label}
            aria-pressed={active}
            title={option.label}
            onClick={() => onChange(option.id)}
            className="flex h-10 w-10 items-center justify-center rounded-md transition-all duration-200"
            style={{
              background: active
                ? "linear-gradient(135deg, var(--color-brand-400), var(--color-brand-600))"
                : "transparent",
              color: active ? "white" : "var(--muted)",
              boxShadow: active
                ? "0 10px 22px rgba(var(--brand-rgb), 0.28)"
                : "none",
            }}
          >
            <Icon className="h-[18px] w-[18px]" />
          </button>
        );
      })}
    </div>
  );
}

function StepIndicator({
  currentStep,
  completeAll = false,
  onStepSelect,
}: {
  currentStep: UploadStep;
  completeAll?: boolean;
  onStepSelect?: (step: UploadStep) => void;
}) {
  const steps: Array<{ id: UploadStep; title: string }> = [
    { id: 1, title: "Upload File" },
    { id: 2, title: "Preview File" },
    { id: 3, title: "Print Settings & Submit" },
  ];

  const getStepState = (stepId: UploadStep): StepState => {
    if (completeAll || currentStep > stepId) return "complete";
    if (currentStep === stepId) return "current";
    return "pending";
  };

  const getStatusText = (state: StepState) => {
    if (state === "complete") return "Completed";
    if (state === "current") return "In Progress";
    return "Pending";
  };

  const getConnectorColor = (stepId: UploadStep) => {
    if (completeAll || currentStep > stepId) return "var(--color-brand-500)";
    return "color-mix(in srgb, var(--color-brand-500) 12%, var(--surface-2))";
  };

  return (
    <div className="w-full overflow-x-auto pb-3">
      <div className="relative min-w-[680px] px-2 py-6">
        <div className="absolute left-8 right-8 top-14 grid grid-cols-2">
          {[1, 2].map((stepId) => {
            const complete = completeAll || currentStep > stepId;

            return (
              <div
                key={stepId}
                className="relative h-1 overflow-hidden bg-[color-mix(in_srgb,var(--color-brand-500)_10%,var(--surface-2))]"
              >
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: getConnectorColor(stepId as UploadStep) }}
                  initial={false}
                  animate={{ width: complete ? "100%" : "0%" }}
                  transition={{ duration: 0.42, ease: "easeOut" }}
                />
              </div>
            );
          })}
        </div>

        <div className="relative z-10 grid grid-cols-3">
          {steps.map((step, index) => {
            const state = getStepState(step.id);
            const complete = state === "complete";
            const current = state === "current";
            const selectable = Boolean(onStepSelect && !completeAll && step.id < currentStep);

            return (
              <div
                key={step.id}
                className={`flex min-w-0 flex-col ${
                  index === 0
                    ? "items-start text-left"
                    : index === steps.length - 1
                      ? "items-end text-right"
                      : "items-center text-center"
                }`}
              >
                <motion.button
                  type="button"
                  aria-current={current ? "step" : undefined}
                  aria-disabled={!selectable}
                  aria-label={`${step.title}, ${getStatusText(state)}`}
                  title={selectable ? `Go back to ${step.title}` : step.title}
                  onClick={() => {
                    if (selectable) onStepSelect?.(step.id);
                  }}
                  className={`relative isolate flex h-16 w-16 items-center justify-center rounded-full border-2 text-xl font-bold outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
                    selectable ? "cursor-pointer" : "cursor-default"
                  }`}
                  style={{
                    borderColor:
                      complete || current
                        ? "var(--color-brand-500)"
                        : "color-mix(in srgb, var(--color-brand-500) 20%, var(--border))",
                    background: complete
                      ? "var(--color-brand-500)"
                      : current
                        ? "var(--color-brand-500)"
                        : "color-mix(in srgb, var(--color-brand-500) 10%, var(--surface-2))",
                    color: complete
                      ? "white"
                      : current
                        ? "#090909"
                        : "color-mix(in srgb, var(--foreground) 78%, var(--color-brand-500))",
                  }}
                  initial={false}
                  animate={{
                    scale: current ? 1.06 : 1,
                    boxShadow:
                      current
                        ? "none"
                        : complete
                          ? "0 8px 18px rgba(var(--shadow-color), 0.08)"
                          : "0 10px 28px rgba(var(--shadow-color), 0.14)",
                  }}
                  whileHover={selectable ? { scale: complete ? 1.04 : 1.08 } : undefined}
                  whileTap={selectable ? { scale: 0.98 } : undefined}
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                >
                  {complete ? (
                    <StepCheckIcon className="h-7 w-7" />
                  ) : current ? (
                    <motion.span
                      className="h-6 w-6 rounded-full bg-[#090909]"
                      initial={{ scale: 0.72, opacity: 0.8 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                    />
                  ) : (
                    step.id
                  )}
                </motion.button>

                <div className="mt-4 max-w-[190px]">
                  <p
                    className="text-[10px] font-medium uppercase tracking-[0.18em]"
                    style={{
                      color:
                        state === "pending"
                          ? "color-mix(in srgb, var(--color-brand-500) 14%, var(--muted))"
                          : "var(--muted)",
                    }}
                  >
                    Step {step.id}
                  </p>
                  <p className="mt-1 text-sm font-bold leading-5 text-[var(--title)]">
                    {step.title}
                  </p>
                  <p
                    className="mt-1.5 text-xs font-semibold"
                    style={{
                      color: complete
                        ? "var(--color-brand-500)"
                        : current
                          ? "var(--color-brand-500)"
                          : "color-mix(in srgb, var(--color-brand-500) 16%, var(--muted))",
                    }}
                  >
                    {getStatusText(state)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepCheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      viewBox="0 0 24 24"
    >
      <motion.path
        d="M5 13l4 4L19 7"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.08, duration: 0.3, ease: "easeOut" }}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SummaryTile({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-[var(--surface-2)] px-4 py-3" style={{ borderColor: "var(--border)" }}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </p>
      <div className="mt-1 text-sm font-semibold text-[var(--title)]">{value}</div>
    </div>
  );
}

function AlertMessage({
  tone,
  children,
}: {
  tone: "danger" | "success";
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg border px-4 py-3 text-sm font-medium"
      style={{
        borderColor:
          tone === "danger"
            ? "color-mix(in srgb, var(--color-danger-500) 28%, var(--border))"
            : "color-mix(in srgb, var(--color-success-500) 28%, var(--border))",
        background:
          tone === "danger"
            ? "color-mix(in srgb, var(--color-danger-500) 10%, var(--surface))"
            : "color-mix(in srgb, var(--color-success-500) 10%, var(--surface))",
        color:
          tone === "danger"
            ? "color-mix(in srgb, var(--color-danger-600) 82%, var(--foreground))"
            : "color-mix(in srgb, var(--color-success-600) 82%, var(--foreground))",
      }}
    >
      {children}
    </div>
  );
}

function FilePreviewPanel({
  items,
  selectedKey,
  onSelect,
}: {
  items: FilePreviewItem[];
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  const selectedItem =
    items.find((item) => item.key === selectedKey) || items[0] || null;

  if (!selectedItem) {
    return (
      <div
        className="rounded-lg border bg-[var(--surface)] p-5"
        style={{ borderColor: "var(--border)" }}
      >
        <p className="text-sm font-semibold text-[var(--title)]">File preview</p>
        <p className="mt-2 text-sm text-[var(--paragraph)]">No file selected.</p>
      </div>
    );
  }

  const { file, kind, typeLabel, url } = selectedItem;
  const previewLabel =
    kind === "pdf" ? "PDF preview" : kind === "image" ? "Image preview" : "No preview";

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div
        className="rounded-lg border bg-[var(--surface)] p-4 sm:p-5"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-[var(--title)]">
              Document preview
            </h3>
            <p className="mt-1 truncate text-sm text-[var(--paragraph)]">
              {file.name}
            </p>
          </div>
          <span
            className="inline-flex w-fit rounded-md border px-2.5 py-1 text-xs font-semibold"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface-2)",
              color: "var(--paragraph)",
            }}
          >
            {previewLabel}
          </span>
        </div>

        <div
          className="mt-4 overflow-hidden rounded-lg border bg-[var(--surface-2)]"
          style={{ borderColor: "var(--border)" }}
        >
          {kind === "pdf" ? (
            <iframe
              src={`${url}#toolbar=0&navpanes=0&view=FitH`}
              title={`Preview of ${file.name}`}
              className="h-[520px] w-full bg-white"
            />
          ) : null}

          {kind === "image" ? (
            <div className="flex min-h-[420px] items-center justify-center p-3">
              <img
                src={url}
                alt={`Preview of ${file.name}`}
                className="max-h-[560px] w-full rounded-md object-contain"
              />
            </div>
          ) : null}

          {kind === "unsupported" ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center px-5 py-8 text-center">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-lg"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--color-brand-500)",
                }}
              >
                <FileText className="h-7 w-7" />
              </span>
              <p className="mt-4 text-base font-bold text-[var(--title)]">
                Preview is unavailable for this file type.
              </p>
              <div className="mt-4 grid w-full max-w-md gap-3 text-left sm:grid-cols-3">
                <SummaryTile label="File name" value={file.name} />
                <SummaryTile label="Type" value={typeLabel} />
                <SummaryTile label="Size" value={formatFileSize(file.size)} />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <aside
        className="rounded-lg border bg-[var(--surface)] p-5"
        style={{ borderColor: "var(--border)" }}
      >
        <h3 className="text-base font-bold text-[var(--title)]">File info</h3>
        <div className="mt-4 space-y-3">
          <SummaryTile label="File name" value={file.name} />
          <SummaryTile label="Type" value={typeLabel} />
          <SummaryTile label="Size" value={formatFileSize(file.size)} />
        </div>

        {items.length > 1 ? (
          <div className="mt-6">
          <p className="text-sm font-semibold text-[var(--title)]">Selected files</p>
          <div className="mt-3 grid gap-2">
            {items.map((item) => {
              const active = item.key === selectedItem.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelect(item.key)}
                  className="min-w-0 rounded-md border px-3 py-2 text-left text-sm transition"
                  style={{
                    borderColor: active
                      ? "color-mix(in srgb, var(--color-brand-500) 48%, var(--border))"
                      : "var(--border)",
                    background: active
                      ? "color-mix(in srgb, var(--color-brand-500) 9%, var(--surface))"
                      : "var(--surface-2)",
                  }}
                >
                  <span className="block truncate font-semibold text-[var(--title)]">
                    {item.file.name}
                  </span>
                  <span className="mt-1 block text-xs text-[var(--muted)]">
                    {formatFileSize(item.file.size)} - {item.typeLabel}
                  </span>
                </button>
              );
            })}
          </div>
          </div>
        ) : null}
      </aside>
    </section>
  );
}

const Page = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<WorkflowTab>("upload");
  const [uploadStep, setUploadStep] = useState<UploadStep>(1);
  const [draftViewMode, setDraftViewMode] = useState<DraftViewMode>("list");
  const [draftSearch, setDraftSearch] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [maxFiles, setMaxFiles] = useState(DEFAULT_MAX_FILES);
  const [jobName, setJobName] = useState("");
  const [queues, setQueues] = useState<PrintQueueOption[]>([]);
  const [selectedQueueId, setSelectedQueueId] = useState("");
  const [selectedPrinterValue, setSelectedPrinterValue] = useState("");
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState("Black & White");
  const [printMode, setPrintMode] = useState("Simplex");
  const [paperSize, setPaperSize] = useState("A4");
  const [drafts, setDrafts] = useState<PrintDraftItem[]>([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftActionId, setDraftActionId] = useState("");
  const [draftToDelete, setDraftToDelete] = useState<PrintDraftItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [queuedJob, setQueuedJob] = useState<UploadedJobResponse["job"] | null>(null);
  const [dispatchSummary, setDispatchSummary] =
    useState<UploadedJobResponse["dispatch"] | null>(null);
  const [copiedReleaseCode, setCopiedReleaseCode] = useState(false);
  const [filePreviewItems, setFilePreviewItems] = useState<FilePreviewItem[]>([]);
  const [selectedPreviewKey, setSelectedPreviewKey] = useState("");

  const loadDrafts = useCallback(async () => {
    setDraftsLoading(true);

    try {
      const data = await apiGet<PrintDraftListResponse>("/user/jobs/drafts", "user");
      setDrafts(data.drafts || []);
    } catch (draftError) {
      setError(
        draftError instanceof Error
          ? draftError.message
          : "Unable to load print drafts.",
      );
    } finally {
      setDraftsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      apiGet<PrintOptionsResponse>("/user/jobs/options", "user"),
      apiGet<UserSettingsForPrint>("/user/settings", "user").catch(() => null),
    ])
      .then(([data, userSettings]) => {
        if (!mounted) return;

        const secureReleaseQueues = (data.queues || []).filter(isSecureReleaseQueue);
        const printPreferences = userSettings?.preferences?.printing;
        const preferredQueue = printPreferences?.preferredQueueId
          ? secureReleaseQueues.find(
              (queue) => queue.id === printPreferences.preferredQueueId,
            )
          : null;
        const defaultSecureQueue =
          preferredQueue ||
          secureReleaseQueues.find((queue) => queue.id === data.defaultQueueId) ||
          (secureReleaseQueues.length === 1 ? secureReleaseQueues[0] : null);

        setQueues(secureReleaseQueues);
        setSelectedQueueId(defaultSecureQueue?.id || "");
        setMaxFiles(Math.max(1, data.maxFiles || DEFAULT_MAX_FILES));
        setPaperSize(printPreferences?.defaultPaperSize || "A4");
        setColorMode(printPreferences?.defaultColorMode || "Black & White");
        setPrintMode(printPreferences?.defaultSides || "Simplex");

        if (secureReleaseQueues.length === 0) {
          setError(
            "No active Secure Release queue is available. Confirm MongoDB is connected and the demo queue is provisioned.",
          );
        }
      })
      .catch((requestError) => {
        if (!mounted) return;

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load queue options.",
        );
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDrafts();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadDrafts]);

  useEffect(() => {
    const nextPreviewItems = files.map((file, index) => ({
      key: getFilePreviewKey(file, index),
      file,
      url: URL.createObjectURL(file),
      kind: getFilePreviewKind(file),
      typeLabel: getFilePreviewTypeLabel(file),
    }));

    setFilePreviewItems(nextPreviewItems);

    return () => {
      nextPreviewItems.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [files]);

  useEffect(() => {
    if (filePreviewItems.length === 0) {
      if (selectedPreviewKey) setSelectedPreviewKey("");
      return;
    }

    if (!filePreviewItems.some((item) => item.key === selectedPreviewKey)) {
      setSelectedPreviewKey(filePreviewItems[0].key);
    }
  }, [filePreviewItems, selectedPreviewKey]);

  const selectedQueue = useMemo(
    () => queues.find((queue) => queue.id === selectedQueueId) || null,
    [queues, selectedQueueId],
  );
  const selectedQueuePrinterTargets = useMemo(
    () => getQueuePrinterTargets(selectedQueue),
    [selectedQueue],
  );
  const selectedPrinter = useMemo(
    () =>
      selectedQueuePrinterTargets.find(
        (printer) => getPrinterTargetValue(printer) === selectedPrinterValue,
      ) || null,
    [selectedPrinterValue, selectedQueuePrinterTargets],
  );
  const selectedPrinterListBoxValue = selectedPrinter ? selectedPrinterValue : "";
  const printerOptions = useMemo<ListBoxOption[]>(
    () =>
      selectedQueuePrinterTargets.map((printer) => {
        const meta = getPrinterTargetMeta(printer);
        const name = printer.name || "Assigned printer";

        return {
          value: getPrinterTargetValue(printer),
          label: (
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-semibold">{name}</span>
              {meta ? (
                <span className="truncate text-xs font-medium text-[var(--muted)]">
                  {meta}
                </span>
              ) : null}
            </span>
          ),
          selectedLabel: name,
          searchText: `${name} ${meta}`,
          disabled: printer.isActive === false,
        };
      }),
    [selectedQueuePrinterTargets],
  );
  const queueOptions = useMemo(
    () =>
      queues.map((queue) => ({
        value: queue.id,
        label: queue.name,
      })),
    [queues],
  );
  const totalSelectedSize = useMemo(
    () => files.reduce((sum, file) => sum + file.size, 0),
    [files],
  );
  const filteredDrafts = useMemo(() => {
    const query = draftSearch.trim().toLowerCase();
    if (!query) return drafts;

    return drafts.filter((draft) => {
      const searchableText = [
        draft.name,
        draft.documentName,
        draft.settings.queueName,
        draft.settings.colorMode,
        draft.settings.mode,
        draft.settings.paperSize,
        ...draft.files.map((file) => file.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [draftSearch, drafts]);

  const resetUploadFlow = () => {
    setFiles([]);
    setJobName("");
    setCopies(1);
    setQueuedJob(null);
    setDispatchSummary(null);
    setCopiedReleaseCode(false);
    setSelectedPreviewKey("");
    setSuccess("");
    setError("");
    setUploadStep(1);
  };

  const handleTabChange = (tab: WorkflowTab) => {
    setActiveTab(tab);
    setError("");
    setSuccess("");
  };

  const handleFilesChange = (nextFiles: File[]) => {
    const nextLimitedFiles = nextFiles.slice(0, maxFiles);

    setQueuedJob(null);
    setDispatchSummary(null);
    setCopiedReleaseCode(false);
    setFiles(nextLimitedFiles);
    setError("");

    if (nextLimitedFiles.length) {
      const previousDefaultName = files.length ? getDefaultJobName(files) : "";
      if (!jobName || jobName === previousDefaultName) {
        setJobName(getDefaultJobName(nextLimitedFiles));
      }
    } else if (files.length && jobName === getDefaultJobName(files)) {
      setJobName("");
      setUploadStep(1);
    }
  };

  const validateFiles = () => {
    if (files.length === 0) {
      setError("Choose at least one file before continuing.");
      setUploadStep(1);
      return false;
    }

    return true;
  };

  const validatePrintableFiles = () => {
    if (files.some((file) => !isPdfFile(file))) {
      setError(
        "Only PDF files can be uploaded right now. Convert DOCX, PPTX, XLSX, or images to PDF before upload.",
      );
      setUploadStep(2);
      return false;
    }

    return true;
  };

  const validateSettings = () => {
    if (!selectedQueueId) {
      setError("Please choose the Secure Release queue before continuing.");
      setUploadStep(3);
      return false;
    }

    if (!selectedQueue || !isSecureReleaseQueue(selectedQueue)) {
      setError("Please choose a valid Secure Release queue before continuing.");
      setUploadStep(3);
      return false;
    }

    if (selectedQueuePrinterTargets.length === 0) {
      setError("No target printers are available for the selected queue.");
      setUploadStep(3);
      return false;
    }

    if (!selectedPrinter) {
      setError("Please choose one target printer before uploading.");
      setUploadStep(3);
      return false;
    }

    return true;
  };

  const goToStep = (nextStep: UploadStep) => {
    setError("");

    if (nextStep >= 2 && !validateFiles()) return;

    setUploadStep(nextStep);
  };

  const handleSaveDraft = async () => {
    setError("");
    setSuccess("");

    if (!validateFiles() || !validatePrintableFiles()) return;

    setSavingDraft(true);

    try {
      const metadata = {
        queueId: selectedQueueId,
        documentName: jobName || getDefaultJobName(files),
        copies,
        colorMode,
        mode: printMode,
        paperSize,
        quality: "Normal",
        clientType: "Web Print Draft",
      };
      const data =
        files.length === 1
          ? await apiUpload<PrintDraftSaveResponse>({
              path: "/user/jobs/drafts",
              scope: "user",
              file: files[0],
              metadata,
            })
          : await apiUploadBatch<PrintDraftSaveResponse>({
              path: "/user/jobs/drafts/batch",
              scope: "user",
              files,
              metadata,
            });

      setSuccess(`Draft "${data.draft.name}" was saved.`);
      await loadDrafts();
    } catch (draftError) {
      setError(
        draftError instanceof Error
          ? draftError.message
          : "Unable to save the print draft.",
      );
    } finally {
      setSavingDraft(false);
    }
  };

  const handleRestoreDraft = async (draft: PrintDraftItem) => {
    setError("");
    setSuccess("");
    setDraftActionId(draft.id);

    try {
      if (draft.files.length === 0) {
        throw new Error("This draft does not include a stored file.");
      }

      const lastSavedAt = draft.lastSavedAt
        ? new Date(draft.lastSavedAt).getTime()
        : 0;
      const restoredFiles = await Promise.all(
        draft.files.map(async (draftFile) => {
          const blob = await apiDownload(
            `/user/jobs/drafts/${draft.id}/files/${draftFile.id}`,
            "user",
          );

          return new File([blob], draftFile.name, {
            type: draftFile.type || blob.type || "application/pdf",
            lastModified: Number.isFinite(lastSavedAt) ? lastSavedAt : 0,
          });
        }),
      );

      setFiles(restoredFiles);
      setJobName(draft.settings.documentName || draft.documentName || draft.name);
      setCopies(Math.max(1, Number(draft.settings.copies || 1)));
      setColorMode(draft.settings.colorMode || "Black & White");
      setPrintMode(draft.settings.mode || "Simplex");
      setPaperSize(draft.settings.paperSize || "A4");
      setSelectedPrinterValue("");
      setQueuedJob(null);
      setDispatchSummary(null);
      setCopiedReleaseCode(false);

      if (
        draft.settings.queueId &&
        queues.some((queue) => queue.id === draft.settings.queueId)
      ) {
        setSelectedQueueId(draft.settings.queueId);
      }

      setActiveTab("upload");
      setUploadStep(1);
      setSuccess(`Draft "${draft.name}" was restored. Review the details, then continue.`);
    } catch (draftError) {
      setError(
        draftError instanceof Error
          ? draftError.message
          : "Unable to restore this print draft.",
      );
    } finally {
      setDraftActionId("");
    }
  };

  const confirmDeleteDraft = async () => {
    if (!draftToDelete) return;

    setError("");
    setSuccess("");
    setDraftActionId(draftToDelete.id);

    try {
      await apiDelete(`/user/jobs/drafts/${draftToDelete.id}`, "user");
      setDrafts((currentDrafts) =>
        currentDrafts.filter((currentDraft) => currentDraft.id !== draftToDelete.id),
      );
      setSuccess(`Draft "${draftToDelete.name}" was deleted.`);
      setDraftToDelete(null);
    } catch (draftError) {
      setError(
        draftError instanceof Error
          ? draftError.message
          : "Unable to delete this print draft.",
      );
    } finally {
      setDraftActionId("");
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setQueuedJob(null);
    setDispatchSummary(null);
    setCopiedReleaseCode(false);

    if (!validateFiles() || !validatePrintableFiles() || !validateSettings()) return;

    setSubmitting(true);

    try {
      const metadata = {
        queueId: selectedQueueId,
        printerId: selectedPrinter?.id || "",
        printerName: selectedPrinter?.name || "",
        documentName: jobName || getDefaultJobName(files),
        copies,
        colorMode,
        mode: printMode,
        paperSize,
        quality: "Normal",
        clientType: "Web Print",
      };
      const data =
        files.length === 1
          ? await apiUpload<UploadedJobResponse>({
              path: "/user/jobs/upload-print",
              scope: "user",
              file: files[0],
              metadata,
            })
          : await apiUploadBatch<UploadedJobResponse>({
              path: "/user/jobs/upload-print-batch",
              scope: "user",
              files,
              metadata,
            });

      setSuccess(
        `Print job ${data.job.jobId} was queued in ${data.job.queueName || selectedQueue?.name || "the selected queue"}.`,
      );
      setQueuedJob(data.job);
      setDispatchSummary(data.dispatch || null);
      setUploadStep(3);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit the print job.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyReleaseCode = async () => {
    if (!queuedJob?.releaseCode) return;

    try {
      await navigator.clipboard.writeText(queuedJob.releaseCode);
      setCopiedReleaseCode(true);
      window.setTimeout(() => setCopiedReleaseCode(false), 1600);
    } catch {
      setError("Unable to copy the release code from this browser.");
    }
  };

  const renderTargetPrinter = () => (
    <div
      className="rounded-lg border px-4 py-3 text-sm"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface-2)",
        color: "var(--title)",
      }}
    >
      {printerOptions.length > 0 ? (
        <ListBox
          value={selectedPrinterListBoxValue}
          onValueChange={setSelectedPrinterValue}
          options={printerOptions}
          placeholder="Select target printer"
          triggerClassName="h-12 w-full"
          contentClassName="w-full"
          ariaLabel="Select target printer"
          emptyText="No printers available"
          searchable
        />
      ) : (
        <p className="font-medium">No printers available</p>
      )}
    </div>
  );

  const renderFileDetailsStep = () => (
    <section className="space-y-5">
      <FileUpload
        value={files}
        onChange={handleFilesChange}
        onReject={(message) => setError(message)}
        multiple
        maxFiles={maxFiles}
        emptyHelperText="Drag & drop files here or click anywhere to upload (up to 10 files)."
        hideHeader
        openOnAreaClick
        hideAddFileButton
        showDraftActions={false}
        className="lg:w-full xl:w-full 2xl:w-full"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--muted)]">
          {files.length
            ? `${files.length} file${files.length === 1 ? "" : "s"} selected, ${formatFileSize(totalSelectedSize)} total.`
            : "No files selected yet."}
        </p>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            disabled={files.length === 0 || savingDraft}
            onClick={handleSaveDraft}
            iconLeft={savingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
          >
            {savingDraft ? "Saving..." : "Save draft"}
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={files.length === 0}
            onClick={() => goToStep(2)}
            iconRight={<ArrowRight className="h-4 w-4" />}
          >
            Preview File
          </Button>
        </div>
      </div>
    </section>
  );

  const renderFormReviewStep = () => (
    <section className="space-y-5">
      <FilePreviewPanel
        items={filePreviewItems}
        selectedKey={selectedPreviewKey}
        onSelect={setSelectedPreviewKey}
      />

      <div
        className="flex flex-col gap-3 rounded-lg border bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: "var(--border)" }}
      >
        <div>
          <h3 className="text-base font-bold text-[var(--title)]">
            Ready for print settings?
          </h3>
          <p className="mt-1 text-sm text-[var(--paragraph)]">
            Review the document here, then choose printer and print options.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setUploadStep(1)}
            iconLeft={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Upload
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => goToStep(3)}
            iconRight={<ArrowRight className="h-4 w-4" />}
          >
            Continue to Settings
          </Button>
        </div>
      </div>
    </section>
  );

  const renderConfirmationStep = () => {
    if (queuedJob) {
      return (
        <section
          className="rounded-lg border bg-[var(--surface)] p-5 sm:p-7"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-success-500)_14%,var(--surface-2))] text-[var(--color-success-600)]">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h2 className="mt-4 text-2xl font-bold text-[var(--title)]">
              Job queued successfully
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--paragraph)]">
              Use this code at the printer screen to release your job.
            </p>

            <div
              className="mt-6 rounded-lg border px-5 py-6"
              style={{
                borderColor: "color-mix(in srgb, var(--color-brand-500) 28%, var(--border))",
                background:
                  "linear-gradient(180deg, color-mix(in srgb, var(--surface-2) 70%, transparent), var(--surface))",
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                One-time release code
              </p>
              <p className="mt-3 break-all font-mono text-4xl font-bold tracking-[0.18em] text-[var(--title)] sm:text-6xl">
                {queuedJob.releaseCode || "Unavailable"}
              </p>
              {queuedJob.releaseCode ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-5"
                  onClick={copyReleaseCode}
                  iconLeft={
                    copiedReleaseCode ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <ClipboardCopy className="h-4 w-4" />
                    )
                  }
                >
                  {copiedReleaseCode ? "Copied" : "Copy code"}
                </Button>
              ) : null}
            </div>

            <div className="mt-6 grid gap-3 text-left md:grid-cols-2">
              <SummaryTile label="Job" value={queuedJob.documentName} />
              <SummaryTile label="Queue" value={queuedJob.queueName || selectedQueue?.name || "Selected queue"} />
              <SummaryTile label="Files" value={`${queuedJob.fileCount || files.length} file${(queuedJob.fileCount || files.length) === 1 ? "" : "s"}`} />
              <SummaryTile
                label="Dispatch"
                value={
                  dispatchSummary
                    ? `${dispatchSummary.destinationCount || 1} printer${(dispatchSummary.destinationCount || 1) === 1 ? "" : "s"}`
                    : "Ready for secure release"
                }
              />
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/sections/user/pending-jobs">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full sm:w-auto"
                  iconLeft={<MonitorUp className="h-4 w-4" />}
                >
                  View Pending Jobs
                </Button>
              </Link>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={resetUploadFlow}
                iconLeft={<UploadCloud className="h-4 w-4" />}
              >
                Upload another document
              </Button>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div
            className="rounded-lg border bg-[var(--surface)] p-5"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--color-brand-500)_12%,var(--surface-2))] text-[var(--color-brand-500)]">
                <Printer className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-[var(--title)]">
                  Print Settings
                </h2>
                <p className="text-sm text-[var(--paragraph)]">
                  Choose the release queue, printer, and output options.
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--muted)]">
                  Job name
                </label>
                <Input
                  value={jobName}
                  onChange={(event) => setJobName(event.target.value)}
                  placeholder="Document name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--muted)]">
                  Queue
                </label>
                <ListBox
                  value={selectedQueueId}
                  onValueChange={(value) => {
                    setSelectedQueueId(value);
                    setSelectedPrinterValue("");
                  }}
                  options={queueOptions}
                  placeholder={selectedQueue?.name || "Select queue"}
                  triggerClassName="h-12 w-full"
                  contentClassName="w-full"
                  ariaLabel="Select queue"
                  emptyText="No Secure Release queues available"
                  searchable
                />
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <label className="text-sm font-medium text-[var(--muted)]">
                Target printer
              </label>
              {renderTargetPrinter()}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--muted)]">
                  Copies
                </label>
                <Input
                  type="number"
                  min={1}
                  value={copies}
                  onChange={(event) =>
                    setCopies(Math.max(1, Number(event.target.value || 1)))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--muted)]">
                  Color mode
                </label>
                <ListBox
                  value={colorMode}
                  onValueChange={(value) => setColorMode(value)}
                  options={COLOR_OPTIONS}
                  triggerClassName="h-12 w-full"
                  contentClassName="w-full"
                  ariaLabel="Select color mode"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--muted)]">
                  Sides
                </label>
                <ListBox
                  value={printMode}
                  onValueChange={(value) => setPrintMode(value)}
                  options={DUPLEX_OPTIONS}
                  placeholder="Select mode"
                  triggerClassName="h-12 w-full"
                  contentClassName="w-full"
                  ariaLabel="Select print sides"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--muted)]">
                  Paper size
                </label>
                <ListBox
                  value={paperSize}
                  onValueChange={(value) => setPaperSize(value)}
                  options={PAPER_SIZE_OPTIONS}
                  placeholder="Select paper size"
                  triggerClassName="h-12 w-full"
                  contentClassName="w-full"
                  ariaLabel="Select paper size"
                />
              </div>
            </div>
          </div>
        </div>

        <aside
          className="rounded-lg border bg-[var(--surface)] p-5"
          style={{ borderColor: "var(--border)" }}
        >
          <h3 className="text-base font-bold text-[var(--title)]">
            Final Review
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--paragraph)]">
            Confirm the selected files and settings before submitting.
          </p>

          <div className="mt-5 space-y-3">
            <SummaryTile
              label="Files"
              value={`${files.length} file${files.length === 1 ? "" : "s"} (${formatFileSize(totalSelectedSize)})`}
            />
            <SummaryTile
              label="Queue"
              value={selectedQueue?.name || "Not selected"}
            />
            <SummaryTile
              label="Printer"
              value={selectedPrinter?.name || "Not selected"}
            />
            <SummaryTile label="Copies" value={copies} />
            <SummaryTile label="Paper size" value={paperSize || "A4"} />
            <SummaryTile label="Color mode" value={colorMode} />
            <SummaryTile label="Sides" value={formatPrintMode(printMode)} />
            <SummaryTile label="Estimated pages/cost" value="Calculated after upload" />
          </div>

          <div className="mt-5 space-y-3">
            <Button
              type="button"
              variant="primary"
              className="w-full"
              disabled={loading || submitting || files.length === 0}
              onClick={() => void handleSubmit()}
              iconLeft={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            >
              {submitting ? "Submitting..." : "Submit Print Job"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={files.length === 0 || savingDraft}
              onClick={handleSaveDraft}
              iconLeft={savingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
            >
              {savingDraft ? "Saving..." : "Save draft"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setUploadStep(2)}
              iconLeft={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Preview
            </Button>
          </div>
        </aside>
      </section>
    );
  };

  const renderUploadTab = () => (
    <div className="space-y-5">
      <StepIndicator
        currentStep={uploadStep}
        completeAll={Boolean(queuedJob)}
        onStepSelect={(step) => {
          setError("");
          setSuccess("");
          setUploadStep(step);
        }}
      />
      {uploadStep === 1 ? renderFileDetailsStep() : null}
      {uploadStep === 2 ? renderFormReviewStep() : null}
      {uploadStep === 3 ? renderConfirmationStep() : null}
    </div>
  );

  const renderDraftActions = (draft: PrintDraftItem, compact = false) => {
    const actionInProgress = draftActionId === draft.id;

    return (
      <>
        <Button
          type="button"
          variant="primary"
          size="sm"
          className={compact ? "flex-1 sm:flex-none" : ""}
          disabled={actionInProgress}
          onClick={() => void handleRestoreDraft(draft)}
          iconLeft={
            actionInProgress ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )
          }
        >
          {actionInProgress ? "Restoring..." : "Restore"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={compact ? "flex-1 sm:flex-none" : ""}
          disabled={actionInProgress}
          onClick={() => setDraftToDelete(draft)}
          iconLeft={<Trash2 className="h-4 w-4" />}
        >
          Delete
        </Button>
      </>
    );
  };

  const renderDraftListRow = (draft: PrintDraftItem) => {
    const fileSummary = getDraftFileSummary(draft);
    const settingsSummary = getDraftSettingsSummary(draft);

    return (
      <article
        key={draft.id}
        className="rounded-lg border bg-[var(--surface)] px-4 py-4 transition-all duration-200 hover:border-[color-mix(in_srgb,var(--color-brand-500)_38%,var(--border))] hover:bg-[color-mix(in_srgb,var(--color-brand-500)_4%,var(--surface))] sm:px-5"
        style={{
          borderColor: "var(--border)",
          boxShadow: "0 14px 30px rgba(var(--shadow-color), 0.08)",
        }}
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1.2fr)_auto] lg:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--color-brand-500) 24%, var(--border))",
                background:
                  "color-mix(in srgb, var(--color-brand-500) 9%, var(--surface-2))",
                color: "var(--color-brand-500)",
              }}
            >
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-[var(--title)] sm:text-base">
                {draft.name}
              </h3>
              <p className="mt-1 truncate text-sm text-[var(--muted)]">
                {fileSummary}
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Saved
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-[var(--title)]">
              {formatDraftDate(draft.lastSavedAt)}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Queue
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-[var(--title)]">
              {draft.settings.queueName || "Not selected"}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Settings
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-[var(--title)]">
              {settingsSummary}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            {renderDraftActions(draft, true)}
          </div>
        </div>
      </article>
    );
  };

  const renderDraftGridCard = (draft: PrintDraftItem) => {
    const fileSummary = getDraftFileSummary(draft);
    const settingsSummary = getDraftSettingsSummary(draft);

    return (
      <article
        key={draft.id}
        className="flex min-h-[250px] flex-col rounded-lg border bg-[var(--surface)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--color-brand-500)_34%,var(--border))]"
        style={{
          borderColor: "var(--border)",
          boxShadow: "0 16px 34px rgba(var(--shadow-color), 0.1)",
        }}
      >
        <div className="flex items-start gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-brand-500) 24%, var(--border))",
              background:
                "color-mix(in srgb, var(--color-brand-500) 9%, var(--surface-2))",
              color: "var(--color-brand-500)",
            }}
          >
            <FileText className="h-5 w-5" />
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-bold text-[var(--title)]">
              {draft.name}
            </h3>
            <p className="mt-1 text-sm text-[var(--muted)]">{fileSummary}</p>
            <p className="mt-2 flex items-center gap-1 text-xs text-[var(--muted)]">
              <Clock3 className="h-3.5 w-3.5" />
              {formatDraftDate(draft.lastSavedAt)}
            </p>
          </div>
        </div>

        <dl className="mt-5 grid gap-2 text-xs">
          <div className="rounded-md bg-[var(--surface-2)] px-3 py-2.5">
            <dt className="text-[var(--muted)]">Queue</dt>
            <dd className="mt-1 truncate font-semibold text-[var(--title)]">
              {draft.settings.queueName || "Not selected"}
            </dd>
          </div>
          <div className="rounded-md bg-[var(--surface-2)] px-3 py-2.5">
            <dt className="text-[var(--muted)]">Settings</dt>
            <dd className="mt-1 truncate font-semibold text-[var(--title)]">
              {settingsSummary}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
          {renderDraftActions(draft)}
        </div>
      </article>
    );
  };

  const renderDraftsTab = () => (
    <section className="space-y-5">
      <div
        className="flex flex-col gap-4 rounded-lg border p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
        style={{
          borderColor: "color-mix(in srgb, var(--border) 82%, transparent)",
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
          boxShadow:
            "0 10px 24px rgba(var(--shadow-color), 0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <Input
            value={draftSearch}
            onChange={(event) => setDraftSearch(event.target.value)}
            placeholder="Search drafts"
            className="pl-10"
            wrapperClassName="border-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            aria-label="Search drafts"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <DraftViewToggle value={draftViewMode} onChange={setDraftViewMode} />
          <button
            type="button"
            onClick={loadDrafts}
            disabled={draftsLoading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-[var(--title)] transition-all duration-200 hover:bg-[color-mix(in_srgb,var(--color-brand-500)_9%,var(--surface-2))] disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--surface-2) 78%, transparent), color-mix(in srgb, var(--surface) 88%, transparent))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            {draftsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            Refresh
          </button>
        </div>
      </div>

      {draftsLoading ? (
        draftViewMode === "list" ? (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-lg border bg-[var(--surface)]"
                style={{ borderColor: "var(--border)" }}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-52 animate-pulse rounded-lg border bg-[var(--surface)]"
                style={{ borderColor: "var(--border)" }}
              />
            ))}
          </div>
        )
      ) : null}

      {!draftsLoading && drafts.length === 0 ? (
        <div
          className="rounded-lg border bg-[var(--surface)] px-5 py-12 text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <FileText className="mx-auto h-10 w-10 text-[var(--muted)]" />
          <p className="mt-4 text-lg font-bold text-[var(--title)]">No drafts yet</p>
          <p className="mt-2 text-sm text-[var(--paragraph)]">
            Upload a PDF, choose settings, then save it as a draft.
          </p>
          <Button
            type="button"
            variant="primary"
            className="mt-5"
            onClick={() => setActiveTab("upload")}
            iconLeft={<UploadCloud className="h-4 w-4" />}
          >
            Start upload
          </Button>
        </div>
      ) : null}

      {!draftsLoading && drafts.length > 0 && filteredDrafts.length === 0 ? (
        <div
          className="rounded-lg border bg-[var(--surface)] px-5 py-10 text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <Search className="mx-auto h-9 w-9 text-[var(--muted)]" />
          <p className="mt-4 text-base font-bold text-[var(--title)]">
            No matching drafts
          </p>
          <p className="mt-2 text-sm text-[var(--paragraph)]">
            Try a different draft name, queue, file, or print setting.
          </p>
        </div>
      ) : null}

      {!draftsLoading && filteredDrafts.length > 0 ? (
        draftViewMode === "list" ? (
          <div className="space-y-3 transition-all duration-200">
            {filteredDrafts.map(renderDraftListRow)}
          </div>
        ) : (
          <div className="grid gap-4 transition-all duration-200 md:grid-cols-2 xl:grid-cols-3">
            {filteredDrafts.map(renderDraftGridCard)}
          </div>
        )
      ) : null}
    </section>
  );

  return (
    <div className="relative space-y-6">
      <PageIntro
        title="Web Print"
        description="Upload PDFs into secure release, or restore saved draft jobs when you need to continue later."
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <WorkflowSegment
          activeTab={activeTab}
          draftCount={drafts.length}
          onChange={handleTabChange}
        />
      </div>

      {loading ? (
        <AlertMessage tone="success">Loading queue options...</AlertMessage>
      ) : null}

      {error ? <AlertMessage tone="danger">{error}</AlertMessage> : null}
      {success && !queuedJob ? (
        <AlertMessage tone="success">{success}</AlertMessage>
      ) : null}

      {activeTab === "upload" ? renderUploadTab() : renderDraftsTab()}

      <ConfirmDialog
        open={Boolean(draftToDelete)}
        title="Delete draft?"
        description={
          <span>
            This removes the saved draft and its stored PDF files. The action
            cannot be undone.
          </span>
        }
        confirmText="Delete draft"
        loadingText="Deleting..."
        variant="danger"
        loading={Boolean(draftToDelete && draftActionId === draftToDelete.id)}
        onConfirm={() => void confirmDeleteDraft()}
        onClose={() => setDraftToDelete(null)}
      />
    </div>
  );
};

export default Page;
