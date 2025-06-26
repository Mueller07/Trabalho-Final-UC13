import { Router } from "express";
import { UserController } from "../controllers/UserController";

const router = Router();

router.post('/users', UserController.register);
router.post('/user/login', UserController.login);

export default router;
