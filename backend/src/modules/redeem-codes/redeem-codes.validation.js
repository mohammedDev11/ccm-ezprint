const { createHttpError } = require("../../utils/http");

const toStringValue = (value) => (typeof value === "string" ? value.trim() : "");

const toNumberValue = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : NaN;
};

const normalizeGeneratePayload = (payload = {}) => {
  const quotaAmount = toNumberValue(payload.quotaAmount || payload.amount);
  const expiresAt = toStringValue(payload.expiresAt || payload.expiryDate);

  if (!Number.isFinite(quotaAmount) || quotaAmount <= 0) {
    throw createHttpError(400, "Quota amount must be greater than zero.");
  }

  return {
    quotaAmount: Number(quotaAmount.toFixed(2)),
    count: 1,
    expiresAt,
    note: toStringValue(payload.note),
  };
};

const normalizeBulkPayload = (payload = {}) => {
  const ids = Array.isArray(payload.ids)
    ? payload.ids.map(toStringValue).filter(Boolean)
    : [];

  if (ids.length === 0) {
    throw createHttpError(400, "At least one redeem code id is required.");
  }

  return { ids };
};

module.exports = {
  normalizeBulkPayload,
  normalizeGeneratePayload,
};
