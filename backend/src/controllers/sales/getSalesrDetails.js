import { startOfYear, format } from "date-fns";
import fsPromises from "fs/promises";
import config from "../../_config/config.js";
import sqlHelpers from "../../_helpers/sqlHelpers/sqlHelpers.js";

const BASE_DIR = config.dbDir;

const aggregateFields = {
  artikelmenge: { fn: "sum", format: "number" },
  artikelsumme: { fn: "sum", format: "currency" },
  vertragsbetrag: {
    fn: "sum",
    format: "currency",
    grain: ["auftragsnummer"],
    grainFn: "max",
    grainDistinct: false,
    grainCast: false,
  },
};

const defaultOrder = [{ field: "period_sort" }];

const resultFields = {
  id: {
    label: "id",
    sortable: false,
    selectable: false,
    visible: false,
    queryable: false,
  },
  period: {
    label: "Zeitraum",
    sortable: true,
    selectable: true,
    visible: true,
    sortKey: "period_sort",
  },
  filiale: {
    label: "Filiale",
    sortable: true,
    selectable: true,
    visible: true,
    filterKey: "nln",
    operators: [],
  },
  // auftragsnummer: {
  //   label: "Auftragsnummer",
  //   sortable: true,
  //   selectable: true,
  //   visible: true,
  // },
  kundentyp: {
    label: "B2B/Andere",
    sortable: true,
    selectable: true,
    visible: true,
    hiddenByDefault: true,
  },
  kundennummer: {
    label: "Kundennummer",
    sortable: true,
    selectable: true,
    visible: true,
    hiddenByDefault: true,
  },
  name: {
    label: "Kunde",
    sortable: true,
    selectable: true,
    visible: true,
    hiddenByDefault: true,
  },
  adresse: {
    label: "Adresse",
    sortable: true,
    selectable: true,
    visible: true,
    hiddenByDefault: true,
  },
  email: {
    label: "email",
    sortable: true,
    selectable: true,
    visible: true,
    hiddenByDefault: true,
  },
  vertragsbetrag: {
    label: "Vertragsbetrag",
    sortable: true,
    selectable: true,
    visible: true,
  },
  warengruppe: {
    label: "Warengruppe",
    sortable: true,
    selectable: true,
    visible: true,
  },
  artikelart: {
    label: "Artikelart",
    sortable: true,
    selectable: true,
    visible: true,
  },
  artikel: {
    label: "Artikel",
    sortable: true,
    selectable: true,
    visible: true,
  },
  verkaufspreis: {
    label: "Verkaufspreis",
    sortable: true,
    selectable: true,
    visible: true,
    format: "currency",
    hiddenByDefault: true,
  },
  artikelmenge: {
    label: "Artikelmenge",
    sortable: true,
    selectable: true,
    visible: true,
  },
  artikelsumme: {
    label: "Summe",
    sortable: true,
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
    SELECT LEFT(vdvar, 3) AS GR_nummer, Trim(UCase(Left(vddat, 30))) AS warengruppe 
    FROM UDVM400DAT.MVDATR AS firmenstamm 
    WHERE vdsaa = '7' AND SUBSTRING(vdvar, 8, 1) <> '2' AND TRANSLATE(LEFT(vdvar, 3), ' ', '0123456789')= '   '`;

const cte = `WGR AS (${productGroupsQuery})`;
const source = `SELECT
      fll.Bezeichnung AS filiale,
      ftr.AUNLN AS nln,
      ftr.AUDAT AS period,
      ftr.AUAUN AS auftragsnummer,
      CASE
        WHEN ftr.AUPER = 51 THEN 'B2B'
        ELSE 'Andere'
      END AS kundentyp,
      TRIM(COALESCE(Kunden.KDNM1, '')) || ' / ' || TRIM(COALESCE(Kunden.KDNM2, '')) || ' / ' || TRIM(COALESCE(Kunden.KDNM3, '')) AS name,
      TRIM(COALESCE(Kunden.KDPLZ, '')) || ', ' || TRIM(COALESCE(Kunden.KDORT, '')) || ', ' || TRIM(COALESCE(Kunden.KDSTR, '')) AS adresse,
      Kunden.KDEML AS email,
      ftr.AURBT AS vertragsbetrag,
      Kunden.KDKDN AS kundennummer,
      Art.artikel,
      Art.artikelart,
      Art.verkaufspreis AS verkaufspreis,
      Art.artikelmenge AS artikelmenge,
      Art.artikelsumme,
      WGR.warengruppe AS warengruppe
    FROM
      UDVM400DAT.MAUFTR AS ftr
    LEFT JOIN UDVM400DAT.MKUNDE AS Kunden ON
      ftr.AUKDN = Kunden.KDKDN
    LEFT JOIN (VALUES ${values}) AS FLL (NLN, Bezeichnung)
              ON ftr.AUNLN = FLL.NLN
    LEFT JOIN
                (
      SELECT
        APMAS AS StornoMassnahme,
        APKAN,
        APWGR,
        TRIM(
              TRIM(COALESCE(APBT1, '')) ||
              CASE WHEN TRIM(COALESCE(APBT2, '')) <> '' THEN ' ' || TRIM(APBT2) ELSE '' END ||
              CASE WHEN TRIM(COALESCE(APBT3, '')) <> '' THEN ' ' || TRIM(APBT3) ELSE '' END
            ) AS artikel,
        CASE
          WHEN APWGR < 900 THEN 'Produkt'
          ELSE 'Leistung'
        END AS artikelart,
        APVKP AS verkaufspreis,
        APMGE AS artikelmenge,
        APMGE * APVKP AS artikelsumme
      FROM
        UDVM400DAT.MARPOK AS MARPOK
      WHERE
        APMAS = 0
    UNION ALL
      SELECT
        APMAS,
        APKAN,
        APWGR,
        TRIM(
              TRIM(COALESCE(APBT1, '')) ||
              CASE WHEN TRIM(COALESCE(APBT2, '')) <> '' THEN ' ' || TRIM(APBT2) ELSE '' END ||
              CASE WHEN TRIM(COALESCE(APBT3, '')) <> '' THEN ' ' || TRIM(APBT3) ELSE '' END
            ),
        CASE
          WHEN APWGR < 900 THEN 'Produkt'
          ELSE 'Leistung'
        END,
        APVKP,
        APMGE,
        APMGE * APVKP
      FROM
        UDVM400DAT.MARPOL AS MARPOL
      WHERE
        APMAS = 0 
                  ) AS Art
              ON
      ftr.AUAUN = Art.APKAN
    LEFT JOIN WGR ON
      TRIM(CHAR(INTEGER(Art.APWGR))) = TRIM(WGR.GR_nummer)
    WHERE
      ftr.AUDAT BETWEEN ? AND ?
      AND ftr.AUAUN <> ftr.AUKDN
      AND ftr.AURBT <> 0
      AND ftr.AUNFV <> 'X'`;

const sqlConfig = {
  cte,
  source,
};

export default async (req, res) => {
  const dateStart =
    req.query?.dateStart || format(startOfYear(new Date()), "yyyyMMdd");
  const dateEnd = req.query?.dateEnd || format(new Date(), "yyyyMMdd");
  const termField = req.query.searchField || "artikel";
  const termValue = req.query.searchValue || "Botero";

  try {
    const result = await sqlHelpers.getQueryData(sqlConfig, {
      query: req.query,
      grouping: { mode: "hierarchical", totals: true },
      aggregateFields,
      resultFields,
      timeGranularity: true,
      defaultOrder,
      params: [dateStart, dateEnd],
    });

    // const filialeOptions = [
    //   ...new Map(
    //     (result?.data ?? [])
    //       .filter(({ filiale, nln }) => filiale && nln)
    //       .map(({ filiale, nln }) => [nln, { label: filiale, value: nln }]),
    //   ).values(),
    // ].sort((a, b) => a.label.localeCompare(b.label));

    const data = {
      ...result,
      // filters: {
      //   ...(filialeOptions.length && {
      //     filiale: {
      //       label: "Filiale",
      //       type: "select",
      //       options: filialeOptions,
      //     },
      //   }),
      // },
    };
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
