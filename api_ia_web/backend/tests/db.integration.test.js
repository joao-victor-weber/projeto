import request from "supertest";
import {afterAll, describe, it, expect} from "vitest";
import app from "../src/app.js";
import {pool} from "../src/database/connection.js";
describe("Database integration",()=>{
    afterAll(async()=>{
        await pool.end();
    });
    it("GET /health/db deve conectar no PostgreSQL", async()=>{
    const response = await request(app).get("/health/db");
        if (response.status !== 200) {
      throw new Error(`
STATUS: ${response.status}
BODY: ${JSON.stringify(response.body, null, 2)}
`);
    }

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.message).toBe("Banco de dados conectado com sucesso");
    expect(response.body.databaseTime).toHaveProperty("now");
});
});