const {
  getRecentJobsData,
  getPendingReleaseJobsData,
  createPrintJobData,
  getPrintJobOptionsData,
  listPrintDraftsData,
  savePrintDraftData,
  getPrintDraftFileData,
  deletePrintDraftData,
  savePrintDraftBatchData,
  uploadAndPrintJobData,
  uploadAndPrintBatchData,
  releaseJobData,
  releaseJobsByIdsData,
  releaseAllEligibleJobsData,
  cancelPendingJobData,
  cancelPendingJobAndSaveDraftData,
  clearPrintDraftsData,
  getAdminPendingReleaseJobsData,
} = require("./jobs.service");
const {
  normalizeCreateJobPayload,
  normalizeJobIdsPayload,
  normalizeUploadPrintHeaders,
  normalizeUploadPrintBatchPayload,
} = require("./jobs.validation");

const getActor = (req) => ({
  userId: req.userId,
  role: req.userRole,
  username: req.userEmail || req.userId,
  ipAddress: req.ip,
  userAgent: req.get("user-agent") || "",
});

const parseRawJsonBody = (body) => {
  const raw = Buffer.isBuffer(body) ? body.toString("utf8") : String(body || "");

  try {
    return JSON.parse(raw || "{}");
  } catch {
    const { createHttpError } = require("../../utils/http");
    throw createHttpError(400, "Upload payload must be valid JSON.");
  }
};

const getRecentJobs = async (req, res, next) => {
  try {
    const data = await getRecentJobsData(req.userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const getPendingReleaseJobs = async (req, res, next) => {
  try {
    const data = await getPendingReleaseJobsData(req.userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const createPrintJob = async (req, res, next) => {
  try {
    const payload = normalizeCreateJobPayload(req.body);
    const data = await createPrintJobData(req.userId, payload, getActor(req));

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const getPrintJobOptions = async (req, res, next) => {
  try {
    const data = await getPrintJobOptionsData(req.userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const listPrintDrafts = async (req, res, next) => {
  try {
    const data = await listPrintDraftsData(req.userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const savePrintDraft = async (req, res, next) => {
  try {
    const payload = normalizeUploadPrintHeaders(req.headers);
    const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || "");
    const data = await savePrintDraftData(req.userId, {
      ...payload,
      buffer,
    });

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const savePrintDraftBatch = async (req, res, next) => {
  try {
    const payload = normalizeUploadPrintBatchPayload(parseRawJsonBody(req.body));
    const data = await savePrintDraftBatchData(req.userId, payload);

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const downloadPrintDraftFile = async (req, res, next) => {
  try {
    const file = await getPrintDraftFileData(
      req.userId,
      req.params.draftId,
      req.params.fileId,
    );

    res.setHeader("Content-Type", file.contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(file.fileName)}"`,
    );
    return res.sendFile(file.absolutePath);
  } catch (error) {
    return next(error);
  }
};

const deletePrintDraft = async (req, res, next) => {
  try {
    const data = await deletePrintDraftData(req.userId, req.params.draftId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const clearPrintDrafts = async (req, res, next) => {
  try {
    const data = await clearPrintDraftsData(req.userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const uploadAndPrintJob = async (req, res, next) => {
  try {
    const payload = normalizeUploadPrintHeaders(req.headers);
    const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || "");
    const data = await uploadAndPrintJobData(
      req.userId,
      {
        ...payload,
        buffer,
      },
      getActor(req),
    );

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const uploadAndPrintBatch = async (req, res, next) => {
  try {
    const payload = normalizeUploadPrintBatchPayload(parseRawJsonBody(req.body));
    const data = await uploadAndPrintBatchData(req.userId, payload, getActor(req));

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const releaseJob = async (req, res, next) => {
  try {
    const data = await releaseJobData(req.params.jobId, getActor(req), {
      scope: "user",
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const releaseSelectedJobs = async (req, res, next) => {
  try {
    const { jobIds } = normalizeJobIdsPayload(req.body);
    const data = await releaseJobsByIdsData(jobIds, getActor(req), {
      scope: "user",
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const releaseAllEligibleJobs = async (req, res, next) => {
  try {
    const data = await releaseAllEligibleJobsData(getActor(req), {
      scope: "user",
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const cancelPendingJob = async (req, res, next) => {
  try {
    const data = await cancelPendingJobData(req.params.jobId, getActor(req), {
      scope: "user",
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const cancelPendingJobAndSaveDraft = async (req, res, next) => {
  try {
    const data = await cancelPendingJobAndSaveDraftData(
      req.params.jobId,
      getActor(req),
      {
        scope: "user",
      },
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const getAdminPendingReleaseJobs = async (req, res, next) => {
  try {
    const data = await getAdminPendingReleaseJobsData();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const adminReleaseJob = async (req, res, next) => {
  try {
    const data = await releaseJobData(req.params.jobId, getActor(req), {
      scope: "admin",
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const adminReleaseSelectedJobs = async (req, res, next) => {
  try {
    const { jobIds } = normalizeJobIdsPayload(req.body);
    const data = await releaseJobsByIdsData(jobIds, getActor(req), {
      scope: "admin",
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const adminReleaseAllEligibleJobs = async (req, res, next) => {
  try {
    const data = await releaseAllEligibleJobsData(getActor(req), {
      scope: "admin",
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const adminCancelJob = async (req, res, next) => {
  try {
    const data = await cancelPendingJobData(req.params.jobId, getActor(req), {
      scope: "admin",
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
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
  getAdminPendingReleaseJobs,
  adminReleaseJob,
  adminReleaseSelectedJobs,
  adminReleaseAllEligibleJobs,
  adminCancelJob,
};
