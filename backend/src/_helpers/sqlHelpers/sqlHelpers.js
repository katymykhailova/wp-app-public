import { query, queryMultiple } from "../../util/db2.js";
import { isInvalidObject, isInvalidArray } from "../is-invalid-var.js";
import { operatorsByType } from "../../_config/constants.js";

const ibmi = process.env.DSN === "WhosPerfect";

const defaultTimeGranularity = {
  label: "Zeitraum",
  fieldKey: "period",
  sortKey: "period_sort",
  defaultGranularity: "month",
  options: [
    { value: "day", label: "Tag" },
    { value: "week", label: "Woche" },
    { value: "month", label: "Monat" },
  ],
};

const getSqlValues = (arr, key, value) => {
  const escapeSqlString = (value) => String(value).replaceAll("'", "''");
  return arr
    .map((item) => `(${item[key]}, '${escapeSqlString(item[value])}')`)
    .join(", ");
};

const getAllowedOperators = (field) =>
  field?.filterOperator ?? operatorsByType[field?.type || "text"] ?? [];

const getDefaultFields = (resultFields) =>
  Object.entries(resultFields)
    .filter(
      ([, config]) => !config.hiddenByDefault && config.queryable !== false,
    )
    .map(([field]) => field);

const parseQueryParams = (value, type = "object") => {
  const fallback = type === "object" ? {} : [];
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value);
    switch (type) {
      case "object":
        return isInvalidObject(parsed, true) ? {} : parsed;
      case "array":
        return isInvalidArray(parsed, true) ? [] : parsed;
      default:
        return fallback;
    }
  } catch {
    return fallback;
  }
};

const getTimeGranularity = (options) => {
  return options.timeGranularity
    ? {
        ...defaultTimeGranularity,
        ...(options.timeGranularity === true ? {} : options.timeGranularity),
      }
    : null;
};

const normalizeOptions = (options = {}) => {
  return {
    ...options,
    timeGranularity: getTimeGranularity(options),
    grouping: {
      mode: "standard",
      totals: true,
      ...options.grouping,
    },
  };
};

const getFieldParts = (options) => {
  const { query, resultFields, grouping } = options;
  const { mode } = grouping;
  const isHierarchical = mode === "hierarchical";

  const { fieldKey: timeFieldKey, sortKey: timeSortKey } =
    defaultTimeGranularity;

  const aggregateFields = Object.fromEntries(
    Object.entries(options.resultFields ?? {}).filter(
      ([, config]) => config.aggregate,
    ),
  );

  const filterFields = Object.entries(resultFields)
    .filter(([, config]) => config.filterable)
    .map(([field, { filterKey }]) => filterKey ?? field);

  const queryFields = query.fields
    ? query.fields
        .split(",")
        .map((field) => field.trim())
        .filter((field) => {
          const config = resultFields[field];
          return config && config.queryable !== false;
        })
    : getDefaultFields(resultFields);

  const defaultOrder = Object.entries(resultFields)
    .filter(
      ([field, config]) => config.defaultOrder && queryFields.includes(field),
    )
    .sort(([, a], [, b]) => a.defaultOrder.priority - b.defaultOrder.priority)
    .map(([field, { defaultOrder, sortKey }]) => ({
      field: sortKey ?? field,
      direction: defaultOrder.direction ?? "ASC",
    }));

  const grainFields = [
    ...new Set(
      queryFields.flatMap((field) => aggregateFields[field]?.grain ?? []),
    ),
  ];

  const requiresGrainGrouping = grainFields.length > 0;

  const requiredFields = Object.entries(resultFields)
    .filter(([, { required }]) => required)
    .map(([field]) => field);

  const technicalFields = Object.entries(resultFields)
    .filter(([field]) => queryFields.includes(field))
    .flatMap(([, { sortKey, filterKey }]) =>
      [sortKey, filterKey].filter((field) => field && field !== timeSortKey),
    );

  const timeSortFields = [
    ...queryFields,
    ...requiredFields,
    ...technicalFields,
  ].includes(timeFieldKey)
    ? [timeSortKey]
    : [];

  const fields = [
    ...new Set([
      ...queryFields,
      ...requiredFields,
      ...technicalFields,
      ...timeSortFields,
    ]),
  ];
  const dimensions = fields.filter(
    (field) => !aggregateFields[field] && field !== timeSortKey,
  );
  const groupingDimensions = dimensions.map((field) => `g_${field}`);

  const groupingSets = isHierarchical
    ? [
        ...dimensions.map((_, index) => [
          ...dimensions.slice(0, dimensions.length - index),
          ...grainFields,
        ]),
        [...grainFields],
      ]
    : [];

  const selectedFields = [
    ...new Set([...fields, ...(isHierarchical ? groupingDimensions : [])]),
  ];

  const preAggregateFields =
    requiresGrainGrouping || isHierarchical
      ? selectedFields.filter((field) => field !== timeSortKey)
      : [];

  const expressionFields = [...new Set([...selectedFields, ...filterFields])];

  const groupFields = selectedFields.filter((field) => !aggregateFields[field]);

  return {
    fields,
    aggregateFields,
    dimensions,
    selectedFields,
    groupingSets,
    requiresGrainGrouping,
    expressionFields,
    preAggregateFields,
    groupingDimensions,
    groupFields,
    defaultOrder,
  };
};

