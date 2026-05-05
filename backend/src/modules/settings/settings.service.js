const mongoose = require("mongoose");
const env = require("../../config/env");
const Queue = require("../../models/Queue");
const PrintDraft = require("../../models/PrintDraft");
const SystemSettings = require("../../models/SystemSettings");
const User = require("../../models/User");
const { createHttpError } = require("../../utils/http");
const { recordAuditLog } = require("../logs/logs.service");
const backendPackage = require("../../../package.json");

const SETTINGS_KEY = "global";
const MAX_PRINT_FILES_PER_JOB = 10;

const PAPER_SIZES = ["A4", "A3", "Letter"];
const COLOR_MODES = ["Black & White", "Color"];
const SIDES = ["Simplex", "Duplex"];
const THEMES = ["system", "light", "dark"];
const NAVBAR_MODES = ["left", "right", "bottom", "top"];

const ADMIN_ONLY_SECTIONS = [
  {
    label: "Printers",
    path: "/sections/admin/printers",
    reason: "Device configuration and printer provisioning.",
  },
  {
    label: "Queue Manager",
    path: "/sections/admin/queue-manger",
    reason: "Queue routing, printer assignment, and release policy.",
  },
  {
    label: "Print Release",
    path: "/sections/admin/print-release",
    reason: "System-wide pending job release controls.",
  },
  {
    label: "Reports",
    path: "/sections/admin/reports",
    reason: "Operational reporting and exports.",
  },
];

const SUBADMIN_ALLOWED_SECTIONS = [
  {
    label: "Dashboard",
    path: "/sections/admin/dashboard",
    reason: "Operational overview.",
  },
  {
    label: "Users",
    path: "/sections/admin/users",
    reason: "User and quota review.",
  },
  {
    label: "Groups",
    path: "/sections/admin/groups",
    reason: "Group quota context.",
  },
  {
    label: "Accounts",
    path: "/sections/admin/accounts",
    reason: "Shared account quota context.",
  },
  {
    label: "Redeem Codes",
    path: "/sections/admin/redeem-codes",
    reason: "Quota redemption operations.",
  },
  {
    label: "Logs",
    path: "/sections/admin/logs",
    reason: "Audit review.",
  },
  {
    label: "Notifications",
    path: "/sections/admin/notifications",
    reason: "Operational alerts.",
  },
  {
    label: "Settings",
    path: "/sections/admin/settings",
    reason: "Personal preferences and read-only limited system context.",
  },
];

const DEFAULT_USER_PREFERENCES = {
  ui: {
    theme: "system",
    navbarMode: "left",
  },
  printing: {
    defaultPaperSize: "A4",
    defaultColorMode: "Black & White",
    defaultSides: "Simplex",
    preferredQueueId: "",
  },
  drafts: {
    showSavedDrafts: true,
    autoSaveDrafts: false,
  },
  notifications: {
    printSuccess: true,
    printFailure: true,
    lowQuota: true,
    quotaUpdates: true,
  },
};

const toIdString = (value) => value?.toString?.() || "";

const sanitizeString = (value, fallback = "", maxLength = 240) => {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.slice(0, maxLength);
};

const sanitizeEnum = (value, allowedValues, fallback) =>
  allowedValues.includes(value) ? value : fallback;

const sanitizeBoolean = (value, fallback) =>
  typeof value === "boolean" ? value : fallback;

const sanitizeNumber = (value, fallback, min, max) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(Math.max(number, min), max);
};

const getDatabaseStatus = () => {
  switch (mongoose.connection.readyState) {
    case 1:
      return "Connected";
    case 2:
      return "Connecting";
    case 3:
      return "Disconnecting";
    default:
      return "Disconnected";
  }
};

const getRequiredUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw createHttpError(404, "User not found.");
  }

  return user;
};

