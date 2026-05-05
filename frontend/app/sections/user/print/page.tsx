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
  Layers3,
  Loader2,
  MonitorUp,
  Printer,
  RotateCcw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

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

const COLOR_OPTIONS = ["Black & White", "Color"];
const DUPLEX_OPTIONS = [
  { value: "Simplex", label: "Single-sided" },
  { value: "Duplex", label: "Double-sided" },
];
const PAPER_SIZE_OPTIONS = ["A4", "A3", "Letter"];
const PDF_ACCEPT = { "application/pdf": [".pdf"] };
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
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }> = [
    { id: "upload", label: "Upload", icon: UploadCloud },
    { id: "drafts", label: "Drafts", icon: Archive, count: draftCount },
  ];

  return (
    <div
      className="inline-flex w-full rounded-lg border bg-[var(--surface)] p-1 sm:w-auto"
      style={{ borderColor: "var(--border)" }}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const active = activeTab === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition sm:min-w-36 ${
              active
                ? "bg-[color-mix(in_srgb,var(--color-brand-500)_13%,var(--surface-2))] text-[var(--color-brand-600)]"
                : "text-[var(--paragraph)] hover:bg-[var(--surface-2)] hover:text-[var(--title)]"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{option.label}</span>
            {option.count !== undefined ? (
              <span className="rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 text-xs text-[var(--muted)]">
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: UploadStep }) {
  const steps: Array<{ id: UploadStep; label: string }> = [
    { id: 1, label: "Upload" },
    { id: 2, label: "Configure" },
    { id: 3, label: "Confirm" },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {steps.map((step) => {
        const active = currentStep === step.id;
        const complete = currentStep > step.id;

        return (
          <div
            key={step.id}
            className="flex items-center gap-3 rounded-lg border p-3"
            style={{
              borderColor:
                active || complete
                  ? "color-mix(in srgb, var(--color-brand-500) 32%, var(--border))"
                  : "var(--border)",
              background:
                active || complete
                  ? "color-mix(in srgb, var(--color-brand-500) 9%, var(--surface))"
                  : "var(--surface)",
            }}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-bold"
              style={{
                background: complete
                  ? "var(--color-brand-500)"
                  : active
                    ? "color-mix(in srgb, var(--color-brand-500) 18%, var(--surface-2))"
                    : "var(--surface-2)",
                color: complete
                  ? "white"
                  : active
                    ? "var(--color-brand-600)"
                    : "var(--muted)",
              }}
            >
              {complete ? <Check className="h-4 w-4" /> : step.id}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Step {step.id}
              </p>
              <p className="font-semibold text-[var(--title)]">{step.label}</p>
            </div>
          </div>
        );
      })}
    </div>
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

const Page = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<WorkflowTab>("upload");
  const [uploadStep, setUploadStep] = useState<UploadStep>(1);
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

  const resetUploadFlow = () => {
    setFiles([]);
    setJobName("");
    setCopies(1);
    setQueuedJob(null);
    setDispatchSummary(null);
    setCopiedReleaseCode(false);
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
    const pdfFiles = nextFiles.filter(isPdfFile).slice(0, maxFiles);

    if (pdfFiles.length !== nextFiles.length) {
      setError("Only PDF files can be uploaded. Unsupported files were removed.");
    } else {
      setError("");
    }

    setQueuedJob(null);
    setDispatchSummary(null);
    setCopiedReleaseCode(false);
    setFiles(pdfFiles);

    if (pdfFiles.length) {
      const previousDefaultName = files.length ? getDefaultJobName(files) : "";
      if (!jobName || jobName === previousDefaultName) {
        setJobName(getDefaultJobName(pdfFiles));
      }
    } else if (files.length && jobName === getDefaultJobName(files)) {
      setJobName("");
      setUploadStep(1);
    }
  };

  const validateFiles = () => {
    if (files.length === 0) {
      setError("Choose at least one PDF file before continuing.");
      setUploadStep(1);
      return false;
    }

    if (files.some((file) => !isPdfFile(file))) {
      setError(
        "Only PDF files can be uploaded right now. Convert DOCX, PPTX, XLSX, or images to PDF before upload.",
      );
      setUploadStep(1);
      return false;
    }

    return true;
  };

  const validateSettings = () => {
    if (!selectedQueueId) {
      setError("Please choose the Secure Release queue before continuing.");
      setUploadStep(2);
      return false;
    }

    if (!selectedQueue || !isSecureReleaseQueue(selectedQueue)) {
      setError("Please choose a valid Secure Release queue before continuing.");
      setUploadStep(2);
      return false;
    }

    if (selectedQueuePrinterTargets.length === 0) {
      setError("No target printers are available for the selected queue.");
      setUploadStep(2);
      return false;
    }

    if (!selectedPrinter) {
      setError("Please choose one target printer before uploading.");
      setUploadStep(2);
      return false;
    }

    return true;
  };

  const goToStep = (nextStep: UploadStep) => {
    setError("");

    if (nextStep >= 2 && !validateFiles()) return;
    if (nextStep >= 3 && !validateSettings()) return;

    setUploadStep(nextStep);
  };

  const handleSaveDraft = async () => {
    setError("");
    setSuccess("");

    if (!validateFiles()) return;

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
      setUploadStep(2);
      setSuccess(`Draft "${draft.name}" was restored. Review it, then continue to confirmation.`);
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

    if (!validateFiles() || !validateSettings()) return;

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

  const renderUploadFilesStep = () => (
    <section className="space-y-5">
      <FileUpload
        value={files}
        onChange={handleFilesChange}
        onReject={(message) => setError(message)}
        multiple
        maxFiles={maxFiles}
        accept={PDF_ACCEPT}
        title="Upload PDF files"
        description="Drag and drop one or more PDF documents. Files are held securely until release."
        emptyHelperText={`Upload up to ${maxFiles} PDF files. Office files need PDF conversion before upload.`}
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
            Configure
          </Button>
        </div>
      </div>
    </section>
  );

  const renderConfigureStep = () => (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
      <div className="rounded-lg border bg-[var(--surface)] p-5" style={{ borderColor: "var(--border)" }}>
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--color-brand-500)_12%,var(--surface-2))] text-[var(--color-brand-500)]">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-[var(--title)]">Job details</h2>
            <p className="text-sm text-[var(--paragraph)]">
              Name the job and choose a secure release queue.
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
      </div>

      <div className="rounded-lg border bg-[var(--surface)] p-5" style={{ borderColor: "var(--border)" }}>
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--color-brand-500)_12%,var(--surface-2))] text-[var(--color-brand-500)]">
            <Printer className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-[var(--title)]">Print settings</h2>
            <p className="text-sm text-[var(--paragraph)]">
              Defaults are loaded from your settings.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
              Color
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

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setUploadStep(1)}
            iconLeft={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={files.length === 0 || savingDraft}
              onClick={handleSaveDraft}
              iconLeft={
                savingDraft ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Archive className="h-4 w-4" />
                )
              }
            >
              {savingDraft ? "Saving..." : "Save draft"}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => goToStep(3)}
              iconRight={<ArrowRight className="h-4 w-4" />}
            >
              Review
            </Button>
          </div>
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
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-lg border bg-[var(--surface)] p-5" style={{ borderColor: "var(--border)" }}>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--color-brand-500)_12%,var(--surface-2))] text-[var(--color-brand-500)]">
              <Layers3 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-[var(--title)]">Review before upload</h2>
              <p className="text-sm text-[var(--paragraph)]">
                Confirm the job details before it enters the secure release queue.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <SummaryTile label="Files selected" value={`${files.length} file${files.length === 1 ? "" : "s"} (${formatFileSize(totalSelectedSize)})`} />
            <SummaryTile label="Queue" value={selectedQueue?.name || "Not selected"} />
            <SummaryTile label="Target printer" value={selectedPrinter?.name || "Not selected"} />
            <SummaryTile label="Copies" value={copies} />
            <SummaryTile label="Color" value={colorMode} />
            <SummaryTile label="Sides" value={formatPrintMode(printMode)} />
            <SummaryTile label="Paper size" value={paperSize || "A4"} />
            <SummaryTile label="Estimated pages/cost" value="Calculated after upload" />
          </div>

          <div className="mt-5 rounded-lg border bg-[var(--surface-2)] p-4" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold text-[var(--title)]">
              Files
            </p>
            <ul className="mt-3 space-y-2">
              {files.map((file) => (
                <li
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="flex flex-col gap-1 rounded-md bg-[var(--surface)] px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="truncate font-medium text-[var(--title)]">
                    {file.name}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {formatFileSize(file.size)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-lg border bg-[var(--surface)] p-5" style={{ borderColor: "var(--border)" }}>
          <h3 className="text-base font-bold text-[var(--title)]">Ready to queue?</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--paragraph)]">
            The backend stores PDFs only, queues the job, and returns the actual one-time release code after upload.
          </p>
          <div className="mt-5 space-y-3">
            <Button
              type="button"
              variant="primary"
              className="w-full"
              disabled={loading || submitting || files.length === 0 || !selectedQueue}
              onClick={() => void handleSubmit()}
              iconLeft={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            >
              {submitting ? "Queuing job..." : "Upload and Queue"}
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
              Back to settings
            </Button>
          </div>
        </div>
      </section>
    );
  };

  const renderUploadTab = () => (
    <div className="space-y-5">
      <StepIndicator currentStep={uploadStep} />
      {uploadStep === 1 ? renderUploadFilesStep() : null}
      {uploadStep === 2 ? renderConfigureStep() : null}
      {uploadStep === 3 ? renderConfirmationStep() : null}
    </div>
  );

  const renderDraftsTab = () => (
    <section className="space-y-5">
      <div
        className="flex flex-col gap-4 rounded-lg border bg-[var(--surface)] p-5 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: "var(--border)" }}
      >
        <div>
          <h2 className="text-lg font-bold text-[var(--title)]">Saved drafts</h2>
          <p className="mt-1 text-sm text-[var(--paragraph)]">
            Restore saved PDF jobs into the Upload flow or remove drafts you no longer need.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={loadDrafts}
          disabled={draftsLoading}
          iconLeft={
            draftsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )
          }
        >
          Refresh
        </Button>
      </div>

      {draftsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-52 animate-pulse rounded-lg border bg-[var(--surface)]"
              style={{ borderColor: "var(--border)" }}
            />
          ))}
        </div>
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

      {!draftsLoading && drafts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {drafts.map((draft) => {
            const firstFile = draft.files[0];
            const actionInProgress = draftActionId === draft.id;

            return (
              <article
                key={draft.id}
                className="flex min-h-[260px] flex-col rounded-lg border bg-[var(--surface)] p-5"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                      color: "var(--color-brand-500)",
                    }}
                  >
                    <FileText className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-[var(--title)]">
                      {draft.name}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {draft.fileCount} file{draft.fileCount === 1 ? "" : "s"}
                      {firstFile ? ` - ${formatFileSize(firstFile.size)}` : ""}
                    </p>
                    <p className="mt-2 flex items-center gap-1 text-xs text-[var(--muted)]">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatDraftDate(draft.lastSavedAt)}
                    </p>
                  </div>
                </div>

                <dl className="mt-5 grid gap-2 text-xs">
                  <div className="rounded-md bg-[var(--surface-2)] px-3 py-2">
                    <dt className="text-[var(--muted)]">Queue</dt>
                    <dd className="mt-1 truncate font-semibold text-[var(--title)]">
                      {draft.settings.queueName || "Not selected"}
                    </dd>
                  </div>
                  <div className="rounded-md bg-[var(--surface-2)] px-3 py-2">
                    <dt className="text-[var(--muted)]">Settings</dt>
                    <dd className="mt-1 truncate font-semibold text-[var(--title)]">
                      {draft.settings.copies || 1}x, {draft.settings.colorMode},{" "}
                      {formatPrintMode(draft.settings.mode)},{" "}
                      {draft.settings.paperSize || "A4"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
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
                    disabled={actionInProgress}
                    onClick={() => setDraftToDelete(draft)}
                    iconLeft={<Trash2 className="h-4 w-4" />}
                  >
                    Delete
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
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
        <p className="text-sm text-[var(--muted)]">
          PDF only for now. Office conversion remains disabled.
        </p>
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