const getQueryOptions = (fieldParts, options, sqlConfig) => {
  const { selectedFields } = fieldParts;
  const { query, resultFields } = options;

  const parseQueryFilter = parseQueryParams(query.filter, "array")
    .filter((filter) => {
      if (!filter || typeof filter !== "object" || Array.isArray(filter)) {
        return false;
      }

      const { field, value, operator } = filter;

      if (!resultFields[field]) {
        return false;
      }

      const allowedOperators = getAllowedOperators(resultFields[field]);

      return (
        Array.isArray(value) &&
        value.length > 0 &&
        allowedOperators.includes(operator) &&
        resultFields[field]?.filterable
      );
    })
    .map((filter) => {
      const { field } = filter;
      return {
        ...filter,
        filterKey: resultFields[field].filterKey ?? field,
      };
    });

  const sourceFilter = sqlConfig.sourceFilter ?? {};

  const queryFilter = parseQueryFilter.filter(
    ({ field }) => !sourceFilter[field],
  );

  const querySourceFilter = parseQueryFilter.filter(
    ({ field }) => sourceFilter[field],
  );

  const queryOrder = parseQueryParams(query.order, "array")
    .filter(
      (item) =>
        item?.field &&
        selectedFields.includes(item.field) &&
        resultFields[item.field]?.sortable,
    )
    .map(({ field, direction }) => ({
      field: resultFields[field]?.sortKey ?? field,
      direction: direction?.toLowerCase() === "desc" ? "DESC" : "ASC",
    }));

  return { queryFilter, querySourceFilter, queryOrder };
};

const getTimeGranularityExpressions = (timeGranularity, query) => {
  if (!timeGranularity) {
    return {};
  }

  const selectedOption =
    timeGranularity.options.find(
      ({ value }) => value === query.timeGranularity,
    ) ??
    timeGranularity.options.find(
      ({ value }) => value === timeGranularity.defaultGranularity,
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
          filter: sort,
        },
      };
    }
    case "month": {
      const field = `Substr(char(t.${fieldKey}), 5, 2) || '.' || Substr(char(t.${fieldKey}), 1, 4)`;
      const sort = `INTEGER(Substr(DIGITS(t.${fieldKey}), 1, 6))`;
      return {
        [fieldKey]: { select: field, groupBy: field, filter: sort },
        [sortKey]: { select: sort, groupBy: sort },
      };
    }
    //day
    default: {
      const field = `VARCHAR_FORMAT(DATE(TIMESTAMP_FORMAT(DIGITS(t.${fieldKey}), 'YYYYMMDD')),'DD.MM.YYYY')`;
      return {
        [fieldKey]: { select: field, groupBy: field, filter: `t.${fieldKey}` },
        [sortKey]: {
          select: `t.${fieldKey}`,
          groupBy: `t.${fieldKey}`,
        },
      };
    }
  }
};

