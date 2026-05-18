import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { pool } from "./connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    const migrationsDir = path.join(__dirname, "migrations");

    const files = await fs.readdir(migrationsDir);

    const sqlFiles = files
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of sqlFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, "utf-8");

      console.log(`Rodando migration: ${file}`);
      await pool.query(sql);
    }

    console.log("Migrations executadas com sucesso.");
  } catch (error) {
    console.error("Erro ao rodar migrations:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runMigrations();