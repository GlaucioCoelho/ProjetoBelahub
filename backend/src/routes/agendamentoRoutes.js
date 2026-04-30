import express from 'express';
import * as agendamentoController from '../controllers/agendamentoController.js';
import { proteger } from '../middlewares/autenticacao.js';
import { verificarLimiteAgendamentos } from '../middlewares/verificarLimitesPlano.js';

const router = express.Router();

router.use(proteger);

router.post('/', verificarLimiteAgendamentos, agendamentoController.criar);
router.get('/', agendamentoController.listar);
router.get('/disponibilidade', agendamentoController.obterHorariosDisponiveis);
router.get('/:id', agendamentoController.obter);
router.put('/:id', agendamentoController.atualizar);
router.delete('/:id', agendamentoController.cancelar);

export default router;
