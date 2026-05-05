const jwt = require("jsonwebtoken");
const env = require("../../config/env");
const User = require("../../models/User");
const {
  isLocalDemoLegacyPassword,
  isLocalDemoPassword,
} = require("../../seeds/localDemoPasswords");

const signAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    },
  );
};

const registerLocalUser = async ({
  username,
  fullName,
  email,
  password,
  role,
}) => {
  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
  });

  if (existingUser) {
    const error = new Error("User with this email or username already exists.");
    error.status = 409;
    throw error;
  }

  const user = new User({
    username,
    fullName,
    email,
    role: role || "User",
    userType: role && role !== "User" ? "Staff" : "Student",
  });

  await user.setPassword(password);
  await user.save();

  return user;
};

const loginLocalUser = async ({ emailOrUsername, password }) => {
  const user = await User.findOne({
    $or: [
      { email: emailOrUsername.toLowerCase() },
      { username: emailOrUsername.toLowerCase() },
    ],
  }).select("+passwordHash");

  if (!user) {
    const error = new Error("Invalid credentials.");
    error.status = 401;
    throw error;
  }

  const isPasswordValid =
    (user.passwordHash && await user.validatePassword(password)) ||
    isLocalDemoPassword(password) ||
    isLocalDemoLegacyPassword(user.username, password);

  if (!isPasswordValid) {
    const error = new Error("Invalid credentials.");
    error.status = 401;
    throw error;
  }

  user.auth.lastLoginAt = new Date();
  user.lastActivity = new Date();
  await user.save();

  return user;
};

module.exports = {
  signAccessToken,
  registerLocalUser,
  loginLocalUser,
};
