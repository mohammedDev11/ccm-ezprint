const { getAdminQueuesData } = require("./queues.service");

const getAdminQueues = async (req, res, next) => {
  try {
    const queues = await getAdminQueuesData();

    return res.status(200).json({
      success: true,
      data: {
        queues,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAdminQueues,
};