const ensureSystemSettings = async () => {
  const settings = await SystemSettings.findOneAndUpdate(
    { key: SETTINGS_KEY },
    {
      $setOnInsert: {
        key: SETTINGS_KEY,
        "general.systemName": "EzPrint",
        "printing.defaultPaperSize": "A4",
        "printing.defaultColorMode": "Black & White",
        "printing.defaultSides": "Simplex",
        "printing.pendingJobRetentionHours": 24,
        "fileDrafts.allowedUploadTypes": ["PDF"],
        "fileDrafts.officeConversionEnabled": false,
        "fileDrafts.maxFileSize": env.printUploadLimit,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  settings.fileDrafts = settings.fileDrafts || {};

  if (settings.fileDrafts?.maxFileSize !== env.printUploadLimit) {
    settings.fileDrafts.maxFileSize = env.printUploadLimit;
    await settings.save();
  }

  return settings;
};

const isPrintingRestricted = (user) =>
  user.printing?.enabled === false || user.printing?.restricted === true;

const canUserAccessQueue = (user, queue) => {
  if (queue.status?.current !== "Active" || queue.isActive === false) {
    return false;
  }

  if (isPrintingRestricted(user)) {
    return false;
  }

  if (
    queue.access?.allowedRoles?.length &&
    !queue.access.allowedRoles.includes(user.role || "User")
  ) {
    return false;
  }

  if (
    queue.access?.allowedDepartments?.length &&
    user.department &&
    !queue.access.allowedDepartments.includes(user.department)
  ) {
    return false;
  }

  if (
    queue.access?.allowedGroups?.length &&
    (!user.groupId ||
      !queue.access.allowedGroups.some(
        (groupId) => toIdString(groupId) === toIdString(user.groupId),
      ))
  ) {
    return false;
  }

  if (
    queue.access?.restrictedUsers?.some(
      (restrictedUserId) => toIdString(restrictedUserId) === toIdString(user._id),
    )
  ) {
    return false;
  }

  return true;
};

const getAccessibleQueues = async (user) => {
  const queues = await Queue.find({
    isActive: true,
    "status.current": "Active",
  }).sort({ name: 1 });

  return queues.filter((queue) => canUserAccessQueue(user, queue));
};

const getSystemPrintingDefaults = (settings) => ({
  defaultPaperSize: settings.printing?.defaultPaperSize || "A4",
  defaultColorMode: settings.printing?.defaultColorMode || "Black & White",
  defaultSides: settings.printing?.defaultSides || "Simplex",
});

const getUserPreferences = (user, systemSettings) => {
  const rawPreferences = user.preferences?.toObject?.() || user.preferences || {};
  const systemDefaults = getSystemPrintingDefaults(systemSettings);

  return {
    ui: {
      theme: sanitizeEnum(
        rawPreferences.ui?.theme,
        THEMES,
        systemSettings.general?.defaultTheme || DEFAULT_USER_PREFERENCES.ui.theme,
      ),
      navbarMode: sanitizeEnum(
        rawPreferences.ui?.navbarMode,
        NAVBAR_MODES,
        DEFAULT_USER_PREFERENCES.ui.navbarMode,
      ),
    },
    printing: {
      defaultPaperSize: sanitizeEnum(
        rawPreferences.printing?.defaultPaperSize,
        PAPER_SIZES,
        systemDefaults.defaultPaperSize,
      ),
      defaultColorMode: sanitizeEnum(
        rawPreferences.printing?.defaultColorMode,
        COLOR_MODES,
        systemDefaults.defaultColorMode,
      ),
      defaultSides: sanitizeEnum(
        rawPreferences.printing?.defaultSides,
        SIDES,
        systemDefaults.defaultSides,
      ),
      preferredQueueId: toIdString(rawPreferences.printing?.preferredQueueId),
    },
    drafts: {
      showSavedDrafts: sanitizeBoolean(
        rawPreferences.drafts?.showSavedDrafts,
        DEFAULT_USER_PREFERENCES.drafts.showSavedDrafts,
      ),
      autoSaveDrafts: sanitizeBoolean(
        rawPreferences.drafts?.autoSaveDrafts,
        DEFAULT_USER_PREFERENCES.drafts.autoSaveDrafts,
      ),
    },
    notifications: {
      printSuccess: sanitizeBoolean(
        rawPreferences.notifications?.printSuccess,
        DEFAULT_USER_PREFERENCES.notifications.printSuccess,
      ),
      printFailure: sanitizeBoolean(
        rawPreferences.notifications?.printFailure,
        DEFAULT_USER_PREFERENCES.notifications.printFailure,
      ),
      lowQuota: sanitizeBoolean(
        rawPreferences.notifications?.lowQuota,
        DEFAULT_USER_PREFERENCES.notifications.lowQuota,
      ),
      quotaUpdates: sanitizeBoolean(
        rawPreferences.notifications?.quotaUpdates,
        DEFAULT_USER_PREFERENCES.notifications.quotaUpdates,
      ),
    },
  };
};

const mapProfile = (user) => ({
  id: toIdString(user._id),
  displayName: user.fullName || "",
  username: user.username || "",
  email: user.email || "",
  role: user.role || user.systemRole || "User",
  department: user.department || "",
  editable: {
    displayName: true,
    email: false,
    password: false,
  },
});

const mapQueues = (queues) =>
  queues.map((queue) => ({
    id: toIdString(queue._id),
    name: queue.name,
    description: queue.description || "",
    type: queue.type || "",
    secureRelease: queue.security?.secureRelease !== false,
  }));

const mapSystemSettings = (settings, role) => ({
  general: {
    systemName: settings.general?.systemName || "EzPrint",
    defaultLanguage: settings.general?.defaultLanguage || "English",
    defaultTheme: settings.general?.defaultTheme || "system",
    supportMessage: settings.general?.supportMessage || "",
  },
  printing: {
    defaultPaperSize: settings.printing?.defaultPaperSize || "A4",
    defaultColorMode: settings.printing?.defaultColorMode || "Black & White",
    defaultSides: settings.printing?.defaultSides || "Simplex",
    pendingJobRetentionHours: settings.printing?.pendingJobRetentionHours ?? 24,
    defaultCostPerPage: env.printDefaultCostPerPage,
  },
  security: {
    jwtExpiresIn: env.jwtExpiresIn,
    inactivityLogoutSupported: false,
    adminOnlySections: ADMIN_ONLY_SECTIONS,
    subAdminAllowedSections: SUBADMIN_ALLOWED_SECTIONS,
  },
  fileDrafts: {
    allowedUploadTypes: ["PDF"],
    officeConversionEnabled: false,
    draftRetentionDays: settings.fileDrafts?.draftRetentionDays ?? 30,
    maxFileSize: env.printUploadLimit,
  },
  notifications: {
    printerIssueNotifications:
      settings.notifications?.printerIssueNotifications !== false,
    jobFailureNotifications: settings.notifications?.jobFailureNotifications !== false,
    lowQuotaNotifications: settings.notifications?.lowQuotaNotifications !== false,
  },
  metadata: {
    updatedAt: settings.updatedAt,
    updatedBy: settings.updatedBy || null,
    readOnly: role !== "Admin",
  },
});

const getSystemInfo = (settings) => ({
  appName: "EzPrint",
  apiName: "Alpha Queue API",
  version: backendPackage.version || "1.0.0",
  nodeEnv: env.nodeEnv,
  backendStatus: "Online",
  databaseStatus: getDatabaseStatus(),
  uploadLimit: env.printUploadLimit,
  officeConversionStatus: "Disabled",
  lastUpdatedAt: settings.updatedAt || new Date(),
});

const getFeatureSupport = () => ({
  userThemePreference: true,
  navbarModePreference: true,
  preferredQueue: true,
  clearDrafts: true,
  passwordChange: false,
  emailNotifications: false,
  officeConversion: false,
  pdfUploadOnly: true,
});

const getUserSettingsData = async (userId) => {
  const [user, systemSettings] = await Promise.all([
    getRequiredUser(userId),
    ensureSystemSettings(),
  ]);
  const [accessibleQueues, draftCount] = await Promise.all([
    getAccessibleQueues(user),
    PrintDraft.countDocuments({ "user.userId": user._id }),
  ]);
  const preferences = getUserPreferences(user, systemSettings);

  return {
    scope: "user",
    role: user.role || user.systemRole || "User",
    capabilities: {
      canUpdateSystemSettings: false,
      canUpdateOwnPreferences: true,
      canClearDrafts: true,
    },
    profile: mapProfile(user),
    preferences,
    printOptions: {
      queues: mapQueues(accessibleQueues),
      defaults: preferences.printing,
      acceptedMimeTypes: ["application/pdf"],
      maxFiles: MAX_PRINT_FILES_PER_JOB,
    },
    drafts: {
      count: draftCount,
      clearSupported: true,
    },
    system: {
      general: mapSystemSettings(systemSettings, user.role).general,
      printing: mapSystemSettings(systemSettings, user.role).printing,
      fileDrafts: mapSystemSettings(systemSettings, user.role).fileDrafts,
    },
    featureSupport: getFeatureSupport(),
  };
};

const getAdminSettingsData = async (actor) => {
  const [userSettings, systemSettings] = await Promise.all([
    getUserSettingsData(actor.userId),
    ensureSystemSettings(),
  ]);
  const role = actor.role || userSettings.role;

  return {
    ...userSettings,
    scope: "admin",
    role,
    capabilities: {
      canUpdateSystemSettings: role === "Admin",
      canUpdateOwnPreferences: true,
      canClearDrafts: true,
    },
    system: mapSystemSettings(systemSettings, role),
    systemInfo: getSystemInfo(systemSettings),
    accessOverview: {
      adminOnlySections: ADMIN_ONLY_SECTIONS,
      subAdminAllowedSections: SUBADMIN_ALLOWED_SECTIONS,
    },
  };
};

const assertPreferredQueueAccess = async (user, queueId) => {
  if (!queueId) {
    return null;
  }

  if (!mongoose.isValidObjectId(queueId)) {
    throw createHttpError(400, "Preferred queue is invalid.");
  }

  const queue = await Queue.findById(queueId);

  if (!queue || !canUserAccessQueue(user, queue)) {
    throw createHttpError(403, "Preferred queue is not available for this account.");
  }

  return queue._id;
};

const applyUserPreferenceUpdates = async (user, payload = {}) => {
  const profile = payload.profile || {};
  const preferences = payload.preferences || payload;
  const updates = {};

  if (Object.prototype.hasOwnProperty.call(profile, "displayName")) {
    const displayName = sanitizeString(profile.displayName, "", 100);

    if (!displayName) {
      throw createHttpError(400, "Display name cannot be empty.");
    }

    user.fullName = displayName;
  }

  if (preferences.ui) {
    if (Object.prototype.hasOwnProperty.call(preferences.ui, "theme")) {
      updates["preferences.ui.theme"] = sanitizeEnum(
        preferences.ui.theme,
        THEMES,
        DEFAULT_USER_PREFERENCES.ui.theme,
      );
    }

    if (Object.prototype.hasOwnProperty.call(preferences.ui, "navbarMode")) {
      updates["preferences.ui.navbarMode"] = sanitizeEnum(
        preferences.ui.navbarMode,
        NAVBAR_MODES,
        DEFAULT_USER_PREFERENCES.ui.navbarMode,
      );
    }
  }

  if (preferences.printing) {
    if (Object.prototype.hasOwnProperty.call(preferences.printing, "defaultPaperSize")) {
      updates["preferences.printing.defaultPaperSize"] = sanitizeEnum(
        preferences.printing.defaultPaperSize,
        PAPER_SIZES,
        DEFAULT_USER_PREFERENCES.printing.defaultPaperSize,
      );
    }

    if (Object.prototype.hasOwnProperty.call(preferences.printing, "defaultColorMode")) {
      updates["preferences.printing.defaultColorMode"] = sanitizeEnum(
        preferences.printing.defaultColorMode,
        COLOR_MODES,
        DEFAULT_USER_PREFERENCES.printing.defaultColorMode,
      );
    }

    if (Object.prototype.hasOwnProperty.call(preferences.printing, "defaultSides")) {
      updates["preferences.printing.defaultSides"] = sanitizeEnum(
        preferences.printing.defaultSides,
        SIDES,
        DEFAULT_USER_PREFERENCES.printing.defaultSides,
      );
    }

    if (Object.prototype.hasOwnProperty.call(preferences.printing, "preferredQueueId")) {
      updates["preferences.printing.preferredQueueId"] =
        await assertPreferredQueueAccess(user, preferences.printing.preferredQueueId);
    }
  }

  if (preferences.drafts) {
    if (Object.prototype.hasOwnProperty.call(preferences.drafts, "showSavedDrafts")) {
      updates["preferences.drafts.showSavedDrafts"] = sanitizeBoolean(
        preferences.drafts.showSavedDrafts,
        DEFAULT_USER_PREFERENCES.drafts.showSavedDrafts,
      );
    }

    if (Object.prototype.hasOwnProperty.call(preferences.drafts, "autoSaveDrafts")) {
      updates["preferences.drafts.autoSaveDrafts"] = sanitizeBoolean(
        preferences.drafts.autoSaveDrafts,
        DEFAULT_USER_PREFERENCES.drafts.autoSaveDrafts,
      );
    }
  }

  if (preferences.notifications) {
    [
      "printSuccess",
      "printFailure",
      "lowQuota",
      "quotaUpdates",
    ].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(preferences.notifications, key)) {
        updates[`preferences.notifications.${key}`] = sanitizeBoolean(
          preferences.notifications[key],
          DEFAULT_USER_PREFERENCES.notifications[key],
        );
      }
    });
  }

  Object.entries(updates).forEach(([path, value]) => {
    user.set(path, value);
  });
};

