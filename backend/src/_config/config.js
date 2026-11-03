import path from "path";

const rootDir = process.cwd();
const filesDir = process.env.FILES_DIR || "daten";
const dbDir = process.env.DB_DIR || "db_daten";
const ldap = process.env.LDAP_URL || "";
const ldapDomain = process.env.LDAP_DOMAIN || "";
const baseDn = process.env.BASE_DN || "";
const jwtKey = process.env.JWT_KEY || "mySecret";

const config = {
  filesDir: path.resolve(rootDir, filesDir),
  dbDir: path.resolve(rootDir, dbDir),
  ldap,
  ldapDomain,
  baseDn,
  jwtKey,
};
export default config;
