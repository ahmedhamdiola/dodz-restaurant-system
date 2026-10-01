import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../src/config/database.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "database", "migrations");

const apply = async (file: string) => {
    const sql = readFileSync(join(root, file), "utf8");
    await pool.query(sql);
    console.log(`Applied ${file}`);
};

// Applies every migration file in order. Migrations are keyed by a date-stamped
// filename; running `tsx scripts/migrate.ts` re-applies them (all statements are
// IF NOT EXISTS / ADD COLUMN IF NOT EXISTS, so they are safe to re-run).
//
// The list is read off disk rather than hardcoded: a new `2026xxxx_*.sql` dropped
// in the directory is picked up on the next run instead of being silently skipped.
const applyAll = async () => {
    const files = readdirSync(root)
        .filter((file) => file.endsWith(".sql"))
        .sort();
    for (const file of files) {
        await apply(file);
    }
    await pool.end();
};

applyAll().catch((err) => {
    console.error("Migration failed:", err);
    process.exitCode = 1;
});