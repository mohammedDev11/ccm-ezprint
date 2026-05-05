const Notification = require("../../models/Notification");
const User = require("../../models/User");
const { formatDateTimeLabel } = require("../../utils/formatters");
const { createHttpError } = require("../../utils/http");
const { recordAuditLog } = require("../logs/logs.service");

const ALLOWED_TYPES = new Set([
  "printer_offline",
  "printer_online",
  "toner_low",
  "paper_low",
  "job_printed",
  "job_failed",
  "job_refunded",
  "device_error",
  "queue_warning",
  "maintenance_reminder",
  "system_warning",
  "security_alert",
]);

const ALLOWED_SOURCES = new Set([
  "Printer",
  "Device",
  "Queue",
  "System",
  "Report Scheduler",
  "Admin",
]);

const USER_MUTABLE_STATUSES = new Set(["read", "archived"]);
const ADMIN_MUTABLE_STATUSES = new Set(["read", "resolved", "dismissed", "archived"]);

const toIdString = (value) => value?.toString?.() || "";

const matchesArrayValue = (items = [], value) => {
  if (!value) {
    return false;
  }

  const target = toIdString(value) || String(value);

  return items.some((item) => {
    const itemValue = toIdString(item) || String(item);
    return itemValue === target;
  });
};

const normalizeNotificationType = (type) => {
  return ALLOWED_TYPES.has(type) ? type : "system_warning";
};

const normalizeNotificationSource = (source) => {
  return ALLOWED_SOURCES.has(source) ? source : "System";
};

const getRequiredUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw createHttpError(404, "User not found.");
  }

  return user;
};

const notificationHasNoAudience = (notification) => {
  const roles = notification.targetAudience?.roles || [];
  const specificUsers = notification.targetAudience?.specificUsers || [];
  const departments = notification.targetAudience?.departments || [];
  const groups = notification.targetAudience?.groups || [];

  return (
    roles.length === 0 &&
    specificUsers.length === 0 &&
    departments.length === 0 &&
    groups.length === 0
  );
};

const isNotificationVisibleToUser = (notification, user) => {
  if (notification.expiresAt && notification.expiresAt < new Date()) {
    return false;
  }

  if (notificationHasNoAudience(notification)) {
    return true;
  }

  if (matchesArrayValue(notification.targetAudience?.specificUsers, user._id)) {
    return true;
  }

  if ((notification.targetAudience?.roles || []).includes(user.role)) {
    return true;
  }

  if (
    user.department &&
    (notification.targetAudience?.departments || []).includes(user.department)
  ) {
    return true;
  }

  if (user.groupId && matchesArrayValue(notification.targetAudience?.groups, user.groupId)) {
    return true;
  }

  return false;
};

const canUserMutateNotification = (notification, user) => {
  const specificUsers = notification.targetAudience?.specificUsers || [];

  if (specificUsers.length !== 1) {
    return false;
  }

  return matchesArrayValue(specificUsers, user._id);
};

const matchesNotificationFilters = (notification, filters = {}) => {
  const search = (filters.search || "").trim().toLowerCase();

  if (search) {
    const haystack = [
      notification.title,
      notification.message,
      notification.description,
      notification.details?.affectedDevice,
      notification.relatedTo?.printerName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(search)) {
      return false;
    }
  }

  if (filters.type && filters.type !== "all" && notification.type !== filters.type) {
    return false;
  }

  if (
    filters.severity &&
    filters.severity !== "all" &&
    notification.severity !== filters.severity
  ) {
    return false;
  }

  if (filters.status && filters.status !== "all" && notification.status?.current !== filters.status) {
    return false;
  }

  if (filters.source && filters.source !== "all" && notification.source !== filters.source) {
    return false;
  }

  return true;
};

const mapAdminType = (notification) => {
  if (["printer_offline", "printer_online", "paper_low"].includes(notification.type)) {
    return "printer_alert";
  }

  if (notification.type === "job_failed" || notification.type === "job_refunded") {
    return "job_issue";
  }

  return notification.type;
};

const mapAdminNotification = (notification) => {
  return {
    id: notification._id.toString(),
    title: notification.title,
    message: notification.message,
    type: mapAdminType(notification),
    source: notification.source,
    severity: notification.severity,
    status: notification.status?.current || "unread",
    affected_device:
      notification.details?.affectedDevice || notification.relatedTo?.printerName || "",
    error_details: notification.details?.errorMessage || "",
    action_taken:
      notification.status?.current === "resolved"
        ? "Resolved"
        : notification.status?.current === "dismissed"
          ? "Dismissed"
          : "",
    related_log_id: "",
    createdAt: formatDateTimeLabel(notification.createdAt),
  };
};

