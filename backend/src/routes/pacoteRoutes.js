import express from 'express';
import * as pacoteController from '../controllers/pacoteController.js';
import { proteger } from '../middlewares/autenticacao.js';

const router = express.Router();
router.use(proteger);

router.get('/estatisticas/geral', pacoteController.estatisticas);
router.post('/',     pacoteController.criar);
router.get('/',      pacoteController.listar);
router.get('/:id',   pacoteController.obter);
router.put('/:id',   pacoteController.atualizar);
router.delete('/:id',pacoteController.deletar);

export default router;
