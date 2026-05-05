const {
  getProfileData,
  getQuotaOverviewData,
  getQuotaTransactionsData,
  getDashboardData,
  getAdminUsersData,
} = require("./users.service");

const getProfile = async (req, res, next) => {
  try {
    const data = await getProfileData(req.userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const getQuotaOverview = async (req, res, next) => {
  try {
    const data = await getQuotaOverviewData(req.userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const getQuotaTransactions = async (req, res, next) => {
  try {
    const data = await getQuotaTransactionsData(req.userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const data = await getDashboardData(req.userId, req.query.period);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const getAdminUsers = async (req, res, next) => {
  try {
    const users = await getAdminUsersData();

    return res.status(200).json({
      success: true,
      data: {
        users,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProfile,
  getQuotaOverview,
  getQuotaTransactions,
  getDashboard,
  getAdminUsers,
};
