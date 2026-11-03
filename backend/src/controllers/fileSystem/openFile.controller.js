import path from "path";
import fs from "fs";
import contentDisposition from "content-disposition";

import config from "../../_config/config.js";

const BASE_DIR = path.resolve(config.filesDir);

export default (req, res) => {
  try {
    const relativePath = req.query.path;
    const action = req.query.action || "open";
    const dispositionType = action === "open" ? "inline" : "attachment";

    if (!relativePath || typeof relativePath !== "string") {
      return res.status(400).json({
        error: "Invalid file path",
      });
    }

    const filePath = path.resolve(BASE_DIR, relativePath);
    const relativeToBase = path.relative(BASE_DIR, filePath);
    const fileName = path.basename(filePath);

    if (relativeToBase.startsWith("..") || path.isAbsolute(relativeToBase)) {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: "File not found",
      });
    }

    const stat = fs.statSync(filePath);

    if (!stat.isFile()) {
      return res.status(400).json({
        error: "The requested path is not a file",
      });
    }

    res.setHeader(
      "Content-Disposition",
      contentDisposition(fileName, {
        type: dispositionType,
      }),
    );

    return res.sendFile(filePath, (error) => {
      if (!error) return;

      console.error("sendFile error:", {
        filePath,
        code: error.code,
        message: error.message,
        headersSent: res.headersSent,
      });

      if (!res.headersSent) {
        res.status(error.status || 500).json({
          error: "File could not be sent",
        });
      } else {
        res.destroy(error);
      }
    });
  } catch (error) {
    console.error("Open file error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.destroy(error);
  }
};
