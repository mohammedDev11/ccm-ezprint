const mongoose = require("mongoose");
const fs = require("fs/promises");
const path = require("path");
const env = require("../../config/env");
const User = require("../../models/User");
const PrintJob = require("../../models/PrintJob");
const PrintDraft = require("../../models/PrintDraft");
const Queue = require("../../models/Queue");
const Printer = require("../../models/Printer");
const Group = require("../../models/Group");
const { createHttpError } = require("../../utils/http");
const {
  formatDateTimeLabel,
  getMinutesAgo,
  toAgoLabel,
} = require("../../utils/formatters");
const { applyQuotaChange, refundJobQuotaIfNeeded } = require("../quota/quota.service");
const { createNotification } = require("../notifications/notifications.service");
const { recordAuditLog } = require("../logs/logs.service");
const { ensureDefaultPrinterSetup } = require("../printers/printer.provision.service");
const {
  storePrintFile,
  dispatchPrintFile,
  isPrintDispatchDisabled,
} = require("./print-dispatch.service");

const getPrinterName = (job) =>
  job.printer?.printerId?.name || job.printer?.printerName || "Unassigned";

const getSubmittedAt = (job) => job.status?.submittedAt || job.createdAt;

const getPrintedAt = (job) => job.status?.printedAt || getSubmittedAt(job);

const getReadinessPercent = (job) => job.status?.readinessPercent || 0;

const roundAmount = (value) => Number(Number(value || 0).toFixed(2));

const toIdString = (value) => value?.toString?.() || "";

const MAX_PRINT_FILES_PER_JOB = 10;

const isPrintingRestricted = (user) =>
  user.printing?.enabled === false || user.printing?.restricted === true;

const isPendingReleaseStatus = (job) =>
  ["Pending Release", "Held"].includes(job.status?.current || "");

const getConfiguredSecureReleaseQueueNames = () =>
  new Set([
    env.printDefaultQueueName,
    ...(env.printAdditionalPrinters || [])
      .map((printer) => printer.queueName)
      .filter(Boolean),
  ]);

const isConfiguredSecureReleaseQueue = (queue) => {
  if (!queue) {
    return false;
  }

  const configuredQueueNames = getConfiguredSecureReleaseQueueNames();
  const isSecureRelease =
    queue.type === "Secure Release Queue" ||
    queue.security?.secureRelease !== false ||
    queue.security?.manualReleaseRequired !== false;

  return configuredQueueNames.has(queue.name) && isSecureRelease;
};

const buildActorPayload = (actor = {}) => ({
  userId: actor.userId,
  username: actor.username,
  role: actor.role,
  ipAddress: actor.ipAddress,
  userAgent: actor.userAgent,
});

const buildDocumentAttributes = (job) => {
  if (job.printSettings?.attributes?.length) {
    return job.printSettings.attributes;
  }

  return [job.document?.fileType?.toUpperCase(), getPrintModeLabel(job)].filter(Boolean);
};

const getRequiredUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw createHttpError(404, "User not found.");
  }

  return user;
};

const getRequiredQueue = async (queueId) => {
  const queue = await Queue.findById(queueId).populate("printers.default printers.assigned");

  if (!queue) {
    throw createHttpError(404, "Queue not found.");
  }

  return queue;
};

const getRequiredJob = async (jobId) => {
  const query = mongoose.isValidObjectId(jobId)
    ? { $or: [{ _id: jobId }, { jobId }] }
    : { jobId };
  const job = await PrintJob.findOne(query).populate("printer.printerId");

  if (!job) {
    throw createHttpError(404, "Print job not found.");
  }

  return job;
};

const syncPrinterQueueLink = async (printer, queue) => {
  if (!printer || !queue) {
    return printer;
  }

  if (toIdString(printer.queue?.assignedQueueId) === toIdString(queue._id)) {
    return printer;
  }

  printer.queue = {
    ...printer.queue,
    assignedQueueId: queue._id,
    queueName: queue.name,
    enabled: queue.status?.current === "Active" && queue.isActive !== false,
    manualReleaseRequired: queue.security?.manualReleaseRequired ?? true,
    pinRequired: queue.security?.requirePrinterAuthentication ?? false,
  };

  await printer.save();
  return printer;
};

const resolvePrinterForQueue = async (queue) => {
  let queueWasUpdated = false;
  let printer =
    queue.printers?.default?._id
      ? queue.printers.default
      : queue.printers?.assigned?.[0]?._id
        ? queue.printers.assigned[0]
        : null;

  if (!printer) {
    const fallbackPrinter = await Printer.findOne({ isActive: true }).sort({ createdAt: 1 });

    if (!fallbackPrinter) {
      throw createHttpError(409, "No printer is linked to the selected queue.");
    }

    queue.printers = {
      ...queue.printers,
      assigned: [fallbackPrinter._id],
      default: fallbackPrinter._id,
      totalAssigned: 1,
      onlineCount: fallbackPrinter.status?.current === "Online" ? 1 : 0,
    };
    await queue.save();
    queueWasUpdated = true;
    printer = fallbackPrinter;
  }

  const resolvedPrinter =
    printer?.name || printer?.model ? printer : await Printer.findById(printer);

  if (!resolvedPrinter) {
    throw createHttpError(409, "The selected queue is missing a valid printer mapping.");
  }

  if (
    !queue.printers?.default ||
    toIdString(queue.printers.default?._id || queue.printers.default) !==
      toIdString(resolvedPrinter._id)
  ) {
    queue.printers = {
      ...queue.printers,
      default: resolvedPrinter._id,
      assigned: (queue.printers?.assigned || []).some(
        (item) => toIdString(item?._id || item) === toIdString(resolvedPrinter._id),
      )
        ? queue.printers.assigned
        : [...(queue.printers?.assigned || []), resolvedPrinter._id],
      totalAssigned: Math.max(queue.printers?.totalAssigned || 0, 1),
      onlineCount:
        resolvedPrinter.status?.current === "Online"
          ? Math.max(queue.printers?.onlineCount || 0, 1)
          : queue.printers?.onlineCount || 0,
    };
    await queue.save();
    queueWasUpdated = true;
  }

  await syncPrinterQueueLink(resolvedPrinter, queue);

  if (queueWasUpdated) {
    await queue.populate("printers.default printers.assigned");
  }

  return {
    queue,
    printer: resolvedPrinter,
  };
};

const isPrinterAssignedToQueue = (queue, printerId) => {
  const selectedId = toIdString(printerId);

  if (!selectedId) {
    return false;
  }

  return [queue.printers?.default, ...(queue.printers?.assigned || [])].some(
    (printer) => toIdString(printer?._id || printer) === selectedId,
  );
};

const getQueuePrinterIds = (queue) =>
  [queue.printers?.default, ...(queue.printers?.assigned || [])]
    .map((printer) => toIdString(printer?._id || printer))
    .filter(Boolean);

const toPrinterLookupKey = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const findAssignedPrinterByName = async (queue, printerName) => {
  const selectedName = toPrinterLookupKey(printerName);

  if (!selectedName) {
    return null;
  }

  const printerIds = getQueuePrinterIds(queue);
  const printers = await Printer.find({
    _id: { $in: printerIds },
    isActive: true,
  });

  return (
    printers.find((printer) => toPrinterLookupKey(printer.name) === selectedName) ||
    null
  );
};

const resolveSelectedPrinterForQueue = async (queue, printerId, printerName = "") => {
  if (!printerId && !printerName) {
    return {
      ...(await resolvePrinterForQueue(queue)),
      selectedPrinterOnly: false,
    };
  }

  if (printerId && !mongoose.isValidObjectId(printerId)) {
    throw createHttpError(400, "Selected printer is invalid.");
  }

  const printer = printerId
    ? await Printer.findOne({
        _id: printerId,
        isActive: true,
      })
    : await findAssignedPrinterByName(queue, printerName);

  if (!printer) {
    throw createHttpError(404, "Selected printer was not found.");
  }

  if (!isPrinterAssignedToQueue(queue, printer._id)) {
    throw createHttpError(400, "Selected printer is not assigned to the selected queue.");
  }

  await syncPrinterQueueLink(printer, queue);

  return {
    queue,
    printer,
    selectedPrinterOnly: true,
  };
};

const resolveDispatchPrintersForQueue = async (
  queue,
  primaryPrinter,
  { selectedPrinterOnly = false } = {},
) => {
  if (selectedPrinterOnly) {
    return primaryPrinter ? [primaryPrinter] : [];
  }

  const orderedIds = [];
  const seen = new Set();

  [primaryPrinter, ...(queue?.printers?.assigned || [])].forEach((printer) => {
    const id = toIdString(printer?._id || printer);

    if (!id || seen.has(id)) {
      return;
    }

    seen.add(id);
    orderedIds.push(id);
  });

  if (orderedIds.length === 0) {
    return primaryPrinter ? [primaryPrinter] : [];
  }

  const printers = await Printer.find({ _id: { $in: orderedIds } });
  const printersById = new Map(printers.map((printer) => [toIdString(printer._id), printer]));

  return orderedIds
    .map((id) => printersById.get(id))
    .filter(
      (printer) =>
        printer &&
        printer.isActive !== false &&
        printer.status?.current === "Online" &&
        Boolean(printer.network?.ipAddress),
    );
};

const getDispatchPortForLog = () =>
  env.printTransport === "socket" ? env.printSocketPort : 0;

const mapDispatchPrinterForLog = (printer) => ({
  printerId: toIdString(printer?._id || printer),
  printerName: printer?.name || "",
  ipAddress: printer?.network?.ipAddress || "",
  port: getDispatchPortForLog(),
  status: printer?.status?.current || "",
  isActive: printer?.isActive !== false,
});

