const express = require("express");
const env = require("../../config/env");
const { requireAuth } = require("../../middleware/auth.middleware");
const {
  getRecentJobs,
  getPendingReleaseJobs,
  createPrintJob,
  getPrintJobOptions,
  listPrintDrafts,
  savePrintDraft,
  savePrintDraftBatch,
  downloadPrintDraftFile,
  deletePrintDraft,
  clearPrintDrafts,
  uploadAndPrintJob,
  uploadAndPrintBatch,
  releaseJob,
  releaseSelectedJobs,
  releaseAllEligibleJobs,
  cancelPendingJob,
  cancelPendingJobAndSaveDraft,
} = require("./jobs.controller");

const router = express.Router();

router.use(requireAuth);

router.get("/options", getPrintJobOptions);
router.get("/drafts", listPrintDrafts);
router.post(
  "/drafts",
  express.raw({
    type: () => true,
    limit: env.printUploadLimit,
  }),
  savePrintDraft,
);
router.post(
  "/drafts/batch",
  express.raw({
    type: "application/vnd.alpha.print-batch+json",
    limit: env.printUploadLimit,
  }),
  savePrintDraftBatch,
);
router.get("/drafts/:draftId/files/:fileId", downloadPrintDraftFile);
router.delete("/drafts", clearPrintDrafts);
router.delete("/drafts/:draftId", deletePrintDraft);
router.post("/", createPrintJob);
router.post(
  "/upload-print",
  express.raw({
    type: () => true,
    limit: env.printUploadLimit,
  }),
  uploadAndPrintJob,
);
router.post(
  "/upload-print-batch",
  express.raw({
    type: "application/vnd.alpha.print-batch+json",
    limit: env.printUploadLimit,
  }),
  uploadAndPrintBatch,
);
router.get("/recent", getRecentJobs);
router.get("/pending-release", getPendingReleaseJobs);
router.post("/release-selected", releaseSelectedJobs);
router.post("/release-all", releaseAllEligibleJobs);
router.post("/:jobId/cancel-save-draft", cancelPendingJobAndSaveDraft);
router.post("/:jobId/release", releaseJob);
router.delete("/:jobId", cancelPendingJob);

module.exports = router;
