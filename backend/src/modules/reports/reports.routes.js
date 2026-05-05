const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const { getReportSummary, exportReport } = require("./reports.controller");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("Admin"));

router.get("/summary", getReportSummary);
router.post("/export", exportReport);

module.exports = router;
