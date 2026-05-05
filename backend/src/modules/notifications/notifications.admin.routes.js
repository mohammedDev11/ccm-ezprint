const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const {
  getAdminNotifications,
  markNotificationRead,
  markManyNotificationsRead,
  resolveNotification,
  dismissNotification,
  deleteNotification,
  deleteManyNotifications,
} = require("./notifications.controller");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("Admin", "SubAdmin"));
router.use((req, res, next) => {
  req.notificationScope = "admin";
  return next();
});

router.get("/", getAdminNotifications);
router.patch("/bulk/read", markManyNotificationsRead);
router.post("/bulk/delete", deleteManyNotifications);
router.patch("/:notificationId/read", markNotificationRead);
router.patch("/:notificationId/resolve", resolveNotification);
router.patch("/:notificationId/dismiss", dismissNotification);
router.delete("/:notificationId", deleteNotification);

module.exports = router;
