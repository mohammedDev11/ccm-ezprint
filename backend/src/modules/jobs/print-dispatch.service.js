const crypto = require("crypto");
const fs = require("fs/promises");
const net = require("net");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const env = require("../../config/env");
const { createHttpError } = require("../../utils/http");

const execFileAsync = promisify(execFile);
const SUPPORTED_MIME_TYPES = new Set(["application/pdf"]);

const isPrintDispatchDisabled = () =>
  !env.printTransport || env.printTransport === "none";

const sanitizeFileName = (value = "") =>
  value
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

const sanitizePjlValue = (value = "", fallback = "Print Job") =>
  String(value || fallback)
    .replace(/["\r\n\t]/g, " ")
    .replace(/[^\x20-\x7E]/g, "")
    .trim()
    .slice(0, 80) || fallback;

const getSha256 = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");

const countPdfPages = (buffer) => {
  try {
    const text = buffer.toString("latin1");
    const matches = text.match(/\/Type\s*\/Page\b/g);
    return matches?.length || 1;
  } catch {
    return 1;
  }
};

const resolveFileExtension = (fileName = "", contentType = "") => {
  const extension = path.extname(fileName).toLowerCase();

  if (extension) {
    return extension;
  }

  if (contentType === "application/pdf") {
    return ".pdf";
  }

  return "";
};

const assertSupportedPrintFile = ({ fileName, contentType }) => {
  const extension = resolveFileExtension(fileName, contentType);

  if (SUPPORTED_MIME_TYPES.has(contentType) || extension === ".pdf") {
    return {
      normalizedContentType: "application/pdf",
      extension: ".pdf",
    };
  }

  throw createHttpError(
    415,
    "Only PDF files can be printed right now. Convert DOCX, PPTX, XLSX, or images to PDF before upload.",
  );
};

const storePrintFile = async ({ jobId, originalFileName, contentType, buffer }) => {
  const { normalizedContentType, extension } = assertSupportedPrintFile({
    fileName: originalFileName,
    contentType,
  });
  const storageRoot = path.resolve(process.cwd(), env.printStorageDir);
  const safeBaseName = sanitizeFileName(path.basename(originalFileName, extension)) || jobId;
  const storedFileName = `${jobId}-${safeBaseName}${extension}`;
  const absolutePath = path.join(storageRoot, storedFileName);

  await fs.mkdir(storageRoot, { recursive: true });
  await fs.writeFile(absolutePath, buffer);

  return {
    contentType: normalizedContentType,
    absolutePath,
    relativePath: path.relative(process.cwd(), absolutePath),
    storedFileName,
    fileSize: buffer.length,
    pageCount: countPdfPages(buffer),
    checksumSha256: getSha256(buffer),
  };
};

const dispatchViaSocket = async ({ host, port, buffer, destinationName }) => {
  if (!host) {
    throw createHttpError(500, "Printer IP is not configured for socket printing.");
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const startedAt = Date.now();
    const socket = net.createConnection({ host, port }, () => {
      socket.write(buffer);
      socket.end();
    });

    const fail = (error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      reject(error);
    };

    socket.setTimeout(env.printTimeoutMs, () => {
      fail(createHttpError(504, `Timed out sending job to ${destinationName || host}.`));
    });

    socket.on("error", (error) => {
      fail(createHttpError(502, error.message || "Printer connection failed."));
    });

    socket.on("close", (hadError) => {
      if (settled || hadError) {
        return;
      }

      settled = true;
      resolve({
        method: "socket",
        targetHost: host,
        targetPort: port,
        destinationName: destinationName || host,
        bytesSent: buffer.length,
        jobReference: "",
        durationMs: Date.now() - startedAt,
      });
    });
  });
};

const buildHpPrivateJobBuffer = ({ buffer, jobName, username, holdKey }) => {
  const safeJobName = sanitizePjlValue(jobName);
  const safeUsername = sanitizePjlValue(username, "Guest");
  const safeHoldKey = String(holdKey || "").replace(/\D/g, "").slice(0, 8);

  if (!safeHoldKey) {
    throw createHttpError(500, "A printer hold PIN is required for private job storage.");
  }

  const header = Buffer.from(
    [
      "\x1B%-12345X@PJL",
      `@PJL JOB NAME="${safeJobName}"`,
      `@PJL SET JOBNAME="${safeJobName}"`,
      `@PJL SET USERNAME="${safeUsername}"`,
      "@PJL SET HOLD=STORE",
      "@PJL SET HOLDTYPE=PRIVATE",
      `@PJL SET HOLDKEY="${safeHoldKey}"`,
      "@PJL ENTER LANGUAGE=PDF",
      "",
    ].join("\r\n"),
    "latin1",
  );
  const footer = Buffer.from(
    `\x1B%-12345X@PJL EOJ NAME="${safeJobName}"\r\n\x1B%-12345X`,
    "latin1",
  );

  return Buffer.concat([header, buffer, footer]);
};

const dispatchViaLp = async ({ filePath, destinationName }) => {
  if (!env.printDestination && !destinationName) {
    throw createHttpError(500, "PRINT_DESTINATION is required for lp transport.");
  }

  const destination = env.printDestination || destinationName;
  const commandArgs = env.printLpRaw
    ? ["-o", "raw", "-d", destination, filePath]
    : ["-d", destination, filePath];
  const { stdout } = await execFileAsync("lp", commandArgs);

  return {
    method: "lp",
    targetHost: "",
    targetPort: 0,
    destinationName: destination,
    bytesSent: 0,
    jobReference: stdout.trim(),
    durationMs: 0,
  };
};

const dispatchPrintFile = async ({
  printer,
  filePath,
  buffer,
  holdOnPrinter = false,
  holdKey = "",
  jobName = "",
  username = "",
}) => {
  if (isPrintDispatchDisabled()) {
    return {
      method: "none",
      targetHost: printer?.network?.ipAddress || "",
      targetPort: 0,
      destinationName: printer?.name || "",
      bytesSent: 0,
      jobReference: "",
      durationMs: 0,
      skipped: true,
    };
  }

  if (env.printTransport === "lp") {
    return dispatchViaLp({
      filePath,
      destinationName: printer?.name || env.printDestination,
    });
  }

  if (env.printTransport !== "socket") {
    throw createHttpError(500, `Unsupported PRINT_TRANSPORT "${env.printTransport}".`);
  }

  const fileBuffer =
    buffer && Buffer.isBuffer(buffer) ? buffer : await fs.readFile(filePath);
  const outputBuffer = holdOnPrinter
    ? buildHpPrivateJobBuffer({
        buffer: fileBuffer,
        holdKey,
        jobName,
        username,
      })
    : fileBuffer;

  return dispatchViaSocket({
    host: printer ? printer.network?.ipAddress : env.printDefaultPrinterIp,
    port: env.printSocketPort,
    buffer: outputBuffer,
    destinationName: printer ? printer.name : env.printDefaultPrinterName,
  });
};

module.exports = {
  storePrintFile,
  dispatchPrintFile,
  isPrintDispatchDisabled,
  countPdfPages,
};
