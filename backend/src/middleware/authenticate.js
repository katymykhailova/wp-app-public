import jwt from "../_services/tokenService.js";

export default (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next();
  }

  try {
    const tokenData = jwt.validateToken(token);
    if (!tokenData) return next();

    const user = {
      username: tokenData.username,
      dn: tokenData.dn,
      displayName: tokenData.displayName,
      mail: tokenData.mail,
      department: tokenData.department,
      roles: tokenData.roles,
    };

    req.user = user;

    const newToken = jwt.generateToken(user);

    if (newToken) {
      res.cookie("token", newToken, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
    }
  } catch {}

  next();
};
