import odbc from "odbc";

const query = async (queryString, params = []) => {
  let connection;
  try {
    connection = await odbc.connect(`${process.env.DB_CONNECTION_STRING}`);
    return await connection.query(queryString, params);
  } catch (err) {
    console.error("DB2 connection error:", err);

    console.error("ODBC details:", JSON.stringify(err.odbcErrors, null, 2));

    throw err;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

/**
 * @typedef {Object} DbQuery
 * @property {string} queryString
 * @property {(string | number)[]} [params]
 */

/**
 * @param {Record<string, DbQuery>} queries
 */
const queryMultiple = async (queries) => {
  let connection;

  try {
    connection = await odbc.connect(`${process.env.DB_CONNECTION_STRING}`);

    const results = {};

    for (const [name, { queryString, params = [] }] of Object.entries(
      queries,
    )) {
      results[name] = await connection.query(queryString, params);
    }

    return results;
  } catch (err) {
    console.error("DB2 connection error:", err);
    console.error("ODBC details:", JSON.stringify(err.odbcErrors, null, 2));
    throw err;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

export { query, queryMultiple };
