const env = require("../config/env");
const { connectDatabase } = require("../config/db");
const User = require("../models/User");
const Group = require("../models/Group");
const Printer = require("../models/Printer");
const Queue = require("../models/Queue");
const QuotaTransaction = require("../models/QuotaTransaction");
const PrintJob = require("../models/PrintJob");
const Notification = require("../models/Notification");
const AuditLog = require("../models/Log");
const {
  usersSeed,
  printersSeed,
  queuesSeed,
  quotaTransactionsSeed,
  printJobsSeed,
} = require("./seedData");

const inferUserType = (userData) => {
  if (userData.role && userData.role !== "User") {
    return "Staff";
  }

  return "Student";
};

const normalizePrinterStatus = (status) => {
  if (status === "Low Toner") {
    return "Maintenance";
  }

  return ["Online", "Offline", "Maintenance"].includes(status) ? status : "Online";
};

const normalizeQueueType = (type) => {
  if (type === "Secure Release" || type === "Secure Release Queue") {
    return "Secure Release Queue";
  }

  if (type === "Direct Print") {
    return "Direct Print";
  }

  return "Managed Queue";
};

const normalizeQueueStatus = (status) => {
  if (status === "Inactive") {
    return "Paused";
  }

  return ["Active", "Paused", "Maintenance"].includes(status) ? status : "Active";
};

const normalizeTransactionType = (type) => {
  switch ((type || "").toLowerCase()) {
    case "print deduction":
      return "Print Deduction";
    case "credit addition":
      return "Credit Addition";
    case "refund":
      return "Refund";
    case "adjustment":
      return "Adjustment";
    default:
      return "Manual Override";
  }
};

const parseColorMode = (text = "") => (/color/i.test(text) ? "Color" : "B&W");

const parseMode = (text = "") => (/duplex/i.test(text) ? "Duplex" : "Simplex");

const inferGroupType = (groupName) => {
  if (/all users/i.test(groupName)) {
    return "All Users";
  }

  if (/faculty/i.test(groupName)) {
    return "Faculty";
  }

  if (/department/i.test(groupName)) {
    return "Department";
  }

  return "Custom";
};

const buildGroupSeeds = () =>
  Array.from(new Set(queuesSeed.flatMap((queue) => queue.allowedGroups || []))).map(
    (name) => ({
      name,
      description: `Seeded access group for ${name}.`,
      groupType: inferGroupType(name),
      members: {
        userIds: [],
        count: 0,
        departments: [],
        userTypes: [],
      },
      quota: {
        initialCredit: 0,
        perUserAllocation: 0,
        resetPeriod: "None",
      },
      access: {
        restricted: false,
        selectedByDefault: false,
        enabled: true,
        requiresApproval: false,
      },
      permissions: {
        canUpload: true,
        canRelease: true,
        allowedQueues: [],
      },
      statistics: {
        totalPagesAllocated: 0,
        totalPagesPrinted: 0,
        totalJobsSubmitted: 0,
        totalCost: 0,
        monthlyPageCount: 0,
        monthlyJobCount: 0,
      },
      notes: "",
    }),
  );

