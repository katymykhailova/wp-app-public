import { Router } from "express";
import { query } from "../util/db2.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM UDVM400DAT.MKUNDE limit 1");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
