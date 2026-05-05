const crypto = require("crypto");

const RedeemCode = require("../../models/RedeemCode");
const User = require("../../models/User");
const { createHttpError } = require("../../utils/http");
const { formatDateTimeLabel } = require("../../utils/formatters");
const { applyQuotaChange } = require("../quota/quota.service");
const { recordAuditLog } = require("../logs/logs.service");

const CODE_LENGTH = 6;
const MAX_GENERATION_ATTEMPTS = 20;

const buildActorPayload = (actor = {}) => ({
  userId: actor.userId,
  username: actor.username,
  role: actor.role,
  ipAddress: actor.ipAddress,
  userAgent: actor.userAgent,
});

const normalizeCodeValue = (value = "") =>
  String(value || "").replace(/[\s-]/g, "").trim().toUpperCase();

const roundAmount = (value) => Number(Number(value || 0).toFixed(2));

const randomNumericCode = () => {
  let code = "";

  for (let index = 0; index < CODE_LENGTH; index += 1) {
    code += crypto.randomInt(0, 10).toString();
  }

  return code;
};

const parseExpiryDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, "Expiry date is invalid.");
  }

  if (date.getTime() <= Date.now()) {
    throw createHttpError(400, "Expiry date must be in the future.");
  }

  return date;
};

const buildUserSummary = (user) => {
  if (!user) return null;

  return {
    id: user._id.toString(),
    username: user.username || "",
    fullName: user.fullName || user.username || "",
    email: user.email || "",
  };
};

const buildGroupSummary = (group) => {
  if (!group) return null;

  return {
    id: group._id.toString(),
    name: group.name || "",
  };
};

const syncExpiredCodes = async () => {
  await RedeemCode.updateMany(
    {
      status: "unused",
      expiresAt: { $ne: null, $lte: new Date() },
    },
    {
      $set: { status: "expired" },
    },
  );
};

const populateRedeemCodeQuery = (query) =>
  query
    .populate("createdBy", "username fullName email")
    .populate("redeemedBy", "username fullName email")
    .populate("targetUser", "username fullName email")
    .populate("targetGroup", "name");

const mapRedeemCode = (code) => {
  const status =
    code.status === "unused" &&
    code.expiresAt &&
    new Date(code.expiresAt).getTime() <= Date.now()
      ? "expired"
      : code.status;

  return {
    id: code._id.toString(),
    code: code.code,
    quotaAmount: code.quotaAmount,
    status,
    createdBy: buildUserSummary(code.createdBy),
    redeemedBy: buildUserSummary(code.redeemedBy),
    redeemedAt: code.redeemedAt || null,
    redeemedAtLabel: code.redeemedAt ? formatDateTimeLabel(code.redeemedAt) : "",
    expiresAt: code.expiresAt || null,
    expiresAtLabel: code.expiresAt ? formatDateTimeLabel(code.expiresAt) : "",
    note: code.note || "",
    targetUser: buildUserSummary(code.targetUser),
    targetGroup: buildGroupSummary(code.targetGroup),
    createdAt: code.createdAt,
    createdAtLabel: formatDateTimeLabel(code.createdAt),
    updatedAt: code.updatedAt,
  };
};

const buildListQuery = (filters = {}) => {
  const query = {};
  const status = String(filters.status || "").trim().toLowerCase();
  const search = String(filters.search || "").trim();

  if (["unused", "redeemed", "expired", "disabled"].includes(status)) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { code: { $regex: search, $options: "i" } },
      { note: { $regex: search, $options: "i" } },
    ];
  }

  return query;
};

