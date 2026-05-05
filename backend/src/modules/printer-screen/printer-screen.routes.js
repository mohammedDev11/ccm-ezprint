const express = require("express");
const {
  getPrinterScreen,
  lookupPrinterReleaseJob,
  releasePrinterJob,
} = require("./printer-screen.controller");

const router = express.Router();

router.get("/", getPrinterScreen);
router.post("/lookup", lookupPrinterReleaseJob);
router.post("/release", releasePrinterJob);

module.exports = router;