const buildUploadDispatchLogBase = (queue, logContext = {}) => ({
  phase: logContext.phase || "upload",
  jobId: logContext.jobId || "",
  queueId: toIdString(queue?._id),
  queueName: queue?.name || "",
});

const logUploadDispatchInfo = (message, payload) => {
  console.info(`[print-upload] ${message}`, payload);
};

const logUploadDispatchWarning = (message, payload) => {
  console.warn(`[print-upload] ${message}`, payload);
};

const dispatchPrintFileToQueuePrinters = async ({
  queue,
  primaryPrinter,
  selectedPrinterOnly = false,
  filePath,
  buffer,
  holdOnPrinter = false,
  holdKey = "",
  jobName = "",
  username = "",
  logContext = null,
}) => {
  const printers = await resolveDispatchPrintersForQueue(queue, primaryPrinter, {
    selectedPrinterOnly,
  });
  const shouldLogUploadDispatch = Boolean(logContext);
  const logBase = shouldLogUploadDispatch
    ? buildUploadDispatchLogBase(queue, logContext)
    : null;

  if (shouldLogUploadDispatch) {
    logUploadDispatchInfo("selected queue", logBase);
    logUploadDispatchInfo("resolved target printers", {
      ...logBase,
      targetCount: printers.length,
      printers: printers.map(mapDispatchPrinterForLog),
    });
  }

  if (printers.length === 0) {
    if (shouldLogUploadDispatch) {
      logUploadDispatchWarning("no eligible assigned printers, using primary printer fallback", {
        ...logBase,
        printer: mapDispatchPrinterForLog(primaryPrinter),
      });
    }

    try {
      const result = await dispatchPrintFile({
        printer: primaryPrinter,
        filePath,
        buffer,
        holdOnPrinter,
        holdKey,
        jobName,
        username,
      });

      if (shouldLogUploadDispatch) {
        logUploadDispatchInfo("printer dispatch succeeded", {
          ...logBase,
          printer: mapDispatchPrinterForLog(primaryPrinter),
          bytesSent: result.bytesSent || 0,
          method: result.method || env.printTransport,
        });
      }

      return result;
    } catch (error) {
      if (shouldLogUploadDispatch) {
        logUploadDispatchWarning("printer dispatch failed", {
          ...logBase,
          printer: mapDispatchPrinterForLog(primaryPrinter),
          message: error.message,
        });
      }

      throw error;
    }
  }

  const destinations = [];
  const failures = [];

  for (const [index, printer] of printers.entries()) {
    if (shouldLogUploadDispatch) {
      logUploadDispatchInfo("dispatching to printer", {
        ...logBase,
        printer: mapDispatchPrinterForLog(printer),
      });
    }

    try {
      const result = await dispatchPrintFile({
        printer,
        filePath,
        buffer,
        holdOnPrinter,
        holdKey,
        jobName,
        username,
      });

      destinations.push({
        ...result,
        printerId: toIdString(printer._id),
        printerName: printer.name,
      });

      if (shouldLogUploadDispatch) {
        logUploadDispatchInfo("printer dispatch succeeded", {
          ...logBase,
          printer: mapDispatchPrinterForLog(printer),
          bytesSent: result.bytesSent || 0,
          method: result.method || env.printTransport,
        });
      }
    } catch (error) {
      if (shouldLogUploadDispatch) {
        logUploadDispatchWarning("printer dispatch failed", {
          ...logBase,
          printer: mapDispatchPrinterForLog(printer),
          message: error.message,
        });
      }

      if (index === 0) {
        throw error;
      }

      failures.push({
        printerId: toIdString(printer._id),
        printerName: printer.name,
        message: error.message,
      });
    }
  }

  const primaryResult = destinations[0];

  return {
    ...primaryResult,
    destinations,
    failures,
    destinationCount: destinations.length,
  };
};

const mapDispatchSummary = (dispatchResult) => {
  if (!dispatchResult) {
    return null;
  }

  return {
    method: dispatchResult.method || env.printTransport,
    destinationName: dispatchResult.destinationName || "",
    destinationCount: dispatchResult.destinationCount || 1,
    documentsDispatched: dispatchResult.documentsDispatched || 1,
    destinations: (dispatchResult.destinations || []).map((destination) => ({
      printerId: destination.printerId || "",
      printerName: destination.printerName || destination.destinationName || "",
      targetHost: destination.targetHost || "",
      bytesSent: destination.bytesSent || 0,
    })),
    failures: dispatchResult.failures || [],
    failureCount: dispatchResult.failures?.length || 0,
  };
};

const recordAdditionalDispatchFailures = async ({ actor, job, dispatchResult }) => {
  const failures = dispatchResult?.failures || [];

  if (failures.length === 0) {
    return;
  }

  try {
    await Promise.all(
      failures.map((failure) =>
        recordAuditLog({
          actor: buildActorPayload(actor),
          action: {
            name: "Additional Printer Dispatch Failed",
            category: "Job",
            details: `Additional printer dispatch failed for job "${job.jobId}".`,
          },
          resource: {
            type: "PrintJob",
            id: job._id,
            name: job.jobId,
            changes: {
              documentName: job.documentName,
              printerName: failure.printerName || "",
              queueName: job.printer?.queueName || "",
            },
          },
          outcome: {
            success: false,
            statusCode: 207,
            errorMessage: failure.message || "Additional printer dispatch failed.",
          },
        }),
      ),
    );
  } catch (error) {
    console.warn(
      `Unable to record additional printer dispatch failure for ${job.jobId}: ${error.message}`,
    );
  }
};

const canUserAccessQueue = (user, queue) => {
  try {
    ensureQueueAccessForUser(user, queue);
    return true;
  } catch {
    return false;
  }
};

const ensureSelectedPrinterForUpload = (payload = {}) => {
  if (payload.printerId || payload.printerName) {
    return;
  }

  throw createHttpError(400, "Select one target printer before uploading.");
};

const resolveQueueAndPrinterForSubmission = async (user, { queueId, printerId, printerName }) => {
  if (queueId) {
    const queue = await getRequiredQueue(queueId);
    ensureQueueAccessForUser(user, queue);

    return resolveSelectedPrinterForQueue(queue, printerId, printerName);
  }

  const { printer, queue } = await ensureDefaultPrinterSetup();

  if (!printer || !queue) {
    throw createHttpError(
      500,
      "No default printer/queue is configured. Add printer environment settings first.",
    );
  }

  const hydratedQueue = await getRequiredQueue(queue._id);
  ensureQueueAccessForUser(user, hydratedQueue);

  return resolveSelectedPrinterForQueue(hydratedQueue, printerId, printerName);
};

const resolveQueueAndPrinterForRelease = async (queue, job) => {
  if (!queue) {
    return {
      printer: null,
      selectedPrinterOnly: false,
    };
  }

  const storedPrinterId = toIdString(job.printer?.printerId?._id || job.printer?.printerId);

  if (!storedPrinterId) {
    return resolveSelectedPrinterForQueue(queue, "");
  }

  try {
    return await resolveSelectedPrinterForQueue(queue, storedPrinterId);
  } catch (error) {
    if ([400, 404].includes(error.status)) {
      return resolveSelectedPrinterForQueue(queue, "");
    }

    throw error;
  }
};

const createJobRecord = async ({ user, queue, printer, payload, actor, statusOverrides = {} }) => {
  const costPerPage = roundAmount(printer?.costPerPage || 0.05);
  const totalPages = payload.pages * payload.copies;
  const totalCost = roundAmount(totalPages * costPerPage);
  const now = new Date();
  const paperSize = payload.paperSize || "A4";
  const storedDocuments =
    payload.files?.length > 0
      ? payload.files
      : [
          {
            fileName: payload.fileName || payload.documentName,
            fileType: payload.fileType || "pdf",
            fileSize: payload.fileSize || 0,
            pages: payload.pages || 1,
            originalFileName: payload.originalFileName || payload.documentName,
            storagePath: payload.storagePath || "",
            storedFileName: payload.storedFileName || "",
            storedAt: payload.storedAt || null,
            checksumSha256: payload.checksumSha256 || "",
          },
        ].filter((document) => document.storagePath || document.fileName);
  const primaryDocument = storedDocuments[0] || {};
  const fileCount = Math.max(1, storedDocuments.length || payload.fileCount || 1);
  const aggregateFileSize = storedDocuments.reduce(
    (sum, document) => sum + (document.fileSize || 0),
    0,
  );

  const job = await PrintJob.create({
    jobId: payload.jobId || generateJobId(),
    documentName: payload.documentName,
    user: {
      userId: user._id,
      username: user.username,
      department: user.department || "",
    },
    printer: {
      printerId: printer?._id || null,
      printerName: printer?.name || queue?.name || "Unassigned",
      queueId: queue?._id || null,
      queueName: queue?.name || printer?.queue?.queueName || "",
    },
    document: {
      fileName:
        fileCount > 1
          ? `${fileCount} PDF files`
          : primaryDocument.fileName || payload.fileName || payload.documentName,
      fileType: payload.fileType || primaryDocument.fileType || "pdf",
      fileSize: aggregateFileSize || payload.fileSize || 0,
      pages: totalPages,
      fileCount,
      originalFileName:
        fileCount > 1
          ? `${fileCount} PDF files`
          : primaryDocument.originalFileName || payload.originalFileName || payload.documentName,
      storagePath: primaryDocument.storagePath || payload.storagePath || "",
      storedFileName: primaryDocument.storedFileName || payload.storedFileName || "",
      storedAt: primaryDocument.storedAt || payload.storedAt || null,
      checksumSha256: primaryDocument.checksumSha256 || payload.checksumSha256 || "",
    },
    documents: storedDocuments,
    printSettings: {
      colorMode: /color/i.test(payload.colorMode) ? "Color" : "B&W",
      mode: payload.mode,
      paperSize,
      quality: payload.quality,
      copies: payload.copies,
      attributes:
        payload.attributes?.length > 0
          ? payload.attributes
          : [
              fileCount > 1 ? `${fileCount} PDFs` : payload.fileType?.toUpperCase?.() || "PDF",
              /color/i.test(payload.colorMode) ? "Color" : "Black & White",
              payload.mode,
            ].filter(Boolean),
      options:
        payload.options?.length > 0
          ? payload.options
          : [
              payload.copies > 1 ? `x${payload.copies}` : "",
              fileCount > 1 ? `${fileCount} files` : "",
              paperSize,
            ].filter(Boolean),
    },
    source: {
      clientType: payload.clientType || "Web Upload",
      sourceIp: actor.ipAddress || "",
      userAgent: actor.userAgent || "",
    },
    status: {
      current: statusOverrides.current || "Pending Release",
      submittedAt: now,
      readinessPercent: statusOverrides.readinessPercent ?? (printer ? 100 : 0),
      printedAt: statusOverrides.printedAt || null,
      releasedAt: statusOverrides.releasedAt || null,
      dispatchedAt: statusOverrides.dispatchedAt || null,
    },
    cost: {
      costPerPage,
      totalCost,
      quotaDeducted: statusOverrides.quotaDeducted || false,
    },
    release: {
      method: queue?.security?.releaseMethod || "Manual",
      releaseCode:
        queue?.security?.secureRelease !== false
          ? String(Math.floor(1000 + Math.random() * 9000))
          : "",
      releaseCodeExpiry:
        queue?.security?.secureRelease !== false
          ? new Date(now.getTime() + 1000 * 60 * 60 * 24)
          : null,
      maxReleaseAttempts: 3,
      failedReleaseAttempts: 0,
    },
    dispatch: {
      method: "",
      targetHost: printer?.network?.ipAddress || "",
      targetPort: 0,
      destinationName: printer?.name || "",
      attempts: 0,
      lastAttemptAt: null,
      lastSuccessfulAt: null,
      bytesSent: 0,
      jobReference: "",
    },
    notes: payload.notes,
  });

  return {
    job,
    totalPages,
    totalCost,
    costPerPage,
  };
};

