import express from 'express';
import * as ctrl from '../controllers/adminController.js';
import { superAdmin } from '../middlewares/autenticacao.js';

const router = express.Router();

// Bootstrap — one-time, unprotected
router.post('/seed', ctrl.seedSuperAdmin);

// All other routes require super_admin
router.use(superAdmin);

router.get('/dashboard',              ctrl.getDashboard);
router.get('/tenants',                ctrl.listarTenants);
router.get('/tenants/:id',            ctrl.obterTenant);
router.put('/tenants/:id',            ctrl.atualizarTenant);
router.post('/tenants/:id/suspender', ctrl.suspenderTenant);
router.post('/tenants/:id/reativar',  ctrl.reativarTenant);

router.get('/planos',       ctrl.listarPlanos);
router.post('/planos',      ctrl.criarPlano);
router.put('/planos/:id',   ctrl.atualizarPlano);
router.delete('/planos/:id', ctrl.deletarPlano);

router.get('/audit', ctrl.listarAuditLog);

export default router;
