const { normalizeBulkNotificationPayload } = require("./notifications.validation");
const {
  getUserNotificationsData,
  getAdminNotificationsData,
  updateNotificationStatusData,
  updateManyNotificationsStatusData,
  deleteNotificationsData,
} = require("./notifications.service");

const getActor = (req) => ({
  userId: req.userId,
  role: req.userRole,
  username: req.userEmail || req.userId,
  ipAddress: req.ip,
  userAgent: req.get("user-agent") || "",
});

const getUserNotifications = async (req, res, next) => {
  try {
    const data = await getUserNotificationsData(req.userId, req.query);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const getAdminNotifications = async (req, res, next) => {
  try {
    const data = await getAdminNotificationsData(req.query);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const data = await updateNotificationStatusData(
      getActor(req),
      req.params.notificationId,
      "read",
      { scope: req.notificationScope },
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const markManyNotificationsRead = async (req, res, next) => {
  try {
    const { notificationIds } = normalizeBulkNotificationPayload(req.body);
    const data = await updateManyNotificationsStatusData(
      getActor(req),
      notificationIds,
      "read",
      { scope: req.notificationScope },
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const resolveNotification = async (req, res, next) => {
  try {
    const data = await updateNotificationStatusData(
      getActor(req),
      req.params.notificationId,
      "resolved",
      { scope: req.notificationScope },
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const dismissNotification = async (req, res, next) => {
  try {
    const data = await updateNotificationStatusData(
      getActor(req),
      req.params.notificationId,
      req.notificationScope === "admin" ? "dismissed" : "archived",
      { scope: req.notificationScope },
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const data = await deleteNotificationsData(getActor(req), [req.params.notificationId], {
      scope: req.notificationScope,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteManyNotifications = async (req, res, next) => {
  try {
    const { notificationIds } = normalizeBulkNotificationPayload(req.body);
    const data = await deleteNotificationsData(getActor(req), notificationIds, {
      scope: req.notificationScope,
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
  getUserNotifications,
  getAdminNotifications,
  markNotificationRead,
  markManyNotificationsRead,
  resolveNotification,
  dismissNotification,
  deleteNotification,
  deleteManyNotifications,
};
