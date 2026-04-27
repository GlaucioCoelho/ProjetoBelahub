import express from 'express';
import * as clienteController from '../controllers/clienteController.js';
import { proteger } from '../middlewares/autenticacao.js';

const router = express.Router();

router.use(proteger);

router.post('/', clienteController.criar);
router.get('/', clienteController.listar);
router.get('/:id', clienteController.obter);
router.get('/:id/agendamentos', clienteController.obterAgendamentos);
router.get('/:id/estatisticas', clienteController.obterEstatisticas);
router.put('/:id', clienteController.atualizar);
router.delete('/:id', clienteController.deletar);

export default router;
