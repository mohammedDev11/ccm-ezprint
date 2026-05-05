const { createHttpError } = require("../../utils/http");

const toStringValue = (value) => (typeof value === "string" ? value.trim() : "");

const toNumberValue = (value, defaultValue = NaN) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : defaultValue;
};

const toStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean),
    ),
  );
};

const normalizeCreateJobPayload = (payload = {}) => {
  const queueId = toStringValue(payload.queueId);
  const pages = toNumberValue(payload.pages);
  const copies = toNumberValue(payload.copies, 1);

  if (!queueId) {
    throw createHttpError(400, "queueId is required.");
  }

  if (!Number.isFinite(pages) || pages < 1) {
    throw createHttpError(400, "pages must be at least 1.");
  }

  if (!Number.isFinite(copies) || copies < 1) {
    throw createHttpError(400, "copies must be at least 1.");
  }

  return {
    queueId,
    printerId: toStringValue(payload.printerId || payload.selectedPrinterId),
    printerName: toStringValue(payload.printerName || payload.selectedPrinterName),
    documentName:
      toStringValue(payload.documentName) ||
      toStringValue(payload.originalFileName) ||
      toStringValue(payload.fileName) ||
      "Untitled document",
    fileName: toStringValue(payload.fileName),
    originalFileName: toStringValue(payload.originalFileName),
    fileType: toStringValue(payload.fileType || "pdf").toLowerCase(),
    fileSize: Math.max(0, toNumberValue(payload.fileSize, 0)),
    pages,
    copies,
    colorMode: toStringValue(payload.colorMode || payload.color || "B&W"),
    mode: /duplex/i.test(toStringValue(payload.mode || payload.duplex))
      ? "Duplex"
      : "Simplex",
    paperSize: toStringValue(payload.paperSize),
    quality: toStringValue(payload.quality),
    attributes: toStringArray(payload.attributes),
    options: toStringArray(payload.options),
    clientType: toStringValue(payload.clientType || "Web Upload"),
    notes: toStringValue(payload.notes),
  };
};

const normalizeJobIdsPayload = (payload = {}) => {
  const jobIds = toStringArray(payload.jobIds || payload.ids);

  if (jobIds.length === 0) {
    throw createHttpError(400, "At least one job id is required.");
  }

  return {
    jobIds,
  };
};

const normalizeUploadPrintHeaders = (headers = {}) => {
  const fileName = toStringValue(headers["x-ccm-ezprint-file-name"]);
  const originalFileName =
    toStringValue(headers["x-ccm-ezprint-original-file-name"]) || fileName;

  if (!fileName && !originalFileName) {
    throw createHttpError(400, "x-ccm-ezprint-file-name header is required.");
  }

  return {
    queueId: toStringValue(headers["x-ccm-ezprint-queue-id"]),
    printerId:
      toStringValue(headers["x-ccm-ezprint-printer-id"]) ||
      toStringValue(headers["x-ccm-ezprint-selected-printer-id"]),
    printerName:
      toStringValue(headers["x-ccm-ezprint-printer-name"]) ||
      toStringValue(headers["x-ccm-ezprint-selected-printer-name"]),
    documentName:
      toStringValue(headers["x-ccm-ezprint-document-name"]) ||
      originalFileName ||
      fileName,
    fileName: fileName || originalFileName,
    originalFileName: originalFileName || fileName,
    fileType: toStringValue(headers["content-type"] || "application/pdf"),
    fileSize: toNumberValue(headers["content-length"], 0),
    copies: Math.max(1, toNumberValue(headers["x-ccm-ezprint-copies"], 1)),
    colorMode: toStringValue(headers["x-ccm-ezprint-color-mode"] || "B&W"),
    mode: /duplex/i.test(toStringValue(headers["x-ccm-ezprint-mode"]))
      ? "Duplex"
      : "Simplex",
    paperSize: toStringValue(headers["x-ccm-ezprint-paper-size"] || "A4"),
    quality: toStringValue(headers["x-ccm-ezprint-quality"] || "Normal"),
    notes: toStringValue(headers["x-ccm-ezprint-notes"]),
    clientType: toStringValue(headers["x-ccm-ezprint-client-type"] || "Web Print"),
  };
};

const normalizeUploadPrintBatchPayload = (payload = {}) => {
  const metadata = payload.metadata && typeof payload.metadata === "object"
    ? payload.metadata
    : payload;
  const files = Array.isArray(payload.files) ? payload.files : [];

  if (files.length === 0) {
    throw createHttpError(400, "At least one PDF file is required.");
  }

  return {
    queueId: toStringValue(metadata.queueId),
    printerId: toStringValue(metadata.printerId || metadata.selectedPrinterId),
    printerName: toStringValue(metadata.printerName || metadata.selectedPrinterName),
    documentName: toStringValue(metadata.documentName) || "Multiple documents",
    copies: Math.max(1, toNumberValue(metadata.copies, 1)),
    colorMode: toStringValue(metadata.colorMode || metadata.color || "B&W"),
    mode: /duplex/i.test(toStringValue(metadata.mode || metadata.duplex))
      ? "Duplex"
      : "Simplex",
    paperSize: toStringValue(metadata.paperSize || "A4"),
    quality: toStringValue(metadata.quality || "Normal"),
    notes: toStringValue(metadata.notes),
    clientType: toStringValue(metadata.clientType || "Web Print"),
    files: files.map((file, index) => {
      const fileName =
        toStringValue(file.fileName) ||
        toStringValue(file.name) ||
        `document-${index + 1}.pdf`;

      return {
        fileName,
        originalFileName:
          toStringValue(file.originalFileName) || fileName,
        fileType: toStringValue(file.fileType || file.type || "application/pdf"),
        fileSize: Math.max(0, toNumberValue(file.fileSize || file.size, 0)),
        contentBase64: toStringValue(file.contentBase64 || file.base64),
      };
    }),
  };
};

module.exports = {
  normalizeCreateJobPayload,
  normalizeJobIdsPayload,
  normalizeUploadPrintHeaders,
  normalizeUploadPrintBatchPayload,
};
