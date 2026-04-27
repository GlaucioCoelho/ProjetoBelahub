import express from 'express';
import * as movimentacaoController from '../controllers/movimentacaoController.js';
import { proteger } from '../middlewares/autenticacao.js';

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(proteger);

// Rotas CRUD Movimentações
router.post('/', movimentacaoController.criar);
router.get('/', movimentacaoController.listar);
router.get('/resumo/geral', movimentacaoController.obterResumo);
router.get('/relatorio/mensal', movimentacaoController.obterRelatorioMensalPorTipo);
router.get('/estoque/:estoqueId', movimentacaoController.obterPorEstoque);
router.get('/:id', movimentacaoController.obter);
router.put('/:id', movimentacaoController.atualizar);
router.delete('/:id', movimentacaoController.deletar);

// Rota para movimentações em lote
router.post('/lote/processar', movimentacaoController.gerarMovimentacaoEmLote);

export default router;
