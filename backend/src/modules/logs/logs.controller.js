const { getLogsData, getAuditLogsData } = require("./logs.service");

const getLogs = async (req, res, next) => {
  try {
    const data = await getLogsData(req.query);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const data = await getAuditLogsData(req.query);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getLogs,
  getAuditLogs,
};
