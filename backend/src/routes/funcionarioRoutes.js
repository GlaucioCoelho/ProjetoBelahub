import express from 'express';
import * as funcionarioController from '../controllers/funcionarioController.js';
import { proteger } from '../middlewares/autenticacao.js';

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(proteger);

// Rotas CRUD Funcionários
router.post('/', funcionarioController.criar);
router.get('/', funcionarioController.listar);
router.get('/:id', funcionarioController.obter);
router.put('/:id', funcionarioController.atualizar);
router.delete('/:id', funcionarioController.deletar);

// Rotas Escalas
router.post('/:funcionarioId/escalas', funcionarioController.criarEscala);
router.get('/:funcionarioId/escalas', funcionarioController.listarEscalas);
router.put('/:funcionarioId/escalas/:escalaId', funcionarioController.atualizarEscala);
router.delete('/:funcionarioId/escalas/:escalaId', funcionarioController.deletarEscala);

// Rotas Comissões e Estatísticas
router.get('/:funcionarioId/comissoes', funcionarioController.obterComissoes);
router.get('/:funcionarioId/estatisticas', funcionarioController.obterEstatisticas);

export default router;