const getAggregateExpression = (
  field,
  aggregateConfig,
  preAggregate = false,
) => {
  const distinct = preAggregate
    ? aggregateConfig.grainDistinct
    : aggregateConfig.distinct;
  const cast = preAggregate ? aggregateConfig.grainCast : aggregateConfig.cast;
  const fn = preAggregate
    ? (aggregateConfig.grainFn ?? aggregateConfig.fn)
    : aggregateConfig.fn;

  const expression = `${fn}(${distinct ? "DISTINCT " : ""}t.${field})`;

  return cast ? `CAST(${expression} AS ${cast})` : expression;
};

const buildFieldExpressions = (
  fields,
  aggregateFields,
  timeExpressions,
  groupingDimensions = [],
  preAggregate = false,
) => {
  return Object.fromEntries(
    fields.map((field) => {
      if (groupingDimensions.includes(field)) {
        return [
          field,
          {
            select: `GROUPING(t.${field.slice(2)})`,
            groupBy: null,
          },
        ];
      }
      const aggregateConfig = aggregateFields[field];
      const timeConfig = timeExpressions[field];
      if (aggregateConfig) {
        const select = getAggregateExpression(
          field,
          aggregateConfig,
          preAggregate,
        );
        const source = `t.${field}`;
        const scope = aggregateConfig.scope ?? "aggregate";
        return [
          field,
          {
            select,
            filter: scope === "source" ? source : select,
            scope,
            groupBy: null,
            sort: `"${field}"`,
          },
        ];
      }
      const select = timeConfig?.select ?? `t.${field}`;
      const groupBy = timeConfig?.groupBy ?? select;
      const filter = timeConfig?.filter ?? timeConfig?.select ?? `t.${field}`;
      const sort = `"${field}"`;

      return [field, { select, filter, scope: "source", groupBy, sort }];
    }),
  );
};

const getFieldExpressions = (fieldParts, options) => {
  const {
    aggregateFields,
    preAggregateFields,
    groupingDimensions,
    expressionFields,
    groupFields,
  } = fieldParts;
  const { query, timeGranularity } = options;
  const timeExpressions = getTimeGranularityExpressions(timeGranularity, query);

  const preAggregateExpressions = buildFieldExpressions(
    preAggregateFields,
    aggregateFields,
    {},
    groupingDimensions,
    true,
  );

  const fieldsExpressions = buildFieldExpressions(
    expressionFields,
    aggregateFields,
    timeExpressions,
  );

  const groupExpressions = groupFields
    .map((field) => fieldsExpressions[field]?.groupBy)
    .filter(Boolean);

  return {
    timeExpressions,
    fieldsExpressions,
    preAggregateExpressions,
    groupExpressions,
  };
};

const getTotalExpression = (field, aggregate) => {
  // const { fn, distinct } = config;
  // if (
  //   distinct ||
  //   !["sum", "count", "min", "max"].includes(fn.toLowerCase())
  // ) {
  //   throw new Error(`Total aggregation is not supported for field: ${field}`);
  // }

  const fn = aggregate.fn.toLowerCase();

  if (fn === "avg") {
    return `SUM(t."${field}__sum") /
      NULLIF(SUM(t."${field}__count"), 0)`;
  }

  const totalFn = ["count", "sum"].includes(fn) ? "SUM" : fn.toUpperCase();

  return `${totalFn}(t."${field}")`;
};

const getTotalSelect = (fieldParts) => {
  const { selectedFields, aggregateFields } = fieldParts;

  return selectedFields
    .map((field) => {
      const aggregate = aggregateFields[field];

      if (!aggregate) {
        return `t."${field}" AS "${field}"`;
      }

      return `${getTotalExpression(field, aggregate)} AS "${field}"`;
    })
    .join(",\n");
};

const buildSelect = (fields, fieldsExpressions, preAggregate = false) => {
  return fields
    .map((field) => {
      const alias = preAggregate ? field : `"${field}"`;
      return `${fieldsExpressions[field].select} AS ${alias}`;
    })
    .join(",\n");
};

