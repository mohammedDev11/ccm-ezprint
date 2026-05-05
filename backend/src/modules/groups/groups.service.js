const Group = require("../../models/Group");
const User = require("../../models/User");
const Queue = require("../../models/Queue");
const { createHttpError } = require("../../utils/http");
const { recordAuditLog } = require("../logs/logs.service");

const toIdString = (value) => value?.toString?.() || "";

const getGroupPeriod = (group) => {
  return group.quota?.scheduleFrequency || group.quota?.resetPeriod || "None";
};

const formatGroupListItem = (group) => {
  return {
    id: group._id.toString(),
    name: group.name,
    members: group.members?.count || group.members?.userIds?.length || 0,
    initialQuota: group.quota?.initialCredit || 0,
    restricted: group.access?.restricted ? "Restricted" : "Unrestricted",
    scheduleAmount: group.quota?.scheduleAmount || 0,
    period: getGroupPeriod(group),
    notes: group.notes || "",
    selectedByDefault: group.access?.selectedByDefault || false,
    accumulationEnabled: false,
    accumulationLimit: 0,
    initialOverdraft: 0,
  };
};

const buildActorPayload = (actor = {}) => ({
  userId: actor.userId,
  username: actor.username,
  role: actor.role,
  ipAddress: actor.ipAddress,
  userAgent: actor.userAgent,
});

const getRequiredGroup = async (groupId) => {
  const group = await Group.findById(groupId)
    .populate("members.userIds", "fullName username email department userType")
    .populate("permissions.allowedQueues", "name description");

  if (!group) {
    throw createHttpError(404, "Group not found.");
  }

  return group;
};

const syncGroupMembers = async (group, memberUserIds) => {
  if (!Array.isArray(memberUserIds)) {
    return group;
  }

  const members = memberUserIds.length
    ? await User.find({ _id: { $in: memberUserIds } }).select("department userType")
    : [];

  if (members.length !== memberUserIds.length) {
    throw createHttpError(400, "One or more group members could not be found.");
  }

  await User.updateMany(
    {
      groupId: group._id,
      _id: { $nin: memberUserIds },
    },
    {
      $set: {
        groupId: null,
      },
    },
  );

  if (memberUserIds.length > 0) {
    await User.updateMany(
      {
        _id: { $in: memberUserIds },
      },
      {
        $set: {
          groupId: group._id,
        },
      },
    );
  }

  group.members.userIds = memberUserIds;
  group.members.count = memberUserIds.length;
  group.members.departments = Array.from(
    new Set(members.map((member) => member.department).filter(Boolean)),
  );
  group.members.userTypes = Array.from(
    new Set(members.map((member) => member.userType).filter(Boolean)),
  );

  return group;
};

const syncAllowedQueues = async (group, allowedQueueIds) => {
  if (!Array.isArray(allowedQueueIds)) {
    return group;
  }

  if (allowedQueueIds.length === 0) {
    group.permissions.allowedQueues = [];
    return group;
  }

  const queues = await Queue.find({ _id: { $in: allowedQueueIds } }).select("_id");

  if (queues.length !== allowedQueueIds.length) {
    throw createHttpError(400, "One or more queues could not be found.");
  }

  group.permissions.allowedQueues = allowedQueueIds;
  return group;
};

const applyGroupPayload = async (group, payload) => {
  if (payload.name) {
    group.name = payload.name;
  }

  group.description = payload.description;
  group.groupType = payload.groupType;
  group.notes = payload.notes;
  group.access.restricted = payload.restricted;
  group.access.selectedByDefault = payload.selectedByDefault;
  group.access.enabled = payload.enabled;
  group.access.requiresApproval = payload.requiresApproval;
  group.permissions.canUpload = payload.canUpload;
  group.permissions.canRelease = payload.canRelease;
  group.permissions.costLimit = payload.costLimit;
  group.quota.initialCredit = payload.initialCredit;
  group.quota.perUserAllocation = payload.perUserAllocation;
  group.quota.scheduleAmount = payload.scheduleAmount;
  group.quota.scheduleFrequency = payload.scheduleFrequency || "";
  group.quota.resetPeriod = payload.resetPeriod;

  await syncGroupMembers(group, payload.memberUserIds);
  await syncAllowedQueues(group, payload.allowedQueueIds);

  return group;
};

