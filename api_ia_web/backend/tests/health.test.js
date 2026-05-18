import request from "supertest";
import {describe, it, expect} from "vitest";
import app from "../src/app.js";
describe("Health routes",()=>{
    it("GET /health deve retornar status ok", async()=>{
        const response= await request(app).get("/health");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status:"ok",
            message: "Backend da plataforma de IAs está rodando"
        });
    });
    it("rota inexistente deve retornar 404", async()=>{
        const response = await request(app).get("/rota-aleatoria-inexistente");
        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            error:"Rota não encontrada."
        });
    });
});