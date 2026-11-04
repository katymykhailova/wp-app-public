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
  firma: {
    label: "Firma",
    type: "select",
  },
  vorname: {
    label: "Vorname",
  },
  nachname: {
    label: "Nachname",
  },
  email: {
    label: "Email",
  },
  online: {
    label: "Online",
    sortable: false,
  },
  filiale: {
    label: "Filiale",
    type: "select",
    sortable: false,
    selectable: true,
    visible: true,
    filterKey: "nln",
  },
  auftragsdatum: {
    label: "Auftragsdatum",
    filterable: false,
    sortKey: "period_sort",
  },
  orderNumber: {
    label: "Auftragsnummer",
  },
  reklamation: {
    label: "Reklamation",
  },
  productGroups: {
    label: "Warengruppen",
  },
});

const branchesData = await fsPromises.readFile(
  BASE_DIR + "/branches.json",
  "utf8",
);
const branches = JSON.parse(branchesData);

const values = sqlHelpers.getSqlValues(branches, "id", "name");

const productGroupsQuery = `
    SELECT INTEGER(LEFT(vdvar, 3)) AS "groupId", Trim(UCase(Left(vddat, 30))) AS "wgr", INTEGER(LEFT(vdvar, 3)) AS groupId, Trim(UCase(Left(vddat, 30))) AS warengruppe 
    FROM UDVM400DAT.MVDATR AS firmenstamm 
    WHERE vdsaa = '7' AND SUBSTRING(vdvar, 8, 1) <> '2' AND TRANSLATE(LEFT(vdvar, 3), ' ', '0123456789')= '   '`;

const sorce = `
      LEFT JOIN (
          VALUES
          ${values}
          ) AS FLL (NLN, Bezeichnung)
          ON FTR.AUNLN = FLL.NLN
      WHERE
        FTR.AUDAT BETWEEN ? AND ?
        AND FTR.AUNFV <> 'X' 
        AND (AUAUN <> AUKDN) 
        AND AUKDN < 9999998 
        AND AURBT <> 0 
`;

const sourceFiliale = `SELECT DISTINCT
      FLL.Bezeichnung AS "label",
      FTR.AUNLN AS "value"
    FROM UDVM400DAT.MAUFTR AS FTR
    ${sorce}
      ORDER BY "label" ASC`;

const cte = ` 
    WGR AS (${productGroupsQuery}),
    rekl AS (
      SELECT APANR,  MAX(APREK) AS APREK
        FROM (
            SELECT APANR, APREK FROM UDVM400DAT.MARPOK
            UNION
            SELECT APANR, APREK FROM UDVM400DAT.MARPOL
        ) AS r
        GROUP BY APANR
    ),
    vertraege AS (
      SELECT
        CASE WHEN AUPER > 5 THEN 'ja' ELSE 'nein' END AS firma,
        CASE WHEN AUNLN < 800 THEN 'nein' ELSE 'ja' END AS Online,
        AUDAT AS period_sort,
        VARCHAR_FORMAT(DATE(TIMESTAMP_FORMAT(DIGITS(AUDAT), 'YYYYMMDD')),'DD.MM.YYYY') AS auftragsdatum,
        TRIM(KDNM2) as vorname, VARCHAR(KDNM1) AS nachname, KDEML AS Email, Bezeichnung AS filiale, AUNLN AS nln, AUAUN AS orderNumber
      FROM UDVM400DAT.MAUFTR AS FTR
      LEFT JOIN UDVM400DAT.MKUNDE AS KUNDE
        ON FTR.AUKDN = KUNDE.KDKDN
      ${sorce}
        AND KDNWL = 'J'
      ),
    Art AS (SELECT APANR, APWGR
      FROM UDVM400DAT.MARPOK AS p
      WHERE APWGR IN (101,102,306,210,402,201,601,301,701,211,702)
      UNION
      SELECT APANR, APWGR
      FROM UDVM400DAT.MARPOL AS p
      WHERE APWGR IN (101,102,306,210,402,201,601,301,701,211,702))`;

const sourceBase = `SELECT
      vertraege.orderNumber AS id, vertraege.firma AS firma, vertraege.vorname AS vorname, 
      vertraege.nachname AS nachname, vertraege.Email AS email, vertraege.Online AS online, 
      vertraege.filiale AS filiale, vertraege.nln AS nln, vertraege.period_sort AS period_sort, vertraege.auftragsdatum AS auftragsdatum, vertraege.orderNumber AS orderNumber,
      CASE WHEN rekl.APREK IS NULL OR TRIM(rekl.APREK) = '' THEN 'nein' ELSE 'ja' END AS reklamation,
      Listagg(WGR.Warengruppe, ', ') WITHIN GROUP (ORDER BY Warengruppe) AS productGroups
    FROM vertraege
    INNER JOIN Art ON vertraege.orderNumber = Art.APANR
    INNER Join WGR ON Art.APWGR = WGR.groupId
    LEFT JOIN rekl ON rekl.APANR = vertraege.orderNumber 
    GROUP BY vertraege.firma, vertraege.vorname, vertraege.nachname, vertraege.Email,
      vertraege.Online, vertraege.filiale, vertraege.nln, vertraege.period_sort, vertraege.auftragsdatum, vertraege.orderNumber,
      CASE WHEN rekl.APREK IS NULL OR TRIM(rekl.APREK) = '' THEN 'nein' ELSE 'ja' END`;

const firmaFilter = {
  label: "Firma",
  options: [
    { label: "ja", value: "ja" },
    { label: "nein", value: "nein" },
  ],
};

export default async (req, res) => {
  const dateStart =
    req.query?.dateStart || format(startOfYear(new Date()), "yyyyMMdd");
  const dateEnd = req.query?.dateEnd || format(new Date(), "yyyyMMdd");

  const queries = {
    data: {
      sqlConfig: {
        cte,
        source: sourceBase,
      },
      options: {
        query: req.query,
        grouping: { mode: "standard", totals: false },
        resultFields,
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
      filters: {
        firma: firmaFilter,
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