const buildFilter = (filters, fieldsExpressions, clause = "WHERE") => {
  const params = [];
  const conditions = [];

  for (const { filterKey, value, operator } of filters) {
    const expression = fieldsExpressions[filterKey].filter;

    if (operator === "in" || operator === "not in") {
      const placeholders = value.map(() => "?").join(", ");
      conditions.push(`${expression} ${operator} (${placeholders})`);
      params.push(...value);
    } else if (operator === "like") {
      conditions.push(`${expression} LIKE ?`);
      params.push(`%${value[0]}%`);
    } else {
      conditions.push(`${expression} ${operator} ?`);
      params.push(value[0]);
    }
  }

  return {
    sql: conditions.length ? `${clause} ${conditions.join(" AND\n")}` : "",
    params,
  };
};

const getFilter = (queryOptions, fieldExpressions) => {
  const { queryFilter } = queryOptions;
  const { fieldsExpressions } = fieldExpressions;

  const whereFilters = queryFilter.filter(
    ({ filterKey }) => fieldsExpressions[filterKey]?.scope === "source",
  );

  const havingFilters = queryFilter.filter(
    ({ filterKey }) => fieldsExpressions[filterKey]?.scope === "aggregate",
  );

  const where = buildFilter(whereFilters, fieldsExpressions);
  const having = buildFilter(havingFilters, fieldsExpressions, "HAVING");

  return { where, having };
};

const getGroupedSource = (fieldParts, fieldExpressions, whereString) => {
  const {
    requiresGrainGrouping,
    isHierarchical,
    groupingSets,
    preAggregateFields,
    dimensions,
    grainFields,
  } = fieldParts;

  if (!requiresGrainGrouping && !isHierarchical) {
    return `SELECT
      t.*,
      1 AS grouping_marker
    FROM t
    ${whereString}`;
  }

  const { preAggregateExpressions } = fieldExpressions;

  const select = buildSelect(preAggregateFields, preAggregateExpressions, true);

  if (isHierarchical) {
    return `SELECT ${select}
      FROM t
      ${whereString}
      GROUP BY GROUPING SETS (
        ${groupingSets.map((fields) => `(${fields.join(", ")})`).join(", ")}
      )`;
  }

  return `SELECT ${select}
    1 AS grouping_marker
    FROM t
    ${whereString}
    GROUP BY ${[...new Set([...dimensions, ...grainFields])].join(", ")}`;
};

const getTotalMarker = (fieldParts, grouping) => {
  const { groupingDimensions, groupFields } = fieldParts;
  const { mode, totals } = grouping;

  if (mode === "hierarchical") {
    return groupingDimensions.length
      ? `CASE WHEN ${groupingDimensions
          .map((field) => `t.${field} = 1`)
          .join(" AND ")} THEN 1 ELSE 0 END AS "is_total"`
      : `1 AS "is_total"`;
  }

  if (!totals) {
    return `0 AS "is_total"`;
  }

  return groupFields.length
    ? `GROUPING(t.grouping_marker) AS "is_total"`
    : `1 AS "is_total"`;
};

const getGroupBy = (
  fieldParts,
  fieldExpressions,
  grouping,
  requiresPostAggregation,
) => {
  const { groupExpressions } = fieldExpressions;
  const { mode, totals } = grouping;
  const { groupFields } = fieldParts;

  const expressions = requiresPostAggregation
    ? groupFields.map((field) => `t."${field}"`)
    : groupExpressions;

  if (!expressions.length) return "";

  if (mode === "hierarchical" || !totals) {
    return `GROUP BY ${expressions.join(", ")}`;
  }

  return `GROUP BY GROUPING SETS (
    (${[...expressions, "t.grouping_marker"].join(", ")}),
    ()
  )`;
};

