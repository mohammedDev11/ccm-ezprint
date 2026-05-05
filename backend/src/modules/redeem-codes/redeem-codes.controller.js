const {
  normalizeBulkPayload,
  normalizeGeneratePayload,
} = require("./redeem-codes.validation");
const {
  deleteRedeemCodeData,
  deleteRedeemCodesBulkData,
  disableRedeemCodeData,
  disableRedeemCodesBulkData,
  generateRedeemCodesData,
  getRedeemCodesData,
} = require("./redeem-codes.service");

const getActor = (req) => ({
  userId: req.userId,
  role: req.userRole,
  username: req.userEmail || req.userId,
  ipAddress: req.ip,
  userAgent: req.get("user-agent") || "",
});

const getRedeemCodes = async (req, res, next) => {
  try {
    const data = await getRedeemCodesData(req.query);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const generateRedeemCodes = async (req, res, next) => {
  try {
    const payload = normalizeGeneratePayload(req.body);
    const data = await generateRedeemCodesData(getActor(req), payload);

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const disableRedeemCode = async (req, res, next) => {
  try {
    const data = await disableRedeemCodeData(req.params.id, getActor(req));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteRedeemCode = async (req, res, next) => {
  try {
    const data = await deleteRedeemCodeData(req.params.id, getActor(req));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const disableRedeemCodesBulk = async (req, res, next) => {
  try {
    const { ids } = normalizeBulkPayload(req.body);
    const data = await disableRedeemCodesBulkData(ids, getActor(req));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteRedeemCodesBulk = async (req, res, next) => {
  try {
    const { ids } = normalizeBulkPayload(req.body);
    const data = await deleteRedeemCodesBulkData(ids, getActor(req));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  deleteRedeemCode,
  deleteRedeemCodesBulk,
  disableRedeemCode,
  disableRedeemCodesBulk,
  generateRedeemCodes,
  getRedeemCodes,
};
