const {
  getAdminPrintersData,
  updatePrinterData,
  deletePrinterData,
} = require("./printers.service");

const getActor = (req) => ({
  userId: req.userId,
  role: req.userRole,
  username: req.userEmail || req.userId,
  ipAddress: req.ip,
  userAgent: req.get("user-agent") || "",
});

const getAdminPrinters = async (req, res, next) => {
  try {
    const printers = await getAdminPrintersData();

    return res.status(200).json({
      success: true,
      data: {
        printers,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const updatePrinter = async (req, res, next) => {
  try {
    const data = await updatePrinterData(
      req.params.printerId,
      req.body,
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

const deletePrinter = async (req, res, next) => {
  try {
    const data = await deletePrinterData(req.params.printerId, getActor(req));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAdminPrinters,
  updatePrinter,
  deletePrinter,
};
