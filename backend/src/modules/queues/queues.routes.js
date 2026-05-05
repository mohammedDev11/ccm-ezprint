const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const { getAdminQueues } = require("./queues.controller");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("Admin"));

router.get("/", getAdminQueues);

module.exports = router;
