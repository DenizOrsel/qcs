import sql from "mssql";

const pools = new Map();

export async function get(name, config) {
  if (!pools.has(name)) {
    if (!config) {
      throw new Error("Pool does not exist");
    }
    const pool = new sql.ConnectionPool(config);
    const connectPool = pool.connect();

    // Override the close method to clean up the pool from the map when it's closed
    const close = pool.close.bind(pool);
    pool.close = (...args) => {
      pools.delete(name);
      return close(...args);
    };

    pools.set(name, connectPool);
  }
  return pools.get(name);
}

export async function closeAll() {
  return Promise.all(
    Array.from(pools.values()).map((connect) => {
      return connect.then((pool) => pool.close());
    })
  );
}