const getRedeemCodesData = async (filters = {}) => {
  await syncExpiredCodes();

  const query = buildListQuery(filters);
  const limit = Math.min(Math.max(Number(filters.limit) || 250, 1), 500);

  const [codes, summaryRows] = await Promise.all([
    populateRedeemCodeQuery(
      RedeemCode.find(query).sort({ createdAt: -1 }).limit(limit),
    ),
    RedeemCode.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const summaryByStatus = summaryRows.reduce((acc, row) => {
    acc[row._id] = row.count;
    return acc;
  }, {});

  return {
    summary: {
      total: Object.values(summaryByStatus).reduce((sum, count) => sum + count, 0),
      unused: summaryByStatus.unused || 0,
      redeemed: summaryByStatus.redeemed || 0,
      expired: summaryByStatus.expired || 0,
      disabled: summaryByStatus.disabled || 0,
    },
    codes: codes.map(mapRedeemCode),
  };
};

const generateUniqueCodes = async (count) => {
  const generated = new Set();
  let attempts = 0;

  while (generated.size < count && attempts < count * MAX_GENERATION_ATTEMPTS) {
    attempts += 1;
    const candidate = randomNumericCode();

    if (generated.has(candidate)) {
      continue;
    }

    const existing = await RedeemCode.exists({ code: candidate });

    if (!existing) {
      generated.add(candidate);
    }
  }

  if (generated.size !== count) {
    throw createHttpError(500, "Unable to generate unique redeem codes.");
  }

  return Array.from(generated);
};

const generateRedeemCodesData = async (actor, payload) => {
  const expiresAt = parseExpiryDate(payload.expiresAt);
  const generatedCodes = await generateUniqueCodes(1);
  const docs = await RedeemCode.insertMany(
    generatedCodes.map((code) => ({
      code,
      quotaAmount: payload.quotaAmount,
      expiresAt,
      note: payload.note,
      createdBy: actor.userId || null,
      targetUser: null,
      targetGroup: null,
    })),
  );

  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Redeem Codes Generated",
      category: "Quota",
      details: `Generated ${docs.length} redeem code${docs.length === 1 ? "" : "s"} worth ${payload.quotaAmount.toFixed(2)} quota each.`,
    },
    resource: {
      type: "RedeemCode",
      name: `${docs.length} generated`,
      changes: {
        count: docs.length,
        quotaAmount: payload.quotaAmount,
        expiresAt,
      },
    },
  });

  const populatedDocs = await populateRedeemCodeQuery(
    RedeemCode.find({ _id: { $in: docs.map((doc) => doc._id) } }).sort({
      createdAt: -1,
    }),
  );

  return {
    generatedCodes,
    codes: populatedDocs.map(mapRedeemCode),
  };
};

const getRequiredRedeemCode = async (id) => {
  const code = await RedeemCode.findById(id);

  if (!code) {
    throw createHttpError(404, "Redeem code not found.");
  }

  return code;
};

const disableRedeemCodeData = async (id, actor) => {
  const code = await getRequiredRedeemCode(id);

  if (code.status === "redeemed") {
    throw createHttpError(409, "Redeemed codes cannot be disabled.");
  }

  code.status = "disabled";
  await code.save();

  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Redeem Code Disabled",
      category: "Quota",
      details: `Disabled redeem code ${code.code}.`,
    },
    resource: {
      type: "RedeemCode",
      id: code._id,
      name: code.code,
    },
  });

  const populated = await populateRedeemCodeQuery(RedeemCode.findById(code._id));

  return {
    code: mapRedeemCode(populated),
  };
};

const deleteRedeemCodeData = async (id, actor) => {
  const code = await getRequiredRedeemCode(id);
  await code.deleteOne();

  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Redeem Code Deleted",
      category: "Quota",
      details: `Deleted redeem code ${code.code}.`,
    },
    resource: {
      type: "RedeemCode",
      id: code._id,
      name: code.code,
      changes: {
        status: code.status,
        quotaAmount: code.quotaAmount,
      },
    },
  });

  return {
    id,
    deleted: true,
  };
};

const disableRedeemCodesBulkData = async (ids, actor) => {
  const result = await RedeemCode.updateMany(
    {
      _id: { $in: ids },
      status: { $ne: "redeemed" },
    },
    {
      $set: { status: "disabled" },
    },
  );

  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Redeem Codes Disabled",
      category: "Quota",
      details: `Disabled ${result.modifiedCount || 0} redeem code${result.modifiedCount === 1 ? "" : "s"}.`,
    },
    resource: {
      type: "RedeemCode",
      name: "Bulk disable",
      changes: {
        ids,
        modifiedCount: result.modifiedCount || 0,
      },
    },
  });

  return {
    modifiedCount: result.modifiedCount || 0,
  };
};

const deleteRedeemCodesBulkData = async (ids, actor) => {
  const result = await RedeemCode.deleteMany({ _id: { $in: ids } });

  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Redeem Codes Deleted",
      category: "Quota",
      details: `Deleted ${result.deletedCount || 0} redeem code${result.deletedCount === 1 ? "" : "s"}.`,
    },
    resource: {
      type: "RedeemCode",
      name: "Bulk delete",
      changes: {
        ids,
        deletedCount: result.deletedCount || 0,
      },
    },
  });

  return {
    deletedCount: result.deletedCount || 0,
  };
};

