const SharedAccount = require("../../models/SharedAccount");
const User = require("../../models/User");
const { createHttpError } = require("../../utils/http");

const toIdString = (value) => value?.toString?.() || "";

const statusLabels = {
  active: "Active",
  review: "Needs Review",
  archived: "Archived",
};

const linkedStatusLabels = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
};

const formatDateValue = (value) => (value ? new Date(value).toISOString() : null);

const findUserForAccountRef = async ({ userId, username }) => {
  if (userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw createHttpError(400, "Linked user could not be found.");
    }
    return user;
  }

  if (!username) {
    return null;
  }

  return User.findOne({ username: username.trim().toLowerCase() });
};

const resolveAccountRef = async (accountRef) => {
  const user = await findUserForAccountRef(accountRef);

  return {
    userId: user?._id || accountRef.userId || null,
    username: user?.username || accountRef.username,
    identifier: user?.printing?.primaryCardId || accountRef.identifier || "",
    department: user?.department || accountRef.department || "",
    role: user?.userType || accountRef.role || "",
    balance: user?.printing?.quota?.remaining ?? accountRef.balance ?? 0,
    pages: user?.statistics?.totalPagesPrinted ?? accountRef.pages ?? 0,
    jobs: user?.statistics?.totalJobsSubmitted ?? accountRef.jobs ?? 0,
    lastActivityAt: user?.statistics?.lastActivityAt || accountRef.lastActivityAt || null,
  };
};

const buildLinkedAccount = async (payload, { isPrimary = false } = {}) => {
  const account = await resolveAccountRef(payload);

  if (!account.username) {
    throw createHttpError(400, "Linked account username or userId is required.");
  }

  return {
    userId: account.userId,
    username: account.username,
    identifier: account.identifier,
    department: account.department,
    role: account.role || payload.role || "",
    status: payload.status || "active",
    balance: account.balance,
    pages: account.pages,
    jobs: account.jobs,
    lastActivityAt: account.lastActivityAt,
    isPrimary,
  };
};

const refreshLinkedRoles = (sharedAccount) => {
  const roles = sharedAccount.linkedAccounts
    .map((account) => account.role)
    .filter(Boolean);
  const suppliedRoles = sharedAccount.linkedRoles || [];

  sharedAccount.linkedRoles = Array.from(new Set([...suppliedRoles, ...roles]));
};

const ensureSinglePrimary = (sharedAccount) => {
  let primaryFound = false;

  sharedAccount.linkedAccounts.forEach((account) => {
    if (!primaryFound && account.isPrimary) {
      primaryFound = true;
      return;
    }

    account.isPrimary = false;
  });

  if (!primaryFound && sharedAccount.linkedAccounts.length > 0) {
    sharedAccount.linkedAccounts[0].isPrimary = true;
  }

  const primary = sharedAccount.linkedAccounts.find((account) => account.isPrimary);

  if (primary) {
    sharedAccount.primaryAccount = {
      userId: primary.userId || null,
      username: primary.username,
    };
  }
};

const assertNoDuplicateLinkedAccount = (sharedAccount, nextAccount) => {
  const duplicate = sharedAccount.linkedAccounts.some((account) => {
    if (nextAccount.userId && toIdString(account.userId) === toIdString(nextAccount.userId)) {
      return true;
    }

    return account.username.toLowerCase() === nextAccount.username.toLowerCase();
  });

  if (duplicate) {
    throw createHttpError(409, "This account is already linked to the shared account.");
  }
};

const getRequiredSharedAccount = async (accountId) => {
  const sharedAccount = await SharedAccount.findById(accountId);

  if (!sharedAccount) {
    throw createHttpError(404, "Shared account not found.");
  }

  return sharedAccount;
};

const formatLinkedAccount = (account) => ({
  id: toIdString(account._id),
  userId: toIdString(account.userId),
  username: account.username,
  identifier: account.identifier || "",
  department: account.department || "",
  role: account.role || "",
  status: account.status,
  statusLabel: linkedStatusLabels[account.status] || account.status,
  balance: account.balance || 0,
  pages: account.pages || 0,
  jobs: account.jobs || 0,
  lastActivityAt: formatDateValue(account.lastActivityAt),
  isPrimary: Boolean(account.isPrimary),
});

