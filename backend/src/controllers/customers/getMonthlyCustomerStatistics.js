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
  month_start: {
    label: "Monat",
    selectable: false,
    filterable: false,
    sortKey: "month_start_sort",
    defaultOrder: { priority: 1, direction: "asc" },
  },
  gesamt_chat: {
    label: "Bestellungen Chat",
  },
  gesamt_nln: {
    label: "Bestellungen Filialen",
  },
  anzahl_chat_neukunden: {
    label: "Neukunden Chat",
  },
  anzahl_eshop_neukunden: {
    label: "Neukunden eShop",
  },
  anzahl_nln_neukunden: {
    label: "Neukunden Filialen",
  },
  anzahl_gesamt_neukunden: {
    label: "Neukunden gesam",
  },
  anzahl_chat_bestandskunden: {
    label: "Bestandskunden Chat",
  },
  anzahl_eshop_bestandskunden: {
    label: "Bestandskunden eShop",
  },
  anzahl_nln_bestandskunden: {
    label: "Bestandskunden Filialen",
  },
  anzahl_gesamt_bestandskunden: {
    label: "Bestandskunden gesamt",
  },
});

const cte = `
      params (dt_from) AS (
      VALUES (DATE(TIMESTAMP_FORMAT(CAST(? AS CHAR(8)), 'YYYYMMDD')))
      ),
      months (month_start, month_end, n) AS (
      SELECT
        dt_from - (DAY(dt_from) - 1) DAYS,
        ADD_MONTHS(dt_from - (DAY(dt_from) - 1) DAYS, 1),
        CAST(0 AS INTEGER)
      FROM params
      UNION ALL
      SELECT
        ADD_MONTHS(month_start, 1),
        ADD_MONTHS(month_end, 1),
        n + 1
      FROM months
      WHERE n < ?
      ),
      umsatz AS (
      SELECT
        DATE(TIMESTAMP_FORMAT(DIGITS(FTR.AUDAT), 'YYYYMMDD')) AS Ftr_dt,
        DATE(TIMESTAMP_FORMAT(DIGITS(KUNDE.KDNAD), 'YYYYMMDD')) AS Kunde_AD,
        FTR.AUKDN AS Kunde_Nr,
        FTR.AURBT AS Ohne_Angebote_BETRAG,
        CASE WHEN FTR.AUNLN = '800' THEN FTR.AURBT END AS Chat_BETRAG,
        CASE WHEN FTR.AUNLN = '900' THEN FTR.AURBT END AS eShop_BETRAG,
        CASE WHEN FTR.AUNLN < '800' THEN FTR.AURBT END AS NLN_BETRAG
      FROM UDVM400DAT.MAUFTR AS FTR
      INNER JOIN UDVM400DAT.MKUNDE AS KUNDE ON FTR.AUKDN = KUNDE.KDKDN
      WHERE
        FTR.AUDAT BETWEEN ? AND ?
        AND FTR.AUNFV <> 'X' 
        AND (AUAUN <> AUKDN) AND AURBT <> 0
        AND KUNDE.KDNAD IS NOT NULL)`;

const source = `SELECT 
        month_start AS month_start_sort,
        VARCHAR_FORMAT(month_start,'MM.YYYY') AS month_start,
        COUNT(Chat_BETRAG) AS Gesamt_Chat,
        COUNT(eShop_BETRAG) AS Gesamt_eShop,
        COUNT(NLN_BETRAG) AS Gesamt_NLN,
        COUNT(CASE WHEN Kunde_AD >= month_start AND Kunde_AD < month_end THEN Chat_BETRAG END) AS Anzahl_Chat_Neukunden,
        COUNT(CASE WHEN Kunde_AD >= month_start AND Kunde_AD < month_end THEN eShop_BETRAG END) AS Anzahl_eShop_Neukunden,
        COUNT(CASE WHEN Kunde_AD >= month_start AND Kunde_AD < month_end THEN NLN_BETRAG END) AS Anzahl_NLN_Neukunden,	
        COUNT(DISTINCT CASE WHEN Kunde_AD >= month_start AND Kunde_AD < month_end THEN Kunde_Nr END) AS Anzahl_Gesamt_Neukunden,
        COUNT(CASE WHEN Kunde_AD < month_start THEN Chat_BETRAG END) AS Anzahl_Chat_Bestandskunden,
        COUNT(CASE WHEN Kunde_AD < month_start THEN eShop_BETRAG END) AS Anzahl_eShop_Bestandskunden,
        COUNT(CASE WHEN Kunde_AD < month_start THEN NLN_BETRAG END) AS Anzahl_NLN_Bestandskunden,	
        COUNT(DISTINCT CASE WHEN Kunde_AD < month_start THEN Kunde_Nr END) AS Anzahl_Gesamt_Bestandskunden
      FROM MONTHS
      LEFT JOIN umsatz ON umsatz.Ftr_dt >= MONTHS.month_start AND umsatz.Ftr_dt <  MONTHS.month_end
      GROUP BY MONTHS.month_start
      ORDER BY MONTHS.month_start`;

const sqlConfig = { recursive: true, cte, source };

export default async (req, res) => {
  const dateStart =
    req.query?.dateStart || format(startOfYear(new Date()), "yyyyMMdd");
  const dateEnd = req.query?.dateEnd || format(new Date(), "yyyyMMdd");
  const startYear = Number(String(dateStart).slice(0, 4));
  const startMonth = Number(String(dateStart).slice(4, 6));

  const endYear = Number(String(dateEnd).slice(0, 4));
  const endMonth = Number(String(dateEnd).slice(4, 6));
  const months = (endYear - startYear) * 12 + (endMonth - startMonth);

  try {
    const data = await sqlHelpers.getQueryData(sqlConfig, {
      query: req.query,
      resultFields,
      grouping: { mode: "standard", totals: false },
      params: [dateStart, months, dateStart, dateEnd],
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
