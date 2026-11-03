import { v4 as uuidv4 } from "uuid";
import fsPromises from "fs/promises";
import data from "../../db_daten/_branches.json" with { type: "json" };

const personalNormalized = data.map((i, index) => {
  const { id, name, city, citySlug, ...irest } = i;
  const iclean = Object.fromEntries(
    Object.entries(irest).map(([k]) => [k, `Musterstraße ${index + 1}`])
  );

  return { ...iclean, name, city, citySlug, id };
});

await fsPromises
  .writeFile(
    "../../db_daten/branches.json",
    JSON.stringify(personalNormalized, null, 2),
    (err) => {
      if (err) console.log(err);
    }
  )
  .then();
