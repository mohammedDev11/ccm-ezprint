const getHealthStatus = () => ({
  message: "Alpha Queue backend is running",
  timestamp: new Date().toISOString(),
});

module.exports = {
  getHealthStatus,
};
