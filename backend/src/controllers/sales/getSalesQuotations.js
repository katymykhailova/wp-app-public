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
  vertragsbetrag: {
    label: "Ø Vertragsbetrag",
    hiddenByDefault: true,
    aggregate: true,
    fn: "avg",
    scope: "source",
    cast: "DECIMAL(18, 4)",
    required: true,
  },
  umsatz_gesamt: {
    label: "Umsatz gesamt",
    aggregate: true,
  },
  umsatz_ohne_angebote: {
    label: "Umsatz ohne Angebote",
    aggregate: true,
  },
  umsatz_nur_angebote: {
    label: "Umsatz nur Angebote",
    aggregate: true,
  },
  anzahl_gesamt: {
    label: "Anzahl gesamt",
    aggregate: true,
    fn: "count",
    distinct: true,
    format: "number",
  },
  anzahl_ohne_angebote: {
    label: "Anzahl ohne Angebote",
    aggregate: true,
    fn: "count",
    distinct: true,
    format: "number",
  },
  anzahl_nur_angebote: {
    label: "Anzahl nur Angebote",
    aggregate: true,
    fn: "count",
    distinct: true,
    format: "number",
  },
});

const chartSeriesUmsatz = [
  {
    dataKey: "umsatz_gesamt",
    label: "Umsatz gesamt",
    format: "currency",
  },
  {
    dataKey: "umsatz_ohne_angebote",
    label: "Umsatz ohne Angebote",
    format: "currency",
  },
  {
    dataKey: "umsatz_nur_angebote",
    label: "Umsatz nur Angebote",
    format: "currency",
  },
];
const chartSeriesAnzahl = [
  {
    dataKey: "anzahl_gesamt",
    label: "Anzahl gesamt",
    format: "number",
  },
  {
    dataKey: "anzahl_ohne_angebote",
    label: "Anzahl ohne Angebote",
    format: "number",
  },
  {
    dataKey: "anzahl_nur_angebote",
    label: "Anzahl nur Angebote",
    format: "number",
  },
];

const chartConfig = [
  {
    name: "Filialübersicht nach Umsatz",
    type: "composed",
    xKey: "period",
    groupBy: "filiale",
    metrics: chartSeriesUmsatz,
    requiredFields: ["filiale", "period", "umsatz_gesamt"],
  },
  {
    name: "Filialübersicht nach Anzahl",
    type: "composed",
    xKey: "period",
    groupBy: "filiale",
    metrics: chartSeriesAnzahl,
    requiredFields: ["filiale", "period", "anzahl_gesamt"],
  },
  {
    name: "Filialvergleich nach Umsatz",
    type: "line",
    xKey: "period",
    groupBy: "period",
    seriesKey: "filiale",
    metrics: chartSeriesUmsatz,
    requiredFields: ["filiale", "period", "umsatz_gesamt"],
  },
  {
    name: "Filialvergleich nach Anzahl",
    type: "line",
    xKey: "period",
    groupBy: "period",
    seriesKey: "filiale",
    metrics: chartSeriesAnzahl,
    requiredFields: ["filiale", "period", "anzahl_gesamt"],
  },
];

const branchesData = await fsPromises.readFile(
  BASE_DIR + "/branches.json",
  "utf8",
);
const branches = JSON.parse(branchesData);

const values = sqlHelpers.getSqlValues(branches, "id", "name");

const sourceFrom = `
  FROM UDVM400DAT.MAUFTR AS FTR
  LEFT JOIN (
    VALUES ${values}
  ) AS FLL (NLN, Bezeichnung)
    ON FTR.AUNLN = FLL.NLN
  WHERE
    FTR.AUDAT BETWEEN ? AND ?
    AND FTR.AUNLN <> 30
    AND FTR.AUAUN <> FTR.AUKDN
    AND FTR.AURBT <> 0
`;

const sourceBase = `SELECT
      FTR.AUDAT AS period,
      FLL.Bezeichnung AS filiale,
      FTR.AUNLN AS nln,
      FTR.AURBT AS vertragsbetrag,
      FTR.AURBT AS umsatz_gesamt,
      CASE WHEN FTR.AUNFV <> 'X' THEN AURBT ELSE 0 END AS umsatz_ohne_angebote,
      CASE WHEN FTR.AUNFV = 'X' THEN AURBT ELSE 0 END AS umsatz_nur_angebote,
      FTR.AUAUN AS anzahl_gesamt,
      CASE WHEN FTR.AUNFV <> 'X' THEN AUAUN END AS anzahl_ohne_angebote,
      CASE WHEN FTR.AUNFV = 'X' THEN AUAUN END AS anzahl_nur_angebote
    ${sourceFrom}`;

const sourceFiliale = `SELECT DISTINCT
      FLL.Bezeichnung AS "label",
      FTR.AUNLN AS "value"
    ${sourceFrom}
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
        grouping: { mode: "standard", totals: true },
        resultFields,
        timeGranularity: {
          defaultGranularity: "month",
        },
        params: [dateStart, dateEnd],
      },
    },
    filiale: {
      sqlConfig: {
        source: sourceFiliale,
      },
      options: {
        query: {},
        rawQuery: true,
        params: [dateStart, dateEnd],
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
