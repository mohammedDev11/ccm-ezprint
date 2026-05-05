const { createHttpError } = require("../../utils/http");

const toStringValue = (value) => (typeof value === "string" ? value.trim() : "");

const toNumberValue = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : NaN;
};

const normalizeQuotaAdjustmentPayload = (payload = {}) => {
  const userId = toStringValue(payload.userId);
  const amount = toNumberValue(payload.amount);

  if (!userId) {
    throw createHttpError(400, "A userId is required.");
  }

  if (!Number.isFinite(amount) || amount === 0) {
    throw createHttpError(400, "A non-zero amount is required.");
  }

  return {
    userId,
    amount,
    transactionType: toStringValue(payload.transactionType || payload.type) || "Adjustment",
    reason: toStringValue(payload.reason),
    comment: toStringValue(payload.comment),
    method: toStringValue(payload.method) || "Admin Adjustment",
  };
};

const normalizeRedeemPayload = (payload = {}) => {
  const code = toStringValue(payload.code || payload.redeemCode);

  if (!code) {
    throw createHttpError(400, "A redeem code is required.");
  }

  return {
    code,
  };
};

const normalizeRefundPayload = (payload = {}) => {
  const amount = payload.amount === undefined ? null : toNumberValue(payload.amount);

  if (amount !== null && (!Number.isFinite(amount) || amount <= 0)) {
    throw createHttpError(400, "Refund amount must be greater than zero.");
  }

  return {
    amount,
    reason: toStringValue(payload.reason),
    comment: toStringValue(payload.comment),
    method: toStringValue(payload.method) || "Manual Refund",
  };
};

module.exports = {
  normalizeQuotaAdjustmentPayload,
  normalizeRedeemPayload,
  normalizeRefundPayload,
};
