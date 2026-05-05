const PrintJob = require("../../models/PrintJob");
const Printer = require("../../models/Printer");
const { createHttpError } = require("../../utils/http");
const { getMinutesAgo, toAgoLabel } = require("../../utils/formatters");
const { ensureDefaultPrinterSetup } = require("../printers/printer.provision.service");
const { releaseJobData } = require("../jobs/jobs.service");

const toIdString = (value) => value?.toString?.() || "";

const normalizeReleaseCode = (value) => String(value || "").replace(/\D/g, "").slice(0, 6);

const mapPrinter = (printer, pendingCount = 0) => ({
  id: toIdString(printer?._id),
  name: printer?.name || "Default Printer",
  model: printer?.model || "",
  status: printer?.status?.current || "Online",
  location: [printer?.location?.building, printer?.location?.room].filter(Boolean).join(" ") || "",
  queueName: printer?.queue?.queueName || "",
  pendingCount,
});

const resolvePrinterForScreen = async (printerId) => {
  if (printerId) {
    const printer = await Printer.findOne({
      _id: printerId,
      isActive: true,
    });

    if (!printer) {
      throw createHttpError(404, "Printer not found.");
    }

    return printer;
  }

  const provisionedSetup = await ensureDefaultPrinterSetup();

  if (provisionedSetup.printer) {
    return provisionedSetup.printer;
  }

  const fallbackPrinter = await Printer.findOne({ isActive: true }).sort({ createdAt: 1 });

  if (!fallbackPrinter) {
    throw createHttpError(404, "No active printer is available.");
  }

  return fallbackPrinter;
};

const buildPendingJobQuery = (printer) => ({
  "printer.printerId": printer._id,
  "status.current": { $in: ["Pending Release", "Held"] },
});

const getPrinterScreenData = async ({ printerId } = {}) => {
  const printer = await resolvePrinterForScreen(printerId);
  const pendingCount = await PrintJob.countDocuments(buildPendingJobQuery(printer));

  return {
    printer: mapPrinter(printer, pendingCount),
  };
};

const getJobForReleaseCode = async ({ printer, releaseCode }) => {
  const normalizedCode = normalizeReleaseCode(releaseCode);

  if (normalizedCode.length !== 6) {
    throw createHttpError(400, "Enter the 6-digit release code.");
  }

  const job = await PrintJob.findOne({
    ...buildPendingJobQuery(printer),
    "release.releaseCode": normalizedCode,
    $or: [
      { "release.releaseCodeExpiry": null },
      { "release.releaseCodeExpiry": { $gte: new Date() } },
    ],
  }).populate("printer.printerId");

  if (!job) {
    throw createHttpError(404, "No pending job matches this release code on this printer.");
  }

  return job;
};

const mapPrinterReleaseJob = (job) => {
  const submittedAt = job.status?.submittedAt || job.createdAt;
  const minutesAgo = getMinutesAgo(submittedAt);

  return {
    id: job.jobId || toIdString(job._id),
    documentName: job.documentName,
    owner: job.user?.username || "User",
    pages: job.document?.pages || 0,
    cost: job.cost?.totalCost || 0,
    submittedAt: toAgoLabel(minutesAgo),
    colorMode: job.printSettings?.colorMode || "B&W",
    mode: job.printSettings?.mode || "Simplex",
    copies: job.printSettings?.copies || 1,
    queueName: job.printer?.queueName || "",
    printerName: job.printer?.printerName || "",
  };
};

const lookupPrinterReleaseJobData = async ({ printerId, releaseCode } = {}) => {
  const printer = await resolvePrinterForScreen(printerId);
  const job = await getJobForReleaseCode({ printer, releaseCode });

  return {
    printer: mapPrinter(printer),
    job: mapPrinterReleaseJob(job),
  };
};

const releasePrinterJobData = async ({ printerId, releaseCode } = {}, actor = {}) => {
  const printer = await resolvePrinterForScreen(printerId);
  const job = await getJobForReleaseCode({ printer, releaseCode });

  const result = await releaseJobData(
    job.jobId || toIdString(job._id),
    {
      userId: null,
      username: printer.name,
      role: "Printer",
      ipAddress: actor.ipAddress || "",
      userAgent: actor.userAgent || "",
    },
    { scope: "printer" },
  );

  return {
    printer: mapPrinter(printer),
    job: result.job,
  };
};

module.exports = {
  getPrinterScreenData,
  lookupPrinterReleaseJobData,
  releasePrinterJobData,
};
