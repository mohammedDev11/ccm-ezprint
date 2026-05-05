const { getSummaryData, requestReportExportData } = require("./reports.service");

const getReportSummary = async (req, res, next) => {
  try {
    const data = await getSummaryData(req.query.period);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const exportReport = async (req, res, next) => {
  try {
    const data = await requestReportExportData(req.body);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getReportSummary,
  exportReport,
};
