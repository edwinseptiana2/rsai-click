import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";

async function run() {
  const connection = await mysql.createConnection({ uri: process.env.DATABASE_URL, multipleStatements: true });
  const db = drizzle(connection, { logger: true });
  await migrate(db, { migrationsFolder: "./drizzle" });
  await connection.end();
}
run();
