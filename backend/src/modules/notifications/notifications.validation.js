const { createHttpError } = require("../../utils/http");

const normalizeIds = (value) => {
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

const normalizeBulkNotificationPayload = (payload = {}) => {
  const notificationIds = normalizeIds(payload.notificationIds || payload.ids);

  if (notificationIds.length === 0) {
    throw createHttpError(400, "At least one notification id is required.");
  }

  return {
    notificationIds,
  };
};

module.exports = {
  normalizeBulkNotificationPayload,
};
