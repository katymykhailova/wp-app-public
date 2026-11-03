import fsPromises from "fs/promises";
import config from "../../_config/config.js";

const BASE_DIR = config.dbDir;

export default async (req, res) => {
  try {
    const data = await fsPromises.readFile(BASE_DIR + "/stores.json", "utf8");
    const jsonData = JSON.parse(data);
    res.status(200).json(jsonData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
