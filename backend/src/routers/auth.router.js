import { Router } from "express";
import loginController from "../controllers/auth/login.controller.js";
import logoutController from "../controllers/auth/logout.controller.js";

const router = Router();

router.post("/login", loginController);
router.post("/logout", logoutController);
router.get("/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      authenticated: false,
    });
  }

  res.json({
    authenticated: true,
    user: req.user,
  });
});

export default router;
