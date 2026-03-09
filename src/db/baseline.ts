import "dotenv/config";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import crypto from "crypto";

async function runBaseline() {
  console.log("🔄 Checking if baselining is required...");
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
  });

  try {
    const [accountRows]: any = await connection.query("SHOW TABLES LIKE 'account'");
    if (accountRows.length === 0) {
      console.log("ℹ️ Database is empty, skipping baseline.");
      return;
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`__drizzle_migrations\` (
        \`id\` int AUTO_INCREMENT PRIMARY KEY,
        \`hash\` text NOT NULL,
        \`created_at\` bigint
      )
    `);

    const [migrationRows]: any = await connection.query("SELECT * FROM __drizzle_migrations");
    if (migrationRows.length > 0) {
      console.log("ℹ️ Migrations already tracked, skipping baseline.");
      return;
    }

    console.log("⚠️ Existing tables found but no migrations tracked. Baselining DB...");

    const dir = path.join(process.cwd(), "drizzle");
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".sql")).sort();

    for (const file of files) {
      // Baseline everything up to 0004
      if (file.startsWith("0000") || file.startsWith("0001") || file.startsWith("0002") || file.startsWith("0003") || file.startsWith("0004")) {
        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const hash = crypto.createHash("sha256").update(content).digest("hex");
        
        await connection.query(
          "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
          [hash, Date.now()]
        );
        console.log(`✅ Baselined: ${file}`);
      }
    }
  } catch (error) {
    console.error("❌ Baseline failed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runBaseline();
