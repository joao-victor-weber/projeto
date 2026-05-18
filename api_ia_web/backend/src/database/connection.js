import pg from "pg"
import dotenv from "dotenv";
dotenv.config();
const {Pool}=pg;
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não foi definida.");
}
export const pool= new Pool({
    connectionString: process.env.DATABASE_URL
});
export async function testDatabaseConnection() {
    const result = await pool.query("SELECT NOW()");
    return result.rows[0];
}