const mapUserType = (notification) => {
  if (["job_printed", "job_failed"].includes(notification.type)) {
    return "print-job";
  }

  if (notification.type === "job_refunded") {
    return "balance";
  }

  if (
    ["printer_offline", "printer_online", "toner_low", "paper_low", "device_error"].includes(
      notification.type,
    )
  ) {
    return "printer";
  }

  if (/redeem/i.test(notification.title || "") || /redeem/i.test(notification.message || "")) {
    return "redeem-card";
  }

  return "system";
};

const mapUserSource = (notification) => {
  if (notification.relatedTo?.jobId) {
    if (notification.type === "job_printed") {
      return "recent-print-jobs";
    }

    return "jobs-pending-release";
  }

  if (notification.type === "job_refunded") {
    return "transaction-history";
  }

  if (mapUserType(notification) === "redeem-card") {
    return "redeem-card";
  }

  if (mapUserType(notification) === "printer") {
    return "printer-device";
  }

  return "system";
};

const mapUserSeverity = (notification) => {
  if (notification.type === "job_printed" || notification.type === "job_refunded") {
    return "success";
  }

  return notification.severity;
};

const mapUserStatus = (notification) => {
  if (notification.status?.current === "dismissed") {
    return "archived";
  }

  return notification.status?.current || "unread";
};

const isNotificationEnabledByUserPreference = (notification, user) => {
  const preferences = user.preferences?.notifications || {};
  const titleAndMessage = `${notification.title || ""} ${notification.message || ""}`;

  if (notification.type === "job_printed" && preferences.printSuccess === false) {
    return false;
  }

  if (notification.type === "job_failed" && preferences.printFailure === false) {
    return false;
  }

  if (
    notification.type === "job_refunded" &&
    preferences.quotaUpdates === false
  ) {
    return false;
  }

  if (
    /quota|redeem|voucher|credit/i.test(titleAndMessage) &&
    preferences.quotaUpdates === false
  ) {
    return false;
  }

  if (/low quota|low balance/i.test(titleAndMessage) && preferences.lowQuota === false) {
    return false;
  }

  return true;
};

const mapUserNotification = (notification) => {
  const userType = mapUserType(notification);
  const status = mapUserStatus(notification);

  return {
    id: notification._id.toString(),
    title: notification.title,
    message: notification.message,
    type: userType,
    source: mapUserSource(notification),
    severity: mapUserSeverity(notification),
    status,
    createdAt: notification.createdAt.toISOString(),
    createdAtLabel: formatDateTimeLabel(notification.createdAt),
    relatedEntity: notification.relatedTo?.jobId
      ? {
          kind: "job",
          id: toIdString(notification.relatedTo.jobId),
          label: notification.title || notification.message,
        }
      : notification.relatedTo?.printerId
        ? {
            kind: "printer",
            id: toIdString(notification.relatedTo.printerId),
            label: notification.relatedTo.printerName || "Printer",
          }
        : undefined,
    canMarkAsRead: status === "unread",
    canMarkAsUnread: false,
    canArchive: true,
    canDelete: true,
  };
};

const setNotificationStatus = (notification, status, updatedBy) => {
  const now = new Date();

  notification.status.current = status;
  notification.updatedBy = updatedBy || null;

  if (status === "read") {
    notification.status.readAt = now;
  }

  if (status === "resolved") {
    notification.status.resolvedAt = now;
  }

  if (status === "dismissed" || status === "archived") {
    notification.status.dismissedAt = now;
  }

  return notification;
};

const createNotification = async (payload = {}) => {
  return Notification.create({
    title: payload.title || "",
    message: payload.message || "",
    description: payload.description || "",
    type: normalizeNotificationType(payload.type),
    source: normalizeNotificationSource(payload.source),
    severity: payload.severity || "info",
    targetAudience: {
      roles: payload.targetAudience?.roles || [],
      specificUsers: payload.targetAudience?.specificUsers || [],
      departments: payload.targetAudience?.departments || [],
      groups: payload.targetAudience?.groups || [],
    },
    relatedTo: {
      printerId: payload.relatedTo?.printerId || null,
      printerName: payload.relatedTo?.printerName || "",
      jobId: payload.relatedTo?.jobId || null,
      userId: payload.relatedTo?.userId || null,
      queueId: payload.relatedTo?.queueId || null,
    },
    details: {
      errorCode: payload.details?.errorCode || "",
      errorMessage: payload.details?.errorMessage || "",
      actionRequired: payload.details?.actionRequired || false,
      suggestedAction: payload.details?.suggestedAction || "",
      affectedDevice: payload.details?.affectedDevice || "",
    },
    status: {
      current: payload.status || "unread",
    },
    delivery: {
      inApp: payload.delivery?.inApp !== false,
      emailSent: false,
      smsSent: false,
      pushSent: false,
    },
    createdBy: payload.createdBy || null,
    updatedBy: payload.updatedBy || null,
    expiresAt: payload.expiresAt || null,
  });
};