const getOrderBy = (queryOptions, fieldExpressions, fieldParts) => {
  const { defaultOrder } = fieldParts;
  const { queryOrder } = queryOptions;
  const { fieldsExpressions } = fieldExpressions;

  const orderFields = queryOrder.length ? queryOrder : defaultOrder;

  if (!orderFields.length) return "";

  const orderExpressions = orderFields
    .map(({ field, direction }) => {
      const order = fieldsExpressions[field]?.sort;
      return order ? `${order} ${direction}` : null;
    })
    .filter(Boolean);

  return orderExpressions.length
    ? `ORDER BY ${orderExpressions.join(",\n")}`
    : "";
};

const getAvgFields = (fieldParts) => {
  const { selectedFields, aggregateFields } = fieldParts;

  return selectedFields.flatMap((field) => {
    const aggregate = aggregateFields[field];

    if (!aggregate) {
      return [];
    }

    if (aggregate.fn.toLowerCase() !== "avg") {
      return [];
    }

    return [
      `SUM(t.${field}) AS "${field}__sum"`,
      `COUNT(t.${field}) AS "${field}__count"`,
    ];
  });
};

const getAggregatedSource = (fieldParts, fieldExpressions, havingString) => {
  const select = getSelect(fieldParts, fieldExpressions);
  const avgFields = getAvgFields(fieldParts);

  const { groupExpressions } = fieldExpressions;

  const groupBy = groupExpressions.length
    ? `GROUP BY ${groupExpressions.join(", ")}`
    : "";

  return `SELECT
    ${[select, ...avgFields, `1 AS grouping_marker`].join(",\n")}
    FROM t_grouped t
    ${groupBy}
    ${havingString}`;
};

const getSelect = (fieldParts, fieldExpressions) => {
  const { selectedFields } = fieldParts;
  const { fieldsExpressions } = fieldExpressions;

  return buildSelect(selectedFields, fieldsExpressions);
};

const getSource = (queryOptions, sqlConfig) => {
  const { querySourceFilter } = queryOptions;
  const { sourceFilter = {}, source } = sqlConfig;
  const params = [];
  const conditions = [];

  for (const [field, config] of Object.entries(sourceFilter)) {
    const filter = querySourceFilter.find((item) => item.field === field);
    const values = filter?.value?.length ? filter.value : config.defaultValue;

    if (!values?.length) continue;

    conditions.push(
      config.where.replace(
        `{{filter:${field}}}`,
        values.map(() => "?").join(", "),
      ),
    );

    params.push(...values);
  }

  const sql = conditions.length ? conditions.join(" AND ") : "1=1";
  const sqlSource = source.replace("{{sourceFilters}}", sql);

  return {
    sqlSource,
    params,
  };
};

const getQueryParts = (options, sqlConfig) => {
  const { grouping } = options;
  const { mode, totals } = grouping;

  const fieldParts = getFieldParts(options);
  const fieldExpressions = getFieldExpressions(fieldParts, options);

  const queryOptions = getQueryOptions(fieldParts, options, sqlConfig);

  const source = getSource(queryOptions, sqlConfig);
  const select = getSelect(fieldParts, fieldExpressions);
  const totalSelect = getTotalSelect(fieldParts);
  const filter = getFilter(queryOptions, fieldExpressions);

  const tGrouped = getGroupedSource(
    fieldParts,
    fieldExpressions,
    filter.where.sql,
  );

  if (mode === "hierarchical" && filter.having.sql) {
    throw new Error("HAVING is not supported with hierarchical grouping");
  }

  const requiresPostAggregation =
    mode === "standard" && totals && Boolean(filter.having.sql);

  const aggregatedSource = getAggregatedSource(
    fieldParts,
    fieldExpressions,
    filter.having.sql,
  );

  const totalMarker = getTotalMarker(fieldParts, grouping);
  const groupBy = getGroupBy(
    fieldParts,
    fieldExpressions,
    grouping,
    requiresPostAggregation,
  );
  const orderBy = getOrderBy(queryOptions, fieldExpressions, fieldParts);

  return {
    source,
    select,
    totalSelect,
    totalMarker,
    tGrouped,
    groupBy,
    orderBy,
    filter,
    aggregatedSource,
    requiresPostAggregation,
  };
};

