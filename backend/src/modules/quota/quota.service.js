const User = require("../../models/User");
const PrintJob = require("../../models/PrintJob");
const QuotaTransaction = require("../../models/QuotaTransaction");
const { createHttpError } = require("../../utils/http");
const { createNotification } = require("../notifications/notifications.service");
const { recordAuditLog } = require("../logs/logs.service");

const roundAmount = (value) => Number(Number(value || 0).toFixed(2));

const getRequiredUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw createHttpError(404, "User not found.");
  }

  return user;
};

const buildActorPayload = (actor = {}) => ({
  userId: actor.userId,
  username: actor.username,
  role: actor.role,
  ipAddress: actor.ipAddress,
  userAgent: actor.userAgent,
});

const buildReferencePayload = (reference = {}) => ({
  jobId: reference.jobId || null,
  jobIdString: reference.jobIdString || "",
  groupId: reference.groupId || null,
  linkedTransactionId: reference.linkedTransactionId || null,
});

const buildTransactionType = (type = "") => {
  const allowedTypes = new Set([
    "Print Deduction",
    "Refund",
    "Credit Addition",
    "Adjustment",
    "Manual Override",
    "Group Allocation",
  ]);

  return allowedTypes.has(type) ? type : "Adjustment";
};

const createQuotaNotificationForTransaction = async (user, transaction, context = {}) => {
  const transactionType = transaction.transaction?.type;

  if (!["Refund", "Credit Addition", "Adjustment", "Manual Override", "Group Allocation"].includes(transactionType)) {
    return null;
  }

  const title =
    transactionType === "Refund"
      ? "Quota refund applied"
      : transactionType === "Credit Addition"
        ? "Quota credited"
        : "Quota updated";
  const message =
    context.message ||
    (transactionType === "Refund"
      ? `A refund of ${transaction.transaction.amount.toFixed(2)} SAR was added back to your balance.`
      : `Your quota changed by ${transaction.transaction.amount.toFixed(2)} SAR.`);

  const type = transactionType === "Refund" ? "job_refunded" : "system_warning";

  return createNotification({
    title,
    message,
    type,
    source: "System",
    severity: transactionType === "Refund" ? "info" : "info",
    targetAudience: {
      specificUsers: [user._id],
    },
    relatedTo: {
      userId: user._id,
      jobId: transaction.reference?.jobId || null,
    },
  });
};

const applyQuotaChange = async ({
  userId,
  user,
  amount,
  transactionType,
  reason,
  comment,
  method,
  reference = {},
  actor = {},
  notificationMessage = "",
}) => {
  const userDoc = user || (await getRequiredUser(userId));
  const before = roundAmount(userDoc.printing?.quota?.remaining);
  const after = roundAmount(before + amount);

  if (after < 0) {
    throw createHttpError(409, "Insufficient balance to complete this action.");
  }

  userDoc.printing.quota.remaining = after;
  userDoc.statistics.lastActivityAt = new Date();
  await userDoc.save();

  const transaction = await QuotaTransaction.create({
    user: {
      userId: userDoc._id,
      username: userDoc.username,
      department: userDoc.department || "",
    },
    transaction: {
      type: buildTransactionType(transactionType),
      amount: roundAmount(amount),
      reason: reason || comment || transactionType,
    },
    quota: {
      amountBefore: before,
      amountAfter: after,
      changed: roundAmount(amount),
    },
    reference: buildReferencePayload(reference),
    metadata: {
      method: method || "System",
      performedBy: actor.userId || null,
      performedByUsername: actor.username || "",
      ipAddress: actor.ipAddress || "",
      notes: comment || "",
      comment: comment || "",
    },
    approval: {
      required: false,
      approvedBy: actor.userId || null,
      approvedAt: actor.userId ? new Date() : null,
      status: "Approved",
    },
  });

  await createQuotaNotificationForTransaction(userDoc, transaction, {
    message: notificationMessage,
  });

  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Quota Updated",
      category: "Quota",
      details: `${transaction.transaction.type} of ${transaction.transaction.amount.toFixed(2)} SAR for ${userDoc.username}.`,
    },
    resource: {
      type: "User",
      id: userDoc._id,
      name: userDoc.username,
      changes: {
        before,
        after,
        transactionType: transaction.transaction.type,
      },
    },
  });

  return {
    user: userDoc,
    transaction,
    before,
    after,
  };
};

