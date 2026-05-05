const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request.",
      });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient role permissions.",
      });
    }

    return next();
  };
};

module.exports = {
  requireRole,
};
