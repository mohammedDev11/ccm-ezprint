const User = require("../../models/User");
const {
  loginLocalUser,
  registerLocalUser,
  signAccessToken,
} = require("./auth.service");

const register = async (req, res, next) => {
  try {
    const { username, fullName, email, password, role } = req.body;

    if (!username || !fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "username, fullName, email, and password are required.",
      });
    }

    const user = await registerLocalUser({
      username,
      fullName,
      email,
      password,
      role,
    });

    const token = signAccessToken(user);

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({
        success: false,
        message: "emailOrUsername and password are required.",
      });
    }

    const user = await loginLocalUser({ emailOrUsername, password });
    const token = signAccessToken(user);

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  me,
};
