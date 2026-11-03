import { Client } from "ldapts";
import config from "../../_config/config.js";
import jwt from "../../_services/tokenService.js";
import sendSuccessRes from "../../_helpers/sendSuccessRes.js";

const LDAP_URL = config.ldap;
const LDAP_DOMAIN = config.ldapDomain;
const BASE_DN = config.baseDn;

export default async (req, res) => {
  const client = new Client({
    url: LDAP_URL,
    timeout: 0,
    strictDN: true,
  });

  const username = req.body?.username || null;
  const password = req.body?.password || null;

  try {
    const user = `${LDAP_DOMAIN}\\${username}`;

    await client.bind(user, password);

    const { searchEntries } = await client.search(BASE_DN, {
      scope: "sub",
      filter: `(&(objectClass=user)(sAMAccountName=${username}))`,
      // attributes: ["*"],
      attributes: [
        "dn",
        "cn",
        "displayName",
        "givenName",
        "sn",
        "mail",
        "name",
        "userPrincipalName",
        "department",
        "mailNickname",
        "memberOf",
        "title",
      ],
    });

    const adUser = searchEntries[0];
    if (!adUser) {
      sendSuccessRes(res, { message: "User not found in AD" }, 404);
    }

    const memberOf = adUser?.memberOf ?? [];
    const roles = memberOf.map((role) => role.split(",")[0].replace("CN=", ""));

    const token = jwt.generateToken({
      username,
      dn: adUser.dn,
      displayName: adUser.displayName,
      mail: adUser.mail,
      department: adUser.department,
      roles,
    });

    if (token) {
      res
        .cookie("token", token, {
          httponly: true,
          maxAge: 1 * 24 * 60 * 60 * 1000,
        })
        .json({ user: username, adUser, roles });
    } else {
      throw new Error("Something went wrong during token generation");
    }
  } catch (error) {
    sendSuccessRes(res, { message: error.message }, 500);
  } finally {
    await client.unbind();
  }
};
