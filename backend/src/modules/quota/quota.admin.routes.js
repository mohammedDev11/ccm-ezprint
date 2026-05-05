const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const { adjustUserQuota, refundJobQuota } = require("./quota.controller");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("Admin", "SubAdmin"));

router.post("/adjustments", adjustUserQuota);
router.post("/jobs/:jobId/refund", refundJobQuota);

module.exports = router;
