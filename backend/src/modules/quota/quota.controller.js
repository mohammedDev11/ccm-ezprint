const {
  normalizeQuotaAdjustmentPayload,
  normalizeRedeemPayload,
  normalizeRefundPayload,
} = require("./quota.validation");
const {
  adjustUserQuotaData,
  refundJobData,
} = require("./quota.service");
const { redeemCodeForUserData } = require("../redeem-codes/redeem-codes.service");

const getActor = (req) => ({
  userId: req.userId,
  role: req.userRole,
  username: req.userEmail || req.userId,
  ipAddress: req.ip,
  userAgent: req.get("user-agent") || "",
});

const redeemQuota = async (req, res, next) => {
  try {
    const payload = normalizeRedeemPayload(req.body);
    const data = await redeemCodeForUserData(getActor(req), payload);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const adjustUserQuota = async (req, res, next) => {
  try {
    const payload = normalizeQuotaAdjustmentPayload(req.body);
    const data = await adjustUserQuotaData(getActor(req), payload);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const refundJobQuota = async (req, res, next) => {
  try {
    const payload = normalizeRefundPayload(req.body);
    const data = await refundJobData(req.params.jobId, getActor(req), payload);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  redeemQuota,
  adjustUserQuota,
  refundJobQuota,
};
