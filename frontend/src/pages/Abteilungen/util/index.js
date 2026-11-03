export const filterPersonal = (
  arr = [],
  needle = "",
  propertyName = "",
  sort = "",
) => {
  const needleNorm = needle.toLowerCase().trim();
  const contactList = arr.filter((item) => {
    const values = item?.[propertyName];

    if (!Array.isArray(values)) return false;

    return values.some((div) => div?.toLowerCase().includes(needleNorm));
  });
  if (sort !== "")
    return contactList.sort((a, b) => {
      if (Array.isArray(a[sort])) {
        return (a[sort][0] ?? "").localeCompare(b[sort][0] ?? "");
      }

      return (a[sort] ?? "").localeCompare(b[sort] ?? "");
    });
  return contactList;
};
