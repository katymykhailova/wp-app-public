import { startOfYear, format } from "date-fns";
import sqlHelpers from "../../_helpers/sqlHelpers.js";

export default async (req, res) => {
  const dateStart =
    req.query?.dateStart || format(startOfYear(new Date()), "yyyyMMdd");
  const dateEnd = req.query?.dateEnd || format(new Date(), "yyyyMMdd");
  const defaultFields = [
    "plz",
    "plz_gruppe",
    "filiale",
    "umsatz_gesamt",
    "umsatz_neukunden",
    "umsatz_bestandskunden",
  ];

  const technicalFields = [];

  const aggregateFields = {
    umsatz_gesamt: { fn: "sum", format: "currency" },
    umsatz_neukunden: { fn: "sum", format: "currency" },
    umsatz_bestandskunden: { fn: "sum", format: "currency" },
  };
  const resultFields = {
    id: { label: "id", sortable: false, selectable: false, visible: false },
    plz: {
      label: "PLZ",
      sortable: false,
      selectable: true,
      visible: true,
      hiddenByDefault: true,
    },
    plz_gruppe: {
      label: "PLZ Gruppe",
      sortable: false,
      selectable: true,
      visible: true,
    },
    filiale: {
      label: "Filiale",
      sortable: true,
      selectable: true,
      visible: true,
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

  const defaultOrder = ["plz_gruppe"];
  const chartSeries = [
    {
      dataKey: "umsatz_gesamt",
      label: "Umsatz gesamt",
      format: "currency",
    },
    {
      dataKey: "umsatz_neukunden",
      label: "Umsatz Neukunden",
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

  try {
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
      WHERE (FTR.AUDAT BETWEEN ? AND ?)
        AND FTR.AUNFV <> 'X'
        AND (FTR.AUAUN <> FTR.AUKDN)
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

    const result = await sqlHelpers.getQueryData(
      { cte, source },
      {
        query: req.query,
        defaultFields,
        technicalFields,
        aggregateFields,
        resultFields,
        defaultOrder,
        params: [dateStart, dateStart, dateStart, dateEnd],
      },
    );

    const data = {
      ...result,
      chartConfig,
      filters: {
        filiale: {
          label: "Filiale",
          type: "select",
          options: [
            { label: "online", value: "online" },
            { label: "Filiale", value: "Filiale" },
          ],
        },
      },
    };

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