const formatSharedAccount = (sharedAccount) => ({
  id: toIdString(sharedAccount._id),
  primaryAccount: {
    userId: toIdString(sharedAccount.primaryAccount?.userId),
    username: sharedAccount.primaryAccount?.username || "",
  },
  linkedAccounts: (sharedAccount.linkedAccounts || []).map(formatLinkedAccount),
  linkedCount: sharedAccount.linkedAccounts?.length || 0,
  linkedRoles: sharedAccount.linkedRoles || [],
  department: sharedAccount.department || "",
  status: sharedAccount.status,
  statusLabel: statusLabels[sharedAccount.status] || sharedAccount.status,
  notes: sharedAccount.notes || "",
  createdAt: sharedAccount.createdAt,
  updatedAt: sharedAccount.updatedAt,
});

const getSharedAccountsData = async () => {
  const accounts = await SharedAccount.find().sort({ createdAt: -1 });

  return {
    summary: {
      total: accounts.length,
      active: accounts.filter((account) => account.status === "active").length,
      review: accounts.filter((account) => account.status === "review").length,
      archived: accounts.filter((account) => account.status === "archived").length,
      linkedAccounts: accounts.reduce(
        (sum, account) => sum + (account.linkedAccounts?.length || 0),
        0,
      ),
    },
    accounts: accounts.map(formatSharedAccount),
  };
};

const createSharedAccountData = async (payload) => {
  const primaryLinkedAccount = await buildLinkedAccount(payload.primaryAccount, {
    isPrimary: true,
  });
  const existingAccount = await SharedAccount.findOne({
    "primaryAccount.username": primaryLinkedAccount.username,
  });

  if (existingAccount) {
    throw createHttpError(409, "A shared account with this primary account already exists.");
  }

  const sharedAccount = new SharedAccount({
    primaryAccount: {
      userId: primaryLinkedAccount.userId,
      username: primaryLinkedAccount.username,
    },
    linkedAccounts: [primaryLinkedAccount],
    linkedRoles: payload.linkedRoles,
    department: payload.department || primaryLinkedAccount.department,
    status: payload.status,
    notes: payload.notes,
  });

  if (payload.linkedAccounts) {
    for (const linkedAccountPayload of payload.linkedAccounts) {
      const linkedAccount = await buildLinkedAccount(linkedAccountPayload);

      if (
        linkedAccount.username.toLowerCase() === primaryLinkedAccount.username.toLowerCase() ||
        (linkedAccount.userId &&
          toIdString(linkedAccount.userId) === toIdString(primaryLinkedAccount.userId))
      ) {
        continue;
      }

      assertNoDuplicateLinkedAccount(sharedAccount, linkedAccount);
      sharedAccount.linkedAccounts.push(linkedAccount);
    }
  }

  refreshLinkedRoles(sharedAccount);
  ensureSinglePrimary(sharedAccount);
  await sharedAccount.save();

  return {
    account: formatSharedAccount(sharedAccount),
  };
};

