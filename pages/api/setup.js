import { saveDbConfig } from "@/lib/adminDb";
import { getTargetDbConnection } from "@/lib/targetDb";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { region, domainname, dbConfig } = req.body;

    try {
      
      await getTargetDbConnection(dbConfig);

      await saveDbConfig(
        region,
        domainname,
        dbConfig.dbserver,
        dbConfig.dbdatabase,
        dbConfig.dbuser,
        dbConfig.dbpassword
      );

      res.status(200).json({ message: "Setup complete" });
    } catch (error) {
      res
        .status(400)
        .json({ error: "Failed to connect to the target database" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
