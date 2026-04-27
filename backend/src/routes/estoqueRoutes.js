import express from 'express';
import * as estoqueController from '../controllers/estoqueController.js';
import { proteger } from '../middlewares/autenticacao.js';

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(proteger);

// Rotas CRUD Estoque
router.post('/', estoqueController.criar);
router.get('/', estoqueController.listar);
router.get('/resumo/geral', estoqueController.obterResumoEstoque);
router.get('/produto/:produtoId', estoqueController.obterPorProduto);
router.get('/:id', estoqueController.obter);
router.put('/:id', estoqueController.atualizar);
router.delete('/:id', estoqueController.deletar);

// Rotas de Operações de Estoque
router.post('/:id/adicionar', estoqueController.adicionarQuantidade);
router.post('/:id/remover', estoqueController.removerQuantidade);
router.post('/:id/reservar', estoqueController.reservarQuantidade);
router.post('/:id/liberar-reserva', estoqueController.liberarReserva);

export default router;
