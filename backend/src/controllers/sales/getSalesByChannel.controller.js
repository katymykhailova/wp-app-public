import { startOfYear, format } from "date-fns";
import sqlHelpers from "../../_helpers/sqlHelpers/sqlHelpers.js";

const source = `SELECT
      COUNT(AUAUN) AS "Gesamtzahl der Bestellungen",
      COUNT(CASE WHEN FTR.AUNFV <> 'X' THEN AUAUN END) AS "Bestellungen (ohne Angebote)",
      COUNT(CASE WHEN FTR.AUNFV = 'X' THEN AUAUN END) AS "Angebote",
      SUM(FTR.AURBT) AS "Umsatz gesamt",
      SUM(CASE WHEN FTR.AUNLN = '800' THEN FTR.AURBT END) AS "Umsatz Chat",
      SUM(CASE WHEN FTR.AUNLN = '900' THEN FTR.AURBT END) AS "Umsatz eShop",
      SUM(CASE WHEN FTR.AUNLN < '800' THEN FTR.AURBT END) AS "Umsatz Filialen",
      COUNT(CASE WHEN FTR.AUNLN = '800' THEN FTR.AUAUN END) AS "Chat-Bestellungen",
      COUNT(CASE WHEN FTR.AUNLN = '900' THEN FTR.AUAUN END) AS "eShop-Bestellungen",
      COUNT(CASE WHEN FTR.AUNLN < '800' THEN FTR.AUAUN END) AS "Filialbestellungen"	
      FROM
        UDVM400DAT.MAUFTR AS FTR
      WHERE
      FTR.AUDAT BETWEEN ? AND ?
      AND AURBT <> 0
      AND AUAUN <> AUKDN
      AND FTR.AUNLN <> 30
      AND FTR.AUNFV <> 'X'
    `;

export default async (req, res) => {
  const dateStart =
    req.query?.dateStart || format(startOfYear(new Date()), "yyyyMMdd");
  const dateEnd = req.query?.dateEnd || format(new Date(), "yyyyMMdd");
  try {
    const result = await sqlHelpers.getQueryData(
      { source },
      {
        query: req.query,
        rawQuery: true,
        grouping: { mode: "standard", totals: false },
        params: [dateStart, dateEnd],
      },
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
