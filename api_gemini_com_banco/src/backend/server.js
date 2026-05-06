import express from "express";
import dotenv from "dotenv";
import usersRoutes from "./routes/users.routes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  return res.json({
    message: "API Node.js + Express + PostgreSQL + Docker funcionando",
  });
});

app.use("/api/users", usersRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});