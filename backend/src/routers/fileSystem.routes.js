import { Router } from "express";
import getAllFilesController from "../controllers/fileSystem/getAllFiles.controller.js";
import downloadFileController from "../controllers/fileSystem/downloadFile.controller.js";
import getPdfAuthors from "../controllers/fileSystem/getPdfAuthors.controller.js";
import openFileController from "../controllers/fileSystem/openFile.controller.js";

const router = Router();

// router.post("/folder", createFolderController);
// router.post("/upload", upload.single("file"), uploadFileController);
// router.post("/copy", copyItemController);
// router.put("/move", moveItemController);
// router.patch("/rename", renameItemController);
// router.delete("/", deleteItemController);
router.get("/", getAllFilesController);
router.post("/download", downloadFileController);
router.get("/open", openFileController);
router.post("/pdf-authors", getPdfAuthors);

export default router;
