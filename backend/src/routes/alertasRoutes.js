import express from 'express';
import * as alertasController from '../controllers/alertasController.js';
import { proteger } from '../middlewares/autenticacao.js';

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(proteger);

// Rotas de Alertas
router.get('/', alertasController.listarAlertas);
router.get('/nao-lidos/listar', alertasController.obterNaoLidos);
router.get('/resumo/geral', alertasController.obterResumo);
router.get('/estatisticas/geral', alertasController.obterEstatisticas);
router.get('/historico/listagem', alertasController.obterHistoricoAlertas);
router.get('/produto/:produtoId', alertasController.obterAlertsporProduto);
router.get('/:id', alertasController.obterAlerta);

// Operações em Alertas
router.post('/', alertasController.criarAlertaManual);
router.post('/:id/lido', alertasController.marcarComoLido);
router.post('/acao/registrar/:id', alertasController.registrarAcao);
router.post('/desativar/:id', alertasController.desativarAlerta);

// Operações em Lote
router.post('/lote/marcar-como-lidos', alertasController.marcarVariosComoLidos);
router.post('/lote/desativar', alertasController.desativarVariosAlertas);

export default router;
