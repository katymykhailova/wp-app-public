import { startOfYear, format } from "date-fns";
import sqlHelpers from "../../_helpers/sqlHelpers.js";

export default async (req, res) => {
  const dateStart =
    req.query.dateStart || format(startOfYear(new Date()), "yyyyMMdd");
  const dateEnd = req.query.dateEnd || format(new Date(), "yyyyMMdd");
  const defaultFields = [
    "kunden_nr",
    "betrag_erstkauf",
    "betrag_zweitkauf",
    "erstes_datum",
    "zweites_datum",
    "tagen_zwischen",
    "segment",
  ];

  const technicalFields = [
    "erstes_datum_sort",
    "zweites_datum_sort",
    "segment_sort",
    "count",
  ];

  const aggregateFields = {
    betrag_erstkauf: { fn: "sum", format: "currency" },
    betrag_zweitkauf: { fn: "sum", format: "currency" },
    erstes_datum_sort: { fn: "min" },
    zweites_datum_sort: { fn: "min" },
    segment_sort: { fn: "min" },
    count: { fn: "count", distinct: true, format: "number" },
  };

  const resultFields = {
    id: { label: "id", sortable: false, selectable: false, visible: false },
    count: {
      label: "Anzahl",
      sortable: true,
      selectable: true,
      visible: true,
      hiddenByDefault: true,
    },
    kunden_nr: {
      label: "Kundennummer",
      sortable: false,
      selectable: true,
      visible: true,
    },
    betrag_erstkauf: {
      label: "Erstkaufbetrag",
      sortable: true,
      selectable: true,
      visible: true,
      format: "currency",
    },
    betrag_zweitkauf: {
      label: "Zweitkaufbetrag",
      sortable: true,
      selectable: true,
      visible: true,
      format: "currency",
    },
    erstes_datum: {
      label: "Erstkaufdatum",
      sortable: true,
      selectable: true,
      visible: true,
      sortKey: "erstes_datum_sort",
    },
    zweites_datum: {
      label: "Zweitkaufdatum",
      sortable: true,
      selectable: true,
      visible: true,
      sortKey: "zweites_datum_sort",
    },
    tagen_zwischen: {
      label: "Tage zwischen den Käufen",
      sortable: true,
      selectable: true,
      visible: true,
    },
    segment: {
      label: "Segment",
      sortable: true,
      sortKey: "segment_sort",
      selectable: false,
      visible: true,
    },
  };

  try {
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

    const data = await sqlHelpers.getQueryData(
      { recursive: true, cte, source },
      {
        query: req.query,
        defaultFields,
        technicalFields,
        aggregateFields,
        resultFields,
        params: [dateStart, dateStart, dateStart, dateEnd],
      },
    );

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
