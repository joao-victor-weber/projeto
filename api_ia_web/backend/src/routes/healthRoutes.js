import express from "express"
import { healthCheck, databaseHealthCheck } from "../controllers/healthController.js";
const router = express.Router();
router.get("/", healthCheck);
router.get("/db", databaseHealthCheck)
export default router;