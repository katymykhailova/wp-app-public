import { startOfYear, format } from "date-fns";
import fsPromises from "fs/promises";
import config from "../../_config/config.js";
import sqlHelpers from "../../_helpers/sqlHelpers/sqlHelpers.js";
import { createFields } from "../../_helpers/createFields.js";

const BASE_DIR = config.dbDir;

const resultFields = createFields({
  id: {
    label: "id",
    type: "number",
    selectable: false,
    sortable: false,
    filterable: false,
    visible: false,
    queryable: false,
  },
  filiale: {
    label: "Filiale",
    type: "select",
    defaultOrder: { priority: 2, direction: "asc" },
    filterKey: "nln",
  },
  period: {
    label: "Zeitraum",
    type: "date",
    selectable: false,
    filterable: false,
    defaultOrder: { priority: 1, direction: "asc" },
    sortKey: "period_sort",
  },
  umsatz_gesamt: {
    label: "Umsatz gesamt",
    aggregate: true,
  },
  umsatz_neukunden: {
    label: "Umsatz Neukunden",
    aggregate: true,
  },
  umsatz_bestandskunden: {
    label: "Umsatz Bestandskunden",
    aggregate: true,
  },
});

const chartSeries = [
  {
    dataKey: "umsatz_neukunden",
    label: "Umsatz Neukunden",
    format: "currency",
  },
  {
    dataKey: "umsatz_gesamt",
    label: "Umsatz gesamt",
    format: "currency",
  },
  {
    dataKey: "umsatz_bestandskunden",
    label: "Umsatz Bestandskunden",
    format: "currency",
  },
];
const chartConfig = [
  {
    name: "Filialübersicht",
    type: "composed",
    xKey: "period",
    groupBy: "filiale",
    metrics: chartSeries,
    requiredFields: [
      "filiale",
      "period",
      "umsatz_bestandskunden",
      "umsatz_neukunden",
      "umsatz_gesamt",
    ],
  },
  {
    name: "Filialvergleich",
    type: "line",
    xKey: "period",
    groupBy: "period",
    seriesKey: "filiale",
    metrics: chartSeries,
    requiredFields: [
      "filiale",
      "period",
      "umsatz_bestandskunden",
      "umsatz_neukunden",
      "umsatz_gesamt",
    ],
  },
];

const branchesData = await fsPromises.readFile(
  BASE_DIR + "/branches.json",
  "utf8",
);
const branches = JSON.parse(branchesData);

const branchValues = sqlHelpers.getSqlValues(branches, "id", "name");

// const source = `
//   LEFT JOIN (
//     VALUES ${values}
//   ) AS FLL (NLN, Bezeichnung)
//     ON FTR.AUNLN = FLL.NLN
// `;

const source = `
  LEFT JOIN (
    VALUES ${branchValues.sql}
  ) AS FLL (NLN, Bezeichnung)
    ON FTR.AUNLN = FLL.NLN
  WHERE
    FTR.AUDAT BETWEEN ? AND ?
    AND FTR.AUNLN <> 30
    AND FTR.AUAUN <> FTR.AUKDN
    AND FTR.AURBT <> 0
    AND FTR.AUNFV <> 'X'
`;

const sourceBase = `SELECT
      FTR.AUDAT AS period,
      FTR.AURBT AS umsatz_gesamt,
      CASE WHEN UDVM400DAT_MKUNDE.KDNAD >= ? THEN FTR.AURBT ELSE 0 END AS umsatz_neukunden,
      CASE WHEN UDVM400DAT_MKUNDE.KDNAD < ? THEN FTR.AURBT ELSE 0 END AS umsatz_bestandskunden,
      FLL.BEZEICHNUNG AS filiale,
      FTR.AUNLN AS nln
    FROM UDVM400DAT.MAUFTR AS FTR
    LEFT JOIN UDVM400DAT.MKUNDE AS UDVM400DAT_MKUNDE ON
      FTR.AUKDN = UDVM400DAT_MKUNDE.KDKDN
    ${source}
`;

const sourceFiliale = `SELECT DISTINCT
      FLL.Bezeichnung AS "label",
      FTR.AUNLN AS "value"
      FROM UDVM400DAT.MAUFTR AS FTR
      ${source}
      ORDER BY "label" ASC`;

export default async (req, res) => {
  const dateStart =
    req.query?.dateStart || format(startOfYear(new Date()), "yyyyMMdd");
  const dateEnd = req.query?.dateEnd || format(new Date(), "yyyyMMdd");

  const queries = {
    data: {
      sqlConfig: {
        source: sourceBase,
      },
      options: {
        query: req.query,
        resultFields,
        timeGranularity: {
          defaultGranularity: "month",
        },
        params: [
          dateStart,
          dateStart,
          ...branchValues.params,
          dateStart,
          dateEnd,
        ],
      },
    },
    filiale: {
      sqlConfig: {
        source: sourceFiliale,
      },
      options: {
        query: {},
        rawQuery: true,
        params: [...branchValues.params, dateStart, dateEnd],
      },
    },
  };
  try {
    const result = await sqlHelpers.getParallelQueryData(queries);

    const data = {
      ...result["data"],
      chartConfig,
      filters: {
        ...(result["filiale"].length && {
          filiale: {
            label: "Filiale",
            options: result["filiale"],
          },
        }),
      },
    };

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
