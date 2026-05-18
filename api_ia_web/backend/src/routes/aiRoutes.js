import express from "express";

import {
  listAis,
  chatWithAi
} from "../controllers/aiController.js";

import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", listAis);
router.post("/:aiId/chat", authenticate, chatWithAi);

export default router;