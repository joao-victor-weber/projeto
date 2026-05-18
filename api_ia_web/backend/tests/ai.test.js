import "dotenv/config";
import request from "supertest";
import jwt from "jsonwebtoken";
import { describe, it, expect } from "vitest";

import app from "../src/app.js";

function createTestToken() {
  return jwt.sign(
    {
      userId: 999,
      name: "Usuário Teste",
      email: "teste@teste.com"
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h"
    }
  );
}

describe("AI routes", () => {
  it("GET /api/ais deve retornar a lista de IAs disponíveis", async () => {
    const response = await request(app).get("/api/ais");

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(3);
    expect(Array.isArray(response.body.data)).toBe(true);

    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "gemini"
        })
      ])
    );
  });

  it("POST /api/ais/gemini/chat sem token deve retornar erro 401", async () => {
    const response = await request(app)
      .post("/api/ais/gemini/chat")
      .send({
        message: "Olá"
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: "Token não enviado."
    });
  });

  it("POST /api/ais/gemini/chat com token inválido deve retornar erro 401", async () => {
    const response = await request(app)
      .post("/api/ais/gemini/chat")
      .set("Authorization", "Bearer token_invalido")
      .send({
        message: "Olá"
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: "Token inválido ou expirado."
    });
  });

  it("POST /api/ais/gemini/chat sem message deve retornar erro 400 quando token é válido", async () => {
    const token = createTestToken();

    const response = await request(app)
      .post("/api/ais/gemini/chat")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: "A mensagem é obrigatória e precisa ser um texto."
    });
  });

  it("POST /api/ais/nao-existe/chat deve retornar erro 404 quando token é válido", async () => {
    const token = createTestToken();

    const response = await request(app)
      .post("/api/ais/nao-existe/chat")
      .set("Authorization", `Bearer ${token}`)
      .send({
        message: "Olá"
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: "IA ainda não suportada."
    });
  });
});