import { Router } from "express";
import { LivroController } from "../controllers/LivroController";

const router = Router();
const controller = new LivroController();

router.post('/', controller.createLivro);
router.get('/', controller.getLivros);
router.get('/:id', controller.getLivroById);
router.put('/:id', controller.updateLivro);
router.delete('/:id', controller.deleteLivro);

export default router;