const updateUserPreferencesData = async (actor, payload = {}, scope = "user") => {
  const user = await getRequiredUser(actor.userId);

  await applyUserPreferenceUpdates(user, payload);
  await user.save();

  await recordAuditLog({
    actor,
    action: {
      name: "Settings Preferences Updated",
      category: "System",
      details: "Personal settings preferences were updated.",
    },
    resource: {
      type: "User",
      id: user._id,
      name: user.username,
    },
  });

  return scope === "admin"
    ? getAdminSettingsData(actor)
    : getUserSettingsData(actor.userId);
};

const updateSystemSettingsData = async (actor, payload = {}) => {
  if (actor.role !== "Admin") {
    throw createHttpError(403, "Only Admin can update system settings.");
  }

  const settings = await ensureSystemSettings();
  const general = payload.general || {};
  const printing = payload.printing || {};
  const fileDrafts = payload.fileDrafts || {};
  const notifications = payload.notifications || {};

  if (Object.prototype.hasOwnProperty.call(general, "systemName")) {
    const systemName = sanitizeString(general.systemName, "EzPrint", 80);
    settings.general.systemName = systemName || "EzPrint";
  }

  if (Object.prototype.hasOwnProperty.call(general, "defaultLanguage")) {
    settings.general.defaultLanguage =
      sanitizeString(general.defaultLanguage, "English", 40) || "English";
  }

  if (Object.prototype.hasOwnProperty.call(general, "defaultTheme")) {
    settings.general.defaultTheme = sanitizeEnum(
      general.defaultTheme,
      THEMES,
      "system",
    );
  }

  if (Object.prototype.hasOwnProperty.call(general, "supportMessage")) {
    settings.general.supportMessage = sanitizeString(general.supportMessage, "", 500);
  }

  if (Object.prototype.hasOwnProperty.call(printing, "defaultPaperSize")) {
    settings.printing.defaultPaperSize = sanitizeEnum(
      printing.defaultPaperSize,
      PAPER_SIZES,
      "A4",
    );
  }

  if (Object.prototype.hasOwnProperty.call(printing, "defaultColorMode")) {
    settings.printing.defaultColorMode = sanitizeEnum(
      printing.defaultColorMode,
      COLOR_MODES,
      "Black & White",
    );
  }

  if (Object.prototype.hasOwnProperty.call(printing, "defaultSides")) {
    settings.printing.defaultSides = sanitizeEnum(
      printing.defaultSides,
      SIDES,
      "Simplex",
    );
  }

  if (Object.prototype.hasOwnProperty.call(printing, "pendingJobRetentionHours")) {
    settings.printing.pendingJobRetentionHours = sanitizeNumber(
      printing.pendingJobRetentionHours,
      24,
      1,
      720,
    );
  }

  if (Object.prototype.hasOwnProperty.call(fileDrafts, "draftRetentionDays")) {
    settings.fileDrafts.draftRetentionDays = sanitizeNumber(
      fileDrafts.draftRetentionDays,
      30,
      1,
      365,
    );
  }

  settings.fileDrafts.allowedUploadTypes = ["PDF"];
  settings.fileDrafts.officeConversionEnabled = false;
  settings.fileDrafts.maxFileSize = env.printUploadLimit;

  [
    "printerIssueNotifications",
    "jobFailureNotifications",
    "lowQuotaNotifications",
  ].forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(notifications, key)) {
      settings.notifications[key] = sanitizeBoolean(notifications[key], true);
    }
  });

  settings.updatedBy = {
    userId: actor.userId,
    username: actor.username || "",
    role: actor.role || "",
  };

  await settings.save();

  await recordAuditLog({
    actor,
    action: {
      name: "System Settings Updated",
      category: "System",
      details: "Admin updated global EzPrint settings.",
    },
    resource: {
      type: "SystemSettings",
      id: settings._id,
      name: settings.general?.systemName || "EzPrint",
    },
  });

  return getAdminSettingsData(actor);
};

module.exports = {
  getUserSettingsData,
  getAdminSettingsData,
  updateUserPreferencesData,
  updateSystemSettingsData,
};
