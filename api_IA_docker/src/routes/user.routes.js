import {Router}from "express";
import {listUsers, findUserGetId, createUser,deletarUser} from "../controllers/users.controller.js";
const router=Router();
router.get("/", listUsers);
router.get("/:id", findUserGetId);
router.post("/", createUser);
router.delete("/:id", deletarUser);
export default router;