const recordRedeemFailure = async (actor, code, statusCode, message) => {
  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Redeem Failed",
      category: "Quota",
      details: message,
    },
    resource: {
      type: "RedeemCode",
      name: code,
    },
    outcome: {
      success: false,
      statusCode,
      errorMessage: message,
    },
  });
};

const throwRedeemError = async (actor, code, statusCode, message) => {
  await recordRedeemFailure(actor, code, statusCode, message);
  throw createHttpError(statusCode, message);
};

const redeemCodeForUserData = async (actor, payload) => {
  const normalizedCode = normalizeCodeValue(payload.code);

  if (!normalizedCode) {
    throw createHttpError(400, "A redeem code is required.");
  }

  const user = await User.findById(actor.userId);

  if (!user) {
    throw createHttpError(404, "User not found.");
  }

  const code = await RedeemCode.findOne({ code: normalizedCode });

  if (!code) {
    await throwRedeemError(actor, normalizedCode, 404, "Redeem code was not found.");
  }

  if (code.status === "disabled") {
    await throwRedeemError(actor, normalizedCode, 409, "Redeem code is disabled.");
  }

  if (code.status === "redeemed") {
    await throwRedeemError(actor, normalizedCode, 409, "Redeem code was already used.");
  }

  if (code.status === "expired") {
    await throwRedeemError(actor, normalizedCode, 410, "Redeem code has expired.");
  }

  if (code.expiresAt && new Date(code.expiresAt).getTime() <= Date.now()) {
    code.status = "expired";
    await code.save();
    await throwRedeemError(actor, normalizedCode, 410, "Redeem code has expired.");
  }

  const claimedCode = await RedeemCode.findOneAndUpdate(
    {
      _id: code._id,
      status: "unused",
    },
    {
      $set: {
        status: "redeemed",
        redeemedBy: user._id,
        redeemedAt: new Date(),
      },
    },
    { new: true },
  );

  if (!claimedCode) {
    await throwRedeemError(
      actor,
      normalizedCode,
      409,
      "Redeem code was already claimed.",
    );
  }

  let quotaResult;

  try {
    quotaResult = await applyQuotaChange({
      user,
      amount: roundAmount(code.quotaAmount),
      transactionType: "Credit Addition",
      reason: "Voucher redeemed",
      comment: code.note
        ? `Redeem code ${normalizedCode}: ${code.note}`
        : `Redeem code ${normalizedCode}`,
      method: "Redeem Code",
      reference: {
        groupId: null,
      },
      actor,
      notificationMessage: `A redeem code added ${roundAmount(code.quotaAmount).toFixed(2)} quota to your account.`,
    });
  } catch (error) {
    await RedeemCode.updateOne(
      {
        _id: claimedCode._id,
        status: "redeemed",
        redeemedBy: user._id,
      },
      {
        $set: {
          status: "unused",
          redeemedBy: null,
          redeemedAt: null,
        },
      },
    );
    throw error;
  }

  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Redeem Code Claimed",
      category: "Quota",
      details: `${user.username} redeemed a code worth ${roundAmount(code.quotaAmount).toFixed(2)} quota.`,
    },
    resource: {
      type: "RedeemCode",
      id: code._id,
      name: normalizedCode,
      changes: {
        quotaAmount: roundAmount(code.quotaAmount),
        redeemedBy: user.username,
        balanceAfter: quotaResult.after,
      },
    },
  });

  return {
    message: `Voucher redeemed. ${roundAmount(code.quotaAmount).toFixed(2)} quota was added to your account.`,
    quota: quotaResult.after,
    balance: quotaResult.after,
    amount: roundAmount(code.quotaAmount),
    transaction: {
      id: quotaResult.transaction._id.toString(),
      type: quotaResult.transaction.transaction.type,
      amount: quotaResult.transaction.transaction.amount,
      amountBefore: quotaResult.transaction.quota.amountBefore,
      amountAfter: quotaResult.transaction.quota.amountAfter,
    },
  };
};

module.exports = {
  deleteRedeemCodeData,
  deleteRedeemCodesBulkData,
  disableRedeemCodeData,
  disableRedeemCodesBulkData,
  generateRedeemCodesData,
  getRedeemCodesData,
  normalizeCodeValue,
  redeemCodeForUserData,
};
