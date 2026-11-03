import { Router } from "express";
import getSalesByChannel from "../controllers/sales/getSalesByChannel.controller.js";
import getSalesByBranch from "../controllers/sales/getSalesByBranch.controller.js";
import getSalesQuotations from "../controllers/sales/getSalesQuotations.js";
import getSalesByPostcode from "../controllers/sales/getSalesByPostcode.controller.js";

const router = Router();

router.get("/get-sales-by-channel", getSalesByChannel);
router.get("/get-sales-by-branch", getSalesByBranch);
router.get("/get-sales-quotations", getSalesQuotations);
router.get("/get-sales-by-postcode", getSalesByPostcode);

export default router;
