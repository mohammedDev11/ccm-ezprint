const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const {
  getAdminSettings,
  getUserSettings,
  updateAdminPreferences,
  updateSystemSettings,
  updateUserPreferences,
} = require("./settings.controller");

const userSettingsRouter = express.Router();
const adminSettingsRouter = express.Router();

userSettingsRouter.use(requireAuth);
userSettingsRouter.get("/", getUserSettings);
userSettingsRouter.patch("/preferences", updateUserPreferences);

adminSettingsRouter.use(requireAuth);
adminSettingsRouter.use(requireRole("Admin", "SubAdmin"));
adminSettingsRouter.get("/", getAdminSettings);
adminSettingsRouter.patch("/preferences", updateAdminPreferences);
adminSettingsRouter.patch("/system", requireRole("Admin"), updateSystemSettings);

module.exports = {
  adminSettingsRouter,
  userSettingsRouter,
};
