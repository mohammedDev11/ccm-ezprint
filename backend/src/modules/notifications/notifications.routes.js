const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const {
  getUserNotifications,
  markNotificationRead,
  markManyNotificationsRead,
  dismissNotification,
  deleteNotification,
  deleteManyNotifications,
} = require("./notifications.controller");

const router = express.Router();

router.use(requireAuth);
router.use((req, res, next) => {
  req.notificationScope = "user";
  return next();
});

router.get("/", getUserNotifications);
router.patch("/bulk/read", markManyNotificationsRead);
router.post("/bulk/delete", deleteManyNotifications);
router.patch("/:notificationId/read", markNotificationRead);
router.patch("/:notificationId/archive", dismissNotification);
router.delete("/:notificationId", deleteNotification);

module.exports = router;
