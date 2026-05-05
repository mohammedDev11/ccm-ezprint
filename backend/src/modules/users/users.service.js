const User = require("../../models/User");
const Queue = require("../../models/Queue");
const QuotaTransaction = require("../../models/QuotaTransaction");
const PrintJob = require("../../models/PrintJob");
const {
  formatDate,
  formatDateTimeLabel,
} = require("../../utils/formatters");

const isPrintingRestricted = (user) =>
  user.printing?.enabled === false || user.printing?.restricted === true;

const getTransactionAmount = (transaction) => transaction.transaction?.amount ?? 0;

const getTransactionType = (transaction) => transaction.transaction?.type || "";

const getJobStatus = (job) => job.status?.current || "";

const getJobPages = (job) => job.document?.pages || 0;

const getDefaultQueueLabel = async (user) => {
  // TODO: Replace this fallback once user-level default queue assignments are migrated.
  if (!user.printing?.defaultQueueId) {
    return "Secure Release Queue";
  }

  const queue = await Queue.findById(user.printing.defaultQueueId).select("name");
  return queue?.name || "Configured queue";
};

const getRequiredUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found.");
    error.status = 404;
    throw error;
  }

  return user;
};

const getProfileData = async (userId) => {
  const user = await getRequiredUser(userId);
  const quota = user.printing?.quota?.remaining ?? 0;
  const defaultQueueLabel = await getDefaultQueueLabel(user);

  return {
    user: user.toSafeObject(),
    informationSections: [
      {
        id: "personal-information",
        title: "Personal Information",
        description: "Your main account and identity details.",
        fields: [
          { id: "full-name", label: "Full Name", value: user.fullName || "-" },
          { id: "username", label: "Username", value: user.username || "-" },
          { id: "email", label: "Email Address", value: user.email || "-" },
          { id: "phone", label: "Phone Number", value: user.phone || "-" },
        ],
      },
      {
        id: "university-information",
        title: "University Information",
        description: "Academic and institutional details linked to your account.",
        fields: [
          { id: "user-id", label: "University ID", value: user.username || "-" },
          { id: "role", label: "Role", value: user.role || "User" },
          { id: "department", label: "Department", value: user.department || "-" },
          {
            id: "college",
            label: "College",
            value: "College of Computing and Mathematics",
          },
        ],
      },
      {
        id: "printing-identity",
        title: "Printing Identity",
        description: "Information used for printing and secure release.",
        fields: [
          {
            id: "primary-card-id",
            label: "Primary Card ID",
            value: user.printing?.primaryCardId || "Not configured",
            sensitive: true,
          },
          { id: "account-quota", label: "Account Quota", value: quota.toFixed(2) },
          {
            id: "printing-status",
            label: "Printing Status",
            value: isPrintingRestricted(user) ? "Restricted" : "Enabled",
          },
          {
            id: "default-queue",
            label: "Default Queue",
            value: defaultQueueLabel,
          },
        ],
      },
    ],
  };
};

const getQuotaOverviewData = async (userId) => {
  const user = await getRequiredUser(userId);
  const transactions = await QuotaTransaction.find({ "user.userId": user._id });
  const quota = user.printing?.quota?.remaining ?? 0;
  const added = transactions
    .filter(
      (item) =>
        ["Credit Addition", "Refund", "Adjustment", "Manual Override", "Group Allocation"].includes(
          getTransactionType(item),
        ) &&
        getTransactionAmount(item) > 0,
    )
    .reduce((sum, item) => sum + getTransactionAmount(item), 0);
  const spent = transactions
    .filter((item) => getTransactionType(item) === "Print Deduction")
    .reduce((sum, item) => sum + Math.abs(getTransactionAmount(item)), 0);

  return {
    quota,
    balance: quota,
    walletSummaryCards: [
      {
        title: "Wallet Balance",
        value: `${quota.toFixed(2)} SAR`,
        helperText: "Available for future print orders",
        iconKey: "wallet",
      },
      {
        title: "Funds Added",
        value: `${added.toFixed(2)} SAR`,
        helperText: "Total credits added",
        iconKey: "arrow-down-left",
      },
      {
        title: "Spent",
        value: `${spent.toFixed(2)} SAR`,
        helperText: "Used for completed print jobs",
        iconKey: "arrow-up-right",
      },
      {
        title: "Redeemed",
        value: `${added.toFixed(2)} SAR`,
        helperText: "Added through top-up or redeem flow",
        iconKey: "gift",
      },
    ],
  };
};

