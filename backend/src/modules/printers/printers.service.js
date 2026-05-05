const Printer = require("../../models/Printer");
const Queue = require("../../models/Queue");
const { createHttpError } = require("../../utils/http");
const { formatDateTimeLabel } = require("../../utils/formatters");
const { recordAuditLog } = require("../logs/logs.service");

const toIdString = (value) => value?.toString?.() || "";

const formatPrinterLocation = (printer) => {
  const building = printer.location?.building || "";
  const room = printer.location?.room ? `Room ${printer.location.room}` : "";
  return [building, room].filter(Boolean).join(", ");
};

const mapAdminPrinter = (printer) => ({
  id: printer._id.toString(),
  name: printer.name,
  model: printer.model,
  location: formatPrinterLocation(printer),
  building: printer.location?.building || "",
  room: printer.location?.room || "",
  department: printer.department,
  status: printer.status?.current || "Online",
  capabilities: printer.capabilities?.supported || [],
  totalPagesPrinted: printer.statistics?.totalPagesPrinted || 0,
  totalJobsSubmitted: printer.statistics?.totalJobsSubmitted || 0,
  costPerPage: printer.costPerPage,
  ipAddress: printer.network?.ipAddress || "",
  queueName: printer.queue?.queueName || "",
  serialNumber: printer.serialNumber,
  deviceType: printer.device?.type || "Physical",
  tonerLevel: printer.status?.toner?.level ?? 0,
  paperLevel: printer.status?.paper?.level ?? 0,
  lastUsed: printer.statistics?.lastUsedAt
    ? formatDateTimeLabel(printer.statistics.lastUsedAt)
    : "No activity",
  notes: printer.notes || "",
});

const buildActorPayload = (actor = {}) => ({
  userId: actor.userId,
  username: actor.username,
  role: actor.role,
  ipAddress: actor.ipAddress,
  userAgent: actor.userAgent,
});

const normalizeString = (value) =>
  value === undefined || value === null ? undefined : String(value).trim();

const normalizeOptionalNumber = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    throw createHttpError(400, `${fieldName} must be a valid non-negative number.`);
  }

  return parsedValue;
};

const getRequiredPrinter = async (printerId) => {
  const printer = await Printer.findOne({
    _id: printerId,
    isActive: { $ne: false },
  });

  if (!printer) {
    throw createHttpError(404, "Printer not found.");
  }

  return printer;
};

const getAdminPrintersData = async () => {
  const printers = await Printer.find({ isActive: { $ne: false } }).sort({
    createdAt: -1,
  });

  return printers.map(mapAdminPrinter);
};

const updatePrinterData = async (printerId, payload = {}, actor = {}) => {
  const printer = await getRequiredPrinter(printerId);
  const name = normalizeString(payload.name);

  if (name !== undefined && !name) {
    throw createHttpError(400, "Printer name is required.");
  }

  if (name && name !== printer.name) {
    const existingPrinter = await Printer.findOne({
      _id: { $ne: printer._id },
      name,
      isActive: { $ne: false },
    });

    if (existingPrinter) {
      throw createHttpError(409, "A printer with this name already exists.");
    }
  }

  const costPerPage = normalizeOptionalNumber(payload.costPerPage, "Cost per page");
  const before = mapAdminPrinter(printer);

  if (name !== undefined) printer.name = name;
  if (payload.model !== undefined) printer.model = normalizeString(payload.model) || "";
  if (payload.department !== undefined) {
    printer.department = normalizeString(payload.department) || "";
  }
  if (payload.building !== undefined) {
    printer.location.building = normalizeString(payload.building) || "";
  }
  if (payload.room !== undefined) {
    printer.location.room = normalizeString(payload.room) || "";
  }
  if (payload.queueName !== undefined) {
    printer.queue.queueName = normalizeString(payload.queueName) || "";
  }
  if (payload.ipAddress !== undefined) {
    printer.network.ipAddress = normalizeString(payload.ipAddress) || "";
  }
  if (payload.serialNumber !== undefined) {
    printer.serialNumber = normalizeString(payload.serialNumber) || "";
  }
  if (payload.notes !== undefined) {
    printer.notes = normalizeString(payload.notes) || "";
  }
  if (costPerPage !== undefined) {
    printer.costPerPage = costPerPage;
  }

  await printer.save();

  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Printer Updated",
      category: "Printer",
      details: `Updated printer "${printer.name}".`,
    },
    resource: {
      type: "Printer",
      id: printer._id,
      name: printer.name,
      changes: {
        before,
        after: mapAdminPrinter(printer),
      },
    },
  });

  return {
    printer: mapAdminPrinter(printer),
  };
};

const detachPrinterFromQueues = async (printer) => {
  const printerId = toIdString(printer._id);
  const queues = await Queue.find({
    $or: [
      { "printers.assigned": printer._id },
      { "printers.default": printer._id },
    ],
  });

  await Promise.all(
    queues.map(async (queue) => {
      const assignedIds = (queue.printers?.assigned || []).filter(
        (assignedPrinterId) => toIdString(assignedPrinterId) !== printerId,
      );
      const defaultId =
        toIdString(queue.printers?.default) && toIdString(queue.printers.default) !== printerId
          ? queue.printers.default
          : assignedIds[0] || null;
      const assignedPrinters = assignedIds.length
        ? await Printer.find({
            _id: { $in: assignedIds },
            isActive: { $ne: false },
          }).select("status")
        : [];

      queue.printers.assigned = assignedIds;
      queue.printers.default = defaultId;
      queue.printers.totalAssigned = assignedIds.length;
      queue.printers.onlineCount = assignedPrinters.filter(
        (assignedPrinter) => assignedPrinter.status?.current === "Online",
      ).length;

      await queue.save();
    }),
  );
};

const deletePrinterData = async (printerId, actor = {}) => {
  const printer = await getRequiredPrinter(printerId);

  printer.isActive = false;
  printer.queue.enabled = false;
  printer.status.current = "Offline";
  await printer.save();
  await detachPrinterFromQueues(printer);

  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Printer Deleted",
      category: "Printer",
      details: `Deleted printer "${printer.name}".`,
    },
    resource: {
      type: "Printer",
      id: printer._id,
      name: printer.name,
      changes: {
        printerName: printer.name,
        serialNumber: printer.serialNumber,
        location: formatPrinterLocation(printer),
      },
    },
  });

  return {
    deletedPrinterId: printerId,
    deletedPrinterName: printer.name,
  };
};

module.exports = {
  getAdminPrintersData,
  updatePrinterData,
  deletePrinterData,
};
