// src/routes/UserRoutes.ts
import { Router } from "express";
import { UserController } from "../controllers/UserController";

const controller = new UserController();
const router = Router();

router.post('/users', controller.register.bind(controller));
router.post('/user/login', controller.login.bind(controller));

export default router;
