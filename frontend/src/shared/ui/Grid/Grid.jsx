import { memo } from "react";
import s from "./Grid.module.scss";

import { formatNumber } from "@/shared/util";

const Grid = ({ data = [], columns: columnsProp = [], totals = {} }) => {
  const hasTotals = Object.keys(totals).length > 0;
  if (data.length === 0 && !hasTotals) {
    return null;
  }
  const columns =
    columnsProp.length > 0
      ? columnsProp
      : data.length > 0
        ? Object.keys(data[0])
            .filter((key) => key !== "id")
            .map((key) => ({
              key,
              label: key,
            }))
        : [];

  return (
    <div className={s.grid} style={{ "--columns-count": columns.length }}>
      {columns.map(({ key, label }) => (
        <div className={s.headerCell} key={`header-${key}`}>
          <div>{label}</div>
        </div>
      ))}
      {hasTotals &&
        columns.map(({ key }) => {
          const { value, format } = totals[key] ?? {};

          return (
            <div className={s.totalsCell} key={`total-${key}`}>
              {format === "number" || format === "currency"
                ? formatNumber(value ?? 0, format)
                : (value ?? "")}
            </div>
          );
        })}
      {data.length > 0 &&
        data.map((row, rowIndex) =>
          columns.map(({ key, format }) => {
            const totalFormat = totals?.[key]?.format;
            const fieldFormat =
              format === "number" || format === "currency" ? format : null;

            const valueFormat =
              totalFormat === "number" || totalFormat === "currency"
                ? totalFormat
                : fieldFormat;

            return (
              <div className={s.cell} key={`${row.id ?? rowIndex}-${key}`}>
                {valueFormat
                  ? formatNumber(row[key] ?? 0, valueFormat)
                  : (row[key] ?? "")}
              </div>
            );
          }),
        )}
    </div>
  );
};

export default memo(Grid);
