const getHealthStatus = () => ({
  message: "CCM EzPrint backend is running",
  timestamp: new Date().toISOString(),
});

module.exports = {
  getHealthStatus,
};