const recordJobSubmittedStats = async ({ user, queue, now }) => {
  await Promise.all([
    User.findByIdAndUpdate(user._id, {
      $inc: {
        "statistics.totalJobsSubmitted": 1,
      },
      $set: {
        "statistics.lastActivityAt": now,
      },
    }),
    queue
      ? Queue.findByIdAndUpdate(queue._id, {
          $inc: {
            "statistics.totalJobs": 1,
          },
        })
      : Promise.resolve(),
    user.groupId
      ? Group.findByIdAndUpdate(user.groupId, {
          $inc: {
            "statistics.totalJobsSubmitted": 1,
          },
        })
      : Promise.resolve(),
  ]);
};

const recordSuccessfulPrintStats = async ({ user, queueId, printerId, groupId, pages, totalCost, now }) => {
  await Promise.all([
    User.findByIdAndUpdate(user._id, {
      $inc: {
        "statistics.totalPagesPrinted": pages || 0,
      },
      $set: {
        "statistics.lastActivityAt": now,
      },
    }),
    queueId
      ? Queue.findByIdAndUpdate(queueId, {
          $inc: {
            "statistics.totalPagesPrinted": pages || 0,
            "statistics.printedToday": 1,
            "statistics.printedThisMonth": 1,
          },
        })
      : Promise.resolve(),
    printerId
      ? Printer.findByIdAndUpdate(printerId, {
          $inc: {
            "statistics.totalPagesPrinted": pages || 0,
            "statistics.totalJobsSubmitted": 1,
            "statistics.totalCost": totalCost || 0,
          },
          $set: {
            "statistics.lastUsedAt": now,
          },
        })
      : Promise.resolve(),
    groupId
      ? Group.findByIdAndUpdate(groupId, {
          $inc: {
            "statistics.totalPagesPrinted": pages || 0,
            "statistics.totalCost": totalCost || 0,
          },
        })
      : Promise.resolve(),
  ]);
};

const recordAdditionalPrinterDispatchStats = async ({
  dispatchResult,
  primaryPrinterId,
  pages,
  totalCost,
  now,
}) => {
  const primaryId = toIdString(primaryPrinterId);
  const additionalPrinterIds = Array.from(
    new Set(
      (dispatchResult?.destinations || [])
        .map((destination) => destination.printerId)
        .filter((printerId) => printerId && printerId !== primaryId),
    ),
  );

  if (additionalPrinterIds.length === 0) {
    return;
  }

  await Promise.all(
    additionalPrinterIds.map((printerId) =>
      Printer.findByIdAndUpdate(printerId, {
        $inc: {
          "statistics.totalPagesPrinted": pages || 0,
          "statistics.totalJobsSubmitted": 1,
          "statistics.totalCost": totalCost || 0,
        },
        $set: {
          "statistics.lastUsedAt": now,
        },
      }),
    ),
  );
};

const ensureQueueAccessForUser = (user, queue) => {
  if (queue.status?.current !== "Active" || queue.isActive === false) {
    throw createHttpError(409, "This queue is not active.");
  }

  if (isPrintingRestricted(user)) {
    throw createHttpError(403, "Printing is restricted for this user.");
  }

  if (
    queue.access?.allowedRoles?.length &&
    !queue.access.allowedRoles.includes(user.role || "User")
  ) {
    throw createHttpError(403, "This user cannot submit jobs to the selected queue.");
  }

  if (
    queue.access?.allowedDepartments?.length &&
    user.department &&
    !queue.access.allowedDepartments.includes(user.department)
  ) {
    throw createHttpError(403, "This queue is not available for the user's department.");
  }

  if (
    queue.access?.allowedGroups?.length &&
    (!user.groupId ||
      !queue.access.allowedGroups.some((groupId) => toIdString(groupId) === toIdString(user.groupId)))
  ) {
    throw createHttpError(403, "This queue is restricted to other groups.");
  }

  if (
    queue.access?.restrictedUsers?.some(
      (restrictedUserId) => toIdString(restrictedUserId) === toIdString(user._id),
    )
  ) {
    throw createHttpError(403, "This user is restricted from the selected queue.");
  }
};

