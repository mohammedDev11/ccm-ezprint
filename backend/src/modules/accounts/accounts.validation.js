const mongoose = require("mongoose");
const { createHttpError } = require("../../utils/http");
const {
  SHARED_ACCOUNT_STATUSES,
  LINKED_ACCOUNT_STATUSES,
} = require("../../models/SharedAccount");

const statusAliases = {
  active: "active",
  review: "review",
  "needs review": "review",
  archived: "archived",
};

const linkedStatusAliases = {
  active: "active",
  inactive: "inactive",
  suspended: "suspended",
};

const toStringValue = (value) => (typeof value === "string" ? value.trim() : "");

const toNumberValue = (value, defaultValue = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : defaultValue;
};

const toObjectIdValue = (value) => {
  const rawValue = toStringValue(value);
  return rawValue && mongoose.isValidObjectId(rawValue) ? rawValue : null;
};

const normalizeStatus = (value, allowedStatuses, aliases, defaultValue) => {
  const normalizedValue = toStringValue(value).toLowerCase();
  const status = aliases[normalizedValue] || normalizedValue;

  return allowedStatuses.includes(status) ? status : defaultValue;
};

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(value.map((item) => toStringValue(item)).filter(Boolean)),
  );
};

const normalizeAccountRef = (payload = {}) => {
  if (typeof payload === "string") {
    return {
      userId: null,
      username: toStringValue(payload).toLowerCase(),
    };
  }

  return {
    userId: toObjectIdValue(payload.userId || payload.id),
    username: toStringValue(payload.username || payload.primaryAccount).toLowerCase(),
  };
};

const normalizeLinkedAccountPayload = (payload = {}) => {
  const accountRef = normalizeAccountRef(payload);

  return {
    ...accountRef,
    identifier: toStringValue(payload.identifier),
    department: toStringValue(payload.department),
    role: toStringValue(payload.role),
    status: normalizeStatus(
      payload.status,
      LINKED_ACCOUNT_STATUSES,
      linkedStatusAliases,
      "active",
    ),
    balance: toNumberValue(payload.balance, 0),
    pages: toNumberValue(payload.pages, 0),
    jobs: toNumberValue(payload.jobs, 0),
    lastActivityAt: payload.lastActivityAt ? new Date(payload.lastActivityAt) : null,
    isPrimary: Boolean(payload.isPrimary),
  };
};

const normalizeSharedAccountPayload = (payload = {}, { requirePrimary = false } = {}) => {
  const primaryAccount = normalizeAccountRef(payload.primaryAccount || payload);
  const hasField = (key) => Object.prototype.hasOwnProperty.call(payload, key);

  if (requirePrimary && !primaryAccount.userId && !primaryAccount.username) {
    throw createHttpError(400, "Primary account userId or username is required.");
  }

  const linkedAccounts = Array.isArray(payload.linkedAccounts)
    ? payload.linkedAccounts.map(normalizeLinkedAccountPayload)
    : null;

  return {
    primaryAccount,
    linkedAccounts,
    linkedRoles: normalizeStringArray(payload.linkedRoles),
    department: toStringValue(payload.department),
    status: normalizeStatus(
      payload.status,
      SHARED_ACCOUNT_STATUSES,
      statusAliases,
      "active",
    ),
    notes: toStringValue(payload.notes),
    fields: {
      primaryAccount:
        hasField("primaryAccount") || hasField("userId") || hasField("username"),
      linkedAccounts: Array.isArray(payload.linkedAccounts),
      linkedRoles: Array.isArray(payload.linkedRoles),
      department: hasField("department"),
      status: hasField("status"),
      notes: hasField("notes"),
    },
  };
};

const normalizePrimaryPayload = (payload = {}) => {
  const accountRef = normalizeAccountRef(payload.account || payload.primaryAccount || payload);
  const linkedAccountId = toStringValue(payload.linkedAccountId || payload.accountId);

  if (!linkedAccountId && !accountRef.userId && !accountRef.username) {
    throw createHttpError(
      400,
      "Provide linkedAccountId, userId, or username for the primary account.",
    );
  }

  return {
    linkedAccountId,
    accountRef,
  };
};

const normalizeLinkedPayload = (payload = {}) =>
  normalizeLinkedAccountPayload(payload.account || payload.linkedAccount || payload);

module.exports = {
  normalizeSharedAccountPayload,
  normalizePrimaryPayload,
  normalizeLinkedPayload,
};
