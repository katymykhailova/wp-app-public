import fsPromises from "fs/promises";
import config from "../../_config/config.js";

const BASE_DIR = config.dbDir;

export default async (req, res) => {
  try {
    const suppliers = await fsPromises.readFile(
      BASE_DIR + "/suppliers.json",
      "utf8",
    );
    const jsonSuppliers = JSON.parse(suppliers);

    const personal = await fsPromises.readFile(
      BASE_DIR + "/personal.json",
      "utf8",
    );

    const jsonPersonal = JSON.parse(personal);

    const personalById = Object.fromEntries(
      jsonPersonal
        .filter((p) => p.user_id)
        .map((p) => [p.user_id.toLowerCase(), p]),
    );

    const suppliersNormalize = jsonSuppliers
      .map((producer) => {
        const { id, lieferant, ...rest } = producer;

        const mapped = Object.fromEntries(
          Object.entries(rest).map(([key, value]) => {
            const person = personalById[String(value).toLowerCase()] ?? null;
            return [key, person];
          }),
        );

        return { id, lieferant, ...mapped };
      })
      .sort((a, b) =>
        String(a.lieferant ?? "").localeCompare(
          String(b.lieferant ?? ""),
          "de",
          {
            sensitivity: "base",
            numeric: true,
          },
        ),
      );
    res.status(200).json(suppliersNormalize);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
