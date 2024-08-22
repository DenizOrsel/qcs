import { getDbConfig } from "@/lib/adminDb";
import { get } from "@/lib/pool-manager"; // Importing the pool manager

export async function getDbConnection(region, domainname) {
  // Retrieve target database configuration from ADMINDB
  const dbConfig = await getDbConfig(region, domainname);

  if (!dbConfig) {
    throw new Error(
      "No database configuration found for the specified region and domain."
    );
  }

  // Create a unique key for the pool based on the server and database name
  const poolKey = `${dbConfig.dbserver}_${dbConfig.dbdatabase}`;

  try {
    // Use the pool manager to get or create the pool
    const pool = await get(poolKey, {
      server: dbConfig.dbserver,
      database: dbConfig.dbdatabase,
      user: dbConfig.dbuser,
      password: dbConfig.dbpassword,
      options: {
        encrypt: true,
      },
    });
    console.log("Connected to the Repository database successfully.");
    return pool;
  } catch (error) {
    console.error("Repository Database connection error:", error);
    throw error;
  }
}
