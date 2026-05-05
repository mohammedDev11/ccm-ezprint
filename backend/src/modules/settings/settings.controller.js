const {
  getAdminSettingsData,
  getUserSettingsData,
  updateSystemSettingsData,
  updateUserPreferencesData,
} = require("./settings.service");

const getActor = (req) => ({
  userId: req.userId,
  role: req.userRole,
  username: req.userEmail || req.userId,
  ipAddress: req.ip,
  userAgent: req.get("user-agent") || "",
});

const getUserSettings = async (req, res, next) => {
  try {
    const data = await getUserSettingsData(req.userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const getAdminSettings = async (req, res, next) => {
  try {
    const data = await getAdminSettingsData(getActor(req));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const updateUserPreferences = async (req, res, next) => {
  try {
    const data = await updateUserPreferencesData(getActor(req), req.body, "user");

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const updateAdminPreferences = async (req, res, next) => {
  try {
    const data = await updateUserPreferencesData(getActor(req), req.body, "admin");

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const updateSystemSettings = async (req, res, next) => {
  try {
    const data = await updateSystemSettingsData(getActor(req), req.body);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAdminSettings,
  getUserSettings,
  updateAdminPreferences,
  updateSystemSettings,
  updateUserPreferences,
};
