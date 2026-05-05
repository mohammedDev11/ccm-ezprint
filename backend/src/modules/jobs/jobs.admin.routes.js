const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const {
  getAdminPendingReleaseJobs,
  adminReleaseJob,
  adminReleaseSelectedJobs,
  adminReleaseAllEligibleJobs,
  adminCancelJob,
} = require("./jobs.controller");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("Admin"));

router.get("/pending-release", getAdminPendingReleaseJobs);
router.post("/release-selected", adminReleaseSelectedJobs);
router.post("/release-all", adminReleaseAllEligibleJobs);
router.post("/:jobId/release", adminReleaseJob);
router.delete("/:jobId", adminCancelJob);

module.exports = router;
