import { Router } from "express";
import getAllVisitorsController from "../controllers/visitors/getAllVisitors.controller.js";

const router = Router();

router.get("/get-all-visitors", getAllVisitorsController);

export default router;
