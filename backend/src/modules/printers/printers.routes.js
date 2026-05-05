const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const {
  getAdminPrinters,
  updatePrinter,
  deletePrinter,
} = require("./printers.controller");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("Admin"));

router.get("/", getAdminPrinters);
router.patch("/:printerId", updatePrinter);
router.delete("/:printerId", deletePrinter);

module.exports = router;
