import sql from "mssql";
import { get, closeAll } from "@/lib/pool-manager";


const adminDbConfig = {
  server: process.env.ADMINDB_SERVER,
  database: process.env.ADMINDB_DATABASE,
  user: process.env.ADMINDB_USER,
  password: process.env.ADMINDB_PASSWORD,
  options: {
    encrypt: true,
    enableArithAbort: true
  },
};

export async function getAdminDbConnection() {
  return get("admin", adminDbConfig);
}

export async function getDbConfig(region, domainname) {
  const adminPool = await getAdminDbConnection();
  try {
    const result = await adminPool
      .request()
      .input("region", sql.VarChar, region)
      .input("domainname", sql.VarChar, domainname)
      .query(
        "SELECT dbserver, dbdatabase, dbuser, dbpassword FROM Domains WHERE region = @region AND domainname = @domainname"
      );

    if (result.recordset.length === 0) {
      console.log("No matching domain found.");
      return null;
    }
    return result.recordset[0];
  } catch {
    console.error("Error getting database configuration.", error);
    throw error;
  }
}

export async function saveDbConfig(
  region,
  domainname,
  dbserver,
  dbdatabase,
  dbuser,
  dbpassword
) {
  const adminPool = await getAdminDbConnection();

  try {
    const encryptedPassword = Buffer.from(dbpassword);

    const updateResult = await adminPool
      .request()
      .input("region", sql.VarChar, region)
      .input("domainname", sql.VarChar, domainname)
      .input("dbserver", sql.VarChar, dbserver)
      .input("dbdatabase", sql.VarChar, dbdatabase)
      .input("dbuser", sql.VarChar, dbuser)
      .input("dbpassword", sql.VarBinary, encryptedPassword)
      .query(
        "UPDATE Domains SET dbserver = @dbserver, dbdatabase = @dbdatabase, dbuser = @dbuser, dbpassword = @dbpassword " +
          "WHERE region = @region AND domainname = @domainname"
      );

    if (updateResult.rowsAffected[0] === 0) {
      await adminPool
        .request()
        .input("region", sql.VarChar, region)
        .input("domainname", sql.VarChar, domainname)
        .input("dbserver", sql.VarChar, dbserver)
        .input("dbdatabase", sql.VarChar, dbdatabase)
        .input("dbuser", sql.VarChar, dbuser)
        .input("dbpassword", sql.VarBinary, encryptedPassword)
        .query(
          "INSERT INTO Domains (region, domainname, dbserver, dbdatabase, dbuser, dbpassword) " +
            "VALUES (@region, @domainname, @dbserver, @dbdatabase, @dbuser, @dbpassword)"
        );
    }
  } catch (error) {
    console.error("Error saving database configuration:", error);
    throw error;
  } 
}

export async function closeDbConnection() {
  try {
    await closeAll(); // Close all managed pools
    console.log("All database connections closed.");
  } catch (error) {
    console.error("Error closing database connections:", error);
  }
}