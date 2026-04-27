import express from 'express';
import * as produtoController from '../controllers/produtoController.js';
import { proteger } from '../middlewares/autenticacao.js';

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(proteger);

// Rotas CRUD Produtos
router.post('/', produtoController.criar);
router.get('/', produtoController.listar);
router.get('/com-estoque/listar', produtoController.listarComEstoque);
router.get('/estatisticas/geral', produtoController.obterStatisticas);
router.get('/categoria/:categoria', produtoController.obterPorCategoria);
router.get('/:id', produtoController.obter);
router.put('/:id', produtoController.atualizar);
router.delete('/:id', produtoController.deletar);

export default router;
