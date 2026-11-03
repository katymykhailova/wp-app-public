import { Router } from "express";
import getAllStoresController from "../controllers/stores/getAllStores.controller.js";

const router = Router();

router.get("/", getAllStoresController);

export default router;
