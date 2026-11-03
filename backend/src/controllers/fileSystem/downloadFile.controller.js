import path from "path";
import fs from "fs";
import contentDisposition from "content-disposition";
import archiver from "archiver";

import config from "../../_config/config.js";
const BASE_DIR = config.filesDir + "/";

// {
//   "name": "",
//   "isDirectory": true,
//   "relativePath": "",
// }

export default async (req, res) => {
  try {
    let files = req.body?.files;

    if (!files) {
      return res.status(400).json({
        error: "Invalid request body",
      });
    }

    const isMultipleFiles = Array.isArray(files);
    const isSingleFile = !isMultipleFiles;

    if (!files || (!isSingleFile && !isMultipleFiles)) {
      return res.status(400).json({
        error: "Invalid request body, expected a file or an array of file.",
      });
    }

    if (isSingleFile) {
      const file = files;

      if (file.isDirectory) {
        files = [files];
      } else {
        const filePath = path.join(BASE_DIR, file.relativePath);

        if (fs.existsSync(filePath)) {
          res.setHeader(
            "Content-Disposition",
            contentDisposition(file.name, { type: "attachment" }),
          );

          const headers = res.getHeaders();
          console.log(headers);

          return res.sendFile(filePath, (error) => {
            if (!error) {
              console.log("File sent successfully:", filePath);
              return;
            }

            console.error("sendFile error:", {
              filePath,
              code: error.code,
              message: error.message,
              status: error.status,
              headersSent: res.headersSent,
            });

            if (!res.headersSent) {
              return res.status(error.status || 500).json({
                error: "File could not be sent",
              });
            }

            res.destroy(error);
          });
        } else {
          return res.status(404).send("File not found");
        }
      }
    }

    const multipleFiles = files;
    if (!multipleFiles || multipleFiles.length !== files.length) {
      return res
        .status(404)
        .json({ error: "One or more of the provided file IDs do not exist." });
    }

    const archive = archiver("zip", { zlib: { level: 3 } });

    archive.on("error", (err) => {
      throw err;
    });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader(
      "Content-Disposition",
      contentDisposition("download", { type: "attachment" }),
    );

    archive.pipe(res);

    multipleFiles.forEach((file) => {
      const filePath = path.join(BASE_DIR, file.relativePath);
      if (fs.existsSync(filePath)) {
        if (file.isDirectory) {
          archive.directory(filePath, file.name);
        } else {
          archive.file(filePath, { name: file.name });
        }
      } else {
        console.log("File not found");
      }
    });

    await archive.finalize();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
