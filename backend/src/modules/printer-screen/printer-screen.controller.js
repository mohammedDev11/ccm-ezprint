const {
  getPrinterScreenData,
  lookupPrinterReleaseJobData,
  releasePrinterJobData,
} = require("./printer-screen.service");

const getActor = (req) => ({
  ipAddress: req.ip,
  userAgent: req.get("user-agent") || "",
});

const getPrinterScreen = async (req, res, next) => {
  try {
    const data = await getPrinterScreenData({
      printerId: req.query.printerId,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const lookupPrinterReleaseJob = async (req, res, next) => {
  try {
    const data = await lookupPrinterReleaseJobData({
      printerId: req.body?.printerId,
      releaseCode: req.body?.releaseCode,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const releasePrinterJob = async (req, res, next) => {
  try {
    const data = await releasePrinterJobData(
      {
        printerId: req.body?.printerId,
        releaseCode: req.body?.releaseCode,
      },
      getActor(req),
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getPrinterScreen,
  lookupPrinterReleaseJob,
  releasePrinterJob,
};
