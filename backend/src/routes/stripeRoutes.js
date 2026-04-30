import express from 'express';
import * as ctrl from '../controllers/stripeController.js';
import { proteger } from '../middlewares/autenticacao.js';

const router = express.Router();

// Public: frontend fetches the publishable key at startup
router.get('/key', ctrl.getPublicKey);

// Authenticated routes
router.post('/checkout', proteger, ctrl.createCheckoutSession);
router.post('/payment-intent', proteger, ctrl.createPaymentIntent);

// Webhook is registered directly in server.js with raw body middleware
// to avoid express.json() consuming the body before signature verification

export default router;
