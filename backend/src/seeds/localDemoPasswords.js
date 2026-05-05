const mongoose = require("mongoose");

const env = require("../config/env");
const { connectDatabase } = require("../config/db");
const User = require("../models/User");

const LOCAL_DEMO_PASSWORD = "12345678";

const LOCAL_DEMO_USERS = [
  {
    username: "202279720",
    fullName: "Mohammed Alshammasi",
    email: "mohammed@kfupm.edu.sa",
    role: "User",
    userType: "Student",
    department: "Software Engineering",
    standing: "Senior",
    quota: 24.5,
    legacyPasswords: ["Mohammed@202279720", "user12345"],
  },
  {
    username: "202322750",
    fullName: "Ali Alorud",
    email: "202322750@kfupm.edu.sa",
    role: "User",
    userType: "Student",
    department: "Software Engineering",
    standing: "Junior",
    quota: 50,
    legacyPasswords: ["Ali@202322750", "user12345"],
  },
  {
    username: "202261120",
    fullName: "ALI AREF ALHASHEM",
    email: "s202261120@kfupm.edu.sa",
    role: "User",
    userType: "Student",
    department: "Software Engineering",
    standing: "Student",
    quota: 50,
    legacyPasswords: ["AliAref@202261120"],
  },
  {
    username: "abdulmohseen.alali",
    fullName: "Mr. Abdulmohseen Al Ali",
    email: "abdulmohseen.alali@kfupm.edu.sa",
    role: "User",
    userType: "Staff",
    department: "CCM",
    standing: "Staff",
    quota: 50,
    legacyPasswords: ["Abdulmohseen@CCM1"],
  },
  {
    username: "khadijah.safwan",
    fullName: "Dr. Khadijah Ahmad Matooq AlSafwan",
    email: "khadijah.safwan@kfupm.edu.sa",
    role: "User",
    userType: "Faculty",
    department: "CCM",
    standing: "Faculty",
    quota: 50,
    legacyPasswords: ["Khadijah@CCM1"],
  },
  {
    username: "d-ccm",
    fullName: "Dr. Abdullah Sultan",
    email: "d-ccm@kfupm.edu.sa",
    role: "User",
    userType: "Faculty",
    department: "CCM",
    standing: "Faculty",
    quota: 50,
    legacyPasswords: ["Abdullah@CCM1"],
  },
  {
    username: "admin",
    fullName: "System Administrator",
    email: "admin@ccm-ezprint.local",
    role: "Admin",
    userType: "Staff",
    department: "CCM",
    standing: "Staff",
    quota: 500,
    legacyPasswords: ["admin123"],
  },
  {
    username: "subadmin",
    fullName: "Quota Manager",
    email: "subadmin@ccm-ezprint.local",
    role: "SubAdmin",
    userType: "Staff",
    department: "CCM",
    standing: "Staff",
    quota: 250,
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

const isLocalDemoPassword = (username, password) =>
  isLocalDemoAuthEnabled() &&
  password === LOCAL_DEMO_PASSWORD &&
  Boolean(getLocalDemoUser(username));

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

const ensureLocalDemoUserRecord = async (demoUser) => {
  const username = normalizeUsername(demoUser.username);
  const email = String(demoUser.email || "").trim().toLowerCase();
  let user = await User.findOne({
    $or: [{ username }, ...(email ? [{ email }] : [])],
  }).select("+passwordHash");
  const wasMissing = !user;

  if (!user) {
    user = new User({
      username,
      email,
      fullName: demoUser.fullName,
    });
  }

  user.username = username;
  user.email = email || user.email;
  user.fullName = demoUser.fullName;
  user.role = demoUser.role || "User";
  user.userType = demoUser.userType || (demoUser.role === "User" ? "Student" : "Staff");
  user.department = demoUser.department || "CCM";
  user.standing = demoUser.standing || "Active";
  user.isActive = true;

  if (!user.printing) {
    user.printing = {};
  }

  user.printing.enabled = true;
  user.printing.restricted = false;

  if (!user.printing.quota) {
    user.printing.quota = {};
  }

  if (
    demoUser.quota !== undefined &&
    (user.printing.quota.remaining === undefined || user.printing.quota.remaining === null)
  ) {
    user.printing.quota.remaining = demoUser.quota;
  }

  const shouldBackfill = wasMissing || await shouldBackfillLocalDemoPassword(user);

  if (shouldBackfill) {
    await user.setPassword(LOCAL_DEMO_PASSWORD);
  }

  await user.save();

  return {
    username: user.username,
    role: user.role,
    created: wasMissing,
    updated: shouldBackfill,
  };
};

const ensureLocalDemoPasswords = async () => {
  if (!isLocalDemoAuthEnabled()) {
    return [];
  }

  const results = [];

  for (const demoUser of LOCAL_DEMO_USERS) {
    results.push(await ensureLocalDemoUserRecord(demoUser));
  }

  const updatedCount = results.filter((result) => result.updated).length;
  const createdCount = results.filter((result) => result.created).length;
  console.log(
    `Local demo auth checked ${results.length} users, created ${createdCount}, updated ${updatedCount}.`,
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
