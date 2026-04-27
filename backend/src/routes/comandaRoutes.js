import express from 'express';
import * as ctrl from '../controllers/comandaController.js';
import { proteger } from '../middlewares/autenticacao.js';

const router = express.Router();
router.use(proteger);

router.get('/',        ctrl.listar);
router.post('/',       ctrl.criar);
router.get('/:id',     ctrl.obter);
router.put('/:id',     ctrl.atualizar);
router.patch('/:id/fechar', ctrl.fechar);
router.delete('/:id',  ctrl.deletar);

export default router;
