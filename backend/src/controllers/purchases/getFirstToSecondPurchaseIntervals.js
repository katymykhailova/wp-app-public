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
  count: {
    label: "Anzahl",
    hiddenByDefault: true,
    aggregate: true,
    fn: "count",
    distinct: true,
    format: "number",
  },
  kunden_nr: {
    label: "Kundennummer",
  },
  betrag_erstkauf: {
    label: "Erstkaufbetrag",
    aggregate: true,
  },
  betrag_zweitkauf: {
    label: "Zweitkaufbetrag",
    aggregate: true,
  },
  erstes_datum: {
    label: "Erstkaufdatum",
    type: "date",
    filterable: false,
    sortKey: "erstes_datum_sort",
    aggregate: true,
    fn: "min",
    format: "date",
  },
  zweites_datum: {
    label: "Zweitkaufdatum",
    type: "date",
    filterable: false,
    sortKey: "zweites_datum_sort",
    aggregate: true,
    fn: "min",
    format: "date",
  },
  tagen_zwischen: {
    label: "Tage zwischen den Käufen",
    type: "number",
  },
  segment: {
    label: "Segment",
    type: "text",
    filterable: false,
    sortKey: "segment_sort",
    selectable: false,
    aggregate: true,
    fn: "min",
    format: "text",
  },
});

const cte = `
          vertraege AS (
          SELECT
              a.AUAUN, a.AUKDN, a.AUAEU, a.AUDAT, a.AURBT, k.KDNAD,
              DATE(TIMESTAMP_FORMAT(DIGITS(a.AUDAT),'YYYYMMDD')) AS vtr_dt,
              CASE WHEN k.KDNAD >= ? THEN 0 WHEN k.KDNAD < ? THEN 1 END AS neue_bestandskunden
          FROM UDVM400DAT.MAUFTR AS a
          LEFT JOIN UDVM400DAT.MKUNDE AS k ON a.AUKDN = k.KDKDN
          WHERE a.AUDAT BETWEEN ? AND ?
            AND a.AUNFV <> 'X' AND a.AUAUN <> a.AUKDN AND a.AUKDN < 9999998 AND a.AURBT <> 0 AND k.KDNAD IS NOT NULL
      ),
      vertraege_rn AS (
          SELECT v.*,
              ROW_NUMBER() OVER ( PARTITION BY v.AUKDN ORDER BY v.vtr_dt, v.AUAUN ) AS rn
          FROM vertraege AS v
      ),
      erst_zweitkauf AS (
          SELECT
              AUKDN AS kunden_nr, SUM(AURBT) AS betrag,
              MAX(CASE WHEN rn = 1 THEN AURBT END) AS betrag_erstkauf,
              MAX(CASE WHEN rn = 2 THEN AURBT END) AS betrag_zweitkauf,
              MAX(CASE WHEN rn = 1 THEN vtr_dt END) AS erstes_datum,
              MAX(CASE WHEN rn = 2 THEN vtr_dt END) AS zweites_datum
          FROM vertraege_rn
          WHERE rn IN (1, 2)
          GROUP BY AUKDN
      ),
      tagen_zwischen AS (
          SELECT
              ez.*, 
              DAYS(ez.zweites_datum) - DAYS(ez.erstes_datum) AS tagen_zwischen
          FROM erst_zweitkauf AS ez
          WHERE ez.erstes_datum IS NOT NULL AND ez.zweites_datum IS NOT NULL AND ez.zweites_datum > ez.erstes_datum
      ),
      max_tagen_zwischen AS (
          SELECT
              MAX(tagen_zwischen) AS max_days
          FROM tagen_zwischen
      ),
      segmente (max_Tagen, segment_start, segment_end) AS (
          SELECT
              max_days, 0, 30
          FROM max_tagen_zwischen
          WHERE max_days IS NOT NULL
          UNION ALL
          SELECT
              max_Tagen, segment_end + 1, segment_end + 30
          FROM segmente
          WHERE segment_end < max_Tagen
      )`;

const source = `SELECT
          kunden_nr as count,
          tz.kunden_nr AS kunden_nr, 
          tz.betrag_erstkauf AS betrag_erstkauf, 
          tz.betrag_zweitkauf AS betrag_zweitkauf,
          VARCHAR_FORMAT(tz.erstes_datum, 'DD.MM.YYYY') AS erstes_datum,
          VARCHAR_FORMAT(tz.zweites_datum, 'DD.MM.YYYY') AS zweites_datum,
          tz.tagen_zwischen AS tagen_zwischen,
          VARCHAR(s.segment_start) || '-' || VARCHAR(s.segment_end) AS segment,
          tz.erstes_datum AS erstes_datum_sort,
          tz.zweites_datum AS zweites_datum_sort,
          s.segment_start AS segment_sort
      FROM tagen_zwischen AS tz
      LEFT JOIN segmente AS s
          ON tz.tagen_zwischen BETWEEN s.segment_start AND s.segment_end`;

const sqlConfig = {
  recursive: true,
  cte,
  source,
};

export default async (req, res) => {
  const dateStart =
    req.query.dateStart || format(startOfYear(new Date()), "yyyyMMdd");
  const dateEnd = req.query.dateEnd || format(new Date(), "yyyyMMdd");

  try {
    const data = await sqlHelpers.getQueryData(sqlConfig, {
      query: req.query,
      resultFields,
      grouping: { mode: "standard", totals: false },
      params: [dateStart, dateStart, dateStart, dateEnd],
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
