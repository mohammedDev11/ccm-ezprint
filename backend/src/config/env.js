const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const parsePrinterCapabilities = (value = "") =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const normalizePrinterConfig = (printer = {}) => ({
  ipAddress: String(printer.ipAddress || printer.ip || "").trim(),
  name: String(printer.name || "").trim(),
  model: String(printer.model || "").trim(),
  building: String(printer.building || "").trim(),
  room: String(printer.room || "").trim(),
  department: String(printer.department || "").trim(),
  locationCode: String(printer.locationCode || "").trim(),
  serialNumber: String(printer.serialNumber || printer.serial || "").trim(),
  firmwareVersion: String(
    printer.firmwareVersion || printer.functionVersion || "",
  ).trim(),
  queueName: String(printer.queueName || "").trim(),
  costPerPage:
    printer.costPerPage === undefined || printer.costPerPage === ""
      ? null
      : Number(printer.costPerPage),
  capabilities: Array.isArray(printer.capabilities)
    ? printer.capabilities.map((item) => String(item).trim()).filter(Boolean)
    : parsePrinterCapabilities(printer.capabilities),
});

const parseAdditionalPrintersJson = () => {
  if (!process.env.PRINT_ADDITIONAL_PRINTERS_JSON) {
    return [];
  }

  try {
    const parsed = JSON.parse(process.env.PRINT_ADDITIONAL_PRINTERS_JSON);
    return Array.isArray(parsed) ? parsed.map(normalizePrinterConfig) : [];
  } catch {
    return [];
  }
};

const parseIndexedAdditionalPrinters = () =>
  [2, 3, 4, 5]
    .map((index) =>
      normalizePrinterConfig({
        ipAddress: process.env[`PRINT_PRINTER_${index}_IP`],
        name: process.env[`PRINT_PRINTER_${index}_NAME`],
        model: process.env[`PRINT_PRINTER_${index}_MODEL`],
        building: process.env[`PRINT_PRINTER_${index}_BUILDING`],
        room: process.env[`PRINT_PRINTER_${index}_ROOM`],
        department: process.env[`PRINT_PRINTER_${index}_DEPARTMENT`],
        locationCode: process.env[`PRINT_PRINTER_${index}_LOCATION_CODE`],
        serialNumber: process.env[`PRINT_PRINTER_${index}_SERIAL_NUMBER`],
        functionVersion: process.env[`PRINT_PRINTER_${index}_FUNCTION_VERSION`],
        queueName: process.env[`PRINT_PRINTER_${index}_QUEUE_NAME`],
        costPerPage: process.env[`PRINT_PRINTER_${index}_COST_PER_PAGE`],
        capabilities: process.env[`PRINT_PRINTER_${index}_CAPABILITIES`],
      }),
    )
    .filter((printer) => printer.ipAddress);

const parseAdditionalPrinters = () => {
  const printers = [...parseAdditionalPrintersJson(), ...parseIndexedAdditionalPrinters()];
  const seen = new Set();

  return printers.filter((printer) => {
    const identity = printer.ipAddress || printer.name;

    if (!identity || seen.has(identity.toLowerCase())) {
      return false;
    }

    seen.add(identity.toLowerCase());
    return true;
  });
};

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5001,
  mongoUri: process.env.MONGO_URI || "",
  mongoDbName: process.env.MONGO_DB_NAME || "ccm_ezprint",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET || "change-this-secret-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  printUploadLimit: process.env.PRINT_UPLOAD_LIMIT || "25mb",
  printTransport: String(process.env.PRINT_TRANSPORT || "").trim().toLowerCase(),
  printSocketPort: Number(process.env.PRINT_SOCKET_PORT) || 9100,
  printTimeoutMs: Number(process.env.PRINT_TIMEOUT_MS) || 15000,
  printStorageDir: process.env.PRINT_STORAGE_DIR || "storage/print-jobs",
  printLpRaw: process.env.PRINT_LP_RAW === "true",
  printDefaultPrinterIp: process.env.PRINT_DEFAULT_PRINTER_IP || "",
  printDefaultPrinterName: process.env.PRINT_DEFAULT_PRINTER_NAME || "HP MFP M830",
  printDefaultPrinterModel: process.env.PRINT_DEFAULT_PRINTER_MODEL || "HP MFP M830",
  printDefaultPrinterBuilding: process.env.PRINT_DEFAULT_PRINTER_BUILDING || "22",
  printDefaultPrinterRoom: process.env.PRINT_DEFAULT_PRINTER_ROOM || "339",
  printDefaultPrinterDepartment:
    process.env.PRINT_DEFAULT_PRINTER_DEPARTMENT || "CCM",
  printDefaultPrinterLocationCode:
    process.env.PRINT_DEFAULT_PRINTER_LOCATION_CODE || "22/339",
  printDefaultQueueName:
    process.env.PRINT_DEFAULT_QUEUE_NAME || "CCM Secure Release Queue",
  printDefaultCostPerPage:
    Number(process.env.PRINT_DEFAULT_COST_PER_PAGE) || 0.05,
  printDefaultUsername: process.env.PRINT_DEFAULT_USERNAME || "",
  printDefaultPassword: process.env.PRINT_DEFAULT_PASSWORD || "",
  printDestination: process.env.PRINT_DESTINATION || "",
  printAdditionalPrinters: parseAdditionalPrinters(),
};

module.exports = env;
