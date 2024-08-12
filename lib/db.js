import sql from "mssql";

const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
  },
};

let pool;

export async function getDbConnection() {
  if (!pool) {
    try {
      pool = await sql.connect(dbConfig);
      console.log("Connected to the SQL database successfully.");
    } catch (error) {
      console.error("Database connection error:", error);
      throw error;
    }
  }
  return pool;
}
