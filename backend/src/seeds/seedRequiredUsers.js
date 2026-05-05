const mongoose = require("mongoose");

const env = require("../config/env");
const { connectDatabase } = require("../config/db");
const User = require("../models/User");

const requiredUsers = [
  {
    username: "202279720",
    fullName: "Mohammed Alshammasi",
    email: "mohammed@kfupm.edu.sa",
    systemRole: "User",
    userType: "Student",
    department: "Software Engineering",
    standing: "Student",
    password: "12345678",
  },
  {
    username: "202322750",
    fullName: "Ali Aloryd",
    email: "202322750@kfupm.edu.sa",
    systemRole: "User",
    userType: "Student",
    department: "Software Engineering",
    standing: "Student",
    password: "12345678",
  },
  {
    username: "202261120",
    fullName: "ALI AREF ALHASHEM",
    email: "s202261120@kfupm.edu.sa",
    systemRole: "User",
    userType: "Student",
    department: "Software Engineering",
    standing: "Student",
    password: "12345678",
  },
  {
    username: "d-ccm",
    fullName: "Dr. Abdullah Sultan",
    email: "d-ccm@kfupm.edu.sa",
    systemRole: "User",
    userType: "Faculty",
    department: "CCM",
    standing: "Faculty",
    password: "12345678",
  },
  {
    username: "khadijah.safwan",
    fullName: "Dr. Khadijah Ahmad Matooq AlSafwan",
    email: "khadijah.safwan@kfupm.edu.sa",
    systemRole: "User",
    userType: "Faculty",
    department: "CCM",
    standing: "Faculty",
    password: "12345678",
  },
  {
    username: "abdulmohseen.alali",
    fullName: "Mr. Abdulmohseen Al Ali",
    email: "abdulmohseen.alali@kfupm.edu.sa",
    systemRole: "User",
    userType: "Staff",
    department: "CCM",
    standing: "Staff",
    password: "12345678",
  },
];

const normalize = (value) => value.trim().toLowerCase();

const upsertRequiredUser = async (seedUser) => {
  const username = normalize(seedUser.username);
  const email = normalize(seedUser.email);
  const usernameMatch = await User.findOne({ username }).select("+passwordHash");
  const emailMatch = await User.findOne({ email }).select("+passwordHash");

  if (
    usernameMatch &&
    emailMatch &&
    usernameMatch._id.toString() !== emailMatch._id.toString()
  ) {
    throw new Error(
      `Cannot upsert ${username}: username and email belong to different users.`,
    );
  }

  const user =
    usernameMatch ||
    emailMatch ||
    new User({
      username,
      email,
      fullName: seedUser.fullName,
    });

  user.username = username;
  user.email = email;
  user.fullName = seedUser.fullName;
  user.role = seedUser.systemRole;
  user.userType = seedUser.userType;
  user.department = seedUser.department;
  user.standing = seedUser.standing;
  user.isActive = true;

  if (!user.printing) {
    user.printing = {};
  }

  user.printing.enabled = true;

  await user.setPassword(seedUser.password);
  await user.save();

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    userType: user.userType,
  };
};

const seedRequiredUsers = async () => {
  await connectDatabase();
  console.log(`Connected to MongoDB "${env.mongoDbName}" for required user upsert.`);

  const results = [];

  for (const seedUser of requiredUsers) {
    results.push(await upsertRequiredUser(seedUser));
  }

  console.table(results);
};

seedRequiredUsers()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
