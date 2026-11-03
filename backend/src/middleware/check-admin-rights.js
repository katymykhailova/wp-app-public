export const checkAdminRights = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json("Unauthorized");
  }
  if (!req.user.isadmin) {
    return res.status(403).json("Forbidden");
  }
  next();
};
