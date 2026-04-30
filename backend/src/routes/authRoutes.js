import express from 'express';
import {
  registrar,
  login,
  obterMeuPerfil,
  logout
} from '../controllers/authController.js';
import { proteger } from '../middlewares/autenticacao.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Rotas públicas com rate limiting
router.post('/registro', authLimiter, registrar);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

// Rotas protegidas
router.get('/me', proteger, obterMeuPerfil);

export default router;
