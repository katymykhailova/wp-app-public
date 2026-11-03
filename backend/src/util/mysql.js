import mysql2 from "mysql2";

const pool = mysql2.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  namedPlaceholders: true,
  connectionLimit: 10,
  charset: "utf8mb4_general_ci",
});

export const query = (q, args) =>
  new Promise((resolve, reject) => {
    pool.query(q, args, (err, res) => {
      if (err) return reject(err);

      if (res) {
        resolve(res);
      } else {
        reject(new Error("Unexpected query result type"));
      }
    });
  });

export const queryCheck = async (q, args) => {
  const res = await query(q, args);

  return res.length > 0;
};

export const closePool = () =>
  new Promise((resolve, reject) => {
    pool.end((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
