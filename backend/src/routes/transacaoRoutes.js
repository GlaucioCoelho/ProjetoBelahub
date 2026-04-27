import express from 'express';
import * as transacaoController from '../controllers/transacaoController.js';
import { proteger } from '../middlewares/autenticacao.js';

const router = express.Router();

router.use(proteger);

router.post('/', transacaoController.criar);
router.get('/', transacaoController.listar);
router.get('/resumo/financeiro', transacaoController.obterResumoFinanceiro);
router.get('/:id', transacaoController.obter);
router.put('/:id', transacaoController.atualizar);
router.delete('/:id', transacaoController.deletar);

export default router;
