export const restoreUmlauts = (str = "") => {
  return str.replace(/ae/g, "ä").replace(/oe/g, "ö").replace(/ue/g, "ü");
};

export const getcity = (branches, citySlug = "") => {
  return (
    branches.find((i) => i.citySlug === citySlug.toLowerCase())?.city ||
    citySlug
  );
};

export const isDateString = (value) => {
  return typeof value === "string" && /^\d{2}\.\d{2}\.\d{4}$/.test(value);
};

export const exportToCsv = (data, fileName = "export.csv") => {
  if (!data.length) return;

  const headers = Object.keys(data[0]);

  const escapeCsvValue = (value) => {
    if (value === null || value === undefined) return "";

    const stringValue = String(value).replaceAll('"', '""');

    return `"${stringValue}"`;
  };

  const rows = [
    headers.map(escapeCsvValue).join(";"),
    ...data.map((row) =>
      headers.map((header) => escapeCsvValue(row[header])).join(";")
    ),
  ];

  const csvContent = "\uFEFF" + rows.join("\r\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

export const formatNumber = (
  value,
  format,
  options = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }
) => {
  format = format ?? "currency";
  return format === "currency"
    ? new Intl.NumberFormat("de-DE", options).format(value)
    : Number(value).toLocaleString("de-DE");
};
