import path from "path";
import fsPromises from "fs/promises";
import pLimit from "p-limit";

import toPosix from "../../_helpers/toPosix.js";
import config from "../../_config/config.js";
import resolveInsideBase from "../../_helpers/resolveInsideBase.js";

const BASE_DIR = config.filesDir;
const statLimit = pLimit(32);
const entryLimit = pLimit(8);

const processEntry = async (entry, currentPath, currentBase) => {
  const fullPath = path.join(currentPath, entry.name);
  const relativePath = path.join(currentBase, entry.name);
  try {
    const isDirectory = entry.isDirectory();

    const absolutePath = toPosix(relativePath);

    const item = {
      name: entry.name,
      isDirectory,
      path: absolutePath,
      relativePath: relativePath,
    };

    if (!isDirectory) {
      const stats = await statLimit(() => fsPromises.stat(fullPath));
      const isPdf = path.extname(entry.name).toLowerCase() === ".pdf";
      item.updatedAt = stats.mtime.toISOString();
      item.size = stats.size;
      item.isPdf = isPdf;
    }
    return { item, fullPath, relativePath, isDirectory };
  } catch (e) {
    console.error(`Skip file ${entry.name}:`, e.message);
    return null;
  }
};

const getFileStructure = async (dirPath, basePath = "") => {
  const stack = [{ dirPath, basePath }];
  const structure = [];

  while (stack.length > 0) {
    const { dirPath: currentPath, basePath: currentBase } = stack.pop();

    try {
      const entries = (
        await fsPromises.readdir(currentPath, { withFileTypes: true })
      ).filter((i) => {
        return !i.name.startsWith(".") && !i.name.includes(".db");
      });

      const results = await Promise.all(
        entries.map((entry) =>
          entryLimit(() => processEntry(entry, currentPath, currentBase)),
        ),
      );

      for (const res of results) {
        if (!res) continue;
        structure.push(res.item);

        if (res.isDirectory) {
          stack.push({ dirPath: res.fullPath, basePath: res.relativePath });
        }
      }
    } catch (error) {
      console.error(`Directory skip ${currentPath}:`, error.message);
    }
  }
  return structure;
};

export default async (req, res) => {
  let requestedPath = req.body?.path || "";
  const { target } = resolveInsideBase(BASE_DIR, requestedPath);

  try {
    const files = await getFileStructure(target, requestedPath);
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
