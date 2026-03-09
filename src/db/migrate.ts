import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import crypto from "crypto";

async function runMigrations() {
  console.log("🔄 Starting database migration process...");
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    multipleStatements: true,
  });

  try {
    // 1. Baselining Check
    console.log("🔍 Checking if baselining is required...");
    const [accountRows]: any = await connection.query("SHOW TABLES LIKE 'account'");
    if (accountRows.length > 0) {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`__drizzle_migrations\` (
          \`id\` int AUTO_INCREMENT PRIMARY KEY,
          \`hash\` text NOT NULL,
          \`created_at\` bigint
        )
      `);
      const [migrationRows]: any = await connection.query("SELECT * FROM __drizzle_migrations");
      
      if (migrationRows.length === 0) {
        console.log("⚠️ Existing tables found but no migrations tracked. Baselining DB...");
        const dir = path.join(process.cwd(), "drizzle");
        const files = fs.readdirSync(dir).filter(f => f.endsWith(".sql")).sort();

        // Baseline files up to 0004 since the production DB already matches this state
        const baselineFiles = files.filter(f => /^(0000|0001|0002|0003|0004)_/.test(f));
        
        for (const file of baselineFiles) {
          const content = fs.readFileSync(path.join(dir, file), "utf-8");
          const hash = crypto.createHash("sha256").update(content).digest("hex");
          await connection.query(
            "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
            [hash, Date.now()]
          );
          console.log(`✅ Baselined: ${file}`);
        }
      } else {
        console.log("ℹ️ Migrations already tracked, skipping baseline.");
      }
    } else {
      console.log("ℹ️ Database is empty, skipping baseline.");
    }

    // 2. Run Drizzle Migrator
    console.log("🔄 Running drizzle migrator for pending migrations...");
    const db = drizzle(connection, { logger: true });
    await migrate(db, { migrationsFolder: "./drizzle" });
    
    // 3. Verify
    const [finalRows]: any = await connection.query("SELECT id, hash FROM __drizzle_migrations");
    console.log(`✅ Migrations completed successfully! Tracked migrations count: ${finalRows.length}`);

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigrations();
