import { Router } from "express";
import getAllNewsController from "../controllers/news/getAllNews.controller.js";

const router = Router();

router.get("/", getAllNewsController);

export default router;
