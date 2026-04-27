import express from 'express';
import {
  registrar,
  login,
  obterMeuPerfil,
  logout
} from '../controllers/authController.js';
import { proteger } from '../middlewares/autenticacao.js';

const router = express.Router();

// Rotas públicas
router.post('/registro', registrar);
router.post('/login', login);
router.post('/logout', logout);

// Rotas protegidas
router.get('/me', proteger, obterMeuPerfil);

export default router;
