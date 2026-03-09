import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";

async function runMigrations() {
  console.log("🔄 Running database migrations...");

  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
  });

  const db = drizzle(connection);

  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ Migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigrations();
