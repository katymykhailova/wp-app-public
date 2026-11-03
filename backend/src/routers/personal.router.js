import { Router } from "express";
import getAllPersonalController from "../controllers/personal/getAllPersonal.controller.js";

const router = Router();

router.get("/", getAllPersonalController);

export default router;