const resetCollections = async () => {
  await Promise.all([
    User.deleteMany({}),
    Group.deleteMany({}),
    Printer.deleteMany({}),
    Queue.deleteMany({}),
    QuotaTransaction.deleteMany({}),
    PrintJob.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
};

const seedUsers = async () => {
  const createdUsers = [];

  for (const userData of usersSeed) {
    const user = new User({
      username: userData.username,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role,
      userType: inferUserType(userData),
      department: userData.department,
      phone: userData.phone,
      standing: userData.standing,
      printing: {
        enabled: true,
        restricted: userData.restricted,
        quota: {
          remaining: userData.printing?.quota?.remaining ?? 0,
        },
        // TODO: Seed defaultQueueId when source data includes a reliable per-user queue mapping.
      },
      statistics: {
        totalPagesPrinted: 0,
        totalJobsSubmitted: 0,
        lastActivityAt: null,
      },
      isActive: true,
    });

    await user.setPassword(userData.password);
    await user.save();
    createdUsers.push(user);
  }

  return createdUsers;
};

const seedGroups = async () => {
  const groups = buildGroupSeeds();

  if (groups.length === 0) {
    return [];
  }

  return Group.insertMany(groups);
};

const seedPrinters = async () => {
  const data = printersSeed.map((printerData) => ({
    name: printerData.name,
    model: printerData.model,
    serialNumber: printerData.serialNumber,
    location: {
      building: printerData.building,
      room: printerData.room,
    },
    department: printerData.department,
    status: {
      current: normalizePrinterStatus(printerData.status),
      lastCheckedAt: new Date(),
      toner: {
        level: printerData.tonerLevel,
        alertSent: printerData.tonerLevel <= 20,
      },
      paper: {
        level: printerData.paperLevel,
        alertSent: printerData.paperLevel <= 30,
      },
      errorDetails:
        printerData.status === "Low Toner" ? "Toner below configured threshold." : "",
    },
    capabilities: {
      supported: printerData.capabilities,
      defaultSettings: {
        colorMode: printerData.capabilities.includes("Color") ? "Color" : "B&W",
        printMode: printerData.capabilities.includes("Duplex") ? "Duplex" : "Simplex",
      },
    },
    queue: {
      queueName: printerData.queueName,
      enabled: true,
      manualReleaseRequired: true,
      pinRequired: true,
    },
    costPerPage: printerData.costPerPage,
    network: {
      ipAddress: printerData.ipAddress,
    },
    statistics: {
      totalPagesPrinted: printerData.totalPagesPrinted,
      totalJobsSubmitted: printerData.totalJobsSubmitted,
      totalCost: Number((printerData.totalPagesPrinted * printerData.costPerPage).toFixed(2)),
      averageCostPerJob: printerData.totalJobsSubmitted
        ? Number(
            (
              (printerData.totalPagesPrinted * printerData.costPerPage) /
              printerData.totalJobsSubmitted
            ).toFixed(2),
          )
        : 0,
      lastUsedAt: null,
    },
    device: {
      type: printerData.deviceType || "Physical",
    },
    notes: printerData.notes,
    isActive: true,
  }));

  return Printer.insertMany(data);
};

const seedQueues = async (groupsMap, printersMap) => {
  const data = queuesSeed.map((queueData) => {
    const assignedPrinters = (queueData.assignedPrinters || [])
      .map((printerName) => printersMap.get(printerName)?._id)
      .filter(Boolean);
    const onlineCount = (queueData.assignedPrinters || []).reduce((count, printerName) => {
      const printer = printersMap.get(printerName);
      return count + (printer?.status?.current === "Online" ? 1 : 0);
    }, 0);
    const normalizedStatus = normalizeQueueStatus(queueData.status);

    return {
      name: queueData.name,
      description: queueData.description,
      type: normalizeQueueType(queueData.type),
      status: {
        current: normalizedStatus,
        pausedAt: normalizedStatus === "Paused" ? new Date() : null,
        pauseReason: normalizedStatus === "Paused" ? "Seeded as inactive queue." : "",
      },
      printers: {
        assigned: assignedPrinters,
        default: printersMap.get(queueData.defaultPrinter)?._id || assignedPrinters[0] || null,
        totalAssigned: assignedPrinters.length,
        onlineCount,
      },
      access: {
        allowedRoles: queueData.allowedRoles || ["User", "SubAdmin", "Admin"],
        allowedGroups: (queueData.allowedGroups || [])
          .map((groupName) => groupsMap.get(groupName)?._id)
          .filter(Boolean),
        allowedDepartments: queueData.allowedDepartments || [],
        restrictedUsers: [],
        requiresApproval: false,
        approverIds: [],
      },
      security: {
        secureRelease: queueData.secureRelease,
        manualReleaseRequired: queueData.manualReleaseRequired,
        allowReleaseAllJobs: queueData.allowReleaseAllJobs,
        requirePrinterAuthentication: queueData.requirePrinterAuthentication,
        releaseMethod: queueData.secureRelease ? "PIN" : "Manual",
      },
      jobManagement: {
        retentionHours: queueData.retentionHours,
        autoDeleteExpired: queueData.autoDeleteExpiredJobs,
      },
      statistics: {
        totalJobs: queueData.pendingJobs,
        pendingJobs: queueData.pendingJobs,
        totalPagesPrinted: 0,
      },
      notifications: {
        enabled: false,
      },
      isActive: normalizedStatus === "Active",
    };
  });

  return Queue.insertMany(data);
};

const syncPrinterQueueAssignments = async (queues) => {
  const updates = [];

  for (const queue of queues) {
    for (const printerId of queue.printers?.assigned || []) {
      updates.push(
        Printer.findByIdAndUpdate(printerId, {
          $set: {
            "queue.assignedQueueId": queue._id,
            "queue.queueName": queue.name,
            "queue.enabled": queue.status?.current === "Active",
            "queue.manualReleaseRequired": queue.security?.manualReleaseRequired ?? true,
            "queue.pinRequired": queue.security?.requirePrinterAuthentication ?? true,
          },
        }),
      );
    }
  }

  await Promise.all(updates);
};

const seedPrintJobs = async (usersMap, printersMap, queuesMap) => {
  const now = Date.now();

  const data = printJobsSeed.map((item, index) => {
    const submittedAt = new Date(now - (index + 1) * 10 * 60 * 1000);
    const printedAt =
      item.status === "Printed" || item.status === "Refunded" || item.status === "Failed"
        ? new Date(submittedAt.getTime() + 5 * 60 * 1000)
        : null;
    const user = usersMap.get(item.userUsername);
    const printer = printersMap.get(item.printerName);
    const queue = queuesMap.get(item.queueName);
    const printDescriptor = item.printMode || item.attributes.join(" ");

    return {
      jobId: item.jobId,
      documentName: item.documentName,
      user: {
        userId: user._id,
        username: user.username,
        department: user.department,
      },
      printer: {
        printerId: printer?._id || null,
        printerName: printer?.name || item.printerName,
        queueId: queue?._id || null,
        queueName: queue?.name || item.queueName,
      },
      document: {
        fileName: item.documentName,
        originalFileName: item.documentName,
        fileType: (item.fileType || "pdf").toLowerCase(),
        pages: item.pages,
      },
      printSettings: {
        colorMode: parseColorMode(printDescriptor),
        mode: parseMode(printDescriptor),
        attributes: item.attributes,
        options: item.attributes,
      },
      source: {
        clientType: item.clientSource,
      },
      status: {
        current: item.status,
        submittedAt,
        printedAt,
        readinessPercent: item.readinessPercent,
      },
      cost: {
        costPerPage: item.pages ? Number((item.cost / item.pages).toFixed(4)) : 0,
        totalCost: item.cost,
        quotaDeducted: item.status !== "Refunded",
        refundedAmount: item.status === "Refunded" ? item.cost : 0,
        refundedAt: item.status === "Refunded" ? printedAt : null,
      },
      release: {
        method: queue?.security?.releaseMethod || "PIN",
      },
    };
  });

  return PrintJob.insertMany(data);
};

const seedQuotaTransactions = async (usersMap, jobsMap) => {
  const data = quotaTransactionsSeed.map((item) => {
    const user = usersMap.get(item.userUsername);
    const amountBefore = Number((item.quotaAfter - item.amount).toFixed(2));
    const job = jobsMap.get((item.reference || "").toUpperCase());

    return {
      user: {
        userId: user._id,
        username: user.username,
        department: user.department,
      },
      transaction: {
        type: normalizeTransactionType(item.type),
        amount: item.amount,
        reason: item.comment,
      },
      quota: {
        amountBefore,
        amountAfter: item.quotaAfter,
        changed: item.amount,
      },
      reference: {
        jobId: job?._id || null,
        jobIdString: item.reference || "",
      },
      metadata: {
        method: item.method,
        comment: item.comment,
        notes: item.comment,
      },
      approval: {
        required: false,
        status: "Approved",
      },
    };
  });

  return QuotaTransaction.insertMany(data);
};

const hydrateUserStatistics = async () => {
  const stats = await PrintJob.aggregate([
    {
      $group: {
        _id: "$user.userId",
        totalJobsSubmitted: { $sum: 1 },
        totalPagesPrinted: {
          $sum: {
            $cond: [{ $eq: ["$status.current", "Printed"] }, "$document.pages", 0],
          },
        },
        lastActivityAt: { $max: "$status.submittedAt" },
      },
    },
  ]);

  await Promise.all(
    stats.map((item) =>
      User.findByIdAndUpdate(item._id, {
        $set: {
          "statistics.totalJobsSubmitted": item.totalJobsSubmitted,
          "statistics.totalPagesPrinted": item.totalPagesPrinted,
          "statistics.lastActivityAt": item.lastActivityAt,
        },
      }),
    ),
  );
};

const hydratePrinterLastUsed = async () => {
  const stats = await PrintJob.aggregate([
    {
      $match: {
        "printer.printerId": { $ne: null },
      },
    },
    {
      $group: {
        _id: "$printer.printerId",
        lastUsedAt: { $max: "$status.submittedAt" },
      },
    },
  ]);

  await Promise.all(
    stats.map((item) =>
      Printer.findByIdAndUpdate(item._id, {
        $set: {
          "statistics.lastUsedAt": item.lastUsedAt,
        },
      }),
    ),
  );
};

const buildMap = (items, keySelector) => {
  const map = new Map();
  for (const item of items) {
    map.set(keySelector(item), item);
  }
  return map;
};

const runSeed = async () => {
  try {
    await connectDatabase();
    console.log(`Connected to MongoDB "${env.mongoDbName}" for seeding.`);

    await resetCollections();
    console.log("Cleared collections.");

    const users = await seedUsers();
    const groups = await seedGroups();
    const printers = await seedPrinters();

    const usersMap = buildMap(users, (item) => item.username);
    const groupsMap = buildMap(groups, (item) => item.name);
    const printersMap = buildMap(printers, (item) => item.name);
    const queues = await seedQueues(groupsMap, printersMap);
    const queuesMap = buildMap(queues, (item) => item.name);
    await syncPrinterQueueAssignments(queues);

    const jobs = await seedPrintJobs(usersMap, printersMap, queuesMap);
    const jobsMap = buildMap(jobs, (item) => item.jobId.toUpperCase());
    const transactions = await seedQuotaTransactions(usersMap, jobsMap);
    await hydrateUserStatistics();
    await hydratePrinterLastUsed();

    console.log("Seed completed successfully.");
    console.log(`Users: ${users.length}`);
    console.log(`Groups: ${groups.length}`);
    console.log(`Printers: ${printers.length}`);
    console.log(`Queues: ${queues.length}`);
    console.log(`Quota Transactions: ${transactions.length}`);
    console.log(`Print Jobs: ${jobs.length}`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

runSeed();
