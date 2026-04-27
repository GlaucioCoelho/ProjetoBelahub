import express from 'express';
import * as faturamentoController from '../controllers/faturamentoController.js';
import { proteger } from '../middlewares/autenticacao.js';

const router = express.Router();

router.use(proteger);

router.post('/', faturamentoController.criar);
router.get('/', faturamentoController.listar);
router.get('/relatorio/vendas', faturamentoController.obterRelatorio);
router.get('/:id', faturamentoController.obter);
router.put('/:id', faturamentoController.atualizar);
router.post('/:id/emitir', faturamentoController.emitir);
router.post('/:id/marcar-como-paga', faturamentoController.marcarComoPaga);

export default router;
