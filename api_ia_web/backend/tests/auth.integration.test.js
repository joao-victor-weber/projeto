import request from "supertest";
import { afterAll, describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import { pool } from "../src/database/connection.js";

describe("Auth integration", () => {
  afterAll(async () => {
    await pool.end();
  });

  it("POST /auth/register deve cadastrar um usuário", async () => {
    const uniqueName = `Usuario_${Date.now()}`;
    const uniqueEmail = `user_${Date.now()}@test.com`;

    const response = await request(app)
      .post("/auth/register")
      .send({
        name: uniqueName,
        email: uniqueEmail,
        password: "123456"
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Usuário cadastrado com sucesso.");

    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data.name).toBe(uniqueName);
    expect(response.body.data.email).toBe(uniqueEmail);

    expect(response.body.data).not.toHaveProperty("password");
    expect(response.body.data).not.toHaveProperty("password_hash");
  });

  it("POST /auth/register não deve cadastrar email repetido", async () => {
    const uniqueName1 = `Usuario_Email_1_${Date.now()}`;
    const uniqueName2 = `Usuario_Email_2_${Date.now()}`;
    const uniqueEmail = `duplicado_${Date.now()}@test.com`;

    await request(app)
      .post("/auth/register")
      .send({
        name: uniqueName1,
        email: uniqueEmail,
        password: "123456"
      });

    const response = await request(app)
      .post("/auth/register")
      .send({
        name: uniqueName2,
        email: uniqueEmail,
        password: "123456"
      });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      success: false,
      error: "Já existe um usuário com este email."
    });
  });

  it("POST /auth/register não deve cadastrar nome repetido", async () => {
    const uniqueName = `Usuario_Nome_${Date.now()}`;
    const email1 = `primeiro_${Date.now()}@test.com`;
    const email2 = `segundo_${Date.now()}@test.com`;

    await request(app)
      .post("/auth/register")
      .send({
        name: uniqueName,
        email: email1,
        password: "123456"
      });

    const response = await request(app)
      .post("/auth/register")
      .send({
        name: uniqueName,
        email: email2,
        password: "123456"
      });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      success: false,
      error: "Já existe um usuário com este nome."
    });
  });

  it("POST /auth/register deve validar senha curta", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        name: `Usuario_Senha_${Date.now()}`,
        email: `senha_curta_${Date.now()}@test.com`,
        password: "123"
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: "A senha precisa ter pelo menos 6 caracteres."
    });
  });

  it("POST /auth/register deve validar nome obrigatório", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: `sem_nome_${Date.now()}@test.com`,
        password: "123456"
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: "Nome é obrigatório."
    });
  });

  it("POST /auth/register deve validar email obrigatório", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        name: `Usuario_Sem_Email_${Date.now()}`,
        password: "123456"
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: "Email é obrigatório."
    });
  });

  it("POST /auth/register deve validar senha obrigatória", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        name: `Usuario_Sem_Senha_${Date.now()}`,
        email: `sem_senha_${Date.now()}@test.com`
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: "Senha é obrigatória."
    });
  });
  it("POST /auth/login deve autenticar usuário e retornar token", async () => {
  const uniqueName = `Usuario_Login_${Date.now()}`;
  const uniqueEmail = `login_${Date.now()}@test.com`;

  await request(app)
    .post("/auth/register")
    .send({
      name: uniqueName,
      email: uniqueEmail,
      password: "123456"
    });

  const response = await request(app)
    .post("/auth/login")
    .send({
      email: uniqueEmail,
      password: "123456"
    });

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.message).toBe("Login realizado com sucesso.");

  expect(response.body.data).toHaveProperty("user");
  expect(response.body.data).toHaveProperty("token");

  expect(response.body.data.user.name).toBe(uniqueName);
  expect(response.body.data.user.email).toBe(uniqueEmail);
  expect(response.body.data.user).not.toHaveProperty("password");
  expect(response.body.data.user).not.toHaveProperty("password_hash");

  const decodedToken = jwt.verify(
    response.body.data.token,
    process.env.JWT_SECRET
  );

  expect(decodedToken.userId).toBe(response.body.data.user.id);
  expect(decodedToken.email).toBe(uniqueEmail);
  expect(decodedToken.name).toBe(uniqueName);
});

it("POST /auth/login deve retornar erro para senha inválida", async () => {
  const uniqueName = `Usuario_Senha_Errada_${Date.now()}`;
  const uniqueEmail = `senha_errada_${Date.now()}@test.com`;

  await request(app)
    .post("/auth/register")
    .send({
      name: uniqueName,
      email: uniqueEmail,
      password: "123456"
    });

  const response = await request(app)
    .post("/auth/login")
    .send({
      email: uniqueEmail,
      password: "senhaerrada"
    });

  expect(response.status).toBe(401);
  expect(response.body).toEqual({
    success: false,
    error: "Email ou senha inválidos."
  });
});

it("POST /auth/login deve retornar erro para email inexistente", async () => {
  const response = await request(app)
    .post("/auth/login")
    .send({
      email: `inexistente_${Date.now()}@test.com`,
      password: "123456"
    });

  expect(response.status).toBe(401);
  expect(response.body).toEqual({
    success: false,
    error: "Email ou senha inválidos."
  });
});

it("POST /auth/login deve validar email obrigatório", async () => {
  const response = await request(app)
    .post("/auth/login")
    .send({
      password: "123456"
    });

  expect(response.status).toBe(400);
  expect(response.body).toEqual({
    success: false,
    error: "Email é obrigatório."
  });
});

it("POST /auth/login deve validar senha obrigatória", async () => {
  const response = await request(app)
    .post("/auth/login")
    .send({
      email: `sem_senha_login_${Date.now()}@test.com`
    });

  expect(response.status).toBe(400);
  expect(response.body).toEqual({
    success: false,
    error: "Senha é obrigatória."
  });
});
});