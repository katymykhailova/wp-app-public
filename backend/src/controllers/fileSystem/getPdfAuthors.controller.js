import { LRUCache } from "lru-cache";
import pLimit from "p-limit";
import { execFile } from "child_process";
import { promisify } from "util";

import resolveInsideBase from "../../_helpers/resolveInsideBase.js";
import config from "../../_config/config.js";

const execFileAsync = promisify(execFile);

const BASE_DIR = config.filesDir;
const options = {
  max: 1000,
  ttl: 1000 * 60 * 60 * 24,
};
const pdfAuthorCache = new LRUCache(options);

const pdfLimit = pLimit(2);

const getPdfAuthor = async (fullPath, updatedAt, size, relativePath) => {
  const cacheKey = `${fullPath}|${updatedAt}|${size}`;
  if (pdfAuthorCache.has(cacheKey)) return pdfAuthorCache.get(cacheKey);
  try {
    const { stdout } = await execFileAsync("pdfinfo", [fullPath], {
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024,
    });
    const meta = {};
    for (const line of stdout.split(/\r?\n/)) {
      const m = line.match(/^([^:]+):\s*(.*)$/);
      if (!m) continue;
      meta[m[1].trim()] = m[2].trim();
    }
    const author = meta["Author"] ?? "";
    pdfAuthorCache.set(cacheKey, { relativePath, author });
    return { relativePath, author };
  } catch {
    return {};
  }
};

export default async (req, res) => {
  let requestedPaths = req.body?.paths || [];

  try {
    const results = await Promise.all(
      requestedPaths.map((entry) => {
        const { relativePath, updatedAt, size } = entry;
        const { target } = resolveInsideBase(BASE_DIR, relativePath);
        return pdfLimit(() =>
          getPdfAuthor(target, updatedAt, size, relativePath),
        );
      }),
    );
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
