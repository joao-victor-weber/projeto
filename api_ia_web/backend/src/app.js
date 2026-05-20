import express from "express";
import cors from "cors";

import healthRoutes from "./routes/healthRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use("/health", healthRoutes);
app.use("/api/ais", aiRoutes);
app.use("/auth", authRoutes);

app.use((req, res) => {
  return res.status(404).json({
    error: "Rota não encontrada.",
  });
});

export default app;