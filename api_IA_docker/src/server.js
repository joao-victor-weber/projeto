import express from "express";
import usuariosRoutes from "./routes/user.routes.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/usuarios", usuariosRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ erro: err.message });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});