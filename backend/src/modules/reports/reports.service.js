const User = require("../../models/User");
const Group = require("../../models/Group");
const Printer = require("../../models/Printer");
const Queue = require("../../models/Queue");
const PrintJob = require("../../models/PrintJob");
const QuotaTransaction = require("../../models/QuotaTransaction");
const Notification = require("../../models/Notification");
const { createHttpError } = require("../../utils/http");

const getPeriodStart = (period = "") => {
  const now = new Date();
  const normalizedPeriod = (period || "Last 30 days").trim();

  if (normalizedPeriod === "Last 7 days") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  if (normalizedPeriod === "Last 90 days") {
    return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  }

  if (normalizedPeriod === "This year") {
    return new Date(now.getFullYear(), 0, 1);
  }

  return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
};

const roundAmount = (value) => Number(Number(value || 0).toFixed(2));

const getSummaryData = async (period) => {
  const periodStart = getPeriodStart(period);

  const [totalUsers, activePrinters, activeQueues, unreadNotifications] = await Promise.all([
    User.countDocuments({}),
    Printer.countDocuments({ "status.current": "Online", isActive: true }),
    Queue.countDocuments({ "status.current": "Active", isActive: true }),
    Notification.countDocuments({ "status.current": "unread" }),
  ]);

  const [jobBreakdown, topUsers, topPrinters, quotaBreakdown, groupSummary] = await Promise.all([
    PrintJob.aggregate([
      { $match: { createdAt: { $gte: periodStart } } },
      {
        $group: {
          _id: "$status.current",
          count: { $sum: 1 },
          pages: { $sum: "$document.pages" },
          cost: { $sum: "$cost.totalCost" },
        },
      },
    ]),
    PrintJob.aggregate([
      { $match: { createdAt: { $gte: periodStart } } },
      {
        $group: {
          _id: "$user.userId",
          username: { $first: "$user.username" },
          jobs: { $sum: 1 },
          pages: { $sum: "$document.pages" },
          cost: { $sum: "$cost.totalCost" },
        },
      },
      { $sort: { pages: -1, jobs: -1 } },
      { $limit: 5 },
    ]),
    PrintJob.aggregate([
      { $match: { createdAt: { $gte: periodStart } } },
      {
        $group: {
          _id: "$printer.printerId",
          printerName: { $first: "$printer.printerName" },
          jobs: { $sum: 1 },
          pages: { $sum: "$document.pages" },
          cost: { $sum: "$cost.totalCost" },
        },
      },
      { $sort: { pages: -1, jobs: -1 } },
      { $limit: 5 },
    ]),
    QuotaTransaction.aggregate([
      { $match: { createdAt: { $gte: periodStart } } },
      {
        $group: {
          _id: "$transaction.type",
          total: { $sum: "$transaction.amount" },
          count: { $sum: 1 },
        },
      },
    ]),
    Group.find().sort({ "statistics.totalPagesPrinted": -1 }).limit(5),
  ]);

  const totalJobs = jobBreakdown.reduce((sum, item) => sum + (item.count || 0), 0);
  const pendingRelease = jobBreakdown.find((item) => item._id === "Pending Release")?.count || 0;
  const printedPages = jobBreakdown
    .filter((item) => item._id === "Printed")
    .reduce((sum, item) => sum + (item.pages || 0), 0);
  const totalPrintCost = roundAmount(
    jobBreakdown.reduce((sum, item) => sum + (item.cost || 0), 0),
  );

  return {
    period: period || "Last 30 days",
    generatedAt: new Date(),
    overviewCards: [
      {
        id: "users",
        title: "Users",
        value: String(totalUsers),
        helperText: "Registered accounts",
      },
      {
        id: "active-printers",
        title: "Active Printers",
        value: String(activePrinters),
        helperText: "Online printers right now",
      },
      {
        id: "pending-release",
        title: "Pending Release Jobs",
        value: String(pendingRelease),
        helperText: "Jobs waiting for release",
      },
      {
        id: "print-cost",
        title: "Estimated Print Cost",
        value: `${totalPrintCost.toFixed(2)} SAR`,
        helperText: "Across the selected period",
      },
    ],
    systemSummary: {
      totalUsers,
      activePrinters,
      activeQueues,
      unreadNotifications,
      totalJobs,
      printedPages,
      pendingRelease,
      totalPrintCost,
    },
    jobStatusBreakdown: jobBreakdown.map((item) => ({
      status: item._id || "Unknown",
      count: item.count || 0,
      pages: item.pages || 0,
      cost: roundAmount(item.cost || 0),
    })),
    topUsers: topUsers.map((item) => ({
      userId: item._id?.toString?.() || "",
      username: item.username || "Unknown user",
      jobs: item.jobs || 0,
      pages: item.pages || 0,
      cost: roundAmount(item.cost || 0),
    })),
    topPrinters: topPrinters.map((item) => ({
      printerId: item._id?.toString?.() || "",
      printerName: item.printerName || "Unassigned",
      jobs: item.jobs || 0,
      pages: item.pages || 0,
      cost: roundAmount(item.cost || 0),
    })),
    quotaSummary: quotaBreakdown.map((item) => ({
      type: item._id || "Unknown",
      total: roundAmount(item.total || 0),
      count: item.count || 0,
    })),
    groupSummary: groupSummary.map((group) => ({
      id: group._id.toString(),
      name: group.name,
      members: group.members?.count || 0,
      jobs: group.statistics?.totalJobsSubmitted || 0,
      pages: group.statistics?.totalPagesPrinted || 0,
      cost: roundAmount(group.statistics?.totalCost || 0),
    })),
  };
};

const requestReportExportData = async () => {
  throw createHttpError(
    501,
    "Report export generation is not implemented yet. The summary aggregation endpoint is ready, but file export still needs a PDF/HTML/Excel writer.",
  );
};

module.exports = {
  getSummaryData,
  requestReportExportData,
};
