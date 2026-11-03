import path from "path";

export default (filePath) => {
  const p = filePath.split(path.sep).join("/");
  return p.startsWith("/") ? p : `/${p}`;
};
