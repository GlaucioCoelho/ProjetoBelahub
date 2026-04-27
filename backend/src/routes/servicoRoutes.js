import express from 'express';
import * as servicoController from '../controllers/servicoController.js';
import { proteger } from '../middlewares/autenticacao.js';

const router = express.Router();

router.use(proteger);

router.get('/estatisticas/geral', servicoController.estatisticas);
router.post('/', servicoController.criar);
router.get('/', servicoController.listar);
router.get('/:id', servicoController.obter);
router.put('/:id', servicoController.atualizar);
router.delete('/:id', servicoController.deletar);

export default router;