const buildQuery = (sqlConfig, options = {}) => {
  const { params = [] } = options;

  const {
    source,
    select,
    totalSelect,
    totalMarker,
    tGrouped,
    groupBy,
    orderBy,
    filter,
    aggregatedSource,
    requiresPostAggregation,
  } = getQueryParts(options, sqlConfig);

  const { where, having } = filter;
  const { params: paramsWhere } = where;
  const { sql: havingString, params: paramsHaving } = having;
  const { sqlSource, params: paramsSource } = source;

  const withKeyword = ibmi && sqlConfig.recursive ? "WITH RECURSIVE" : "WITH";

  const withParts = [
    sqlConfig.cte,
    `t AS (${sqlSource})`,
    `t_grouped AS (${tGrouped})`,
    requiresPostAggregation ? `t_aggregated AS (${aggregatedSource})` : null,
  ].filter(Boolean);

  const queryString = `
  ${withKeyword} ${withParts.join(",\n")}
  SELECT
    ${requiresPostAggregation ? totalSelect : select},
    ${totalMarker}
  FROM ${requiresPostAggregation ? "t_aggregated" : "t_grouped"} t
  ${groupBy}
  ${requiresPostAggregation ? "" : havingString}
  ${orderBy}`;

  return {
    queryString,
    params: [...params, ...paramsSource, ...paramsWhere, ...paramsHaving],
  };
};

const processResult = (rows, options) => {
  const { resultFields } = options;

  const totalRow = rows.find((row) => row.is_total === 1);
  const result = rows
    .filter((row) => row.is_total === 0)
    .map(({ is_total, ...row }, index) => ({
      id: index + 1,
      ...row,
    }));

  const totals = totalRow
    ? Object.fromEntries(
        Object.entries(totalRow)
          .filter(([field]) => resultFields[field]?.aggregate)
          .map(([field, value]) => [
            field,
            {
              format:
                resultFields[field]?.format ??
                (resultFields[field]?.fn === "sum" ? "currency" : "number"),
              value,
            },
          ]),
      )
    : null;

  const { timeGranularity } = options;

  return {
    fields: resultFields,
    ...(timeGranularity && { timeGranularity }),
    totals,
    data: result,
  };
};

// ? Example:
//     sqlConfig: { cte: "", source: "" },
//     option: {
//       query: req.query,
//       technicalFields: [""],
//       resultFields: { id: {} },
//       timeGranularity:
//         true |
//         {
//           defaultGranularity: "month",
//         },
//       defaultOrder: [],
//       params: [],
//     },

const getQueryData = async (sqlConfig, options = {}) => {
  options = normalizeOptions(options);

  if (options.rawQuery) return query(sqlConfig.source, options.params ?? []);

  const sql = buildQuery(sqlConfig, options);

  const rows = await query(sql.queryString, sql.params);

  return processResult(rows, options);
};

// ? Example:
// const queries = {
//   nameQuerie1: {
//     sqlConfig: {},
//     option: {},
//   },
//   nameQuerie2: {
//     sqlConfig: {},
//     option: {},
//   },
// };
const getParallelQueryData = async (queries) => {
  const entries = await Promise.all(
    Object.entries(queries).map(async ([name, config]) => {
      const result = await getQueryData(config.sqlConfig, config.options);

      return [name, result];
    }),
  );

  return Object.fromEntries(entries);
};

export const getSequentialQueryData = async (queries) => {
  const normalizedOptions = {};
  const preparedQueries = {};
  for (const [name, config] of Object.entries(queries)) {
    const options = normalizeOptions(config.options);

    normalizedOptions[name] = options;
    preparedQueries[name] = options.rawQuery
      ? {
          queryString: config.sqlConfig.source,
          params: options.params ?? [],
        }
      : buildQuery(config.sqlConfig, options);
  }
  const results = await queryMultiple(preparedQueries);
  return Object.fromEntries(
    Object.entries(results).map(([name, rows]) => [
      name,
      normalizedOptions[name].rawQuery
        ? rows
        : processResult(rows, normalizedOptions[name]),
    ]),
  );
};

export default {
  getSqlValues,
  getQueryData,
  getSequentialQueryData,
  getParallelQueryData,
};
