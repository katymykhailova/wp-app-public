import { startOfYear, format } from "date-fns";
import fsPromises from "fs/promises";
import config from "../../_config/config.js";
import sqlHelpers from "../../_helpers/sqlHelpers/sqlHelpers.js";

const BASE_DIR = config.dbDir;

const defaultOrder = [{ field: "date" }];

const aggregateFields = {};

const resultFields = {
  id: {
    label: "id",
    sortable: false,
    selectable: false,
    visible: false,
    queryable: false,
  },
  company: {
    label: "Firma",
    sortable: false,
    selectable: true,
    visible: true,
  },
  firstName: {
    label: "Vorname",
    sortable: false,
    selectable: true,
    visible: true,
  },
  lastName: {
    label: "Nachname",
    sortable: false,
    selectable: true,
    visible: true,
  },
  email: {
    label: "Email",
    sortable: false,
    selectable: true,
    visible: true,
  },
  online: {
    label: "Online",
    sortable: false,
    selectable: true,
    visible: true,
  },
  branch: {
    label: "Filiale",
    sortable: false,
    selectable: true,
    visible: true,
    filterKey: "nln",
  },
  date: {
    label: "Auftragsdatum",
    sortable: true,
    selectable: true,
    visible: true,
    sortKey: "period_sort",
  },
  orderNumber: {
    label: "Auftragsnummer",
    sortable: false,
    selectable: true,
    visible: true,
  },
  complaint: {
    label: "Reklamation",
    sortable: false,
    selectable: true,
    visible: true,
  },
  productGroups: {
    label: "Warengruppen",
    sortable: false,
    selectable: true,
    visible: true,
  },
};

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

export default async (req, res) => {
  const dateStart =
    req.query?.dateStart || format(startOfYear(new Date()), "yyyyMMdd");
  const dateEnd = req.query?.dateEnd || format(new Date(), "yyyyMMdd");

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
        CASE WHEN AUPER > 5 THEN 'ja' ELSE 'nein' END AS company,
        CASE WHEN AUNLN < 800 THEN 'nein' ELSE 'ja' END AS Online,
        AUDAT AS period_sort,
        VARCHAR_FORMAT(DATE(TIMESTAMP_FORMAT(DIGITS(AUDAT), 'YYYYMMDD')),'DD.MM.YYYY') AS date,
        TRIM(KDNM2) as firstName, VARCHAR(KDNM1) AS lastName, KDEML AS Email, Bezeichnung AS branch, AUNLN AS nln, AUAUN AS orderNumber
      FROM UDVM400DAT.MAUFTR AS UDVM400DAT_MAUFTR
      LEFT JOIN UDVM400DAT.MKUNDE AS UDVM400DAT_MKUNDE 
        ON UDVM400DAT_MAUFTR.AUKDN = UDVM400DAT_MKUNDE.KDKDN
          LEFT JOIN (
          VALUES
          ${values}
          ) AS FLL (NLN, Bezeichnung)
          ON UDVM400DAT_MAUFTR.AUNLN = FLL.NLN
      WHERE
        UDVM400DAT_MAUFTR.AUDAT BETWEEN ? AND ?
        AND UDVM400DAT_MAUFTR.AUNFV <> 'X' AND (AUAUN <> AUKDN) AND AUKDN < 9999998 AND AURBT <> 0 AND KDNWL = 'J'
      ),
    Art AS (SELECT APANR, APWGR
      FROM UDVM400DAT.MARPOK AS p
      WHERE APWGR IN (101,102,306,210,402,201,601,301,701,211,702)
      UNION
      SELECT APANR, APWGR
      FROM UDVM400DAT.MARPOL AS p
      WHERE APWGR IN (101,102,306,210,402,201,601,301,701,211,702))`;

  const source = `SELECT
      vertraege.orderNumber AS id, vertraege.company AS company, vertraege.firstName AS firstName, 
      vertraege.lastName AS lastName, vertraege.Email AS email, vertraege.Online AS online, 
      vertraege.branch AS branch, vertraege.nln AS nln, vertraege.period_sort AS period_sort, vertraege.date AS date, vertraege.orderNumber AS orderNumber,
      CASE WHEN rekl.APREK IS NULL OR TRIM(rekl.APREK) = '' THEN 'nein' ELSE 'ja' END AS complaint,
      Listagg(WGR.Warengruppe, ', ') WITHIN GROUP (ORDER BY Warengruppe) AS productGroups
    FROM vertraege
    INNER JOIN Art ON vertraege.orderNumber = Art.APANR
    INNER Join WGR ON Art.APWGR = WGR.groupId
    LEFT JOIN rekl ON rekl.APANR = vertraege.orderNumber 
    GROUP BY vertraege.company, vertraege.firstName, vertraege.lastName, vertraege.Email,
      vertraege.Online, vertraege.branch, vertraege.nln, vertraege.period_sort, vertraege.date, vertraege.orderNumber,
      CASE WHEN rekl.APREK IS NULL OR TRIM(rekl.APREK) = '' THEN 'nein' ELSE 'ja' END`;

  const sqlConfig = {
    cte,
    source,
  };

  try {
    // const productGroups = await query(productGroupsQuery);
    // const productGroupsOptions = [
    //   ...new Map(
    //     productGroups.map(({ wgr, groupId: id }) => [
    //       id,
    //       { label: wgr, value: id },
    //     ]),
    //   ).values(),
    // ].sort((a, b) => a.label.localeCompare(b.label));

    const result = await sqlHelpers.getQueryData(sqlConfig, {
      query: req.query,
      aggregateFields,
      resultFields,
      defaultOrder,
      params: [dateStart, dateEnd],
    });

    const filialeOptions = [
      ...new Map(
        (result?.data ?? [])
          .filter(({ filiale, nln }) => filiale && nln)
          .map(({ filiale, nln }) => [nln, { label: filiale, value: nln }]),
      ).values(),
    ].sort((a, b) => a.label.localeCompare(b.label));

    const data = {
      ...result,
      filters: {
        // wgr: {
        //   label: "Filiale",
        //   type: "select",
        //   options: productGroupsOptions,
        // },
        company: {
          label: "Firma",
          // type: "select",
          options: [
            { label: "ja", value: "ja" },
            { label: "nein", value: "nein" },
          ],
        },
        // complaint: {
        //   label: "Reklamation",
        //   type: "select",
        //   options: [
        //     { label: "ja", value: "ja" },
        //     { label: "nein", value: "nein" },
        //   ],
        // },
        ...(filialeOptions.length && {
          filiale: {
            label: "Filiale",
            // type: "select",
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
