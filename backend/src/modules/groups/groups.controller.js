const { normalizeGroupPayload } = require("./groups.validation");
const {
  getGroupsData,
  getGroupDetailsData,
  createGroupData,
  updateGroupData,
  deleteGroupData,
} = require("./groups.service");

const getActor = (req) => ({
  userId: req.userId,
  role: req.userRole,
  username: req.userEmail || req.userId,
  ipAddress: req.ip,
  userAgent: req.get("user-agent") || "",
});

const getGroups = async (req, res, next) => {
  try {
    const data = await getGroupsData();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const getGroupDetails = async (req, res, next) => {
  try {
    const data = await getGroupDetailsData(req.params.groupId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const createGroup = async (req, res, next) => {
  try {
    const payload = normalizeGroupPayload(req.body, { requireName: true });
    const data = await createGroupData(payload, getActor(req));

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const updateGroup = async (req, res, next) => {
  try {
    const payload = normalizeGroupPayload(req.body);
    const data = await updateGroupData(req.params.groupId, payload, getActor(req));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteGroup = async (req, res, next) => {
  try {
    const data = await deleteGroupData(req.params.groupId, getActor(req));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getGroups,
  getGroupDetails,
  createGroup,
  updateGroup,
  deleteGroup,
};
