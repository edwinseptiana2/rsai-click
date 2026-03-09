import { readMigrationFiles } from "drizzle-orm/migrator";

const files = readMigrationFiles({ migrationsFolder: "./drizzle" });
console.log("Total files Drizzle found:", files.length);

const lastDbHash = "9509cc3a75d4c69d183766964d1b27bde5991449ca795da452d383ac9290f859";
const lastIndex = files.findIndex((f: any) => f.hash === lastDbHash);
console.log("Index of lastDbHash in files:", lastIndex);

if (lastIndex !== -1) {
  const nextFiles = files.slice(lastIndex + 1);
  console.log("Next files to run:", nextFiles.map((f: any) => f.hash));
} else {
  console.log("Hash not found in files. Drizzle probably throws an error?");
}
