import express from "express";
import healthRouts from "./routes/healthRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
const app = express();
app.use(express.json());
app.use("/health", healthRouts);
app.use("/api/ais", aiRoutes);
app.use("/auth", authRoutes);
app.use((req,res)=>{
    return res.status(404).json({
        error:"Rota não encontrada."
    });
});
export default app;