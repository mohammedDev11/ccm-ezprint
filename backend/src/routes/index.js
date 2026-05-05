const express = require("express");
const healthRoutes = require("../modules/health/health.routes");
const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/users/users.routes");
const userAdminRoutes = require("../modules/users/users.admin.routes");
const jobRoutes = require("../modules/jobs/jobs.routes");
const jobAdminRoutes = require("../modules/jobs/jobs.admin.routes");
const accountRoutes = require("../modules/accounts/accounts.routes");
const printerRoutes = require("../modules/printers/printers.routes");
const queueRoutes = require("../modules/queues/queues.routes");
const groupRoutes = require("../modules/groups/groups.routes");
const notificationRoutes = require("../modules/notifications/notifications.routes");
const notificationAdminRoutes = require("../modules/notifications/notifications.admin.routes");
const logRoutes = require("../modules/logs/logs.routes");
const quotaRoutes = require("../modules/quota/quota.routes");
const quotaAdminRoutes = require("../modules/quota/quota.admin.routes");
const redeemCodeAdminRoutes = require("../modules/redeem-codes/redeem-codes.routes");
const reportRoutes = require("../modules/reports/reports.routes");
const dashboardAdminRoutes = require("../modules/admin/dashboard.routes");
const printerScreenRoutes = require("../modules/printer-screen/printer-screen.routes");
const {
  adminSettingsRouter,
  userSettingsRouter,
} = require("../modules/settings/settings.routes");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Alpha Queue API v1",
  });
});

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/printer-screen", printerScreenRoutes);
router.use("/user", userRoutes);
router.use("/user/jobs", jobRoutes);
router.use("/user/notifications", notificationRoutes);
router.use("/user/quota", quotaRoutes);
router.use("/user/settings", userSettingsRouter);
router.use("/admin/users", userAdminRoutes);
router.use("/admin/groups", groupRoutes);
router.use("/admin/accounts", accountRoutes);
router.use("/admin/jobs", jobAdminRoutes);
router.use("/admin/printers", printerRoutes);
router.use("/admin/queues", queueRoutes);
router.use("/admin/notifications", notificationAdminRoutes);
router.use("/admin/logs", logRoutes);
router.use("/admin/quota", quotaAdminRoutes);
router.use("/admin/redeem-codes", redeemCodeAdminRoutes);
router.use("/admin/dashboard", dashboardAdminRoutes);
router.use("/admin/reports", reportRoutes);
router.use("/admin/settings", adminSettingsRouter);

module.exports = router;
