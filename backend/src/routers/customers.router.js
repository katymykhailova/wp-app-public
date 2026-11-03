import { Router } from "express";
import getAllNewsletterController from "../controllers/customers/getAllNewsletter.controller.js";
import getMonthlyCustomerStatistics from "../controllers/customers/getMonthlyCustomerStatistics.js";

const router = Router();

router.get("/get-all-newsletter", getAllNewsletterController);
router.get("/get-monthly-customer-statistics", getMonthlyCustomerStatistics);

export default router;
