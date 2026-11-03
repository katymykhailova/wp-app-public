export default (roles) => (req, res, next) => {
  if (req.user?.isAdmin) return next();

  const userRoles = req.user?.roles ?? [];
  if (userRoles.length === 0) {
    return res.status(403).json({
      code: "INSUFFICIENT_PERMISSIONS",
    });
  } else if (
    !userRoles.some((role) =>
      roles.some((item) => role.toLowerCase() === item.toLowerCase())
    )
  ) {
    return res.status(403).json({
      code: "INSUFFICIENT_PERMISSIONS",
    });
  }

  next();
};
