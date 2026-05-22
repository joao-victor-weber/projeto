import express from "express";
import cors from "cors";

import healthRoutes from "./routes/healthRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  }
}));

app.use(express.json());

app.use("/health", healthRoutes);
app.use("/api/ais", aiRoutes);
app.use("/auth", authRoutes);

app.use((req, res) => {
  return res.status(404).json({
    error: "Rota não encontrada."
  });
});

export default app;