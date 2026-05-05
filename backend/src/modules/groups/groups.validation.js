const { createHttpError } = require("../../utils/http");

const GROUP_TYPES = new Set(["Department", "Faculty", "Custom", "All Users"]);
const RESET_PERIODS = new Set(["Monthly", "Semester", "Annual", "None"]);

const toStringValue = (value) => (typeof value === "string" ? value.trim() : "");

const toBooleanValue = (value, defaultValue = false) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return defaultValue;
};

const toNumberValue = (value, defaultValue = 0) => {
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

const normalizeGroupPayload = (payload = {}, { requireName = false } = {}) => {
  const name = toStringValue(payload.name);

  if (requireName && !name) {
    throw createHttpError(400, "Group name is required.");
  }

  const groupType = toStringValue(payload.groupType) || "Custom";
  const resetPeriod = toStringValue(payload.resetPeriod) || "None";

  return {
    name,
    description: toStringValue(payload.description),
    groupType: GROUP_TYPES.has(groupType) ? groupType : "Custom",
    notes: toStringValue(payload.notes),
    memberUserIds: toStringArray(payload.memberUserIds || payload.userIds),
    allowedQueueIds: toStringArray(payload.allowedQueueIds || payload.queueIds),
    restricted: toBooleanValue(
      payload.restricted,
      String(payload.restricted).toLowerCase() === "restricted",
    ),
    selectedByDefault: toBooleanValue(payload.selectedByDefault),
    enabled: payload.enabled === undefined ? true : toBooleanValue(payload.enabled, true),
    requiresApproval: toBooleanValue(payload.requiresApproval),
    canUpload: payload.canUpload === undefined ? true : toBooleanValue(payload.canUpload, true),
    canRelease:
      payload.canRelease === undefined ? true : toBooleanValue(payload.canRelease, true),
    initialCredit: toNumberValue(payload.initialCredit ?? payload.initialQuota, 0),
    perUserAllocation: toNumberValue(payload.perUserAllocation, 0),
    scheduleAmount: toNumberValue(payload.scheduleAmount, 0),
    scheduleFrequency: toStringValue(payload.scheduleFrequency || payload.period),
    resetPeriod: RESET_PERIODS.has(resetPeriod) ? resetPeriod : "None",
    costLimit: toNumberValue(payload.costLimit, 0),
  };
};

module.exports = {
  normalizeGroupPayload,
};