const generateJobId = () => {
  return `job-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
};

const refreshQueuePendingCount = async (queueId) => {
  if (!queueId) {
    return;
  }

  const pendingJobs = await PrintJob.countDocuments({
    "printer.queueId": queueId,
    "status.current": { $in: ["Pending Release", "Held"] },
  });

  await Queue.findByIdAndUpdate(queueId, {
    $set: {
      "statistics.pendingJobs": pendingJobs,
    },
  });
};

const mapCreatedJob = (job) => {
  return {
    id: job._id.toString(),
    jobId: job.jobId,
    documentName: job.documentName,
    queueId: toIdString(job.printer?.queueId),
    queueName: job.printer?.queueName || "",
    printerId: toIdString(job.printer?.printerId),
    printerName: getPrinterName(job),
    pages: job.document?.pages || 0,
    cost: job.cost?.totalCost || 0,
    status: job.status?.current,
    submittedAt: job.status?.submittedAt || job.createdAt,
    releaseMethod: job.release?.method || "PIN",
    releaseCode: job.release?.releaseCode || "",
    releaseCodeExpiry: job.release?.releaseCodeExpiry || null,
    fileStorage: job.document?.storagePath || "",
    fileCount: job.documents?.length || job.document?.fileCount || 1,
    errorMessage: job.errorMessage || "",
  };
};

const mapPrintDraft = (draft) => ({
  id: draft._id.toString(),
  name: draft.name || draft.settings?.documentName || "Untitled draft",
  documentName: draft.settings?.documentName || draft.name || "",
  fileCount: draft.files?.length || 0,
  createdFrom: draft.source?.createdFrom || "print-page",
  createdAt: draft.createdAt,
  lastSavedAt: draft.updatedAt,
  settings: {
    queueId: toIdString(draft.settings?.queueId),
    queueName: draft.settings?.queueName || "",
    documentName: draft.settings?.documentName || "",
    copies: draft.settings?.copies || 1,
    colorMode: draft.settings?.colorMode || "Black & White",
    mode: draft.settings?.mode || "Simplex",
    paperSize: draft.settings?.paperSize || "A4",
    quality: draft.settings?.quality || "Normal",
  },
  files: (draft.files || []).map((file) => ({
    id: file._id.toString(),
    name: file.originalFileName || file.fileName || "document.pdf",
    type: file.fileType || "application/pdf",
    size: file.fileSize || 0,
    pages: file.pages || 1,
  })),
});

const getRequiredDraftForUser = async (userId, draftId) => {
  if (!mongoose.isValidObjectId(draftId)) {
    throw createHttpError(404, "Print draft not found.");
  }

  const draft = await PrintDraft.findOne({
    _id: draftId,
    "user.userId": userId,
  });

  if (!draft) {
    throw createHttpError(404, "Print draft not found.");
  }

  return draft;
};

const resolveStoredDraftPath = (relativePath = "") => {
  const storageRoot = path.resolve(process.cwd(), env.printStorageDir);
  const absolutePath = path.resolve(process.cwd(), relativePath);
  const relativeToStorage = path.relative(storageRoot, absolutePath);

  if (relativeToStorage.startsWith("..") || path.isAbsolute(relativeToStorage)) {
    throw createHttpError(400, "Draft file path is invalid.");
  }

  return absolutePath;
};

const removeStoredDraftFile = async (relativePath = "") => {
  if (!relativePath) {
    return;
  }

  try {
    await fs.unlink(resolveStoredDraftPath(relativePath));
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

const decodeBatchUploadFile = (file) => {
  if (!file.contentBase64) {
    throw createHttpError(400, `File "${file.fileName}" is missing upload content.`);
  }

  return Buffer.from(file.contentBase64, "base64");
};

const mapStoredFileDocument = ({ storedFile, sourceFile, storedAt }) => ({
  originalFileName:
    sourceFile.originalFileName || sourceFile.fileName || storedFile.storedFileName,
  fileName: sourceFile.fileName || storedFile.storedFileName,
  fileType: storedFile.contentType,
  fileSize: storedFile.fileSize,
  pages: Math.max(1, storedFile.pageCount || 1),
  storagePath: storedFile.relativePath,
  storedFileName: storedFile.storedFileName,
  storedAt,
  checksumSha256: storedFile.checksumSha256,
});

const storeBatchPrintFiles = async ({ files, idPrefix }) => {
  if (!Array.isArray(files) || files.length === 0) {
    throw createHttpError(400, "At least one PDF file is required.");
  }

  if (files.length > MAX_PRINT_FILES_PER_JOB) {
    throw createHttpError(400, `Upload up to ${MAX_PRINT_FILES_PER_JOB} PDF files at a time.`);
  }

  const storedAt = new Date();
  const storedDocuments = [];

  try {
    for (const [index, file] of files.entries()) {
      const buffer = decodeBatchUploadFile(file);
      const storedFile = await storePrintFile({
        jobId: `${idPrefix}-${index + 1}`,
        originalFileName: file.originalFileName || file.fileName || `document-${index + 1}.pdf`,
        contentType: file.fileType,
        buffer,
      });

      storedDocuments.push(
        mapStoredFileDocument({
          storedFile,
          sourceFile: file,
          storedAt,
        }),
      );
    }
  } catch (error) {
    await Promise.all(
      storedDocuments.map((document) =>
        removeStoredDraftFile(document.storagePath).catch(() => {}),
      ),
    );
    throw error;
  }

  return storedDocuments;
};

const getJobStoredDocuments = (job) => {
  if (job.documents?.length) {
    return job.documents;
  }

  if (job.document?.storagePath) {
    return [job.document];
  }

  return [];
};

const dispatchStoredDocumentsToQueuePrinters = async ({
  queue,
  primaryPrinter,
  selectedPrinterOnly = false,
  documents,
  holdOnPrinter = false,
  holdKey = "",
  jobName = "",
  username = "",
  logContext = null,
}) => {
  if (!documents.length) {
    throw createHttpError(409, "No stored printable files are available for this job.");
  }

  const results = [];

  for (const [index, document] of documents.entries()) {
    const suffix = documents.length > 1 ? ` (${index + 1}/${documents.length})` : "";
    const result = await dispatchPrintFileToQueuePrinters({
      queue,
      primaryPrinter,
      selectedPrinterOnly,
      filePath: document.storagePath,
      holdOnPrinter,
      holdKey,
      jobName: `${jobName || document.originalFileName || "Print Job"}${suffix}`,
      username,
      logContext: logContext
        ? {
            ...logContext,
            fileName: document.originalFileName || document.fileName || "",
            fileIndex: index + 1,
          }
        : null,
    });

    results.push(result);
  }

  const firstResult = results[0] || {};
  const destinations = results.flatMap((result) => result.destinations || []);
  const failures = results.flatMap((result) => result.failures || []);

  return {
    ...firstResult,
    bytesSent: results.reduce((sum, result) => sum + (result.bytesSent || 0), 0),
    documentsDispatched: documents.length,
    destinationCount: firstResult.destinationCount || firstResult.destinations?.length || 1,
    destinations,
    failures,
  };
};

const mapQueuePrinterTarget = (printer) => {
  const id = toIdString(printer?._id || printer);

  if (!id && !printer?.name) {
    return null;
  }

  return {
    id,
    name: printer?.name || "",
    status: printer?.status?.current || "",
    online: printer?.status?.current === "Online" && printer?.isActive !== false,
    isActive: printer?.isActive !== false,
    ipAddress: printer?.network?.ipAddress || "",
  };
};

const getQueuePrinterTargets = (queue, fallbackPrinter) => {
  const assignedTargets = (queue.printers?.assigned || [])
    .map(mapQueuePrinterTarget)
    .filter(Boolean);

  if (assignedTargets.length > 0) {
    return assignedTargets;
  }

  return [fallbackPrinter, queue.printers?.default]
    .map(mapQueuePrinterTarget)
    .filter(Boolean)
    .slice(0, 1);
};

const mapPrintOptionQueue = (queue, printer) => {
  const assignedPrinters = getQueuePrinterTargets(queue, printer);

  return {
    id: queue._id.toString(),
    name: queue.name,
    description: queue.description || "",
    type: queue.type,
    secureRelease: queue.security?.secureRelease ?? true,
    printerId: toIdString(printer?._id || queue.printers?.default?._id || queue.printers?.default),
    printerName: printer?.name || queue.printers?.default?.name || "",
    assignedPrinters,
    targetPrinterCount: assignedPrinters.length,
  };
};

const mapReleaseAdminJob = (job, user) => {
  return {
    id: job._id.toString(),
    jobId: job.jobId,
    userName: user?.fullName || job.user?.username || "Unknown user",
    userEmail: user?.email || "",
    documentName: job.documentName,
    printerName: getPrinterName(job),
    pages: job.document?.pages || 0,
    options: [
      job.printSettings?.colorMode || "B&W",
      job.printSettings?.mode || "Simplex",
      job.printSettings?.copies > 1 ? `x${job.printSettings.copies}` : "",
    ].filter(Boolean),
    status: "Queued",
    submittedAt: formatDateTimeLabel(getSubmittedAt(job)),
    queueName: job.printer?.queueName || "",
    cost: job.cost?.totalCost || 0,
  };
};

const assertJobOwnership = (job, actor, scope) => {
  if (scope === "admin" || scope === "printer") {
    return;
  }

  if (toIdString(job.user?.userId) !== toIdString(actor.userId)) {
    throw createHttpError(403, "You can only manage your own jobs.");
  }
};

const markInsufficientBalanceNotification = async (user, job) => {
  return createNotification({
    title: "Insufficient balance for print release",
    message: `You do not have enough balance to release "${job.documentName}".`,
    type: "system_warning",
    source: "System",
    severity: "warning",
    targetAudience: {
      specificUsers: [user._id],
    },
    relatedTo: {
      userId: user._id,
      jobId: job._id,
      queueId: job.printer?.queueId || null,
    },
  });
};

const markJobQueuedNotification = async (user, job) => {
  return createNotification({
    title: "Print job queued for release",
    message: `Your document "${job.documentName}" is stored and waiting in ${job.printer?.queueName || "the selected queue"}.`,
    type: "system_warning",
    source: "Queue",
    severity: "info",
    targetAudience: {
      specificUsers: [user._id],
    },
    relatedTo: {
      userId: user._id,
      jobId: job._id,
      printerId: job.printer?.printerId || null,
      printerName: job.printer?.printerName || "",
      queueId: job.printer?.queueId || null,
    },
  });
};

const markJobReleasedNotification = async (user, job) => {
  return createNotification({
    title: "Print job released successfully",
    message: `Your document "${job.documentName}" has been released successfully.`,
    type: "job_printed",
    source: "Queue",
    severity: "info",
    targetAudience: {
      specificUsers: [user._id],
    },
    relatedTo: {
      userId: user._id,
      jobId: job._id,
      printerId: job.printer?.printerId || null,
      printerName: job.printer?.printerName || "",
      queueId: job.printer?.queueId || null,
    },
  });
};

const markReleaseAttemptFailedNotification = async (user, job, errorMessage) => {
  return createNotification({
    title: "Print release attempt failed",
    message: `We could not dispatch "${job.documentName}" to ${job.printer?.printerName || "the printer"}: ${errorMessage}`,
    type: "job_failed",
    source: "System",
    severity: "error",
    targetAudience: {
      specificUsers: [user._id],
    },
    relatedTo: {
      userId: user._id,
      jobId: job._id,
      printerId: job.printer?.printerId || null,
      printerName: job.printer?.printerName || "",
      queueId: job.printer?.queueId || null,
    },
    details: {
      errorMessage,
      affectedDevice: job.printer?.printerName || "",
      actionRequired: true,
      suggestedAction: "Retry release from the admin queue or check printer connectivity.",
    },
  });
};

const markJobCancelledNotification = async (user, job, refunded) => {
  return createNotification({
    title: refunded ? "Pending job cancelled and refunded" : "Pending job cancelled",
    message: refunded
      ? `Your pending job "${job.documentName}" was cancelled and refunded.`
      : `Your pending job "${job.documentName}" was cancelled.`,
    type: refunded ? "job_refunded" : "system_warning",
    source: "System",
    severity: "info",
    targetAudience: {
      specificUsers: [user._id],
    },
    relatedTo: {
      userId: user._id,
      jobId: job._id,
      queueId: job.printer?.queueId || null,
    },
  });
};

const getPrintModeLabel = (job) => {
  const colorMode = job.printSettings?.colorMode === "Color" ? "Color" : "Black & White";
  const mode = job.printSettings?.mode === "Duplex" ? "Duplex" : "Single-sided";
  return `${colorMode} · ${mode}`;
};

const getRecentJobsData = async (userId) => {
  const jobs = await PrintJob.find({
    "user.userId": userId,
    "status.current": { $in: ["Printed", "Failed", "Refunded"] },
  })
    .populate("printer.printerId")
    .sort({ "status.submittedAt": -1 });

  return {
    jobs: jobs.map((job) => {
      const submittedAt = getSubmittedAt(job);
      const date = new Date(submittedAt);

      return {
        id: job.jobId || job._id.toString(),
        date: date.toISOString().slice(0, 10),
        dateOrder: Number(date.toISOString().slice(0, 10).replaceAll("-", "")),
        printerName: getPrinterName(job),
        documentName: job.documentName,
        pages: job.document?.pages || 0,
        cost: job.cost?.totalCost || 0,
        status: job.status?.current,
        attributes: job.printSettings?.attributes?.length
          ? job.printSettings.attributes
          : [job.document?.fileType?.toUpperCase(), getPrintModeLabel(job)].filter(Boolean),
        submittedFrom: job.source?.clientType || "Web Print",
        printedAt: formatDateTimeLabel(getPrintedAt(job)),
        note: job.notes || "",
      };
    }),
  };
};

const getPendingReleaseJobsData = async (userId) => {
  const user = await User.findById(userId);
  const jobs = await PrintJob.find({
    "user.userId": userId,
    "status.current": { $in: ["Pending Release", "Held"] },
  })
    .populate("printer.printerId")
    .sort({ "status.submittedAt": -1 });

  const quota = user?.printing?.quota?.remaining ?? 0;

  return {
    pendingReleaseQuota: quota,
    balance: quota,
    jobs: jobs.map((job) => {
      const submittedAt = getSubmittedAt(job);
      const readinessPercent = getReadinessPercent(job);
      const minutesAgo = getMinutesAgo(submittedAt);

      return {
        id: job.jobId || job._id.toString(),
        documentName: job.documentName,
        printerName: getPrinterName(job),
        fileCount: job.documents?.length || job.document?.fileCount || 1,
        pages: job.document?.pages || 0,
        cost: job.cost?.totalCost || 0,
        submittedAt: toAgoLabel(minutesAgo),
        submittedMinutesAgo: minutesAgo,
        clientSource: job.source?.clientType || "Web Print",
        fileType: (job.document?.fileType || "pdf").toUpperCase(),
        printMode: getPrintModeLabel(job),
        estimatedReady:
          job.status?.current === "Held"
            ? "Stored on printer"
            : readinessPercent >= 100
              ? "Ready now"
              : "Syncing to printer",
        readinessPercent,
        releaseCode: job.release?.releaseCode || "",
        releaseCodeExpiry: job.release?.releaseCodeExpiry || null,
      };
    }),
  };
};

const getPrintJobOptionsData = async (userId) => {
  const user = await getRequiredUser(userId);
  const provisionedSetup = await ensureDefaultPrinterSetup();

  const queues = await Queue.find({
    isActive: true,
    "status.current": "Active",
  })
    .populate("printers.default", "name model location network queue status isActive")
    .populate("printers.assigned", "name model location network queue status isActive");

  const accessibleQueues = queues.filter((queue) => canUserAccessQueue(user, queue));
  const preferredQueues = accessibleQueues.filter(
    (queue) =>
      isConfiguredSecureReleaseQueue(queue) ||
      (toIdString(queue._id) === toIdString(provisionedSetup.queue?._id) &&
        isConfiguredSecureReleaseQueue(queue)),
  );
  const mappedQueues = await Promise.all(
    preferredQueues.map(async (queue) => {
      const { printer } = await resolvePrinterForQueue(queue);
      return mapPrintOptionQueue(queue, printer);
    }),
  );
  const defaultQueue =
    preferredQueues.find((queue) => toIdString(queue._id) === toIdString(user.printing?.defaultQueueId)) ||
    preferredQueues.find((queue) => queue.name === env.printDefaultQueueName) ||
    (provisionedSetup.queue &&
    preferredQueues.find(
      (queue) => toIdString(queue._id) === toIdString(provisionedSetup.queue?._id),
    )) ||
    preferredQueues[0] ||
    null;

  return {
    queues: mappedQueues,
    defaultQueueId: defaultQueue?._id?.toString?.() || "",
    acceptedMimeTypes: ["application/pdf"],
    maxFiles: MAX_PRINT_FILES_PER_JOB,
  };
};

const listPrintDraftsData = async (userId) => {
  const drafts = await PrintDraft.find({ "user.userId": userId }).sort({
    updatedAt: -1,
  });

  return {
    drafts: drafts.map(mapPrintDraft),
  };
};

const savePrintDraftData = async (userId, payload) => {
  if (!payload.buffer || !Buffer.isBuffer(payload.buffer) || payload.buffer.length === 0) {
    throw createHttpError(400, "A non-empty file upload is required to save a draft.");
  }

  const user = await getRequiredUser(userId);
  let queue = null;

  if (payload.queueId) {
    if (!mongoose.isValidObjectId(payload.queueId)) {
      throw createHttpError(400, "Selected queue is invalid.");
    }

    queue = await Queue.findById(payload.queueId);

    if (!queue) {
      throw createHttpError(404, "Selected queue was not found.");
    }

    ensureQueueAccessForUser(user, queue);
  }

  const draftStorageId = generateJobId().replace(/^job-/, "draft-");
  const storedFile = await storePrintFile({
    jobId: draftStorageId,
    originalFileName: payload.originalFileName || payload.fileName || "document.pdf",
    contentType: payload.fileType,
    buffer: payload.buffer,
  });
  const documentName =
    payload.documentName ||
    payload.originalFileName ||
    payload.fileName ||
    "Untitled draft";

  const draft = await PrintDraft.create({
    user: {
      userId: user._id,
      username: user.username,
      department: user.department || "",
    },
    name: documentName,
    source: {
      createdFrom: "print-page",
      clientType: payload.clientType || "Web Print Draft",
    },
    settings: {
      queueId: queue?._id || null,
      queueName: queue?.name || "",
      documentName,
      copies: payload.copies || 1,
      colorMode: payload.colorMode || "Black & White",
      mode: payload.mode || "Simplex",
      paperSize: payload.paperSize || "A4",
      quality: payload.quality || "Normal",
    },
    files: [
      {
        originalFileName:
          payload.originalFileName || payload.fileName || storedFile.storedFileName,
        fileName: payload.fileName || storedFile.storedFileName,
        fileType: storedFile.contentType,
        fileSize: storedFile.fileSize,
        pages: Math.max(1, storedFile.pageCount || 1),
        storagePath: storedFile.relativePath,
        storedFileName: storedFile.storedFileName,
        storedAt: new Date(),
        checksumSha256: storedFile.checksumSha256,
      },
    ],
  });

  return {
    draft: mapPrintDraft(draft),
  };
};

const savePrintDraftBatchData = async (userId, payload) => {
  const user = await getRequiredUser(userId);
  let queue = null;

  if (payload.queueId) {
    if (!mongoose.isValidObjectId(payload.queueId)) {
      throw createHttpError(400, "Selected queue is invalid.");
    }

    queue = await Queue.findById(payload.queueId);

    if (!queue) {
      throw createHttpError(404, "Selected queue was not found.");
    }

    ensureQueueAccessForUser(user, queue);
  }

  const draftStorageId = generateJobId().replace(/^job-/, "draft-");
  const storedDocuments = await storeBatchPrintFiles({
    files: payload.files,
    idPrefix: draftStorageId,
  });
  const documentName = payload.documentName || "Multiple documents";

  const draft = await PrintDraft.create({
    user: {
      userId: user._id,
      username: user.username,
      department: user.department || "",
    },
    name: documentName,
    source: {
      createdFrom: "print-page",
      clientType: payload.clientType || "Web Print Draft",
    },
    settings: {
      queueId: queue?._id || null,
      queueName: queue?.name || "",
      documentName,
      copies: payload.copies || 1,
      colorMode: payload.colorMode || "Black & White",
      mode: payload.mode || "Simplex",
      paperSize: payload.paperSize || "A4",
      quality: payload.quality || "Normal",
    },
    files: storedDocuments.map((document) => ({
      originalFileName: document.originalFileName,
      fileName: document.fileName,
      fileType: document.fileType,
      fileSize: document.fileSize,
      pages: document.pages,
      storagePath: document.storagePath,
      storedFileName: document.storedFileName,
      storedAt: document.storedAt,
      checksumSha256: document.checksumSha256,
    })),
  });

  return {
    draft: mapPrintDraft(draft),
  };
};

const getPrintDraftFileData = async (userId, draftId, fileId) => {
  const draft = await getRequiredDraftForUser(userId, draftId);
  const file = draft.files.id(fileId);

  if (!file) {
    throw createHttpError(404, "Draft file not found.");
  }

  return {
    absolutePath: resolveStoredDraftPath(file.storagePath),
    fileName: file.originalFileName || file.fileName || "document.pdf",
    contentType: file.fileType || "application/pdf",
  };
};

const deletePrintDraftData = async (userId, draftId) => {
  const draft = await getRequiredDraftForUser(userId, draftId);

  for (const file of draft.files || []) {
    await removeStoredDraftFile(file.storagePath);
  }

  await draft.deleteOne();

  return {
    draft: mapPrintDraft(draft),
  };
};

const deleteDraftDocument = async (draft) => {
  for (const file of draft.files || []) {
    await removeStoredDraftFile(file.storagePath);
  }

  await draft.deleteOne();
};

const clearPrintDraftsData = async (userId) => {
  const drafts = await PrintDraft.find({ "user.userId": userId });

  for (const draft of drafts) {
    await deleteDraftDocument(draft);
  }

  return {
    deletedCount: drafts.length,
    drafts: [],
  };
};

const createPrintDraftFromJob = async (job) => {
  const jobDocuments = getJobStoredDocuments(job);

  if (jobDocuments.length === 0) {
    throw createHttpError(409, "This pending job does not have a stored file to save as a draft.");
  }
  const colorMode = /color/i.test(job.printSettings?.colorMode || "")
    ? "Color"
    : "Black & White";
  const draftStorageId = generateJobId().replace(/^job-/, "draft-");
  const copiedDocuments = [];

  try {
    for (const [index, document] of jobDocuments.entries()) {
      let buffer;

      try {
        buffer = await fs.readFile(resolveStoredDraftPath(document.storagePath));
      } catch (error) {
        if (error.code === "ENOENT") {
          throw createHttpError(404, "The stored print file for this job was not found.");
        }

        throw error;
      }

      const originalFileName =
        document.originalFileName ||
        document.fileName ||
        `${job.documentName || job.jobId}-${index + 1}.pdf`;
      const storedFile = await storePrintFile({
        jobId: `${draftStorageId}-${index + 1}`,
        originalFileName,
        contentType: document.fileType || "application/pdf",
        buffer,
      });

      copiedDocuments.push(
        mapStoredFileDocument({
          storedFile,
          sourceFile: {
            originalFileName,
            fileName: document.fileName || originalFileName,
          },
          storedAt: new Date(),
        }),
      );
    }
  } catch (error) {
    await Promise.all(
      copiedDocuments.map((document) =>
        removeStoredDraftFile(document.storagePath).catch(() => {}),
      ),
    );
    throw error;
  }

  return PrintDraft.create({
    user: {
      userId: job.user?.userId,
      username: job.user?.username || "",
      department: job.user?.department || "",
    },
    name: job.documentName || copiedDocuments[0]?.originalFileName || "Print draft",
    source: {
      createdFrom: "pending-job",
      clientType: "Pending Job Draft",
    },
    settings: {
      queueId: job.printer?.queueId || null,
      queueName: job.printer?.queueName || "",
      documentName: job.documentName || copiedDocuments[0]?.originalFileName || "Print draft",
      copies: job.printSettings?.copies || 1,
      colorMode,
      mode: job.printSettings?.mode || "Simplex",
      paperSize: job.printSettings?.paperSize || "A4",
      quality: job.printSettings?.quality || "Normal",
    },
    files: copiedDocuments.map((document) => ({
      originalFileName: document.originalFileName,
      fileName: document.fileName,
      fileType: document.fileType,
      fileSize: document.fileSize,
      pages: document.pages,
      storagePath: document.storagePath,
      storedFileName: document.storedFileName,
      storedAt: document.storedAt,
      checksumSha256: document.checksumSha256,
    })),
  });
};

const createPrintJobData = async (userId, payload, actor) => {
  const user = await getRequiredUser(userId);
  const { queue, printer } = await resolveQueueAndPrinterForSubmission(user, payload);
  const now = new Date();

  const { job, totalPages } = await createJobRecord({
    user,
    queue,
    printer,
    payload,
    actor,
  });

  await recordJobSubmittedStats({ user, queue, now });

  await refreshQueuePendingCount(queue._id);

  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Job Submitted",
      category: "Job",
      details: `Submitted job "${job.jobId}" to queue "${queue.name}".`,
    },
    resource: {
      type: "PrintJob",
      id: job._id,
      name: job.jobId,
      changes: {
        documentName: job.documentName,
        pages: totalPages,
        queueName: queue.name,
        printerName: printer?.name || "",
      },
    },
  });

  return {
    job: mapCreatedJob(job),
  };
};

const uploadAndPrintJobData = async (userId, payload, actor) => {
  if (!payload.buffer || !Buffer.isBuffer(payload.buffer) || payload.buffer.length === 0) {
    throw createHttpError(400, "A non-empty file upload is required.");
  }

  if (!payload.queueId) {
    throw createHttpError(400, "Select a secure-release queue before uploading.");
  }

  const user = await getRequiredUser(userId);
  ensureSelectedPrinterForUpload(payload);
  const { queue, printer, selectedPrinterOnly } = await resolveQueueAndPrinterForSubmission(
    user,
    payload,
  );

  if (!isConfiguredSecureReleaseQueue(queue)) {
    throw createHttpError(400, "Select the configured Secure Release queue for this demo.");
  }

  const draftJobId = generateJobId();
  const storedFile = await storePrintFile({
    jobId: draftJobId,
    originalFileName: payload.originalFileName || payload.fileName || "document.pdf",
    contentType: payload.fileType,
    buffer: payload.buffer,
  });

  const originalPages = Math.max(1, storedFile.pageCount || 1);
  const now = new Date();

  const { job, totalPages } = await createJobRecord({
    user,
    queue,
    printer,
    actor,
    payload: {
      jobId: draftJobId,
      ...payload,
      pages: originalPages,
      fileType: storedFile.contentType,
      fileSize: storedFile.fileSize,
      fileName: payload.fileName || storedFile.storedFileName,
      originalFileName: payload.originalFileName || payload.fileName || storedFile.storedFileName,
      storagePath: storedFile.relativePath,
      storedFileName: storedFile.storedFileName,
      storedAt: now,
      checksumSha256: storedFile.checksumSha256,
      clientType: payload.clientType || "Web Print",
      attributes: [
        "PDF",
        /color/i.test(payload.colorMode) ? "Color" : "Black & White",
        payload.mode,
      ].filter(Boolean),
      options: [payload.copies > 1 ? `x${payload.copies}` : "", payload.paperSize || "A4"].filter(
        Boolean,
      ),
    },
    statusOverrides: {
      current: "Pending Release",
      readinessPercent: 100,
    },
  });

  if (isPrintDispatchDisabled()) {
    await recordJobSubmittedStats({ user, queue, now });
    await refreshQueuePendingCount(queue._id);
    await markJobQueuedNotification(user, job);
    await recordAuditLog({
      actor: buildActorPayload(actor),
      action: {
        name: "Job Uploaded To Queue",
        category: "Job",
        details: `Uploaded job "${job.jobId}" to queue "${queue.name}" without printer dispatch.`,
      },
      resource: {
        type: "PrintJob",
        id: job._id,
        name: job.jobId,
        changes: {
          documentName: job.documentName,
          pages: totalPages,
          queueName: queue?.name || "",
          printerName: printer?.name || "",
          storagePath: job.document.storagePath,
          printerHold: false,
          dispatchSkipped: true,
          releaseCode: job.release?.releaseCode || "",
        },
      },
    });

    return {
      job: mapCreatedJob(job),
      dispatch: null,
    };
  }

  let dispatchResult = null;

  try {
    dispatchResult = await dispatchPrintFileToQueuePrinters({
      queue,
      primaryPrinter: printer,
      selectedPrinterOnly,
      filePath: storedFile.relativePath,
      holdOnPrinter: true,
      holdKey: job.release?.releaseCode,
      jobName: job.documentName,
      username: user.username,
      logContext: {
        phase: "upload",
        jobId: job.jobId,
      },
    });
  } catch (error) {
    job.status.current = "Pending Release";
    job.status.readinessPercent = 100;
    job.dispatch = {
      ...job.dispatch,
      method: env.printTransport,
      targetHost: printer ? printer.network?.ipAddress || "" : env.printDefaultPrinterIp,
      targetPort: env.printTransport === "socket" ? env.printSocketPort : 0,
      destinationName: printer ? printer.name || "" : env.printDestination || env.printDefaultPrinterName,
      attempts: (job.dispatch?.attempts || 0) + 1,
      lastAttemptAt: now,
      lastSuccessfulAt: job.dispatch?.lastSuccessfulAt || null,
      bytesSent: 0,
      jobReference: "",
    };
    job.errorMessage = error.message;
    await job.save();
    throw error;
  }

  if (job.cost?.totalCost > 0) {
    await applyQuotaChange({
      user,
      amount: roundAmount(-job.cost.totalCost),
      transactionType: "Print Deduction",
      reason: "Held printer job deduction",
      comment: `Quota deducted for held printer job ${job.documentName}`,
      method: "Printer Hold",
      reference: {
        jobId: job._id,
        jobIdString: job.jobId,
      },
      actor,
    });
  }

  job.status.current = "Held";
  job.status.dispatchedAt = now;
  job.status.readinessPercent = 100;
  job.cost.quotaDeducted = job.cost?.totalCost > 0;
  job.dispatch = {
    ...job.dispatch,
    method: dispatchResult?.method || env.printTransport,
    targetHost: dispatchResult?.targetHost || printer?.network?.ipAddress || "",
    targetPort: dispatchResult?.targetPort || (env.printTransport === "socket" ? env.printSocketPort : 0),
    destinationName: dispatchResult?.destinationName || printer?.name || "",
    attempts: (job.dispatch?.attempts || 0) + 1,
    lastAttemptAt: now,
    lastSuccessfulAt: now,
    bytesSent: dispatchResult?.bytesSent || 0,
    jobReference: dispatchResult?.jobReference || "",
  };
  job.errorMessage = "";
  await job.save();
  await recordAdditionalDispatchFailures({
    actor,
    job,
    dispatchResult,
  });

  await recordJobSubmittedStats({ user, queue, now });
  await recordSuccessfulPrintStats({
    user,
    queueId: queue?._id,
    printerId: printer?._id,
    groupId: user.groupId,
    pages: totalPages,
    totalCost: job.cost?.totalCost || 0,
    now,
  });
  await recordAdditionalPrinterDispatchStats({
    dispatchResult,
    primaryPrinterId: printer?._id,
    pages: totalPages,
    totalCost: job.cost?.totalCost || 0,
    now,
  });
  await refreshQueuePendingCount(queue._id);
  await markJobQueuedNotification(user, job);
  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Job Uploaded To Queue",
      category: "Job",
      details: `Uploaded job "${job.jobId}" to queue "${queue.name}" for later release.`,
    },
    resource: {
      type: "PrintJob",
      id: job._id,
      name: job.jobId,
      changes: {
        documentName: job.documentName,
        pages: totalPages,
        queueName: queue?.name || "",
        printerName: printer?.name || "",
        storagePath: job.document.storagePath,
        printerHold: true,
        releaseCode: job.release?.releaseCode || "",
      },
    },
  });

  return {
    job: mapCreatedJob(job),
    dispatch: mapDispatchSummary(dispatchResult),
  };
};

const uploadAndPrintBatchData = async (userId, payload, actor) => {
  if (!payload.queueId) {
    throw createHttpError(400, "Select a secure-release queue before uploading.");
  }

  const user = await getRequiredUser(userId);
  ensureSelectedPrinterForUpload(payload);
  const { queue, printer, selectedPrinterOnly } = await resolveQueueAndPrinterForSubmission(
    user,
    payload,
  );

  if (!isConfiguredSecureReleaseQueue(queue)) {
    throw createHttpError(400, "Select the configured Secure Release queue for this demo.");
  }

  const jobId = generateJobId();
  const storedDocuments = await storeBatchPrintFiles({
    files: payload.files,
    idPrefix: jobId,
  });
  const originalPages = storedDocuments.reduce(
    (sum, document) => sum + Math.max(1, document.pages || 1),
    0,
  );
  const fileCount = storedDocuments.length;
  const now = new Date();
  const documentName =
    payload.documentName ||
    (fileCount > 1 ? "Multiple documents" : storedDocuments[0]?.originalFileName) ||
    "Print job";

  const { job, totalPages } = await createJobRecord({
    user,
    queue,
    printer,
    actor,
    payload: {
      jobId,
      ...payload,
      documentName,
      pages: originalPages,
      fileType: "application/pdf",
      fileSize: storedDocuments.reduce(
        (sum, document) => sum + (document.fileSize || 0),
        0,
      ),
      files: storedDocuments,
      clientType: payload.clientType || "Web Print",
      attributes: [
        fileCount > 1 ? `${fileCount} PDFs` : "PDF",
        /color/i.test(payload.colorMode) ? "Color" : "Black & White",
        payload.mode,
      ].filter(Boolean),
      options: [
        payload.copies > 1 ? `x${payload.copies}` : "",
        fileCount > 1 ? `${fileCount} files` : "",
        payload.paperSize || "A4",
      ].filter(Boolean),
    },
    statusOverrides: {
      current: "Pending Release",
      readinessPercent: 100,
    },
  });

  if (isPrintDispatchDisabled()) {
    await recordJobSubmittedStats({ user, queue, now });
    await refreshQueuePendingCount(queue._id);
    await markJobQueuedNotification(user, job);
    await recordAuditLog({
      actor: buildActorPayload(actor),
      action: {
        name: "Job Uploaded To Queue",
        category: "Job",
        details: `Uploaded job "${job.jobId}" with ${fileCount} file${fileCount === 1 ? "" : "s"} to queue "${queue.name}" without printer dispatch.`,
      },
      resource: {
        type: "PrintJob",
        id: job._id,
        name: job.jobId,
        changes: {
          documentName: job.documentName,
          pages: totalPages,
          fileCount,
          queueName: queue?.name || "",
          printerName: printer?.name || "",
          storagePath: job.document.storagePath,
          printerHold: false,
          dispatchSkipped: true,
          releaseCode: job.release?.releaseCode || "",
        },
      },
    });

    return {
      job: mapCreatedJob(job),
      dispatch: null,
    };
  }

  let dispatchResult = null;

  try {
    dispatchResult = await dispatchStoredDocumentsToQueuePrinters({
      queue,
      primaryPrinter: printer,
      selectedPrinterOnly,
      documents: storedDocuments,
      holdOnPrinter: true,
      holdKey: job.release?.releaseCode,
      jobName: job.documentName,
      username: user.username,
      logContext: {
        phase: "upload",
        jobId: job.jobId,
      },
    });
  } catch (error) {
    job.status.current = "Pending Release";
    job.status.readinessPercent = 100;
    job.dispatch = {
      ...job.dispatch,
      method: env.printTransport,
      targetHost: printer ? printer.network?.ipAddress || "" : env.printDefaultPrinterIp,
      targetPort: env.printTransport === "socket" ? env.printSocketPort : 0,
      destinationName: printer ? printer.name || "" : env.printDestination || env.printDefaultPrinterName,
      attempts: (job.dispatch?.attempts || 0) + 1,
      lastAttemptAt: now,
      lastSuccessfulAt: job.dispatch?.lastSuccessfulAt || null,
      bytesSent: 0,
      jobReference: "",
    };
    job.errorMessage = error.message;
    await job.save();
    throw error;
  }

  if (job.cost?.totalCost > 0) {
    await applyQuotaChange({
      user,
      amount: roundAmount(-job.cost.totalCost),
      transactionType: "Print Deduction",
      reason: "Held printer job deduction",
      comment: `Quota deducted for held printer job ${job.documentName}`,
      method: "Printer Hold",
      reference: {
        jobId: job._id,
        jobIdString: job.jobId,
      },
      actor,
    });
  }

  job.status.current = "Held";
  job.status.dispatchedAt = now;
  job.status.readinessPercent = 100;
  job.cost.quotaDeducted = job.cost?.totalCost > 0;
  job.dispatch = {
    ...job.dispatch,
    method: dispatchResult?.method || env.printTransport,
    targetHost: dispatchResult?.targetHost || printer?.network?.ipAddress || "",
    targetPort: dispatchResult?.targetPort || (env.printTransport === "socket" ? env.printSocketPort : 0),
    destinationName: dispatchResult?.destinationName || printer?.name || "",
    attempts: (job.dispatch?.attempts || 0) + fileCount,
    lastAttemptAt: now,
    lastSuccessfulAt: now,
    bytesSent: dispatchResult?.bytesSent || 0,
    jobReference: dispatchResult?.jobReference || "",
  };
  job.errorMessage = "";
  await job.save();
  await recordAdditionalDispatchFailures({
    actor,
    job,
    dispatchResult,
  });

  await recordJobSubmittedStats({ user, queue, now });
  await recordSuccessfulPrintStats({
    user,
    queueId: queue?._id,
    printerId: printer?._id,
    groupId: user.groupId,
    pages: totalPages,
    totalCost: job.cost?.totalCost || 0,
    now,
  });
  await recordAdditionalPrinterDispatchStats({
    dispatchResult,
    primaryPrinterId: printer?._id,
    pages: totalPages,
    totalCost: job.cost?.totalCost || 0,
    now,
  });
  await refreshQueuePendingCount(queue._id);
  await markJobQueuedNotification(user, job);
  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Job Uploaded To Queue",
      category: "Job",
      details: `Uploaded job "${job.jobId}" with ${fileCount} file${fileCount === 1 ? "" : "s"} to queue "${queue.name}" for later release.`,
    },
    resource: {
      type: "PrintJob",
      id: job._id,
      name: job.jobId,
      changes: {
        documentName: job.documentName,
        pages: totalPages,
        fileCount,
        queueName: queue?.name || "",
        printerName: printer?.name || "",
        storagePath: job.document.storagePath,
        printerHold: true,
        releaseCode: job.release?.releaseCode || "",
      },
    },
  });

  return {
    job: mapCreatedJob(job),
    dispatch: mapDispatchSummary(dispatchResult),
  };
};

const releaseJobData = async (jobId, actor, { scope }) => {
  const job = await getRequiredJob(jobId);
  assertJobOwnership(job, actor, scope);

  if (!isPendingReleaseStatus(job)) {
    throw createHttpError(409, "Only pending release jobs can be released.");
  }

  const user = await getRequiredUser(job.user.userId);

  if (isPrintingRestricted(user)) {
    throw createHttpError(403, "Printing is restricted for this user.");
  }

  const queue = job.printer?.queueId ? await getRequiredQueue(job.printer.queueId) : null;
  const { printer, selectedPrinterOnly } = await resolveQueueAndPrinterForRelease(queue, job);
  const totalCost = roundAmount(job.cost?.totalCost || 0);
  const now = new Date();
  const nextAttemptCount = (job.dispatch?.attempts || 0) + 1;
  const storedDocuments = getJobStoredDocuments(job);

  if (!job.cost?.quotaDeducted && (user.printing?.quota?.remaining || 0) < totalCost) {
    await markInsufficientBalanceNotification(user, job);
    throw createHttpError(409, "Insufficient balance to release this job.");
  }

  if (printer) {
    job.printer.printerId = printer._id || printer;
    job.printer.printerName = printer.name || job.printer.printerName;
  }

  let dispatchResult = null;

  // TODO: Keep this manual-complete fallback until every pending job in the system
  // is guaranteed to have a stored printable file from the upload flow.
  if (storedDocuments.length > 0) {
    try {
      dispatchResult = await dispatchStoredDocumentsToQueuePrinters({
        queue,
        primaryPrinter: printer,
        selectedPrinterOnly,
        documents: storedDocuments,
        jobName: job.documentName,
        username: user.username,
      });
    } catch (error) {
      job.status.current = "Pending Release";
      job.status.releasedAt = null;
      job.status.printedAt = null;
      job.status.dispatchedAt = null;
      job.status.readinessPercent = 100;
      job.dispatch = {
        ...job.dispatch,
        method: env.printTransport,
        targetHost: printer ? printer.network?.ipAddress || "" : env.printDefaultPrinterIp,
        targetPort: env.printTransport === "socket" ? env.printSocketPort : 0,
        destinationName: printer ? printer.name || "" : env.printDestination || env.printDefaultPrinterName,
        attempts: nextAttemptCount,
        lastAttemptAt: now,
        lastSuccessfulAt: job.dispatch?.lastSuccessfulAt || null,
        bytesSent: 0,
        jobReference: "",
      };
      job.errorMessage = error.message;
      await job.save();
      await markReleaseAttemptFailedNotification(user, job, error.message);
      await recordAuditLog({
        actor: buildActorPayload(actor),
        action: {
          name: "Job Release Dispatch Failed",
          category: "Job",
          details: `Dispatch failed for released job "${job.jobId}".`,
        },
        resource: {
          type: "PrintJob",
          id: job._id,
          name: job.jobId,
          changes: {
            documentName: job.documentName,
            printerName: job.printer?.printerName || "",
            queueName: job.printer?.queueName || "",
          },
        },
        outcome: {
          success: false,
          statusCode: error.status || 500,
          errorMessage: error.message,
        },
      });
      throw error;
    }
  }

  if (!job.cost?.quotaDeducted && totalCost > 0) {
    await applyQuotaChange({
      user,
      amount: roundAmount(-totalCost),
      transactionType: "Print Deduction",
      reason: "Print release deduction",
      comment: `Quota deducted for ${job.documentName}`,
      method: "Job Release",
      reference: {
        jobId: job._id,
        jobIdString: job.jobId,
      },
      actor,
    });
  }

  job.status.current = "Printed";
  job.status.printedAt = now;
  job.status.releasedAt = now;
  job.status.dispatchedAt = dispatchResult ? now : job.status.dispatchedAt;
  job.status.readinessPercent = 100;
  job.cost.quotaDeducted = totalCost > 0;
  job.dispatch = {
    ...job.dispatch,
    method: dispatchResult?.method || job.dispatch?.method || "",
    targetHost: dispatchResult?.targetHost || job.dispatch?.targetHost || printer?.network?.ipAddress || "",
    targetPort:
      dispatchResult?.targetPort ||
      job.dispatch?.targetPort ||
      (env.printTransport === "socket" ? env.printSocketPort : 0),
    destinationName:
      dispatchResult?.destinationName ||
      job.dispatch?.destinationName ||
      printer?.name ||
      "",
    attempts: dispatchResult ? nextAttemptCount : job.dispatch?.attempts || 0,
    lastAttemptAt: dispatchResult ? now : job.dispatch?.lastAttemptAt || null,
    lastSuccessfulAt: dispatchResult ? now : job.dispatch?.lastSuccessfulAt || null,
    bytesSent: dispatchResult?.bytesSent || job.dispatch?.bytesSent || 0,
    jobReference: dispatchResult?.jobReference || job.dispatch?.jobReference || "",
  };
  job.errorMessage = "";

  await job.save();
  await recordAdditionalDispatchFailures({
    actor,
    job,
    dispatchResult,
  });

  await Promise.all([
    User.findByIdAndUpdate(user._id, {
      $inc: {
        "statistics.totalPagesPrinted": job.document?.pages || 0,
      },
      $set: {
        "statistics.lastActivityAt": now,
      },
    }),
    job.printer?.queueId
      ? Queue.findByIdAndUpdate(job.printer.queueId, {
          $inc: {
            "statistics.totalPagesPrinted": job.document?.pages || 0,
            "statistics.printedToday": 1,
            "statistics.printedThisMonth": 1,
          },
        })
      : Promise.resolve(),
    job.printer?.printerId
      ? Printer.findByIdAndUpdate(job.printer.printerId, {
          $inc: {
            "statistics.totalPagesPrinted": job.document?.pages || 0,
            "statistics.totalJobsSubmitted": 1,
            "statistics.totalCost": totalCost,
          },
          $set: {
            "statistics.lastUsedAt": now,
          },
        })
      : Promise.resolve(),
    user.groupId
      ? Group.findByIdAndUpdate(user.groupId, {
          $inc: {
            "statistics.totalPagesPrinted": job.document?.pages || 0,
            "statistics.totalCost": totalCost,
          },
        })
      : Promise.resolve(),
  ]);
  await recordAdditionalPrinterDispatchStats({
    dispatchResult,
    primaryPrinterId: job.printer?.printerId,
    pages: job.document?.pages || 0,
    totalCost,
    now,
  });

  await refreshQueuePendingCount(job.printer?.queueId);
  await markJobReleasedNotification(user, job);

  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Job Released",
      category: "Job",
      details: `Released job "${job.jobId}".`,
    },
    resource: {
      type: "PrintJob",
      id: job._id,
      name: job.jobId,
      changes: {
        documentName: job.documentName,
        pages: job.document?.pages || 0,
        printerName: job.printer?.printerName || "",
        queueName: job.printer?.queueName || "",
        cost: totalCost,
      },
    },
  });

  return {
    job: {
      id: job._id.toString(),
      jobId: job.jobId,
      documentName: job.documentName,
      status: job.status?.current,
      printerName: job.printer?.printerName || "",
      releasedAt: job.status?.releasedAt,
      quotaDeducted: totalCost,
    },
  };
};

const releaseJobsByIdsData = async (jobIds, actor, { scope }) => {
  const released = [];
  const skipped = [];

  for (const jobId of jobIds) {
    try {
      const result = await releaseJobData(jobId, actor, { scope });
      released.push(result.job);
    } catch (error) {
      skipped.push({
        id: jobId,
        message: error.message,
      });
    }
  }

  return {
    releasedCount: released.length,
    skippedCount: skipped.length,
    jobs: released,
    skipped,
  };
};

const releaseAllEligibleJobsData = async (actor, { scope }) => {
  const match = {
    "status.current": "Pending Release",
  };

  if (scope !== "admin") {
    match["user.userId"] = actor.userId;
  }

  const jobs = await PrintJob.find(match).sort({ "status.submittedAt": 1 });
  const eligibleJobIds = [];
  const skipped = [];

  for (const job of jobs) {
    if (scope !== "admin") {
      const queue = job.printer?.queueId ? await Queue.findById(job.printer.queueId) : null;

      if (queue && queue.security?.allowReleaseAllJobs !== true) {
        skipped.push({
          id: job.jobId,
          message: "Queue policy does not allow release-all for this job.",
        });
        continue;
      }
    }

    eligibleJobIds.push(job.jobId);
  }

  const data = await releaseJobsByIdsData(eligibleJobIds, actor, { scope });

  return {
    ...data,
    skipped: [...skipped, ...data.skipped],
    skippedCount: skipped.length + data.skippedCount,
  };
};

const cancelPendingJobData = async (jobId, actor, { scope }) => {
  const job = await getRequiredJob(jobId);
  assertJobOwnership(job, actor, scope);

  if (!isPendingReleaseStatus(job)) {
    throw createHttpError(409, "Only pending release jobs can be cancelled.");
  }

  const user = await getRequiredUser(job.user.userId);
  const refundResult = await refundJobQuotaIfNeeded(job, actor, {
    reason: "Pending job cancelled",
    comment: `Cancelled ${job.documentName}`,
    method: "Job Cancellation Refund",
    preserveStatus: true,
  });

  job.status.current = "Cancelled";
  job.status.cancelledAt = new Date();
  job.status.readinessPercent = 0;
  await job.save();

  await refreshQueuePendingCount(job.printer?.queueId);
  await markJobCancelledNotification(user, job, Boolean(refundResult));

  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Job Cancelled",
      category: "Job",
      details: `Cancelled pending job "${job.jobId}".`,
    },
    resource: {
      type: "PrintJob",
      id: job._id,
      name: job.jobId,
      changes: {
        documentName: job.documentName,
        refunded: Boolean(refundResult),
        queueName: job.printer?.queueName || "",
      },
    },
  });

  return {
    job: {
      id: job._id.toString(),
      jobId: job.jobId,
      documentName: job.documentName,
      status: job.status?.current,
      refundedAmount: refundResult?.job?.cost?.refundedAmount || 0,
    },
    refundTransaction: refundResult
      ? {
          id: refundResult.transaction._id.toString(),
          amount: refundResult.transaction.transaction.amount,
        }
      : null,
  };
};

const cancelPendingJobAndSaveDraftData = async (jobId, actor, { scope }) => {
  const job = await getRequiredJob(jobId);
  assertJobOwnership(job, actor, scope);

  if (!isPendingReleaseStatus(job)) {
    throw createHttpError(409, "Only pending release jobs can be saved as drafts.");
  }

  const draft = await createPrintDraftFromJob(job);

  try {
    const cancellation = await cancelPendingJobData(jobId, actor, { scope });

    return {
      ...cancellation,
      draft: mapPrintDraft(draft),
    };
  } catch (error) {
    await deleteDraftDocument(draft).catch(() => {});
    throw error;
  }
};

const getAdminPendingReleaseJobsData = async () => {
  const jobs = await PrintJob.find({
    "status.current": { $in: ["Pending Release", "Held"] },
  })
    .populate("printer.printerId")
    .sort({ "status.submittedAt": -1 });

  const userIds = Array.from(new Set(jobs.map((job) => toIdString(job.user?.userId)).filter(Boolean)));
  const users = await User.find({ _id: { $in: userIds } }).select("fullName email");
  const usersMap = new Map(users.map((user) => [user._id.toString(), user]));

  const mappedJobs = jobs.map((job) => mapReleaseAdminJob(job, usersMap.get(toIdString(job.user?.userId))));

  return {
    summary: {
      total: mappedJobs.length,
      totalPages: mappedJobs.reduce((sum, job) => sum + (job.pages || 0), 0),
      totalCost: roundAmount(mappedJobs.reduce((sum, job) => sum + (job.cost || 0), 0)),
    },
    jobs: mappedJobs,
  };
};

module.exports = {
  getRecentJobsData,
  getPendingReleaseJobsData,
  getPrintJobOptionsData,
  listPrintDraftsData,
  savePrintDraftData,
  savePrintDraftBatchData,
  getPrintDraftFileData,
  deletePrintDraftData,
  clearPrintDraftsData,
  createPrintJobData,
  uploadAndPrintJobData,
  uploadAndPrintBatchData,
  releaseJobData,
  releaseJobsByIdsData,
  releaseAllEligibleJobsData,
  cancelPendingJobData,
  cancelPendingJobAndSaveDraftData,
  getAdminPendingReleaseJobsData,
};
