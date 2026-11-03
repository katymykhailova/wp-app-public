import jwt from "jsonwebtoken";
import config from "../_config/config.js";

const JWT_KEY = config.jwtKey;

const generateToken = (user) => {
  try {
    const token = jwt.sign(user, JWT_KEY, {
      expiresIn: "1d",
    });
    return token;
  } catch (error) {
    return null;
  }
};

const validateToken = (token) => {
  try {
    const userData = jwt.verify(token, JWT_KEY);
    return userData;
  } catch (error) {
    return null;
  }
};

export default { generateToken, validateToken };