const getGroupsData = async () => {
  const groups = await Group.find()
    .populate("permissions.allowedQueues", "name")
    .sort({ createdAt: -1 });

  return {
    summary: {
      total: groups.length,
      restricted: groups.filter((group) => group.access?.restricted).length,
      selectedByDefault: groups.filter((group) => group.access?.selectedByDefault).length,
      totalMembers: groups.reduce(
        (sum, group) => sum + (group.members?.count || group.members?.userIds?.length || 0),
        0,
      ),
    },
    groups: groups.map(formatGroupListItem),
  };
};

const getGroupDetailsData = async (groupId) => {
  const group = await getRequiredGroup(groupId);

  return {
    group: {
      ...formatGroupListItem(group),
      description: group.description || "",
      groupType: group.groupType,
      resetPeriod: group.quota?.resetPeriod || "None",
      perUserAllocation: group.quota?.perUserAllocation || 0,
      enabled: group.access?.enabled !== false,
      requiresApproval: group.access?.requiresApproval || false,
      canUpload: group.permissions?.canUpload !== false,
      canRelease: group.permissions?.canRelease !== false,
      costLimit: group.permissions?.costLimit || 0,
      memberUserIds: (group.members?.userIds || []).map((member) => member._id.toString()),
      membersList: (group.members?.userIds || []).map((member) => ({
        id: member._id.toString(),
        fullName: member.fullName,
        username: member.username,
        email: member.email,
        department: member.department,
        userType: member.userType,
      })),
      allowedQueues: (group.permissions?.allowedQueues || []).map((queue) => ({
        id: queue._id.toString(),
        name: queue.name,
        description: queue.description || "",
      })),
    },
  };
};

const createGroupData = async (payload, actor) => {
  const existingGroup = await Group.findOne({ name: payload.name });

  if (existingGroup) {
    throw createHttpError(409, "A group with this name already exists.");
  }

  const group = new Group({
    name: payload.name,
  });

  await applyGroupPayload(group, payload);
  group.administration.createdBy = actor.userId || null;
  await group.save();

  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Group Created",
      category: "Group",
      details: `Created group "${group.name}".`,
    },
    resource: {
      type: "Group",
      id: group._id,
      name: group.name,
      changes: {
        restricted: group.access?.restricted || false,
        members: group.members?.count || 0,
      },
    },
  });

  return getGroupDetailsData(group._id);
};

const updateGroupData = async (groupId, payload, actor) => {
  const group = await Group.findById(groupId);

  if (!group) {
    throw createHttpError(404, "Group not found.");
  }

  if (payload.name && payload.name !== group.name) {
    const existingGroup = await Group.findOne({ name: payload.name });

    if (existingGroup) {
      throw createHttpError(409, "A group with this name already exists.");
    }
  }

  const before = {
    name: group.name,
    restricted: group.access?.restricted || false,
    members: group.members?.count || 0,
  };

  await applyGroupPayload(group, payload);
  await group.save();

  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Group Updated",
      category: "Group",
      details: `Updated group "${group.name}".`,
    },
    resource: {
      type: "Group",
      id: group._id,
      name: group.name,
      changes: {
        before,
        after: {
          name: group.name,
          restricted: group.access?.restricted || false,
          members: group.members?.count || 0,
        },
      },
    },
  });

  return getGroupDetailsData(group._id);
};

const deleteGroupData = async (groupId, actor) => {
  const group = await Group.findById(groupId);

  if (!group) {
    throw createHttpError(404, "Group not found.");
  }

  await Promise.all([
    User.updateMany(
      {
        groupId: group._id,
      },
      {
        $set: {
          groupId: null,
        },
      },
    ),
    Queue.updateMany(
      {
        "access.allowedGroups": group._id,
      },
      {
        $pull: {
          "access.allowedGroups": group._id,
        },
      },
    ),
  ]);

  await Group.deleteOne({ _id: group._id });

  await recordAuditLog({
    actor: buildActorPayload(actor),
    action: {
      name: "Group Deleted",
      category: "Group",
      details: `Deleted group "${group.name}".`,
    },
    resource: {
      type: "Group",
      id: group._id,
      name: group.name,
      changes: {
        members: group.members?.count || 0,
      },
    },
  });

  return {
    deletedGroupId: groupId,
    deletedGroupName: group.name,
  };
};

module.exports = {
  getGroupsData,
  getGroupDetailsData,
  createGroupData,
  updateGroupData,
  deleteGroupData,
};
