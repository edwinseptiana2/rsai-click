import { readMigrationFiles } from "drizzle-orm/migrator";
const files = readMigrationFiles({ migrationsFolder: "./drizzle" });
console.log(files.map(f => f.hash));
