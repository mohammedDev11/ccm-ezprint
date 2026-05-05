const AuditLog = require("../../models/Log");
const { formatDateTimeLabel } = require("../../utils/formatters");

const DEFAULT_LIMIT = 100;

const getLogTypeLabel = (category = "") => {
  switch (category) {
    case "Job":
      return "Print Job";
    case "Printer":
      return "Device";
    case "Security":
      return "Security";
    case "Quota":
      return "System";
    case "Queue":
      return "System";
    case "Group":
      return "System";
    default:
      return "System";
  }
};

const getLogStatusLabel = (log) => {
  if (log.outcome?.success === false) {
    return "Failed";
  }

  if ((log.outcome?.statusCode || 200) >= 400) {
    return "Warning";
  }

  if (["Security", "System"].includes(log.action?.category)) {
    return "Info";
  }

  return "Success";
};

const buildSearchFilter = (search = "") => {
  const term = search.trim();

  if (!term) {
    return null;
  }

  return {
    $or: [
      { "actor.username": { $regex: term, $options: "i" } },
      { "action.name": { $regex: term, $options: "i" } },
      { "action.details": { $regex: term, $options: "i" } },
      { "resource.name": { $regex: term, $options: "i" } },
      { "resource.type": { $regex: term, $options: "i" } },
    ],
  };
};

const mapAuditLog = (log) => {
  const resourceChanges = log.resource?.changes || {};
  const printerName =
    log.resource?.type === "Printer"
      ? log.resource?.name
      : resourceChanges.printerName || "—";

  return {
    id: log._id.toString(),
    time: formatDateTimeLabel(log.performedAt || log.createdAt),
    type: getLogTypeLabel(log.action?.category),
    title: log.action?.name || "System event",
    description: log.action?.details || log.resource?.name || "No description available.",
    user: log.actor?.username || "System",
    printer: printerName || "—",
    pages: Number.isFinite(resourceChanges.pages) ? resourceChanges.pages : null,
    status: getLogStatusLabel(log),
    documentName: resourceChanges.documentName || "",
    deviceIp: log.actor?.ipAddress || "",
    queueName: resourceChanges.queueName || "",
    serialNumber: resourceChanges.serialNumber || "",
    location: resourceChanges.location || "",
    resolutionNote: log.outcome?.errorMessage || resourceChanges.resolutionNote || "",
    category: log.action?.category || "System",
    performedAt: log.performedAt || log.createdAt,
    success: log.outcome?.success !== false,
  };
};

const recordAuditLog = async ({
  actor = {},
  action = {},
  resource = {},
  outcome = {},
  duration = 0,
  performedAt = new Date(),
}) => {
  return AuditLog.create({
    actor: {
      userId: actor.userId || null,
      username: actor.username || actor.email || "",
      role: actor.role || "",
      ipAddress: actor.ipAddress || "",
      userAgent: actor.userAgent || "",
    },
    action: {
      name: action.name || "System event",
      category: action.category || "System",
      details: action.details || "",
    },
    resource: {
      type: resource.type || "",
      id: resource.id || null,
      name: resource.name || "",
      changes: resource.changes || {},
    },
    outcome: {
      success: outcome.success !== false,
      statusCode: outcome.statusCode || 200,
      errorMessage: outcome.errorMessage || "",
    },
    duration,
    performedAt,
  });
};

const getLogsData = async (filters = {}) => {
  const query = {};
  const andConditions = [];
  const limit = Math.min(Math.max(Number(filters.limit) || DEFAULT_LIMIT, 1), 250);
  const category = (filters.category || "").trim();
  const success = (filters.success || "").trim();
  const searchFilter = buildSearchFilter(filters.search);

  if (category) {
    query["action.category"] = category;
  }

  if (success === "true" || success === "false") {
    query["outcome.success"] = success === "true";
  }

  if (filters.startDate || filters.endDate) {
    query.performedAt = {};

    if (filters.startDate) {
      query.performedAt.$gte = new Date(filters.startDate);
    }

    if (filters.endDate) {
      query.performedAt.$lte = new Date(filters.endDate);
    }
  }

  if (searchFilter) {
    andConditions.push(searchFilter);
  }

  const mongoQuery =
    andConditions.length > 0 ? { ...query, $and: andConditions } : query;

  const [logs, total] = await Promise.all([
    AuditLog.find(mongoQuery).sort({ performedAt: -1 }).limit(limit),
    AuditLog.countDocuments(mongoQuery),
  ]);

  const mappedLogs = logs.map(mapAuditLog);

  return {
    total,
    count: mappedLogs.length,
    filtersApplied: {
      search: filters.search || "",
      category: category || "all",
      success: success || "all",
      startDate: filters.startDate || "",
      endDate: filters.endDate || "",
    },
    logs: mappedLogs,
    auditLogs: mappedLogs,
  };
};

module.exports = {
  getLogsData,
  getAuditLogsData: getLogsData,
  recordAuditLog,
};
