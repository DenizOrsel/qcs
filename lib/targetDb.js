import { get } from "@/lib/pool-manager"; // Importing the pool manager

export async function getTargetDbConnection(dbConfig) {
  // Create a unique key for the connection pool
  const poolKey = `${dbConfig.dbserver}_${dbConfig.dbdatabase}`;

  try {
    // Use the pool manager to get or create the connection pool
    const pool = await get(poolKey, {
      server: dbConfig.dbserver,
      database: dbConfig.dbdatabase,
      user: dbConfig.dbuser,
      password: dbConfig.dbpassword,
      options: {
        encrypt: true,
      },
    });
    console.log("Connected to the target database successfully.");
    return pool;
  } catch (error) {
    console.error("Error connecting to the target database:", error);
    throw error;
  }
}
