import { Router } from "express";
import getAllSuppliersController from "../controllers/suppliers/getAllSuppliers.controller.js";

const router = Router();

router.get("/", getAllSuppliersController);

export default router;
