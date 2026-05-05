const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const { getLogs, getAuditLogs } = require("./logs.controller");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("Admin", "SubAdmin"));

router.get("/", getLogs);
router.get("/audit", getAuditLogs);

module.exports = router;
