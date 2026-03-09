import fs from "fs";
import crypto from "crypto";
const queries = fs.readFileSync("drizzle/0004_add_background_pattern.sql", "utf-8").split("--> statement-breakpoint");
console.log(queries);
