import { testDatabaseConnection } from "../database/connection.js";

export function healthCheck(req, res) {
  return res.json({
    status: "ok",
    message: "Backend da plataforma de IAs está rodando"
  });
}

export async function databaseHealthCheck(req, res) {
  try {
    const databaseTime = await testDatabaseConnection();

    return res.json({
      status: "ok",
      message: "Banco de dados conectado com sucesso",
      databaseTime
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Erro ao conectar com o banco de dados",
      error: error.message
    });
  }
}