const refundJobQuotaIfNeeded = async (job, actor, options = {}) => {
  const refundableAmount = roundAmount(
    (job.cost?.totalCost || 0) - (job.cost?.refundedAmount || 0),
  );

  if (!job.cost?.quotaDeducted || refundableAmount <= 0) {
    return null;
  }

  const amount = roundAmount(
    options.amount === null || options.amount === undefined
      ? refundableAmount
      : Math.min(refundableAmount, options.amount),
  );

  if (amount <= 0) {
    return null;
  }

  const quotaResult = await applyQuotaChange({
    userId: job.user.userId,
    amount,
    transactionType: "Refund",
    reason: options.reason || "Print job refund",
    comment: options.comment || `Refund for ${job.documentName}`,
    method: options.method || "System Refund",
    reference: {
      jobId: job._id,
      jobIdString: job.jobId,
    },
    actor,
    notificationMessage: `A refund of ${amount.toFixed(2)} SAR was added back for "${job.documentName}".`,
  });

  job.cost.refundedAmount = roundAmount((job.cost?.refundedAmount || 0) + amount);
  job.cost.refundedAt = new Date();
  job.cost.quotaDeducted = job.cost.refundedAmount < (job.cost?.totalCost || 0);

  if (!options.preserveStatus) {
    job.status.current = "Refunded";
  }

  await job.save();

  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Job Refunded",
      category: "Job",
      details: `Refunded ${amount.toFixed(2)} SAR for job "${job.jobId}".`,
    },
    resource: {
      type: "PrintJob",
      id: job._id,
      name: job.jobId,
      changes: {
        amount,
        documentName: job.documentName,
        queueName: job.printer?.queueName || "",
      },
    },
  });

  return {
    user: quotaResult.user,
    transaction: quotaResult.transaction,
    job,
  };
};

const adjustUserQuotaData = async (actor, payload) => {
  const result = await applyQuotaChange({
    userId: payload.userId,
    amount: payload.amount,
    transactionType: payload.transactionType,
    reason: payload.reason || "Admin adjustment",
    comment: payload.comment,
    method: payload.method,
    actor,
    notificationMessage: `Your balance changed by ${roundAmount(payload.amount).toFixed(2)} SAR.`,
  });

  return {
    user: {
      id: result.user._id.toString(),
      username: result.user.username,
      quota: result.after,
    },
    transaction: {
      id: result.transaction._id.toString(),
      type: result.transaction.transaction.type,
      amount: result.transaction.transaction.amount,
      amountBefore: result.transaction.quota.amountBefore,
      amountAfter: result.transaction.quota.amountAfter,
    },
  };
};

const redeemQuotaData = async (actor, payload) => {
  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Redeem Attempted",
      category: "Quota",
      details: `Redeem code "${payload.code}" was submitted but redeem code storage is not configured.`,
    },
    resource: {
      type: "RedeemCode",
      name: payload.code,
    },
    outcome: {
      success: false,
      statusCode: 501,
      errorMessage: "Redeem code persistence is not configured yet.",
    },
  });

  throw createHttpError(
    501,
    "Redeem code persistence is not configured yet. Add a RedeemCode model or external voucher provider before enabling this endpoint.",
  );
};

const refundJobData = async (jobId, actor, payload) => {
  const job = await PrintJob.findById(jobId);

  if (!job) {
    throw createHttpError(404, "Print job not found.");
  }

  const result = await refundJobQuotaIfNeeded(job, actor, {
    amount: payload.amount,
    reason: payload.reason || "Manual job refund",
    comment: payload.comment,
    method: payload.method,
  });

  if (!result) {
    throw createHttpError(409, "This job does not have refundable quota remaining.");
  }

  return {
    job: {
      id: result.job._id.toString(),
      jobId: result.job.jobId,
      status: result.job.status?.current,
      refundedAmount: result.job.cost?.refundedAmount || 0,
    },
    transaction: {
      id: result.transaction._id.toString(),
      amount: result.transaction.transaction.amount,
      type: result.transaction.transaction.type,
    },
  };
};

module.exports = {
  applyQuotaChange,
  refundJobQuotaIfNeeded,
  adjustUserQuotaData,
  redeemQuotaData,
  refundJobData,
};
