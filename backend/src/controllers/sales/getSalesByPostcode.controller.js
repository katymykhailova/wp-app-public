import { startOfYear, format } from "date-fns";
import sqlHelpers from "../../_helpers/sqlHelpers/sqlHelpers.js";
import { createFields } from "../../_helpers/createFields.js";

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
  plz: {
    label: "PLZ",
    filterable: false,
    hiddenByDefault: true,
  },
  plz_gruppe: {
    label: "PLZ Gruppe",
    filterable: false,
    defaultOrder: { priority: 1, direction: "asc" },
  },
  filiale: {
    label: "Filiale",
    type: "select",
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

const chartConfig = [
  {
    name: "Umsatz gesamt",
    type: "map",
    groupBy: "plz",
    dataKey: "umsatz_gesamt",
    requiredFields: ["plz", "umsatz_gesamt"],
  },
  {
    name: "Umsatz Neukunden",
    type: "map",
    groupBy: "plz",
    dataKey: "umsatz_neukunden",
    requiredFields: ["plz", "umsatz_neukunden"],
  },
  {
    name: "Umsatz Bestandskunden",
    type: "map",
    groupBy: "plz",
    dataKey: "umsatz_bestandskunden",
    requiredFields: ["plz", "umsatz_bestandskunden"],
  },
];

const cte = `base AS (
      SELECT
        Substr(TRIM(KUNDE.KDPLZ),1,3) AS plz,
        INT(TRIM(KUNDE.KDPLZ)) AS plz_int,
        CASE WHEN FTR.AUNLN IN (800, 900) THEN 'online' ELSE 'Filiale' END AS filiale,
        FTR.AURBT AS umsatz_gesamt,
        CASE WHEN KDNAD <  ? THEN FTR.AURBT ELSE 0 END AS umsatz_bestandskunden,
        CASE WHEN KDNAD >= ? THEN FTR.AURBT ELSE 0 END AS umsatz_neukunden
      FROM UDVM400DAT.MAUFTR AS FTR
      INNER JOIN UDVM400DAT.MKUNDE AS KUNDE ON FTR.AUKDN = KUNDE.KDKDN
      WHERE FTR.AUDAT BETWEEN ? AND ?
        AND FTR.AUNFV <> 'X'
        AND FTR.AUAUN <> FTR.AUKDN
        AND FTR.AURBT <> 0
        AND FTR.AUNLN <> 30
        AND KUNDE.KDNAT = '')`;

const source = `SELECT
        plz,
        TRIM(CHAR(INT(plz_int / 10000))) || '0000-' || TRIM(CHAR(INT(plz_int / 10000))) || '9999' AS plz_gruppe,
        filiale,
        umsatz_gesamt AS umsatz_gesamt,
        umsatz_bestandskunden AS umsatz_bestandskunden,
        umsatz_neukunden AS umsatz_neukunden
      FROM base`;

const filters = {
  filiale: {
    label: "Filiale",
    options: [
      { label: "online", value: "online" },
      { label: "Filiale", value: "Filiale" },
    ],
  },
};

const sqlConfig = {
  cte,
  source,
};

export default async (req, res) => {
  const dateStart =
    req.query?.dateStart || format(startOfYear(new Date()), "yyyyMMdd");
  const dateEnd = req.query?.dateEnd || format(new Date(), "yyyyMMdd");

  try {
    const result = await sqlHelpers.getQueryData(sqlConfig, {
      query: req.query,
      resultFields,
      params: [dateStart, dateStart, dateStart, dateEnd],
    });

    const data = {
      ...result,
      chartConfig,
      filters,
    };

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
