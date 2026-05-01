import express from 'express';
import {
  registrar,
  login,
  obterMeuPerfil,
  logout,
  completarOnboarding,
  atualizarPerfil,
  alterarSenha,
  salvarNotificacoes,
  obterNotificacoes
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
router.put('/perfil', proteger, atualizarPerfil);
router.post('/alterar-senha', proteger, alterarSenha);
router.get('/notificacoes', proteger, obterNotificacoes);
router.put('/notificacoes', proteger, salvarNotificacoes);
router.post('/onboarding-completo', proteger, completarOnboarding);

export default router;