const updateSharedAccountData = async (accountId, payload) => {
  const sharedAccount = await getRequiredSharedAccount(accountId);

  if (payload.fields.primaryAccount) {
    const primaryLinkedAccount = await buildLinkedAccount(payload.primaryAccount, {
      isPrimary: true,
    });
    const existingAccount = await SharedAccount.findOne({
      _id: { $ne: sharedAccount._id },
      "primaryAccount.username": primaryLinkedAccount.username,
    });

    if (existingAccount) {
      throw createHttpError(409, "A shared account with this primary account already exists.");
    }

    sharedAccount.primaryAccount = {
      userId: primaryLinkedAccount.userId,
      username: primaryLinkedAccount.username,
    };

    const existingPrimary = sharedAccount.linkedAccounts.find(
      (account) =>
        (primaryLinkedAccount.userId &&
          toIdString(account.userId) === toIdString(primaryLinkedAccount.userId)) ||
        account.username.toLowerCase() === primaryLinkedAccount.username.toLowerCase(),
    );

    if (existingPrimary) {
      sharedAccount.linkedAccounts.forEach((account) => {
        account.isPrimary = toIdString(account._id) === toIdString(existingPrimary._id);
      });
    } else {
      sharedAccount.linkedAccounts.forEach((account) => {
        account.isPrimary = false;
      });
      sharedAccount.linkedAccounts.push(primaryLinkedAccount);
    }
  }

  if (payload.fields.linkedAccounts) {
    sharedAccount.linkedAccounts = [];

    for (const linkedAccountPayload of payload.linkedAccounts) {
      const linkedAccount = await buildLinkedAccount(linkedAccountPayload, {
        isPrimary: linkedAccountPayload.isPrimary,
      });

      assertNoDuplicateLinkedAccount(sharedAccount, linkedAccount);
      sharedAccount.linkedAccounts.push(linkedAccount);
    }
  }

  if (payload.fields.linkedRoles) {
    sharedAccount.linkedRoles = payload.linkedRoles;
  }

  if (payload.fields.department) {
    sharedAccount.department = payload.department;
  }

  if (payload.fields.status) {
    sharedAccount.status = payload.status;
  }

  if (payload.fields.notes) {
    sharedAccount.notes = payload.notes;
  }

  refreshLinkedRoles(sharedAccount);
  ensureSinglePrimary(sharedAccount);
  await sharedAccount.save();

  return {
    account: formatSharedAccount(sharedAccount),
  };
};

const changePrimaryAccountData = async (accountId, payload) => {
  const sharedAccount = await getRequiredSharedAccount(accountId);

  const target = sharedAccount.linkedAccounts.find((account) => {
    if (payload.linkedAccountId && toIdString(account._id) === payload.linkedAccountId) {
      return true;
    }

    if (
      payload.accountRef.userId &&
      toIdString(account.userId) === toIdString(payload.accountRef.userId)
    ) {
      return true;
    }

    return (
      payload.accountRef.username &&
      account.username.toLowerCase() === payload.accountRef.username.toLowerCase()
    );
  });

  if (!target) {
    throw createHttpError(404, "Linked account was not found in this grouping.");
  }

  sharedAccount.linkedAccounts.forEach((account) => {
    account.isPrimary = toIdString(account._id) === toIdString(target._id);
  });
  ensureSinglePrimary(sharedAccount);
  await sharedAccount.save();

  return {
    account: formatSharedAccount(sharedAccount),
  };
};

const addLinkedAccountData = async (accountId, payload) => {
  const sharedAccount = await getRequiredSharedAccount(accountId);
  const linkedAccount = await buildLinkedAccount(payload);

  assertNoDuplicateLinkedAccount(sharedAccount, linkedAccount);
  sharedAccount.linkedAccounts.push(linkedAccount);
  refreshLinkedRoles(sharedAccount);
  ensureSinglePrimary(sharedAccount);
  await sharedAccount.save();

  return {
    account: formatSharedAccount(sharedAccount),
  };
};

const updateSharedAccountNotesData = async (accountId, notes) => {
  const sharedAccount = await getRequiredSharedAccount(accountId);

  sharedAccount.notes = notes;
  await sharedAccount.save();

  return {
    account: formatSharedAccount(sharedAccount),
  };
};

const deleteSharedAccountData = async (accountId) => {
  const sharedAccount = await getRequiredSharedAccount(accountId);

  await SharedAccount.deleteOne({ _id: sharedAccount._id });

  return {
    deletedAccountId: accountId,
    deletedPrimaryAccount: sharedAccount.primaryAccount?.username || "",
  };
};

module.exports = {
  getSharedAccountsData,
  createSharedAccountData,
  updateSharedAccountData,
  changePrimaryAccountData,
  addLinkedAccountData,
  updateSharedAccountNotesData,
  deleteSharedAccountData,
};
