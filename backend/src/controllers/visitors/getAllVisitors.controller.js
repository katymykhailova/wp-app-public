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
  besucherzahl: {
    label: "Besucherzahl",
    aggregate: true,
    format: "number",
    fn: "sum",
  },
});

const chartConfig = [
  {
    name: "Filialvergleich",
    type: "line",
    xKey: "period",
    groupBy: "period",
    seriesKey: "filiale",
    metrics: [
      {
        dataKey: "besucherzahl",
        label: "Besucherzahl",
        format: "number",
      },
    ],
    requiredFields: ["filiale", "period", "besucherzahl"],
  },
];

const branchesData = await fsPromises.readFile(
  BASE_DIR + "/branches.json",
  "utf8",
);
const branches = JSON.parse(branchesData);

const values = sqlHelpers.getSqlValues(branches, "id", "name");

const source = `SELECT
      BSU.K6NLN AS nln,
      BSU.K6DAT AS period,
      BSU.K6BSU AS besucherzahl,
      FLL.BEZEICHNUNG AS filiale
    FROM
      UDVM400DAT.MKVINF AS BSU
    LEFT JOIN (
    VALUES
    ${values}
    ) AS FLL (NLN,
      Bezeichnung)
    ON
      BSU.K6NLN = FLL.NLN
    WHERE
      BSU.K6DAT BETWEEN ? AND ?`;

export default async (req, res) => {
  const dateStart =
    req.query?.dateStart || format(startOfYear(new Date()), "yyyyMMdd");
  const dateEnd = req.query?.dateEnd || format(new Date(), "yyyyMMdd");

  try {
    const result = await sqlHelpers.getQueryData(
      { source },
      {
        query: req.query,
        resultFields,
        timeGranularity: true,
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
