import { Router } from "express";
import getFirstToSecondPurchaseIntervals from "../controllers/purchases/getFirstToSecondPurchaseIntervals.js";

const router = Router();

router.get(
  "/get-first-to-second-purchase-intervals",
  getFirstToSecondPurchaseIntervals,
);

export default router;
