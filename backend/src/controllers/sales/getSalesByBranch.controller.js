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
    "umsatz_gesamt",
    "umsatz_neukunden",
    "umsatz_bestandskunden",
    "filiale",
    "nln",
  ];

  const technicalFields = ["nln", "period_sort"];

  const aggregateFields = {
    umsatz_gesamt: { fn: "sum", format: "currency" },
    umsatz_neukunden: { fn: "sum", format: "currency" },
    umsatz_bestandskunden: { fn: "sum", format: "currency" },
  };

  const timeGranularity = true;

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
      selectable: true,
      visible: true,
      sortKey: "period_sort",
    },
    umsatz_gesamt: {
      label: "Umsatz gesamt",
      sortable: false,
      selectable: true,
      visible: true,
    },
    umsatz_neukunden: {
      label: "Umsatz Neukunden",
      sortable: false,
      selectable: true,
      visible: true,
    },
    umsatz_bestandskunden: {
      label: "Umsatz Bestandskunden",
      sortable: false,
      selectable: true,
      visible: true,
    },
  };

  const defaultOrder = ["period_sort", "filiale"];
  // {
  //   dataKey: "umsatz_bestandskunden",
  //   type: "line",
  //   label: "Umsatz Bestandskunden",
  //   format: "number/currency",
  // },
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

  try {
    const branchesData = await fsPromises.readFile(
      BASE_DIR + "/branches.json",
      "utf8",
    );
    const branches = JSON.parse(branchesData);

    const values = sqlHelpers.getSqlValues(branches, "id", "name");

    const source = `SELECT
      FTR.AUDAT AS period,
      FTR.AURBT AS umsatz_gesamt,
      CASE WHEN UDVM400DAT_MKUNDE.KDNAD >= ${dateStart} THEN FTR.AURBT ELSE 0 END AS umsatz_neukunden,
      CASE WHEN UDVM400DAT_MKUNDE.KDNAD < ${dateStart} THEN FTR.AURBT ELSE 0 END AS umsatz_bestandskunden,
      FLL.BEZEICHNUNG AS filiale,
      FTR.AUNLN AS nln
    FROM
      UDVM400DAT.MAUFTR AS FTR
    LEFT JOIN (
    VALUES
    ${values}
    ) AS FLL (NLN, Bezeichnung)
    ON
      FTR.AUNLN = FLL.NLN
    LEFT JOIN UDVM400DAT.MKUNDE AS UDVM400DAT_MKUNDE ON
      FTR.AUKDN = UDVM400DAT_MKUNDE.KDKDN
    WHERE
      FTR.AUDAT BETWEEN ? AND ?
      AND NLN <> 30
      AND FTR.AUNFV <> 'X'
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