const getUserNotificationsData = async (userId, filters = {}) => {
  const user = await getRequiredUser(userId);
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(200);

  const visibleNotifications = notifications
    .filter((notification) => isNotificationVisibleToUser(notification, user))
    .filter((notification) => isNotificationEnabledByUserPreference(notification, user))
    .filter((notification) => matchesNotificationFilters(notification, filters));

  const mappedNotifications = visibleNotifications.map(mapUserNotification);

  return {
    notifications: mappedNotifications,
    summary: {
      total: mappedNotifications.length,
      unread: mappedNotifications.filter((item) => item.status === "unread").length,
      critical: mappedNotifications.filter((item) => item.severity === "critical").length,
      actionRequired: visibleNotifications.filter(
        (item) => item.details?.actionRequired === true,
      ).length,
    },
  };
};

const getAdminNotificationsData = async (filters = {}) => {
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(200);
  const visibleNotifications = notifications.filter((item) =>
    matchesNotificationFilters(item, filters),
  );
  const mappedNotifications = visibleNotifications.map(mapAdminNotification);

  return {
    notifications: mappedNotifications,
    summary: {
      total: mappedNotifications.length,
      unread: mappedNotifications.filter((item) => item.status === "unread").length,
      critical: mappedNotifications.filter((item) => item.severity === "critical").length,
      resolved: mappedNotifications.filter((item) => item.status === "resolved").length,
    },
  };
};

const getScopedNotificationForUpdate = async (actor, notificationId, scope) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw createHttpError(404, "Notification not found.");
  }

  if (scope === "admin") {
    return notification;
  }

  const user = await getRequiredUser(actor.userId);

  if (!isNotificationVisibleToUser(notification, user)) {
    throw createHttpError(404, "Notification not found.");
  }

  if (!canUserMutateNotification(notification, user)) {
    throw createHttpError(
      409,
      "This shared notification cannot be changed per user until recipient receipts are implemented.",
    );
  }

  return notification;
};

const updateNotificationStatusData = async (actor, notificationId, status, { scope }) => {
  const allowedStatuses = scope === "admin" ? ADMIN_MUTABLE_STATUSES : USER_MUTABLE_STATUSES;

  if (!allowedStatuses.has(status)) {
    throw createHttpError(400, "Unsupported notification status update.");
  }

  const notification = await getScopedNotificationForUpdate(actor, notificationId, scope);
  setNotificationStatus(notification, status, actor.userId);
  await notification.save();

  await recordAuditLog({
    actor: {
      userId: actor.userId,
      username: actor.username,
      role: actor.role,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    },
    action: {
      name: "Notification Status Updated",
      category: "System",
      details: `Notification "${notification.title}" marked as ${status}.`,
    },
    resource: {
      type: "Notification",
      id: notification._id,
      name: notification.title,
      changes: {
        status,
      },
    },
  });

  return {
    notification:
      scope === "admin" ? mapAdminNotification(notification) : mapUserNotification(notification),
  };
};

const updateManyNotificationsStatusData = async (actor, notificationIds, status, { scope }) => {
  const updated = [];
  const skipped = [];

  for (const notificationId of notificationIds) {
    try {
      const result = await updateNotificationStatusData(actor, notificationId, status, { scope });
      updated.push(result.notification);
    } catch (error) {
      skipped.push({
        id: notificationId,
        message: error.message,
      });
    }
  }

  return {
    updatedCount: updated.length,
    skippedCount: skipped.length,
    notifications: updated,
    skipped,
  };
};

const deleteNotificationsData = async (actor, notificationIds, { scope }) => {
  const deleted = [];
  const skipped = [];

  for (const notificationId of notificationIds) {
    try {
      const notification = await getScopedNotificationForUpdate(actor, notificationId, scope);
      await Notification.deleteOne({ _id: notification._id });
      deleted.push(notificationId);

      await recordAuditLog({
        actor: {
          userId: actor.userId,
          username: actor.username,
          role: actor.role,
          ipAddress: actor.ipAddress,
          userAgent: actor.userAgent,
        },
        action: {
          name: "Notification Deleted",
          category: "System",
          details: `Notification "${notification.title}" was deleted.`,
        },
        resource: {
          type: "Notification",
          id: notification._id,
          name: notification.title,
        },
      });
    } catch (error) {
      skipped.push({
        id: notificationId,
        message: error.message,
      });
    }
  }

  return {
    deletedCount: deleted.length,
    skippedCount: skipped.length,
    deletedIds: deleted,
    skipped,
  };
};

module.exports = {
  createNotification,
  getUserNotificationsData,
  getAdminNotificationsData,
  updateNotificationStatusData,
  updateManyNotificationsStatusData,
  deleteNotificationsData,
};