const getQuotaTransactionsData = async (userId) => {
  const transactions = await QuotaTransaction.find({ "user.userId": userId }).sort({
    createdAt: -1,
  });

  return {
    transactions: transactions.map((item) => {
      const amount = getTransactionAmount(item);
      const type = getTransactionType(item);
      const direction = amount >= 0 ? "in" : "out";

      return {
        id: item._id.toString(),
        description: item.metadata?.comment || item.transaction?.reason || type,
        type,
        amount: Math.abs(amount),
        date: formatDate(item.createdAt),
        dateOrder: Number(
          new Date(item.createdAt).toISOString().slice(0, 10).replaceAll("-", ""),
        ),
        status: "Completed",
        direction,
        balanceAfter: item.quota?.amountAfter ?? 0,
        method: item.metadata?.method || "System",
        note: item.reference?.jobIdString || "",
      };
    }),
  };
};

const getDashboardData = async (userId, period) => {
  const user = await getRequiredUser(userId);
  const allJobs = await PrintJob.find({ "user.userId": userId });
  const pendingJobs = allJobs.filter((job) => getJobStatus(job) === "Pending Release");
  const printedJobs = allJobs.filter((job) => getJobStatus(job) === "Printed");
  const totalPages = printedJobs.reduce((sum, job) => sum + getJobPages(job), 0);
  const quota = user.printing?.quota?.remaining ?? 0;

  return {
    period: period || "Today",
    cards: [
      {
        id: 1,
        title: "Current Quota",
        value: quota.toFixed(2),
        change: "Live",
        iconKey: "dollar-sign",
      },
      {
        id: 2,
        title: "Total Print Jobs",
        value: String(allJobs.length),
        change: "All time",
        iconKey: "file-text",
      },
      {
        id: 3,
        title: "Total Pages Printed",
        value: String(totalPages),
        change: "All time",
        iconKey: "layers-3",
      },
      {
        id: 4,
        title: "Active Pending Jobs",
        value: String(pendingJobs.length),
        change: "Ready to release",
        iconKey: "clock-3",
      },
    ],
    printActivity: [],
    printUsage: [],
    userInformation: [
      { id: 1, label: "Name", value: user.fullName, iconKey: "user-2" },
      { id: 2, label: "User ID", value: user.username, iconKey: "id-card" },
    ],
    quickActions: [
      {
        id: 1,
        label: "Upload Document",
        href: "/sections/user/print",
        iconKey: "upload",
        variant: "primary",
      },
      {
        id: 2,
        label: "Redeem Card",
        href: "/sections/user/redeem",
        iconKey: "credit-card",
        variant: "secondary",
      },
      {
        id: 3,
        label: "View Pending Jobs",
        href: "/sections/user/pending-jobs",
        iconKey: "clock-3",
        variant: "secondary",
      },
    ],
  };
};

const getAdminUsersData = async () => {
  const users = await User.find().sort({ createdAt: -1 });

  return Promise.all(
    users.map(async (user) => {
      const stats = await PrintJob.aggregate([
        { $match: { "user.userId": user._id } },
        {
          $group: {
            _id: "$user.userId",
            jobs: { $sum: 1 },
            pages: { $sum: "$document.pages" },
          },
        },
      ]);

      return {
        id: user._id.toString(),
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        userType: user.userType,
        department: user.department || "Software Engineering",
        standing: user.standing || "Student",
        phone: user.phone || "-",
        quota: user.printing?.quota?.remaining ?? 0,
        restricted: isPrintingRestricted(user) ? "Restricted" : "Unrestricted",
        pages: stats[0]?.pages || 0,
        jobs: stats[0]?.jobs || 0,
        lastActivity: user.statistics?.lastActivityAt
          ? formatDateTimeLabel(user.statistics.lastActivityAt)
          : "No activity",
        notes: "",
      };
    }),
  );
};

module.exports = {
  getProfileData,
  getQuotaOverviewData,
  getQuotaTransactionsData,
  getDashboardData,
  getAdminUsersData,
};
