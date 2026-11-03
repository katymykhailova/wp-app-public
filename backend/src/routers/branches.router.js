import { Router } from "express";
import getAllBranchesController from "../controllers/branches/getAllBranches.controller.js";

const router = Router();

router.get("/", getAllBranchesController);

export default router;
