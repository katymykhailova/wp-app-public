import { startOfYear, format } from "date-fns";
import fsPromises from "fs/promises";
import config from "../../_config/config.js";
import sqlHelpers from "../../_helpers/sqlHelpers.js";

const BASE_DIR = config.dbDir;

export default async (req, res) => {
  const dateStart =
    req.query?.dateStart || format(startOfYear(new Date()), "yyyyMMdd");
  const dateEnd = req.query?.dateEnd || format(new Date(), "yyyyMMdd");
  const defaultFields = [
    "period",
    "filiale",
    "nln",
    "umsatz_gesamt",
    "umsatz_ohne_angebote",
    "umsatz_nur_angebote",
    "anzahl_gesamt",
    "anzahl_ohne_angebote",
    "anzahl_nur_angebote",
  ];

  const technicalFields = ["nln", "period_sort"];

  const aggregateFields = {
    umsatz_gesamt: { fn: "sum", format: "currency" },
    umsatz_ohne_angebote: { fn: "sum", format: "currency" },
    umsatz_nur_angebote: { fn: "sum", format: "currency" },
    anzahl_gesamt: { fn: "count", distinct: true, format: "number" },
    anzahl_ohne_angebote: { fn: "count", distinct: true, format: "number" },
    anzahl_nur_angebote: { fn: "count", distinct: true, format: "number" },
  };

  const timeGranularity = {
    defaultGranularity: "month",
  };

  const resultFields = {
    id: { label: "id", sortable: false, selectable: false, visible: false },
    filiale: {
      label: "Filiale",
      sortable: true,
      selectable: true,
      visible: true,
      filterKey: "nln",
    },
    period: {
      label: "Zeitraum",
      sortable: true,
      selectable: false,
      visible: true,
      sortKey: "period_sort",
    },
    umsatz_gesamt: {
      label: "Umsatz gesamt",
      sortable: false,
      selectable: true,
      visible: true,
    },
    umsatz_ohne_angebote: {
      label: "Umsatz ohne Angebote",
      sortable: false,
      selectable: true,
      visible: true,
    },
    umsatz_nur_angebote: {
      label: "Umsatz nur Angebote",
      sortable: false,
      selectable: true,
      visible: true,
    },
    anzahl_gesamt: {
      label: "Anzahl gesamt",
      sortable: false,
      selectable: true,
      visible: true,
    },
    anzahl_ohne_angebote: {
      label: "Anzahl ohne Angebote",
      sortable: false,
      selectable: true,
      visible: true,
    },
    anzahl_nur_angebote: {
      label: "Anzahl nur Angebote",
      sortable: false,
      selectable: true,
      visible: true,
    },
  };

  const defaultOrder = ["period_sort", "filiale"];

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

  try {
    const branchesData = await fsPromises.readFile(
      BASE_DIR + "/branches.json",
      "utf8",
    );
    const branches = JSON.parse(branchesData);

    const values = sqlHelpers.getSqlValues(branches, "id", "name");

    const source = `SELECT
      FTR.AUDAT AS period,
      FLL.Bezeichnung AS filiale,
      FTR.AUNLN AS nln,
      FTR.AURBT AS umsatz_gesamt,
      CASE WHEN FTR.AUNFV <> 'X' THEN AURBT ELSE 0 END AS umsatz_ohne_angebote,
      CASE WHEN FTR.AUNFV = 'X' THEN AURBT ELSE 0 END AS umsatz_nur_angebote,
      FTR.AUAUN AS anzahl_gesamt,
      CASE WHEN FTR.AUNFV <> 'X' THEN AUAUN END AS anzahl_ohne_angebote,
      CASE WHEN FTR.AUNFV = 'X' THEN AUAUN END AS anzahl_nur_angebote
    FROM
      UDVM400DAT.MAUFTR AS FTR
    LEFT JOIN (
    VALUES
    ${values}
    ) AS FLL (NLN,
      Bezeichnung)
    ON
      FTR.AUNLN = FLL.NLN
    WHERE
      FTR.AUDAT BETWEEN ? AND ?
      AND FTR.AUNLN <> 30
      AND (AUAUN <> AUKDN)
      AND AURBT <> 0`;

    const result = await sqlHelpers.getQueryData(
      { source },
      {
        query: req.query,
        defaultFields,
        technicalFields,
        aggregateFields,
        resultFields,
        timeGranularity,
        defaultOrder,
        params: [dateStart, dateEnd],
      },
    );

    const filialeOptions = [
      ...new Map(
        (result?.data ?? [])
          .filter(({ filiale, nln }) => filiale && nln)
          .map(({ filiale, nln }) => [nln, { label: filiale, value: nln }]),
      ).values(),
    ].sort((a, b) => a.label.localeCompare(b.label));

    const data = {
      ...result,
      chartConfig,
      filters: {
        ...(filialeOptions.length && {
          filiale: {
            label: "Filiale",
            type: "select",
            options: filialeOptions,
          },
        }),
      },
    };

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
