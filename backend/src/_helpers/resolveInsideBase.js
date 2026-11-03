import path from "path";

export default (baseDir, requestedPath = "") => {
  const base = path.resolve(baseDir);

  if (path.isAbsolute(requestedPath)) {
    throw new Error("Access denied");
  }

  const target = path.resolve(base, requestedPath);

  if (target !== base && !target.startsWith(base + path.sep)) {
    throw new Error("Access denied");
  }

  return { base, target };
};
