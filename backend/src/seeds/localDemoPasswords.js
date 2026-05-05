const mongoose = require("mongoose");

const env = require("../config/env");
const { connectDatabase } = require("../config/db");
const User = require("../models/User");

const LOCAL_DEMO_PASSWORD = "12345678";

const LOCAL_DEMO_USERS = [
  {
    username: "202279720",
    legacyPasswords: ["Mohammed@202279720", "user12345"],
  },
  {
    username: "202322750",
    legacyPasswords: ["Ali@202322750", "user12345"],
  },
  {
    username: "202261120",
    legacyPasswords: ["AliAref@202261120"],
  },
  {
    username: "abdulmohseen.alali",
    legacyPasswords: ["Abdulmohseen@CCM1"],
  },
  {
    username: "khadijah.safwan",
    legacyPasswords: ["Khadijah@CCM1"],
  },
  {
    username: "d-ccm",
    legacyPasswords: ["Abdullah@CCM1"],
  },
  {
    username: "admin",
    legacyPasswords: ["admin123"],
  },
  {
    username: "subadmin",
    legacyPasswords: ["subadmin123"],
  },
];

const LOCAL_DEMO_USER_MAP = new Map(
  LOCAL_DEMO_USERS.map((user) => [user.username, user]),
);

const normalizeUsername = (value = "") => String(value).trim().toLowerCase();

const isLocalDemoAuthEnabled = () => env.nodeEnv !== "production";

const getLocalDemoUser = (username) =>
  LOCAL_DEMO_USER_MAP.get(normalizeUsername(username));

const isLocalDemoPassword = (password) =>
  isLocalDemoAuthEnabled() && password === LOCAL_DEMO_PASSWORD;

const isLocalDemoLegacyPassword = (username, password) => {
  if (!isLocalDemoAuthEnabled()) {
    return false;
  }

  const user = getLocalDemoUser(username);

  return Boolean(user && user.legacyPasswords.includes(password));
};

const shouldBackfillLocalDemoPassword = async (user) => {
  const demoUser = getLocalDemoUser(user.username);

  if (!demoUser || !isLocalDemoAuthEnabled()) {
    return false;
  }

  if (!user.passwordHash) {
    return true;
  }

  if (await user.validatePassword(LOCAL_DEMO_PASSWORD)) {
    return false;
  }

  for (const legacyPassword of demoUser.legacyPasswords) {
    if (await user.validatePassword(legacyPassword)) {
      return true;
    }
  }

  return false;
};

const ensureLocalDemoPasswords = async () => {
  if (!isLocalDemoAuthEnabled()) {
    return [];
  }

  const usernames = LOCAL_DEMO_USERS.map((user) => user.username);
  const users = await User.find({ username: { $in: usernames } }).select(
    "+passwordHash",
  );
  const results = [];

  for (const user of users) {
    const shouldBackfill = await shouldBackfillLocalDemoPassword(user);

    if (shouldBackfill) {
      await user.setPassword(LOCAL_DEMO_PASSWORD);
      await user.save();
    }

    results.push({
      username: user.username,
      role: user.role,
      updated: shouldBackfill,
    });
  }

  const foundUsernames = new Set(users.map((user) => user.username));
  const missingUsernames = usernames.filter(
    (username) => !foundUsernames.has(username),
  );

  for (const username of missingUsernames) {
    results.push({
      username,
      role: "missing",
      updated: false,
    });
  }

  const updatedCount = results.filter((result) => result.updated).length;
  console.log(
    `Local demo auth password backfill checked ${results.length} users, updated ${updatedCount}.`,
  );

  return results;
};

if (require.main === module) {
  connectDatabase()
    .then(async () => {
      console.log(
        `Connected to MongoDB "${env.mongoDbName}" for local auth backfill.`,
      );
      const results = await ensureLocalDemoPasswords();
      console.table(results);
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await mongoose.disconnect();
    });
}

module.exports = {
  LOCAL_DEMO_PASSWORD,
  ensureLocalDemoPasswords,
  isLocalDemoPassword,
  isLocalDemoLegacyPassword,
};
