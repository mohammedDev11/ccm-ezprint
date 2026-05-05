const Queue = require("../../models/Queue");

const getAdminQueuesData = async () => {
  const queues = await Queue.find()
    .populate("printers.assigned", "name")
    .populate("printers.default", "name")
    .populate("access.allowedGroups", "name")
    .populate("access.restrictedUsers", "username")
    .sort({ createdAt: -1 });

  return queues.map((queue) => ({
    id: queue._id.toString(),
    name: queue.name,
    description: queue.description,
    type: queue.type,
    status: queue.status?.current || "Active",
    assignedPrinters: (queue.printers?.assigned || []).map((printer) => printer.name),
    defaultPrinter: queue.printers?.default?.name || "",
    allowedRoles: queue.access?.allowedRoles || [],
    allowedGroups: (queue.access?.allowedGroups || []).map((group) => group.name),
    allowedDepartments: queue.access?.allowedDepartments || [],
    restrictedUsers: (queue.access?.restrictedUsers || []).map((user) => user.username),
    pendingJobs: queue.statistics?.pendingJobs || 0,
    retentionHours: queue.jobManagement?.retentionHours ?? 24,
    secureRelease: queue.security?.secureRelease ?? true,
    manualReleaseRequired: queue.security?.manualReleaseRequired ?? true,
    allowReleaseAllJobs: queue.security?.allowReleaseAllJobs ?? false,
    requirePrinterAuthentication: queue.security?.requirePrinterAuthentication ?? true,
    autoDeleteExpiredJobs: queue.jobManagement?.autoDeleteExpired ?? true,
  }));
};

module.exports = {
  getAdminQueuesData,
};
