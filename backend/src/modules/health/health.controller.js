const { getHealthStatus } = require("./health.service");

const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    ...getHealthStatus(),
  });
};

module.exports = {
  getHealth,
};
