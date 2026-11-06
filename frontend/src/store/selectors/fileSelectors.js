export const selectFilteredFiles = (
  files,
  searchTerm,
  authors = [],
  currentFolder = "",
) => {
  if (!files) return [];

  const search = searchTerm?.trim().toLowerCase() || "";
  const hasSearch = search.length > 0;
  const hasAuthors = authors.length > 0;
  const authorsLower = hasAuthors ? authors.map((a) => a.toLowerCase()) : [];
  const needPath = hasSearch || hasAuthors;

  const filteredFiles = [];

  for (const file of files) {
    if (needPath && file.isDirectory) continue;

    if (hasAuthors) {
      if (!file?.isPdf) continue;
      const authorLower = (file.author ?? "").toLowerCase();
      if (!authorsLower.some((a) => authorLower.includes(a))) continue;
    }

    if (hasSearch) {
      if (!file.name.toLowerCase().includes(search)) continue;
    }

    filteredFiles.push(
      needPath ? { ...file, path: `${currentFolder}/${file.name}` } : file,
    );
  }
  return filteredFiles;
};

export const getFilesByCategory = (files = [], categories = []) => {
  const fileCategories = Array.isArray(categories) ? categories : [categories];
  if (files.length === 0) return [];

  if (fileCategories[0] === "all") return files;
  const lowerCategories = fileCategories.map((c) => `/${c.toLowerCase()}`);
  const result = [];

  files.forEach((file) => {
    const lowerPath = file.path.toLowerCase();

    const matchedCategory = lowerCategories.find((category) =>
      lowerPath.includes(category),
    );

    if (!matchedCategory) return;

    const idx = lowerPath.indexOf(matchedCategory);
    const path = idx > 1 ? file.path.slice(idx) : file.path;

    result.push({ ...file, path });
  });

  return result;
};
