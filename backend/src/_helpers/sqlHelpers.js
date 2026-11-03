import { query } from "../util/db2.js";

const IS_PRODUCTION = process.env.IS_PRODUCTION === "true";

const getSqlValues = (arr, key, value) =>
  arr.map((branche) => `(${branche[key]}, '${branche[value]}')`).join(", ");

const defaultTimeGranularity = {
  label: "Zeitintervall",
  fieldKey: "period",
  sortKey: "period_sort",
  defaultGranularity: "month",
  options: [
    { value: "day", label: "Tag" },
    { value: "week", label: "Woche" },
    { value: "month", label: "Monat" },
  ],
};

const getTimeGranularityExpressions = (timeGranularity, query) => {
  if (!timeGranularity) {
    return {};
  }

  const selectedOption =
    timeGranularity.options.find(
      ({ value }) => value === query.timeGranularity
    ) ??
    timeGranularity.options.find(
      ({ value }) => value === timeGranularity.defaultGranularity
    );

  if (!selectedOption) {
    return {};
  }

  const { fieldKey, sortKey } = timeGranularity;

  switch (selectedOption.value) {
    case "week": {
      const date = `DATE(TIMESTAMP_FORMAT(DIGITS(t.${fieldKey}), 'YYYYMMDD'))`;

      const isoWeek = `WEEK_ISO(${date})`;

      const isoYear = `YEAR(${date} + (4 - DAYOFWEEK_ISO(${date})) DAYS)`;

      const weekText = `DIGITS(DECIMAL(${isoWeek}, 2, 0))`;

      const field = `'KW ' || ${weekText} || ' / ' || CHAR(${isoYear})`;

      const sort = `${isoYear} * 100 + ${isoWeek}`;

      return {
        [sortKey]: {
          select: sort,
          groupBy: sort,
        },
        [fieldKey]: {
          select: field,
          groupBy: field,
        },
      };
    }
    case "month": {
      const field = `Substr(char(t.${fieldKey}), 5, 2) || '.' || Substr(char(t.${fieldKey}), 1, 4)`;
      const sort = `INTEGER(Substr(DIGITS(t.${fieldKey}), 1, 6))`;
      return {
        [fieldKey]: { select: field, groupBy: field },
        [sortKey]: { select: sort, groupBy: sort },
      };
    }
    //day
    default: {
      const field = `VARCHAR_FORMAT(DATE(TIMESTAMP_FORMAT(DIGITS(t.${fieldKey}), 'YYYYMMDD')),'DD.MM.YYYY')`;
      return {
        [fieldKey]: { select: field, groupBy: field },
        [sortKey]: {
          select: `t.${fieldKey}`,
          groupBy: `t.${fieldKey}`,
        },
      };
    }
  }
};

const getFieldExpression = (field, fieldExpressions, usage) =>
  fieldExpressions?.[field]?.[usage] ?? `t.${field}`;

const getAggregateExpression = (field, aggregate) => {
  if (typeof aggregate === "string") {
    return `${aggregate}(t.${field}) AS "${field}"`;
  }

  const distinct = aggregate.distinct ? "DISTINCT " : "";

  return `${aggregate.fn}(${distinct}t.${field}) AS "${field}"`;
};

// ? Example:
// getQueryParts({
//   query,
//   defaultFields: [""],
//   technicalFields: [""],
//   aggregateFields: {
//     umsatz_gesamt: { fn: "sum", format: "currency" },
//     oder_umsatz_gesamt: "sum",
//   },
//   defaultOrder: [""],
//   timeGranularity: {
//     label: "Zeitintervall",
//     fieldKey: "period",
//     sortKey: "period_sort",
//     defaultGranularity: "month",
//     options: [
//       { value: "day", label: "Tag" },
//       { value: "week", label: "Woche" },
//       { value: "month", label: "Monat" },
//     ],
//   },
//   resultFields: {
//     id: {
//       label: "id",
//       sortable: false,
//       sortKey: "id",
//       selectable: false,
//       visible: false,
//     },
//   },
// });
const getQueryParts = (option) => {
  const {
    query,
    defaultFields,
    technicalFields,
    aggregateFields,
    timeGranularity,
    defaultOrder,
    resultFields,
  } = option;

  const queryFields =
    query.fields
      ?.split(",")
      .map((field) => field.trim())
      .filter((field) => defaultFields.includes(field)) ??
    defaultFields.filter((field) => !resultFields[field]?.hiddenByDefault);

  const fieldExpressions = getTimeGranularityExpressions(
    timeGranularity,
    query
  );

  const unusedKeys = new Set(
    Object.entries(resultFields)
      .filter(([field]) => !queryFields.includes(field))
      .flatMap(([, { sortKey, filterKey }]) =>
        [sortKey, filterKey].filter(Boolean)
      )
  );

  const fields = [
    ...new Set([
      ...queryFields,
      ...technicalFields.filter((field) => !unusedKeys.has(field)),
    ]),
  ];

  const select = fields
    .map((field) => {
      if (aggregateFields[field]) {
        return getAggregateExpression(field, aggregateFields[field]);
      }
      return `${getFieldExpression(field, fieldExpressions, "select")} AS "${field}"`;
    })
    .join(",\n");

  const queryFilterField = query.filterField || null;
  const filterValue =
    query.filterValue
      ?.split(",")
      .map((field) => field.trim())
      .filter(Boolean) || [];

  const placeholders = Array(filterValue.length).fill("?").join(",");

  const filterField =
    queryFilterField && defaultFields.includes(queryFilterField)
      ? (resultFields[queryFilterField]?.filterKey ?? queryFilterField)
      : null;

  const where =
    filterField && filterValue.length > 0
      ? `WHERE t.${filterField} in (${filterValue.map((field) => `${field}`).join(",\n")})`
      : "";

  const wherePlaceholders =
    filterField && filterValue.length > 0
      ? `WHERE t.${filterField} in (${placeholders})`
      : "";

  const groupFields = fields.filter((field) => !aggregateFields[field]);

  const groupExpressions = groupFields.map((field) =>
    getFieldExpression(field, fieldExpressions, "groupBy")
  );

  const groupingMarkerExpression = "t.grouping_marker";
  const groupBy =
    groupExpressions.length > 0
      ? `GROUP BY GROUPING SETS (
        (${[...groupExpressions, groupingMarkerExpression].join(", ")}),
        ()
      )`
      : "";

  const totalMarker =
    groupExpressions.length > 0
      ? `GROUPING(t.grouping_marker) AS "is_total"`
      : `1 AS "is_total"`;

  const defaultOrderFields = (defaultOrder ?? []).filter((field) =>
    fields.includes(field)
  );

  const defaultOrderBy = defaultOrderFields.length
    ? `ORDER BY ${defaultOrderFields.map((field) => `"${field}"`).join(",\n")}`
    : "";

  const queryOrder = query.order || null;
  const order =
    queryOrder && defaultFields.includes(queryOrder)
      ? (resultFields[queryOrder]?.sortKey ?? queryOrder)
      : null;
  const directionOrder =
    query.direction?.toLowerCase() === "desc" ? "DESC" : "ASC";
  const orderBy = order
    ? `ORDER BY "${order}" ${directionOrder}`
    : defaultOrderBy;
  return {
    select,
    totalMarker,
    where,
    groupBy,
    orderBy,
    wherePlaceholders,
    filterValue,
  };
};

const getQueryData = async (sqlConfig, option = {}) => {
  const { aggregateFields, resultFields, params = [] } = option;

  const timeGranularity = option.timeGranularity
    ? {
        ...defaultTimeGranularity,
        ...(option.timeGranularity === true ? {} : option.timeGranularity),
      }
    : null;

  const {
    select,
    totalMarker,
    where,
    groupBy,
    orderBy,
    wherePlaceholders,
    filterValue,
  } = getQueryParts({ ...option, timeGranularity });

  const withKeyword =
    sqlConfig.recursive && IS_PRODUCTION ? "WITH RECURSIVE" : "WITH";

  const withParts = [
    sqlConfig.cte,
    `t AS (${sqlConfig.source})`,
    `t_grouped AS (
    SELECT
      t.*,
      1 AS grouping_marker
    FROM t
  )`,
  ].filter(Boolean);

  const sql = `
  ${withKeyword} ${withParts.join(",\n")}
  SELECT
    ${select},
    ${totalMarker}
  FROM t_grouped t
  ${wherePlaceholders}
  ${groupBy}
  ${orderBy}`;

  const rows = await query(sql, [...params, ...filterValue]);
  const totalRow = rows.find((row) => row.is_total === 1);
  const result = rows
    .filter((row) => row.is_total === 0)
    .map(({ is_total, ...row }, index) => ({
      id: index + 1,
      ...row,
    }));

  const totals = totalRow
    ? Object.fromEntries(
        Object.entries(aggregateFields).map(([field, aggregate]) => [
          field,
          {
            format:
              resultFields[field]?.format ??
              aggregate?.format ??
              (aggregate === "sum" ? "currency" : "number"),
            value: totalRow[field],
          },
        ])
      )
    : null;

  const data = {
    fields: resultFields,
    ...(timeGranularity && { timeGranularity }),
    totals,
    data: result,
  };

  return data;
};

export default { getSqlValues, getQueryParts, getQueryData };
